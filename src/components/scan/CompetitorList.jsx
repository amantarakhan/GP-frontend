import React, { useState } from "react";
import { MOCK_COMPETITORS } from "../../constants";
import { useLocationAnalysis } from "../../hooks/useLocationAnalysis";

const STATUS_STYLES = {
  high:   { bg:"#fee2e2", color:"#991b1b", label:"High Threat"   },
  medium: { bg:"var(--color-accent)", color:"var(--color-dark)", label:"Medium" },
  low:    { bg:"var(--color-success)", color:"var(--color-brand)", label:"Low Threat" },
};

export default function CompetitorList() {
  const { hasResults } = useLocationAnalysis();
  const [expanded, setExpanded] = useState(true);

  if (!hasResults) return null;

  return (
    <div style={{
      background:   "var(--color-card)",
      borderRadius: "var(--radius-lg)",
      border:       "1px solid rgba(230,211,173,.6)",
      overflow:     "hidden",
      boxShadow:    "var(--shadow-sm)",
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "15px 18px",
          cursor:         "pointer",
          borderBottom:   expanded ? "1px solid rgba(230,211,173,.5)" : "none",
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <span style={{ fontFamily:"var(--font-body)", fontSize:"13px", fontWeight:700, color:"var(--color-dark)" }}>
            Nearby Competitors
          </span>
          <span style={{
            background:"rgba(63,125,88,.15)", color:"var(--color-brand)",
            fontSize:"10px", fontWeight:700, padding:"2px 7px",
            borderRadius:"10px", fontFamily:"monospace",
          }}>
            {MOCK_COMPETITORS.length}
          </span>
        </div>
        <svg
          width="14" height="14" fill="none" viewBox="0 0 24 24"
          stroke="var(--color-text)" strokeWidth={2}
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition:"transform .2s" }}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>

      {/* List */}
      {expanded && (
        <div>
          {MOCK_COMPETITORS.map((c, i) => {
            const s = STATUS_STYLES[c.status];
            return (
              <div
                key={c.id}
                style={{
                  display:       "flex",
                  alignItems:    "center",
                  gap:           "12px",
                  padding:       "11px 18px",
                  borderBottom:  i < MOCK_COMPETITORS.length - 1 ? "1px solid rgba(230,211,173,.35)" : "none",
                  transition:    "background .15s",
                  cursor:        "pointer",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(245,242,225,.7)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {/* Avatar */}
                <div style={{
                  width:          "34px",
                  height:         "34px",
                  borderRadius:   "10px",
                  background:     "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       "13px",
                  fontWeight:     700,
                  color:          "var(--color-accent)",
                  flexShrink:     0,
                  fontFamily:     "var(--font-display)",
                }}>
                  {c.name[0]}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{
                    fontFamily:"var(--font-body)", fontSize:"13px", fontWeight:600,
                    color:"var(--color-dark)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                  }}>
                    {c.name}
                  </div>
                  <div style={{ fontFamily:"var(--font-body)", fontSize:"11px", color:"var(--color-text)" }}>
                    {c.type} · {c.distance}
                  </div>
                </div>

                {/* Rating */}
                <div style={{ display:"flex", alignItems:"center", gap:"4px", flexShrink:0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--color-brand)">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
                  </svg>
                  <span style={{ fontFamily:"monospace", fontSize:"11px", fontWeight:700, color:"var(--color-dark)" }}>
                    {c.rating}
                  </span>
                </div>

                {/* Status badge */}
                <span style={{
                  background:   s.bg,
                  color:        s.color,
                  fontSize:     "10px",
                  fontWeight:   700,
                  padding:      "3px 8px",
                  borderRadius: "20px",
                  fontFamily:   "var(--font-body)",
                  flexShrink:   0,
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}