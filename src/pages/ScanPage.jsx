import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import InputPanel      from "../components/scan/InputPanel";
import MapContainer    from "../components/scan/MapContainer";
import ResultPanel     from "../components/scan/ResultPanel";
import CompetitorList  from "../components/scan/CompetitorList";
import AiInsightsPanel from "../components/scan/AiInsightsPanel";
import CompareModal    from "../components/scan/CompareModal";
import { useLocationAnalysis } from "../hooks/useLocationAnalysis";
import { auth } from "../firebase"; // Use two dots to go up to src
import { saveReport as firestoreSaveReport } from "../services/dbService"; // Use two dots to go up to src
// ── ScanPage ──────────────────────────────────────────────────────────────────
export default function ScanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { comparePin, comparePicking } = useLocationAnalysis();

  // After picking Location B on map, navigate back to compare page
  useEffect(() => {
    if (comparePin && !comparePicking && location.state?.returnTo) {
      navigate(location.state.returnTo, { replace: true });
    }
  }, [comparePin, comparePicking]);

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
            {t("scan.targetLocation")}
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)" }}>
            {t("scan.clickMapWarning")}
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

      {/* ── Compare modal picking banner ── */}
      <CompareModal />
    </div>
  );
}