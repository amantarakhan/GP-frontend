/**
 * ReportsPage.jsx
 *
 * Changes from original:
 *  - Fetches reports from Firestore (getUserReports) for authenticated users.
 *  - Falls back to apiService.getReports() for guests.
 *  - Adds three UI states: loading skeleton, empty state, fetch-error banner.
 *  - Delete now calls Firestore deleteReport() for auth users.
 *  - "Save Current Scan" also writes to Firestore when authenticated.
 *  - All existing inline styles, markdown renderer and AI accordion untouched.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { auth } from "../firebase";
import {
  getUserReports,
  deleteReport   as firestoreDeleteReport,
  saveReport     as firestoreSaveReport,
} from "../services/dbService";
import { apiService } from "../services/apiService";

// ── Status pill styles ────────────────────────────────────────────────────────
const STATUS_STYLES = {
  strong:   { bg: "var(--color-success)", color: "var(--color-brand)", label: "Strong"   },
  moderate: { bg: "var(--color-accent)",  color: "var(--color-dark)",  label: "Moderate" },
  weak:     { bg: "#fee2e2",              color: "#991b1b",            label: "Weak"     },
};

// ── Minimal markdown renderer (unchanged from original) ───────────────────────
function inlineFormat(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ fontWeight: 700, color: "var(--color-dark)" }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderMarkdownCompact(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith("## ") || line.startsWith("# ")) {
      const clean = line.replace(/^#+\s/, "");
      elements.push(
        <div key={i} style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "var(--color-brand)", textTransform: "uppercase", letterSpacing: "1.5px", margin: "12px 0 5px" }}>
          {inlineFormat(clean)}
        </div>
      );
      i++; continue;
    }

    if (/^[\*\-]\s+/.test(line) && !line.startsWith("**")) {
      const items = [];
      while (i < lines.length && /^[\*\-]\s+/.test(lines[i]) && !lines[i].startsWith("**")) {
        items.push(lines[i].replace(/^[\*\-]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: "5px 0", padding: 0, listStyle: "none" }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: "flex", gap: "8px", marginBottom: "5px", alignItems: "flex-start" }}>
              <span style={{ flexShrink: 0, marginTop: "5px", width: "4px", height: "4px", borderRadius: "50%", background: "var(--color-brand)", opacity: 0.65 }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)", lineHeight: 1.65 }}>{inlineFormat(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: "5px 0", padding: 0, listStyle: "none" }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: "flex", gap: "10px", marginBottom: "6px", alignItems: "flex-start" }}>
              <span style={{ flexShrink: 0, minWidth: "20px", height: "20px", borderRadius: "5px", background: "rgba(63,125,88,.1)", border: "1px solid rgba(63,125,88,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontSize: "9px", fontWeight: 700, color: "var(--color-brand)", marginTop: "1px" }}>{idx + 1}</span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)", lineHeight: 1.65, flex: 1 }}>{inlineFormat(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    elements.push(
      <p key={i} style={{ fontFamily: "var(--font-body)", fontSize: "12.5px", color: "var(--color-text)", lineHeight: 1.7, margin: "4px 0" }}>
        {inlineFormat(line)}
      </p>
    );
    i++;
  }
  return elements;
}

// ── AI Analysis accordion (unchanged from original) ───────────────────────────
function AiAnalysisAccordion({ analysis }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: "12px", borderRadius: "var(--radius-md)", border: "1px solid rgba(63,125,88,.18)", overflow: "hidden", background: "rgba(63,125,88,.02)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", gap: "8px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
          </svg>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, color: "var(--color-brand)" }}>AI Market Insights</span>
          <span style={{ background: "rgba(63,125,88,.12)", color: "var(--color-brand)", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "10px", fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Saved</span>
        </div>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="var(--color-text)" strokeWidth={2}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "4px 14px 14px", borderTop: "1px solid rgba(63,125,88,.1)", animation: "reportsAiFade .3s ease both" }}>
          {renderMarkdownCompact(analysis)}
        </div>
      )}
      <style>{`
        @keyframes reportsAiFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function ReportSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .shimmer-line {
          background: linear-gradient(90deg, rgba(230,211,173,.18) 25%, rgba(230,211,173,.36) 50%, rgba(230,211,173,.18) 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 6px;
        }
      `}</style>
      {[1, 2, 3].map(n => (
        <div key={n} style={{ background: "var(--color-card)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(230,211,173,.6)", padding: "20px 22px" }}>
          <div className="shimmer-line" style={{ height: "14px", width: "55%", marginBottom: "10px" }} />
          <div className="shimmer-line" style={{ height: "10px", width: "35%", marginBottom: "18px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
            {[1,2,3].map(m => (
              <div key={m} className="shimmer-line" style={{ height: "52px", borderRadius: "10px" }} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ReportsPage() {
  const navigate  = useNavigate();
  const { hasResults, results, pin, businessType, radius, aiAnalysis } = useAnalysis();

  const [reports,   setReports]   = useState([]);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [fetchErr,  setFetchErr]  = useState(null);
  const [saveState, setSaveState] = useState("idle"); // "idle"|"saving"|"saved"|"error"

  // ── Determine if current user is authenticated ────────────────────────────
  const currentUser = auth.currentUser;

  // ── Fetch reports on mount ────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setFetchErr(null);
    try {
      if (currentUser) {
        const data = await getUserReports(currentUser.uid);
        setReports(data);
      } else {
        // Guest: fall back to localStorage
        setReports(apiService.getReports());
      }
    } catch (err) {
      console.error("[ReportsPage] fetchReports:", err);
      setFetchErr("Could not load your reports. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = reports.filter((r) => {
    const name = (r.reportName ?? r.title ?? "").toLowerCase();
    const loc  = (r.location ?? "").toLowerCase();
    const q    = search.toLowerCase();
    return name.includes(q) || loc.includes(q);
  });

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      if (currentUser) {
        await firestoreDeleteReport(id);
      } else {
        apiService.deleteReport(id);
      }
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("[ReportsPage] handleDelete:", err);
    }
  };

  // ── Save current scan ─────────────────────────────────────────────────────
  const buildPayload = () => {
    if (!results || !pin) return null;
    return {
      title:       `${businessType.charAt(0).toUpperCase() + businessType.slice(1)} — ${results.districtName}`,
      location:    results.districtName,
      date:        new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      score:       results.feasibility,
      competitors: results.competitors,
      saturation:  results.saturation,
      status:      results.feasibility >= 75 ? "strong" : results.feasibility >= 55 ? "moderate" : "weak",
      businessType, lat: pin.lat, lng: pin.lng, radius,
      fullResults: results,
      aiAnalysis:  aiAnalysis ?? null,
    };
  };

  const handleSaveCurrent = async () => {
    if (saveState === "saving") return;
    const payload = buildPayload();
    if (!payload) return;
    setSaveState("saving");
    try {
      if (currentUser) {
        await firestoreSaveReport(currentUser.uid, payload);
      } else {
        apiService.saveReport(payload);
      }
      setSaveState("saved");
      await fetchReports(); // refresh list
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      console.error("[ReportsPage] handleSaveCurrent:", err);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  // ── Helpers: map Firestore doc shape → display shape ─────────────────────
  const displayTitle      = (r) => r.reportName  ?? r.title      ?? "Untitled Report";
  const displayLocation   = (r) => r.location    ?? "";
  const displayDate       = (r) => r.dateLabel   ?? r.date       ?? "";
  const displayScore      = (r) => r.feasibilityScore ?? r.score ?? 0;
  const displayCompetitors= (r) => r.competitorCount  ?? r.competitors ?? "—";
  const displaySaturation = (r) => r.saturation  ?? 0;
  const displayStatus     = (r) => r.status      ?? "moderate";
  const displayAi         = (r) => r.aiInsightsSummary ?? r.aiAnalysis ?? null;

  return (
    <div style={{ padding: "28px" }}>
      {/* Header */}
      <div className="fade-in" style={{ marginBottom: "28px" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 600, color: "var(--color-brand)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "6px" }}>
          Archive
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700, color: "var(--color-dark)", letterSpacing: "-0.5px", marginBottom: "6px" }}>
              Saved Reports
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "13.5px", color: "var(--color-text)" }}>
              {loading ? "Loading your reports…"
                : reports.length > 0
                  ? `${reports.length} report${reports.length > 1 ? "s" : ""} saved`
                  : "No reports yet"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            {/* Save current scan button */}
            {hasResults && (
              <button
                onClick={handleSaveCurrent}
                disabled={saveState === "saving"}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "11px 18px", borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--color-brand)",
                  background: saveState === "saved" ? "var(--color-success)" : "transparent",
                  color: "var(--color-brand)",
                  fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-body)",
                  cursor: saveState === "saving" ? "not-allowed" : "pointer",
                  transition: "all .2s", opacity: saveState === "saving" ? 0.7 : 1,
                }}
              >
                {saveState === "saving" && (
                  <span style={{ width: "11px", height: "11px", border: "2px solid rgba(63,125,88,.3)", borderTop: "2px solid var(--color-brand)", borderRadius: "50%", display: "inline-block", animation: "reportsSpin .7s linear infinite" }} />
                )}
                {saveState === "saving" ? "Saving report…"
                  : saveState === "saved" ? "✓ Saved!"
                  : saveState === "error"  ? "Error — retry"
                  : "Save Current Scan"}
              </button>
            )}

            <button
              onClick={() => navigate("/scan")}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "11px 18px", borderRadius: "var(--radius-md)", border: "none",
                background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
                color: "var(--color-card)", fontSize: "13px", fontWeight: 700,
                fontFamily: "var(--font-body)", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(63,125,88,.35)",
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Scan
            </button>
          </div>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes reportsSpin { to { transform: rotate(360deg); } }`}</style>

      {/* Fetch error banner */}
      {fetchErr && !loading && (
        <div className="fade-in" style={{
          marginBottom: "20px", padding: "14px 18px", borderRadius: "var(--radius-md)",
          background: "#fee2e2", border: "1px solid rgba(220,38,38,.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
        }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#991b1b", margin: 0 }}>
            {fetchErr}
          </p>
          <button
            onClick={fetchReports}
            style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, color: "#991b1b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Search bar */}
      {!loading && reports.length > 0 && (
        <div className="fade-in fade-in-1" style={{ position: "relative", marginBottom: "20px" }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--color-text)" strokeWidth={2}
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" placeholder="Search reports…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-accent)", background: "var(--color-app-bg)", color: "var(--color-dark)", fontSize: "13.5px", fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }}
            onFocus={(e) => { e.target.style.borderColor = "var(--color-brand)"; e.target.style.boxShadow = "0 0 0 3px rgba(63,125,88,.12)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: "14px" }}>
          <ReportSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchErr && reports.length === 0 && (
        <div className="fade-in fade-in-1" style={{ textAlign: "center", padding: "60px 20px", background: "var(--color-card)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-accent)" }}>
          <div style={{ fontSize: "36px", marginBottom: "14px" }}>📋</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "8px" }}>
            No reports saved yet
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", marginBottom: "22px" }}>
            Run a scan and save the results to build your report archive
          </div>
          <button
            onClick={() => navigate("/scan")}
            style={{ padding: "12px 24px", borderRadius: "var(--radius-md)", border: "none", background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))", color: "var(--color-card)", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-body)", cursor: "pointer" }}
          >
            Start First Scan →
          </button>
        </div>
      )}

      {/* Reports grid */}
      {!loading && (
        <div className="fade-in fade-in-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: "14px" }}>

          {/* No-match state */}
          {filtered.length === 0 && reports.length > 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--color-card)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-accent)", color: "var(--color-text)", fontFamily: "var(--font-body)", fontSize: "14px" }}>
              No reports match your search.
            </div>
          )}

          {filtered.map((r) => {
            const s     = STATUS_STYLES[displayStatus(r)] ?? STATUS_STYLES.moderate;
            const score = displayScore(r);
            const sat   = displaySaturation(r);
            const ai    = displayAi(r);

            return (
              <div
                key={r.id}
                style={{ background: "var(--color-card)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(230,211,173,.6)", padding: "20px 22px", boxShadow: "var(--shadow-sm)", transition: "transform .18s, box-shadow .18s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700, color: "var(--color-dark)" }}>
                        {displayTitle(r)}
                      </span>
                      <span style={{ background: s.bg, color: s.color, fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", fontFamily: "var(--font-body)", flexShrink: 0 }}>
                        {s.label}
                      </span>
                      {ai && (
                        <span style={{ background: "rgba(63,125,88,.1)", color: "var(--color-brand)", fontSize: "9.5px", fontWeight: 700, padding: "2px 7px", borderRadius: "10px", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                          <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
                          </svg>
                          AI
                        </span>
                      )}
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)" }}>
                      📍 {displayLocation(r)} · {displayDate(r)}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => navigate("/scan")}
                      style={{ padding: "7px 14px", borderRadius: "8px", border: "1.5px solid var(--color-accent)", background: "transparent", color: "var(--color-brand)", fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-body)", cursor: "pointer" }}
                    >
                      Re-run
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      style={{ padding: "7px 10px", borderRadius: "8px", border: "1.5px solid rgba(220,38,38,.2)", background: "transparent", color: "#dc2626", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Metric strip */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
                  {[
                    { label: "Feasibility", value: `${score}%`,   color: score >= 75 ? "var(--color-brand)" : "#b45309" },
                    { label: "Competitors", value: displayCompetitors(r), color: "var(--color-dark)" },
                    { label: "Saturation",  value: `${sat}%`,     color: sat  <= 35 ? "var(--color-brand)" : "#b45309"  },
                  ].map((m) => (
                    <div key={m.label} style={{ background: "rgba(252,252,253,.7)", borderRadius: "10px", padding: "10px 13px", border: "1px solid rgba(230,211,173,.4)" }}>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)", marginBottom: "3px" }}>{m.label}</div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* District detail row */}
                {r.fullResults?.districtName && (
                  <div style={{ marginTop: "10px", fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--color-text)" }}>
                    🏙 {r.fullResults.districtName}
                    {r.fullResults.youthPercentage && ` · Youth: ${r.fullResults.youthPercentage.toFixed(1)}%`}
                    {r.fullResults.avgRating       && ` · Avg Rating: ★ ${r.fullResults.avgRating}`}
                  </div>
                )}

                {/* AI accordion */}
                {ai && <AiAnalysisAccordion analysis={ai} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}