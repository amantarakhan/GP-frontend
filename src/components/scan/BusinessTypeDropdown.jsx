import React, { useState, useRef, useEffect } from "react";
import { BUSINESS_TYPES } from "../../constants";

export default function BusinessTypeDropdown({ value, onChange }) {
  const [open, setOpen]     = useState(false);
  const wrapRef             = useRef(null);
  const selected            = BUSINESS_TYPES.find((b) => b.value === value);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width:         "100%",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"space-between",
          padding:       "12px 14px",
          borderRadius:  "var(--radius-md)",
          border:        `1.5px solid ${open ? "var(--color-brand)" : "var(--color-accent)"}`,
          background:    "var(--color-app-bg)",
          color:         selected ? "var(--color-dark)" : "var(--color-text)",
          fontSize:      "13.5px",
          fontFamily:    "var(--font-body)",
          fontWeight:    selected ? 500 : 400,
          cursor:        "pointer",
          boxShadow:     open ? "0 0 0 3px rgba(63,125,88,.12)" : "none",
          transition:    "all .2s",
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {selected ? `${selected.emoji}  ${selected.label}` : "Select business type"}
        </div>
        <svg
          width="15" height="15" fill="none" viewBox="0 0 24 24"
          stroke="var(--color-text)" strokeWidth={2.5}
          style={{ transform: open ? "rotate(180deg)" : "none", transition:"transform .2s" }}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:     "absolute",
          top:          "calc(100% + 5px)",
          left:         0, right: 0,
          background:   "var(--color-app-bg)",
          border:       "1.5px solid var(--color-accent)",
          borderRadius: "var(--radius-md)",
          overflow:     "hidden",
          zIndex:       200,
          boxShadow:    "var(--shadow-lg)",
          maxHeight:    "280px",
          overflowY:    "auto",
        }}>
          {BUSINESS_TYPES.map((biz, i) => {
            const isSelected = value === biz.value;
            return (
              <button
                key={biz.value}
                type="button"
                onClick={() => { onChange(biz.value); setOpen(false); }}
                style={{
                  width:         "100%",
                  display:       "flex",
                  alignItems:    "center",
                  gap:           "10px",
                  padding:       "11px 14px",
                  background:    isSelected ? "rgba(63,125,88,.08)" : "transparent",
                  color:         isSelected ? "var(--color-brand)" : "var(--color-dark)",
                  fontSize:      "13px",
                  fontFamily:    "var(--font-body)",
                  fontWeight:    isSelected ? 600 : 400,
                  border:        "none",
                  borderBottom:  i < BUSINESS_TYPES.length - 1 ? "1px solid rgba(230,211,173,.4)" : "none",
                  cursor:        "pointer",
                  textAlign:     "left",
                  transition:    "background .14s",
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(63,125,88,.05)"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize:"16px" }}>{biz.emoji}</span>
                {biz.label}
                {isSelected && (
                  <svg style={{ marginLeft:"auto" }} width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2.5}>
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}