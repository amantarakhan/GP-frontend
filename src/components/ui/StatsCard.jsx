import React from "react";

const ICONS = {
  pin: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  data: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}>
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  ),
  globe: (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
};

export default function StatsCard({ icon, label, value }) {
  return (
    <div style={{
      background:   "var(--color-app-bg)",
      borderRadius: "var(--radius-md)",
      padding:      "13px 15px",
      border:       "1px solid rgba(230,211,173,.5)",
      display:      "flex",
      alignItems:   "center",
      gap:          "11px",
      transition:   "background .18s",
      cursor:       "default",
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-card)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-app-bg)"}
    >
      <div style={{
        width:          "34px",
        height:         "34px",
        borderRadius:   "9px",
        background:     "var(--color-card)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
      }}>
        {ICONS[icon]}
      </div>
      <div>
        <div style={{ fontFamily:"var(--font-body)", fontSize:"10px", color:"var(--color-text)", marginBottom:"2px" }}>
          {label}
        </div>
        <div style={{ fontFamily:"var(--font-body)", fontSize:"14px", fontWeight:700, color:"var(--color-dark)" }}>
          {value}
        </div>
      </div>
    </div>
  );
}