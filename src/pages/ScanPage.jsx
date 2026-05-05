import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import InputPanel      from "../components/scan/InputPanel";
import MapContainer    from "../components/scan/MapContainer";
import ResultPanel     from "../components/scan/ResultPanel";
import CompetitorList  from "../components/scan/CompetitorList";
import AiInsightsPanel from "../components/scan/AiInsightsPanel";
import CompareModal    from "../components/scan/CompareModal";
import { useAnalysis } from "../context/AnalysisContext";

// ── Reset Confirmation Modal ───────────────────────────────────────────────────
function ResetModal({ onSaveAndReset, onResetOnly, onCancel, isSaving, t }) {
  return createPortal(
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 8000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "tut-fadeIn .2s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-card)",
          borderRadius: "18px",
          border: "1px solid rgba(230,211,173,.7)",
          boxShadow: "0 24px 64px rgba(0,0,0,.28)",
          padding: "32px 28px 24px",
          width: "340px",
          animation: "tut-tooltipIn .3s cubic-bezier(.34,1.28,.64,1) both",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "rgba(234,179,8,.12)",
          border: "1px solid rgba(234,179,8,.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 18,
        }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
               stroke="#ca8a04" strokeWidth={2} strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.5}/>
          </svg>
        </div>

        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700,
          color: "var(--color-dark)", margin: "0 0 8px", letterSpacing: -0.3,
        }}>
          {t("scan.resetScanTitle")}
        </h2>
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 13,
          color: "var(--color-text)", lineHeight: 1.65, margin: "0 0 24px",
        }}>
          {t("scan.resetScanDesc")}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Save & Reset */}
          <button
            onClick={onSaveAndReset}
            disabled={isSaving}
            style={{
              width: "100%", padding: "12px 16px",
              borderRadius: "var(--radius-md)", border: "none",
              background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
              color: "#fff", fontSize: 13.5, fontWeight: 700,
              fontFamily: "var(--font-body)", cursor: isSaving ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 14px rgba(63,125,88,.3)",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? (
              <>
                <svg className="spin" width="14" height="14" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                {t("scan.saving")}
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17,21 17,13 7,13 7,21"/>
                  <polyline points="7,3 7,8 15,8"/>
                </svg>
                {t("scan.saveAndReset")}
              </>
            )}
          </button>

          {/* Reset without saving */}
          <button
            onClick={onResetOnly}
            disabled={isSaving}
            style={{
              width: "100%", padding: "11px 16px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid rgba(220,38,38,.25)",
              background: "transparent", color: "#dc2626",
              fontSize: 13, fontWeight: 600,
              fontFamily: "var(--font-body)", cursor: isSaving ? "default" : "pointer",
              opacity: isSaving ? 0.5 : 1,
            }}
          >
            {t("scan.discardAndReset")}
          </button>

          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={isSaving}
            style={{
              width: "100%", padding: "9px 16px",
              borderRadius: "var(--radius-md)", border: "none",
              background: "transparent", color: "var(--color-text)",
              fontSize: 12.5, fontWeight: 500,
              fontFamily: "var(--font-body)", cursor: isSaving ? "default" : "pointer",
              opacity: isSaving ? 0.5 : 0.8,
            }}
          >
            {t("scan.cancel")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── ScanPage ──────────────────────────────────────────────────────────────────
export default function ScanPage() {
  const { t } = useTranslation();
  const {
    hasResults, saveCurrentReport, resetAnalysis,
    setComparePicking, comparePin, comparePicking,
  } = useAnalysis();

  const [showResetModal, setShowResetModal] = useState(false);
  const [isSaving,       setIsSaving]       = useState(false);

  const handleResetClick = () => {
    if (hasResults) {
      setShowResetModal(true);
    } else {
      resetAnalysis();
    }
  };

  const handleSaveAndReset = async () => {
    setIsSaving(true);
    try {
      await saveCurrentReport();
    } finally {
      setIsSaving(false);
      setShowResetModal(false);
      resetAnalysis();
    }
  };

  const handleResetOnly = () => {
    setShowResetModal(false);
    resetAnalysis();
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative" }}>
      {/* ── Left: Input panel ── */}
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
        <div className="fade-in" style={{ flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: 700, color: "var(--color-dark)", letterSpacing: "-0.3px", marginBottom: "2px" }}>
              {t("scan.targetLocation")}
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)" }}>
              {t("scan.clickMapWarning")}
            </p>
          </div>

          {/* Right-side actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {/* Compare Location — visible after a scan, hidden while picking */}
            {hasResults && !comparePin && !comparePicking && (
              <button
                onClick={() => setComparePicking(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "var(--radius-md)",
                  border: "1.5px solid rgba(99,102,241,.4)",
                  background: "rgba(99,102,241,.07)",
                  color: "#6366f1", fontSize: "12.5px", fontWeight: 700,
                  fontFamily: "var(--font-body)", cursor: "pointer",
                  transition: "all .18s", whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(99,102,241,.14)";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,.65)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(99,102,241,.07)";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,.4)";
                }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6"  y1="20" x2="6"  y2="14"/>
                </svg>
                {t("scan.compareLocation")}
              </button>
            )}

            {/* Reset / New Scan button */}
            <button
              onClick={handleResetClick}
              title={t("scan.resetScan")}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "var(--radius-md)",
                border: "1.5px solid rgba(230,211,173,.7)",
                background: "var(--color-card)", color: "var(--color-text)",
                fontSize: "12.5px", fontWeight: 600, fontFamily: "var(--font-body)",
                cursor: "pointer", transition: "all .18s", whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(63,125,88,.4)";
                e.currentTarget.style.color = "var(--color-brand)";
                e.currentTarget.style.background = "rgba(63,125,88,.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(230,211,173,.7)";
                e.currentTarget.style.color = "var(--color-text)";
                e.currentTarget.style.background = "var(--color-card)";
              }}
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1,4 1,10 7,10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-4.9"/>
              </svg>
              {t("scan.resetScan")}
            </button>
          </div>
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

      {/* ── Compare modal picking banner ── */}
      <CompareModal />

      {/* ── Reset confirmation modal ── */}
      {showResetModal && (
        <ResetModal
          onSaveAndReset={handleSaveAndReset}
          onResetOnly={handleResetOnly}
          onCancel={() => setShowResetModal(false)}
          isSaving={isSaving}
          t={t}
        />
      )}
    </div>
  );
}
