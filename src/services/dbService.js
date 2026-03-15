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
  where,
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


// ═══════════════════════════════════════════════════════════════════════════════
// SAVED REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Save a market analysis report to Firestore.
 *
 * @param {string} userId   — Auth UID of the creator
 * @param {object} report   — report payload from AnalysisContext
 * @returns {Promise<string>}  the new Firestore document ID
 */
export async function saveReport(userId, report) {
  if (!userId) throw new Error("saveReport: userId is required");
  if (!report) throw new Error("saveReport: report payload is required");

  // Build payload — all fields defaulted to null so no undefined sneaks through
  const payload = {
    userId,

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

  // clean() must be called BEFORE serverTimestamp() fields are included,
  // but serverTimestamp() returns a sentinel object (not a plain value),
  // so we clean everything except the timestamp sentinel by extracting it first.
  const { timestamp, ...rest } = payload;
  const cleanedPayload = { ...clean(rest), timestamp };

  const ref = await addDoc(collection(db, "saved_reports"), cleanedPayload);
  return ref.id;
}

/**
 * Fetch all saved reports for a given user, newest first.
 *
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function getUserReports(userId) {
  if (!userId) return [];

  const q = query(
    collection(db, "saved_reports"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Delete a saved report by its Firestore document ID.
 *
 * @param {string} reportId — Firestore doc ID
 * @returns {Promise<void>}
 */
export async function deleteReport(reportId) {
  if (!reportId) throw new Error("deleteReport: reportId is required");
  await deleteDoc(doc(db, "saved_reports", reportId));
}