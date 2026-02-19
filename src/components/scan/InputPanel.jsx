import React from "react";
import { useLocationAnalysis } from "../../hooks/useLocationAnalysis";
import { getRadiusLabel, formatRadius } from "../../constants";
import BusinessTypeDropdown from "./BusinessTypeDropdown";

export default function InputPanel() {
  const {
    businessType, setBusinessType,
    category,     setCategory,
    radius,       setRadius,
    location,     setLocation,
    isAnalyzing,  canRun,
    runAnalysis,
  } = useLocationAnalysis();

  const sliderPct = ((radius - 250) / (5000 - 250)) * 100;
  const sliderBg  = `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${sliderPct}%, var(--color-accent) ${sliderPct}%, var(--color-accent) 100%)`;

  return (
    <div style={{
      width:         "330px",
      flexShrink:    0,
      background:    "var(--color-app-bg)",
      borderRight:   "1px solid rgba(230,211,173,.5)",
      overflowY:     "auto",
      padding:       "26px 22px",
      display:       "flex",
      flexDirection: "column",
      gap:           "22px",
    }}>
      {/* Header */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"6px" }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2.5}>
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
          </svg>
          <span style={{ fontFamily:"var(--font-body)", fontSize:"9.5px", fontWeight:600, color:"var(--color-brand)", letterSpacing:"2.5px", textTransform:"uppercase" }}>
            Market Analysis
          </span>
        </div>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:"24px", fontWeight:700, color:"var(--color-dark)", letterSpacing:"-0.5px", lineHeight:1.15, marginBottom:"8px" }}>
          Location<br />Intelligence
        </h1>
        <p style={{ fontFamily:"var(--font-body)", fontSize:"13px", color:"var(--color-text)", lineHeight:1.65 }}>
          Analyze foot traffic, competition density, and demand signals for your target area.
        </p>
      </div>

      <div style={{ height:"1px", background:"rgba(230,211,173,.6)" }} />

      {/* Business Type */}
      <div>
        <Label>Business Type</Label>
        <BusinessTypeDropdown value={businessType} onChange={setBusinessType} />
      </div>

      {/* Category */}
      <div>
        <Label>Target Cuisine / Category</Label>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", color:"var(--color-text)" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="e.g. Italian, Sushi, Vegan…"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle({ paddingLeft:"37px" })}
            onFocus={(e) => { e.target.style.borderColor="var(--color-brand)"; e.target.style.boxShadow="0 0 0 3px rgba(63,125,88,.12)"; }}
            onBlur={(e)  => { e.target.style.borderColor="var(--color-accent)"; e.target.style.boxShadow="none"; }}
          />
        </div>
      </div>

      {/* Radius slider */}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"12px" }}>
          <Label style={{ marginBottom:0 }}>Search Radius</Label>
          <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
            <span style={{ fontFamily:"var(--font-display)", fontSize:"16px", fontWeight:700, color:"var(--color-brand)" }}>
              {formatRadius(radius)}
            </span>
            <span style={{ background:"var(--color-accent)", color:"var(--color-dark)", fontSize:"10px", fontWeight:600, padding:"2px 8px", borderRadius:"20px", fontFamily:"var(--font-body)" }}>
              {getRadiusLabel(radius)}
            </span>
          </div>
        </div>
        <input
          type="range" min={250} max={5000} step={250}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ width:"100%", background: sliderBg }}
        />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px" }}>
          <span style={{ fontFamily:"monospace", fontSize:"10px", color:"var(--color-text)" }}>250m</span>
          <span style={{ fontFamily:"monospace", fontSize:"10px", color:"var(--color-text)" }}>5 km</span>
        </div>
      </div>

      {/* Location */}
      <div>
        <Label>Target Location</Label>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", color:"var(--color-text)" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2" fill="var(--color-text)" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Click the map or enter address…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={inputStyle({ paddingLeft:"37px" })}
            onFocus={(e) => { e.target.style.borderColor="var(--color-brand)"; e.target.style.boxShadow="0 0 0 3px rgba(63,125,88,.12)"; }}
            onBlur={(e)  => { e.target.style.borderColor="var(--color-accent)"; e.target.style.boxShadow="none"; }}
          />
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={runAnalysis}
        disabled={!canRun || isAnalyzing}
        style={{
          width:         "100%",
          padding:       "14px 20px",
          borderRadius:  "var(--radius-md)",
          border:        "none",
          background:    (!canRun || isAnalyzing) ? "var(--color-text)" : "linear-gradient(135deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)",
          color:         "var(--color-card)",
          fontSize:      "14px",
          fontWeight:    700,
          fontFamily:    "var(--font-body)",
          letterSpacing: ".7px",
          cursor:        (!canRun || isAnalyzing) ? "not-allowed" : "pointer",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          gap:           "9px",
          boxShadow:     (!canRun || isAnalyzing) ? "none" : "0 4px 18px rgba(63,125,88,.38)",
          transition:    "all .2s",
        }}
        onMouseEnter={(e) => { if (canRun && !isAnalyzing) e.currentTarget.style.transform="translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform="none"; }}
      >
        {isAnalyzing ? (
          <>
            <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Analyzing Market…
          </>
        ) : (
          <>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
            Run Analysis
          </>
        )}
      </button>

      {/* Pro tip */}
      <div style={{
        borderRadius: "var(--radius-md)",
        background:   "linear-gradient(135deg,var(--color-card) 0%,#ede8d0 100%)",
        border:       "1px solid rgba(230,211,173,.8)",
        padding:      "14px",
        display:      "flex",
        gap:          "11px",
      }}>
        <div style={{ width:"30px", height:"30px", borderRadius:"8px", background:"var(--color-brand)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-accent)" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <div style={{ fontFamily:"var(--font-body)", fontSize:"11.5px", fontWeight:700, color:"var(--color-brand)", marginBottom:"3px" }}>Pro Tip</div>
          <div style={{ fontFamily:"var(--font-body)", fontSize:"12px", color:"var(--color-text)", lineHeight:1.55 }}>
            Click anywhere on the map to set your target location before running analysis.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function Label({ children, style = {} }) {
  return (
    <div style={{
      fontFamily:   "var(--font-body)",
      fontSize:     "9.5px",
      fontWeight:   600,
      color:        "var(--color-text)",
      letterSpacing:"2px",
      textTransform:"uppercase",
      marginBottom: "9px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function inputStyle(extra = {}) {
  return {
    width:        "100%",
    padding:      "12px 14px",
    borderRadius: "var(--radius-md)",
    border:       "1.5px solid var(--color-accent)",
    background:   "var(--color-app-bg)",
    color:        "var(--color-dark)",
    fontSize:     "13.5px",
    fontFamily:   "var(--font-body)",
    outline:      "none",
    boxSizing:    "border-box",
    transition:   "border-color .2s, box-shadow .2s",
    ...extra,
  };
}