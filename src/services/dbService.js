/**
 * src/services/dbService.js
 *
 * Firestore database service for Localyze.
 * Handles user profile management and saved report CRUD.
 *
 * Collections:
 *   users          — one doc per Auth UID
 *   saved_reports  — one doc per saved scan, userId field links back to creator
 */

import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Recursively strip `undefined` values from an object so Firestore
 * doesn't throw "Unsupported field value: undefined".
 * Uses JSON round-trip: undefined values are dropped by JSON.stringify,
 * then we restore them as null so no fields go missing.
 */
const clean = (obj) =>
  JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));


// ═══════════════════════════════════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create (or overwrite) a user profile document.
 * Call this right after a successful sign-up or first Google sign-in.
 *
 * @param {object} user  — Firebase Auth user object
 * @param {object} extra — optional extra fields (e.g. displayName override)
 * @returns {Promise<void>}
 */
export async function createUserProfile(user, extra = {}) {
  if (!user?.uid) throw new Error("createUserProfile: user.uid is required");

  const ref = doc(db, "users", user.uid);

  // merge:true so re-running on sign-in doesn't overwrite existing data
  await setDoc(
    ref,
    clean({
      email:            user.email       ?? "",
      displayName:      extra.displayName ?? user.displayName ?? "",
      subscriptionTier: "Basic",
      createdAt:        serverTimestamp(),
      ...extra,
    }),
    { merge: true }
  );
}

/**
 * Fetch a user profile document by Auth UID.
 *
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export async function getUserProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Update specific fields in a user profile document.
 *
 * @param {string} uid    — Auth UID
 * @param {object} fields — partial fields to update (e.g. { displayName, email })
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, fields) {
  if (!uid) throw new Error("updateUserProfile: uid is required");
  await setDoc(doc(db, "users", uid), clean(fields), { merge: true });
}


// ═══════════════════════════════════════════════════════════════════════════════
// SAVED REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Save a market analysis report as a subcollection under the user's document.
 * Structure: users/{userId}/saved_reports/{reportId}
 *
 * @param {string} userId   — Auth UID of the creator
 * @param {object} report   — report payload from AnalysisContext
 * @returns {Promise<string>}  the new Firestore document ID
 */
export async function saveReport(userId, report) {
  if (!userId) throw new Error("saveReport: userId is required");
  if (!report) throw new Error("saveReport: report payload is required");

  const payload = {
    // ── Core identity ────────────────────────────────────────────────────────
    reportName:   report.title        ?? `${report.businessType ?? ""} — ${report.location ?? ""}`,
    businessType: report.businessType ?? "",

    // ── Geographic data ──────────────────────────────────────────────────────
    coordinates: {
      lat: report.lat ?? null,
      lng: report.lng ?? null,
    },
    location: report.location ?? "",
    radius:   report.radius   ?? null,

    // ── Scores & metrics ─────────────────────────────────────────────────────
    feasibilityScore: report.score       ?? null,
    competitorCount:  report.competitors ?? null,
    saturation:       report.saturation  ?? null,
    status:           report.status      ?? "moderate",

    // ── AI insights (optional) ───────────────────────────────────────────────
    aiInsightsSummary: report.aiAnalysis ?? null,

    // ── Full result snapshot ─────────────────────────────────────────────────
    fullResults: report.fullResults ?? null,

    // ── Timestamps ───────────────────────────────────────────────────────────
    timestamp: serverTimestamp(),
    dateLabel: report.date ?? new Date().toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }),
  };

  const { timestamp, ...rest } = payload;
  const cleanedPayload = { ...clean(rest), timestamp };

  const reportsRef = collection(db, "users", userId, "saved_reports");
  const ref = await addDoc(reportsRef, cleanedPayload);
  return ref.id;
}

/**
 * Fetch all saved reports for a given user, newest first.
 * Reads from: users/{userId}/saved_reports
 *
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function getUserReports(userId) {
  if (!userId) return [];

  const q = query(
    collection(db, "users", userId, "saved_reports"),
    orderBy("timestamp", "desc")
  );

  const snap = await getDocs(q);
  const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Sort client-side (newest first) to avoid requiring a Firestore composite index
  reports.sort((a, b) => {
    const ta = a.timestamp?.toMillis?.() ?? 0;
    const tb = b.timestamp?.toMillis?.() ?? 0;
    return tb - ta;
  });

  return reports;
}

/**
 * Delete a saved report from the user's subcollection.
 *
 * @param {string} userId   — Auth UID
 * @param {string} reportId — Firestore doc ID
 * @returns {Promise<void>}
 */
export async function deleteReport(userId, reportId) {
  if (!userId)   throw new Error("deleteReport: userId is required");
  if (!reportId) throw new Error("deleteReport: reportId is required");
  await deleteDoc(doc(db, "users", userId, "saved_reports", reportId));
}