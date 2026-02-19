import React from "react";
import InputPanel   from "../components/scan/InputPanel";
import MapContainer from "../components/scan/MapContainer";
import ResultPanel  from "../components/scan/ResultPanel";
import CompetitorList from "../components/scan/CompetitorList";

export default function ScanPage() {
  return (
    <div style={{
      display:    "flex",
      height:     "100%",
      overflow:   "hidden",
    }}>
      {/* ── Left: Input panel ── */}
      <InputPanel />

      {/* ── Right: Map + results ── */}
      <div style={{
        flex:          1,
        display:       "flex",
        flexDirection: "column",
        overflow:      "hidden",
        padding:       "20px",
        gap:           "16px",
        minWidth:      0,
      }}>
        {/* Map header */}
        <div className="fade-in" style={{ flexShrink:0 }}>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"19px", fontWeight:700, color:"var(--color-dark)", letterSpacing:"-0.3px", marginBottom:"2px" }}>
            Target Location
          </h2>
          <p style={{ fontFamily:"var(--font-body)", fontSize:"12px", color:"var(--color-text)" }}>
            Click the map to drop a pin and define your analysis zone
          </p>
        </div>

        {/* Map */}
        <div className="fade-in fade-in-1" style={{
          flex:         1,
          borderRadius: "var(--radius-xl)",
          border:       "1px solid rgba(230,211,173,.5)",
          overflow:     "hidden",
          minHeight:    "0",
          boxShadow:    "var(--shadow-md)",
        }}>
          <MapContainer />
        </div>

        {/* Results */}
        <div className="fade-in fade-in-2" style={{ flexShrink:0 }}>
          <ResultPanel />
        </div>

        {/* Competitor list */}
        <div className="fade-in fade-in-3" style={{ flexShrink:0 }}>
          <CompetitorList />
        </div>
      </div>
    </div>
  );
}