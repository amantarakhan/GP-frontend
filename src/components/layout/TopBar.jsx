import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAnalysis } from "../../context/AnalysisContext";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/scan":      "New Scan",
  "/reports":   "Saved Reports",
};

export default function TopBar() {
  const { pathname }  = useLocation();
  const navigate      = useNavigate();
  const { hasResults, results } = useAnalysis();

  const title = PAGE_TITLES[pathname] ?? "Localyze";

  return (
    <header style={{
      height:         "56px",
      padding:        "0 28px",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      background:     "var(--color-app-bg)",
      borderBottom:   "1px solid rgba(230,211,173,.5)",
      flexShrink:     0,
      zIndex:         10,
    }}>
      {/* Breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
        <span style={{ fontFamily:"var(--font-body)", fontSize:"12px", color:"var(--color-text)", cursor:"pointer" }}
          onClick={() => navigate("/dashboard")}>
          Home
        </span>
        <span style={{ color:"var(--color-accent)", fontSize:"14px" }}>/</span>
        <span style={{ fontFamily:"var(--font-body)", fontSize:"12px", fontWeight:600, color:"var(--color-dark)" }}>
          {title}
        </span>
      </div>

      {/* Right controls */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        {hasResults && (
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "6px",
            background:   "var(--color-success)",
            padding:      "5px 12px",
            borderRadius: "20px",
            border:       "1px solid rgba(63,125,88,.2)",
          }}>
            <span style={{
              width: "6px", height:"6px", borderRadius:"50%",
              background:"var(--color-brand)",
              animation:"pulse-dot 1.8s ease infinite",
              display:"inline-block",
            }} />
            <span style={{ fontFamily:"var(--font-body)", fontSize:"11px", fontWeight:700, color:"var(--color-brand)" }}>
              Analysis Ready
            </span>
          </div>
        )}

        {/* Export */}
        <button
          onClick={() => window.print()}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "6px",
            padding:      "7px 14px",
            borderRadius: "8px",
            border:       "1.5px solid var(--color-accent)",
            background:   "var(--color-card)",
            color:        "var(--color-text)",
            fontSize:     "12px",
            fontWeight:   600,
            fontFamily:   "var(--font-body)",
          }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>

        {/* Save Report */}
        <button
          onClick={() => navigate("/reports")}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "6px",
            padding:      "7px 14px",
            borderRadius: "8px",
            border:       "none",
            background:   "var(--color-brand)",
            color:        "var(--color-card)",
            fontSize:     "12px",
            fontWeight:   600,
            fontFamily:   "var(--font-body)",
          }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17,21 17,13 7,13 7,21" />
            <polyline points="7,3 7,8 15,8" />
          </svg>
          Save Report
        </button>
      </div>
    </header>
  );
}