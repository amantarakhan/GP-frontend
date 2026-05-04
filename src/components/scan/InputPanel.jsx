import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { useLocationAnalysis } from "../../hooks/useLocationAnalysis";
import { getRadiusLabel, formatRadius, SUBCATEGORIES, MAX_RADIUS } from "../../constants";
import BusinessTypeDropdown from "./BusinessTypeDropdown";
import { auth } from "../../firebase";
import { saveReport as firestoreSaveReport } from "../../services/dbService";

// ── Sub-category dropdown ─────────────────────────────────────────────────────
const toSubKey = (v) =>
  v.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase();

function SubCategoryDropdown({ businessType, value, onChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const options = businessType ? (SUBCATEGORIES[businessType] ?? []) : [];
  const selected = options.find((o) => o.value === value);
  const optLabel = (opt) => t(`subTypes.${toSubKey(opt.value)}`, { defaultValue: opt.label });

  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // No business type selected yet
  if (!businessType) {
    return (
      <div style={{
        padding: "12px 14px", borderRadius: "var(--radius-md)",
        border: "1.5px solid var(--color-accent)", background: "var(--color-app-bg)",
        fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)",
        opacity: 0.6,
      }}>
        {t("scan.selectBusinessFirst")}
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "12px 14px",
          borderRadius: "var(--radius-md)",
          border: `1.5px solid ${open ? "var(--color-brand)" : "var(--color-accent)"}`,
          background: "var(--color-app-bg)",
          color: selected ? "var(--color-dark)" : "var(--color-text)",
          fontSize: "13.5px", fontFamily: "var(--font-body)",
          fontWeight: selected ? 500 : 400, cursor: "pointer",
          boxShadow: open ? "0 0 0 3px rgba(63,125,88,.12)" : "none",
          transition: "all .2s",
        }}
      >
        <span>{selected ? optLabel(selected) : t("scan.selectCategory")}</span>
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
          stroke="var(--color-text)" strokeWidth={2.5}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 5px)", left: 0, right: 0,
          background: "var(--color-app-bg)", border: "1.5px solid var(--color-accent)",
          borderRadius: "var(--radius-md)", overflow: "hidden", zIndex: 200,
          boxShadow: "var(--shadow-lg)", maxHeight: "240px", overflowY: "auto",
        }}>
          {options.map((opt, i) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "space-between", gap: "10px",
                  padding: "11px 14px",
                  background: isSelected ? "rgba(63,125,88,.08)" : "transparent",
                  color: isSelected ? "var(--color-brand)" : "var(--color-dark)",
                  fontSize: "13px", fontFamily: "var(--font-body)",
                  fontWeight: isSelected ? 600 : 400, border: "none",
                  borderBottom: i < options.length - 1 ? "1px solid rgba(230,211,173,.4)" : "none",
                  cursor: "pointer", textAlign: "left", transition: "background .14s",
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(63,125,88,.05)"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                {optLabel(opt)}
                {isSelected && (
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2.5}>
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

export default function InputPanel() {
  const {
    businessType, setBusinessType,
    subType,      setSubType,
    radius,       setRadius,
    location,     setLocation,
    pin,
    isAnalyzing,  canRun,
    runAnalysis,
    scanError,
    hasResults,
    results,
    aiAnalysis,
    saveCurrentReport,
  } = useLocationAnalysis();

  const { t } = useTranslation();
  const [saveState, setSaveState] = React.useState("idle"); // idle | saving | saved

  React.useEffect(() => { setSaveState("idle"); }, [hasResults]);

  const maxRadius  = MAX_RADIUS[businessType] ?? 5000;
  const sliderPct  = ((radius - 250) / (maxRadius - 250)) * 100;
  const isRTL      = i18n.language?.startsWith("ar");
  const gradDir    = isRTL ? "to left" : "to right";
  const sliderBg   = `linear-gradient(${gradDir}, var(--color-brand) 0%, var(--color-brand) ${sliderPct}%, var(--color-accent) ${sliderPct}%, var(--color-accent) 100%)`;

  // canRun requires businessType (from hook) AND a pin on the map
  const readyToRun = canRun && Boolean(pin);

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
            {t("scan.marketAnalysis")}
          </span>
        </div>
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:"24px", fontWeight:700, color:"var(--color-dark)", letterSpacing:"-0.5px", lineHeight:1.15, marginBottom:"8px" }}>
          {t("scan.locationIntelligence")}<br />{t("scan.intelligence")}
        </h1>
        <p style={{ fontFamily:"var(--font-body)", fontSize:"13px", color:"var(--color-text)", lineHeight:1.65 }}>
          {t("scan.scanDesc")}
        </p>
      </div>

      <div style={{ height:"1px", background:"rgba(230,211,173,.6)" }} />

      {/* Business Type */}
      <div>
        <Label>{t("scan.businessType")}</Label>
        <BusinessTypeDropdown value={businessType} onChange={(val) => {
          setBusinessType(val);
          setSubType("");
          const cap = MAX_RADIUS[val] ?? 5000;
          if (radius > cap) setRadius(cap);
        }} />
      </div>

      {/* Category */}
      <div>
        <Label>{t("scan.targetCategory")}</Label>
        <SubCategoryDropdown
          businessType={businessType}
          value={subType}
          onChange={(val) => { setSubType(val); }}
        />
      </div>

      {/* Radius slider */}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"12px" }}>
          <Label style={{ marginBottom:0 }}>{t("scan.searchRadius")}</Label>
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
          type="range" min={250} max={maxRadius} step={250}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ width:"100%", background: sliderBg }}
        />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px" }}>
          <span style={{ fontFamily:"monospace", fontSize:"10px", color:"var(--color-text)" }}>250m</span>
          <span style={{ fontFamily:"monospace", fontSize:"10px", color:"var(--color-text)" }}>{formatRadius(maxRadius)}</span>
        </div>
      </div>

      {/* Location */}
      <div>
        <Label>{t("scan.targetLocation")}</Label>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", color:"var(--color-text)" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2" fill="var(--color-text)" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={t("scan.clickMapOrEnter")}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={inputStyle({ paddingLeft:"37px" })}
            onFocus={(e) => { e.target.style.borderColor="var(--color-brand)"; e.target.style.boxShadow="0 0 0 3px rgba(63,125,88,.12)"; }}
            onBlur={(e)  => { e.target.style.borderColor="var(--color-accent)"; e.target.style.boxShadow="none"; }}
          />
        </div>

        {/* No-pin warning — shown only if businessType selected but map not clicked */}
        {businessType && !pin && (
          <div style={{
            marginTop:    "8px",
            display:      "flex",
            alignItems:   "center",
            gap:          "6px",
            fontFamily:   "var(--font-body)",
            fontSize:     "11.5px",
            color:        "#b45309",
          }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {t("scan.clickMapWarning")}
          </div>
        )}
      </div>

      {/* ── API error banner ── */}
      {scanError && (
        <div style={{
          borderRadius: "var(--radius-md)",
          background:   "#fee2e2",
          border:       "1px solid rgba(220,38,38,.25)",
          padding:      "12px 14px",
          display:      "flex",
          gap:          "10px",
          alignItems:   "flex-start",
        }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2} style={{ flexShrink:0, marginTop:"1px" }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div style={{ fontFamily:"var(--font-body)", fontSize:"12px", color:"#991b1b", lineHeight:1.5 }}>
            <strong style={{ display:"block", marginBottom:"2px" }}>{t("scan.scanFailed")}</strong>
            {scanError}
          </div>
        </div>
      )}

      {/* Run button */}
      <button
        onClick={runAnalysis}
        disabled={!readyToRun || isAnalyzing}
        style={{
          width:         "100%",
          padding:       "14px 20px",
          borderRadius:  "var(--radius-md)",
          border:        "none",
          background:    (!readyToRun || isAnalyzing) ? "var(--color-text)" : "linear-gradient(135deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)",
          color:         "var(--color-card)",
          fontSize:      "14px",
          fontWeight:    700,
          fontFamily:    "var(--font-body)",
          letterSpacing: ".7px",
          cursor:        (!readyToRun || isAnalyzing) ? "not-allowed" : "pointer",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          gap:           "9px",
          boxShadow:     (!readyToRun || isAnalyzing) ? "none" : "0 4px 18px rgba(63,125,88,.38)",
          transition:    "all .2s",
        }}
        onMouseEnter={(e) => { if (readyToRun && !isAnalyzing) e.currentTarget.style.transform="translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform="none"; }}
      >
        {isAnalyzing ? (
          <>
            <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            {t("scan.analyzingMarket")}
          </>
        ) : (
          <>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
            {t("scan.runAnalysis")}
          </>
        )}
      </button>

      {/* Save Report button — visible only after a scan */}
      {hasResults && (
        <button
          onClick={async () => {
            if (saveState !== "idle") return;
            setSaveState("saving");
            try {
              saveCurrentReport(); // keep localStorage in sync (sidebar badge)
              const uid = auth.currentUser?.uid;
              if (uid && results) {
                await firestoreSaveReport(uid, {
                  title:        `${businessType.charAt(0).toUpperCase() + businessType.slice(1)} — ${results.districtName || "Outside Amman"}`,
                  location:     results.districtName || "Outside Amman",
                  date:         new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                  score:        results.feasibility,
                  competitors:  results.competitors,
                  saturation:   results.saturation,
                  status:       results.feasibility >= 75 ? "strong" : results.feasibility >= 55 ? "moderate" : "weak",
                  businessType,
                  lat:          pin?.lat,
                  lng:          pin?.lng,
                  radius,
                  fullResults:  results,
                  aiAnalysis:   aiAnalysis ?? null,
                });
              }
              setSaveState("saved");
              setTimeout(() => setSaveState("idle"), 2500);
            } catch {
              setSaveState("idle");
            }
          }}
          disabled={saveState !== "idle"}
          style={{
            width:          "100%",
            padding:        "13px 20px",
            borderRadius:   "var(--radius-md)",
            border:         saveState === "saved" ? "1.5px solid rgba(63,125,88,.4)" : "1.5px solid rgba(63,125,88,.3)",
            background:     saveState === "saved"
              ? "rgba(63,125,88,.1)"
              : "transparent",
            color:          "var(--color-brand)",
            fontSize:       "14px",
            fontWeight:     700,
            fontFamily:     "var(--font-body)",
            letterSpacing:  ".4px",
            cursor:         saveState !== "idle" ? "default" : "pointer",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "8px",
            transition:     "all .2s",
          }}
          onMouseEnter={(e) => { if (saveState === "idle") e.currentTarget.style.background = "rgba(63,125,88,.07)"; }}
          onMouseLeave={(e) => { if (saveState === "idle") e.currentTarget.style.background = "transparent"; }}
        >
          {saveState === "saved" ? (
            <>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2.5}>
                <polyline points="20,6 9,17 4,12" />
              </svg>
              {t("scan.reportSaved")}
            </>
          ) : (
            <>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              {t("scan.saveReport")}
            </>
          )}
        </button>
      )}

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
          <div style={{ fontFamily:"var(--font-body)", fontSize:"11.5px", fontWeight:700, color:"var(--color-brand)", marginBottom:"3px" }}>{t("scan.proTip")}</div>
          <div style={{ fontFamily:"var(--font-body)", fontSize:"12px", color:"var(--color-text)", lineHeight:1.55 }}>
            {t("scan.proTipText")}
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