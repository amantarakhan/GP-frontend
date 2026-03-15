import React, { useState } from "react";
import InputPanel      from "../components/scan/InputPanel";
import MapContainer    from "../components/scan/MapContainer";
import ResultPanel     from "../components/scan/ResultPanel";
import CompetitorList  from "../components/scan/CompetitorList";
import AiInsightsPanel from "../components/scan/AiInsightsPanel";
import CompareModal    from "../components/scan/CompareModal";
import { useLocationAnalysis } from "../hooks/useLocationAnalysis";
import { auth } from "../firebase"; // Use two dots to go up to src
import { saveReport as firestoreSaveReport } from "../services/dbService"; // Use two dots to go up to src
// ── Floating Compare Button ───────────────────────────────────────────────────
function CompareButton() {
  const { hasResults, compareMode, setCompareMode, comparePicking } = useLocationAnalysis();
  const [hovered, setHovered] = useState(false);

  if (!hasResults || compareMode || comparePicking) return null;

  return (
    <>
      <style>{`
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(16px) scale(.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }
        @keyframes floatPulse {
          0%, 100% { box-shadow: 0 8px 30px rgba(99,102,241,.4), 0 0 0 0   rgba(99,102,241,.3); }
          50%       { box-shadow: 0 8px 30px rgba(99,102,241,.5), 0 0 0 8px rgba(99,102,241,0);  }
        }
      `}</style>
      <button
        onClick={() => setCompareMode(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position:      "fixed",
          bottom:        "32px",
          right:         "32px",
          zIndex:        500,
          display:       "flex",
          alignItems:    "center",
          gap:           "10px",
          padding:       "13px 20px",
          borderRadius:  "50px",
          border:        "none",
          background:    hovered
            ? "linear-gradient(135deg,#7c3aed,#4338ca)"
            : "linear-gradient(135deg,#6366f1,#4338ca)",
          color:         "#fff",
          fontFamily:    "var(--font-body)",
          fontSize:      "13px",
          fontWeight:    700,
          cursor:        "pointer",
          letterSpacing: ".3px",
          animation:     "floatIn .5s cubic-bezier(.34,1.56,.64,1) both, floatPulse 2.5s ease 1s infinite",
          transform:     hovered ? "translateY(-2px) scale(1.03)" : "none",
          transition:    "background .2s, transform .2s",
        }}
      >
        {/* Icon: two bars side by side */}
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6"  y1="20" x2="6"  y2="14"/>
        </svg>
        Compare Location
        {/* Arrow */}
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          style={{ opacity: hovered ? 1 : 0.7, transition: "opacity .2s, transform .2s", transform: hovered ? "translateX(2px)" : "none" }}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </>
  );
}

// ── ScanPage ──────────────────────────────────────────────────────────────────
export default function ScanPage() {
  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative" }}>
      {/* ── Left: Input panel ── */}
      {/* className applied inside InputPanel's root div — see note below */}
      <InputPanel />

      {/* ── Right: Map + results ── */}
      <div style={{
        flex:          1,
        overflowY:     "auto",
        overflowX:     "hidden",
        padding:       "20px",
        minWidth:      0,
        display:       "flex",
        flexDirection: "column",
        gap:           "16px",
      }}>
        {/* Map header */}
        <div className="fade-in" style={{ flexShrink: 0 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: 700, color: "var(--color-dark)", letterSpacing: "-0.3px", marginBottom: "2px" }}>
            Target Location
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)" }}>
            Click the map to drop a pin and define your analysis zone
          </p>
        </div>

        {/* Map */}
        <div className="fade-in fade-in-1" style={{
          height:       "420px",
          flexShrink:   0,
          borderRadius: "var(--radius-xl)",
          border:       "1px solid rgba(230,211,173,.5)",
          overflow:     "hidden",
          boxShadow:    "var(--shadow-md)",
        }}>
          <MapContainer />
        </div>

        {/* Results */}
        <div className="fade-in fade-in-2" style={{ flexShrink: 0 }}>
          <ResultPanel />
        </div>

        {/* Competitor list */}
        <div className="fade-in fade-in-3" style={{ flexShrink: 0 }}>
          <CompetitorList />
        </div>

        {/* AI Insights */}
        <div className="fade-in fade-in-4" style={{ flexShrink: 0, paddingBottom: "20px" }}>
          <AiInsightsPanel />
        </div>
      </div>

      {/* ── Floating compare button ── */}
      <CompareButton />

      {/* ── Compare modal (portal-style fixed overlay) ── */}
      <CompareModal />
    </div>
  );
}