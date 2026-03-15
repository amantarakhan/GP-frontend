/**
 * TopBar.jsx
 *
 * Changes from original:
 *  - "Save Report" button now calls dbService.saveReport() to persist to Firestore.
 *  - Shows "Saving…" spinner state while the async write is in flight.
 *  - Falls back gracefully to the local apiService.saveReport() if no auth user
 *    is present (so the app still works when logged out).
 *  - All existing inline styles and emerald-glass theme preserved exactly.
 */

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAnalysis } from "../../context/AnalysisContext";
import { auth } from "../../firebase";
import { saveReport as firestoreSaveReport } from "../../services/dbService";
import { apiService } from "../../services/apiService";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/scan":      "New Scan",
  "/reports":   "Saved Reports",
};

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { hasResults, results, pin, businessType, radius, aiAnalysis } = useAnalysis();

  // ── Save button states ────────────────────────────────────────────────────
  const [saveState, setSaveState] = useState("idle"); // "idle" | "saving" | "saved" | "error"

  const title = PAGE_TITLES[pathname] ?? "Localyze";

  // ── Build the report payload (matches both local and Firestore schemas) ────
  const buildReportPayload = () => {
    if (!results || !pin) return null;
    return {
      title:       `${businessType.charAt(0).toUpperCase() + businessType.slice(1)} — ${results.districtName}`,
      location:    results.districtName,
      date:        new Date().toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      }),
      score:       results.feasibility,
      competitors: results.competitors,
      saturation:  results.saturation,
      status:      results.feasibility >= 75 ? "strong"
                 : results.feasibility >= 55 ? "moderate"
                 : "weak",
      businessType,
      lat:         pin.lat,
      lng:         pin.lng,
      radius,
      fullResults: results,
      aiAnalysis:  aiAnalysis ?? null,
    };
  };

  const handleSave = async () => {
    if (saveState === "saving") return;         // debounce double-clicks
    const payload = buildReportPayload();
    if (!payload) return;

    setSaveState("saving");

    try {
      const user = auth.currentUser;

      if (user) {
        // ── Authenticated: persist to Firestore ──────────────────────────
        await firestoreSaveReport(user.uid, payload);
      } else {
        // ── Guest fallback: save to local storage via existing service ────
        apiService.saveReport(payload);
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      console.error("[TopBar] handleSave error:", err);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  // ── Derived button appearance ─────────────────────────────────────────────
  const saveLabel = {
    idle:   "Save Report",
    saving: "Saving…",
    saved:  "Saved!",
    error:  "Error — retry",
  }[saveState];

  const saveBg = {
    idle:   hasResults ? "var(--color-brand)" : "var(--color-text)",
    saving: "rgba(63,125,88,.55)",
    saved:  "var(--color-success)",
    error:  "#dc2626",
  }[saveState];

  const saveColor = saveState === "saved" ? "var(--color-brand)" : "var(--color-card)";

  const saveIcon = {
    idle: (
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
        <polyline points="17,21 17,13 7,13 7,21"/>
        <polyline points="7,3 7,8 15,8"/>
      </svg>
    ),
    saving: (
      <span style={{
        width: "11px", height: "11px",
        border: "2px solid rgba(255,255,255,.3)",
        borderTop: "2px solid #fff",
        borderRadius: "50%",
        display: "inline-block",
        animation: "topbarSpin .7s linear infinite",
      }} />
    ),
    saved: (
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <polyline points="20,6 9,17 4,12"/>
      </svg>
    ),
    error: (
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  }[saveState];

  return (
    <>
      <style>{`
        @keyframes topbarSpin { to { transform: rotate(360deg); } }
      `}</style>

      <header
        className="topbar-wrapper"
        style={{
          height: "56px", padding: "0 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--color-app-bg)", borderBottom: "1px solid rgba(230,211,173,.5)",
          flexShrink: 0, zIndex: 10,
        }}
      >
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)", cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            Home
          </span>
          <span style={{ color: "var(--color-accent)", fontSize: "14px" }}>/</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "var(--color-dark)" }}>
            {title}
          </span>
        </div>

        {/* Right controls */}
        <div
          className="topbar-right-actions"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          {/* Analysis ready badge */}
          {hasResults && (
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "var(--color-success)", padding: "5px 12px",
              borderRadius: "20px", border: "1px solid rgba(63,125,88,.2)",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "var(--color-brand)",
                animation: "pulse-dot 1.8s ease infinite", display: "inline-block",
              }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "var(--color-brand)" }}>
                Analysis Ready
              </span>
            </div>
          )}

          {/* Export */}
          <button
            onClick={() => window.print()}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "8px",
              border: "1.5px solid var(--color-accent)",
              background: "var(--color-card)", color: "var(--color-text)",
              fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer",
            }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>

          {/* Save Report — Firestore-powered */}
          <button
            onClick={hasResults ? handleSave : () => navigate("/reports")}
            disabled={saveState === "saving"}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "8px", border: "none",
              background: saveBg,
              color:      saveColor,
              fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-body)",
              cursor: saveState === "saving" ? "not-allowed" : "pointer",
              transition: "all .2s",
              opacity: saveState === "saving" ? 0.8 : 1,
            }}
          >
            {saveIcon}
            {saveLabel}
          </button>
        </div>
      </header>
    </>
  );
}