import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocationAnalysis } from "../hooks/useLocationAnalysis";
import { auth } from "../firebase";
import { saveReport as firestoreSaveReport } from "../services/dbService";
/* eslint-disable react/prop-types */

// ── Metric config (labels are i18n keys, resolved at render time) ────────────
const METRICS_CONFIG = [
  { key: "feasibility",  labelKey: "compare.feasibilityScore",  icon: "✦", higherWins: true,  format: (v) => `${v}%`, max: 100 },
  { key: "competitors",  labelKey: "compare.competitorsNearby", icon: "⬡", higherWins: false, format: (v) => v,       max: 60  },
  { key: "saturation",   labelKey: "compare.marketSaturation",  icon: "◈", higherWins: false, format: (v) => `${v}%`, max: 100 },
  { key: "footTraffic",  labelKey: "compare.footTraffic",       icon: "◉", higherWins: true,  format: (v) => `${v}`,  max: 100 },
  { key: "demandSignal", labelKey: "compare.demandSignal",      icon: "◈", higherWins: true,  format: (v) => `${v}`,  max: 100 },
];

function getOverallWinner(resultsA, resultsB) {
  if (!resultsA || !resultsB) return null;
  let scoreA = 0, scoreB = 0;
  for (const m of METRICS_CONFIG) {
    const a = resultsA[m.key] ?? 0;
    const b = resultsB[m.key] ?? 0;
    if (m.higherWins) { if (a > b) scoreA++; else if (b > a) scoreB++; }
    else              { if (a < b) scoreA++; else if (b < a) scoreB++; }
  }
  if (scoreA > scoreB) return "A";
  if (scoreB > scoreA) return "B";
  return "tie";
}

function MetricRow({ metric, valueA, valueB }) {
  const { t } = useTranslation();
  const a    = valueA ?? 0;
  const b    = valueB ?? 0;
  const pctA = Math.min((a / metric.max) * 100, 100);
  const pctB = Math.min((b / metric.max) * 100, 100);
  const aWins = metric.higherWins ? a > b : a < b;
  const bWins = metric.higherWins ? b > a : b < a;
  const tied  = a === b;

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 120px 1fr",
      alignItems: "center", gap: "20px",
      padding: "22px 0", borderBottom: "1px solid rgba(230,211,173,.4)",
    }}>
      {/* A side */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, color: aWins ? "#3f7d58" : tied ? "var(--color-dark)" : "var(--color-text)" }}>
            {metric.format(a)}
          </span>
          {aWins && !tied && (
            <span style={{ background: "rgba(63,125,88,.12)", color: "#3f7d58", fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "10px", fontFamily: "var(--font-body)", letterSpacing: ".5px", textTransform: "uppercase" }}>
              {t("compare.better")}
            </span>
          )}
        </div>
        <div style={{ width: "100%", height: "7px", borderRadius: "4px", background: "rgba(230,211,173,.4)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pctA}%`, background: aWins ? "linear-gradient(90deg,#3f7d58,#2d5c3f)" : "rgba(104,114,128,.3)", borderRadius: "4px", marginLeft: "auto", transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </div>

      {/* Center label */}
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "20px", color: "var(--color-brand)" }}>{metric.icon}</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "1.2px", lineHeight: 1.4, textAlign: "center" }}>
          {t(metric.labelKey)}
        </span>
        {tied && (
          <span style={{ fontFamily: "var(--font-body)", fontSize: "9px", fontWeight: 700, color: "#b45309", background: "rgba(180,83,9,.1)", padding: "2px 8px", borderRadius: "8px" }}>{t("compare.tie")}</span>
        )}
      </div>

      {/* B side */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {bWins && !tied && (
            <span style={{ background: "rgba(99,102,241,.12)", color: "#6366f1", fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "10px", fontFamily: "var(--font-body)", letterSpacing: ".5px", textTransform: "uppercase" }}>
              {t("compare.better")}
            </span>
          )}
          <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, color: bWins ? "#6366f1" : tied ? "var(--color-dark)" : "var(--color-text)" }}>
            {metric.format(b)}
          </span>
        </div>
        <div style={{ width: "100%", height: "7px", borderRadius: "4px", background: "rgba(230,211,173,.4)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pctB}%`, background: bWins ? "linear-gradient(90deg,#6366f1,#4338ca)" : "rgba(104,114,128,.3)", borderRadius: "4px", transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </div>
    </div>
  );
}

function LocationCard({ letter, color, pin, results, isWinner }) {
  const { t } = useTranslation();
  return (
    <div style={{
      flex: 1, borderRadius: "var(--radius-lg)",
      border: `2px solid ${isWinner ? color + "55" : "rgba(230,211,173,.5)"}`,
      background: isWinner ? `linear-gradient(135deg, ${color}0d 0%, transparent 70%)` : "var(--color-app-bg)",
      padding: "48px 44px", position: "relative", transition: "border-color .3s",
      display: "flex", flexDirection: "column", justifyContent: "center",
    }}>
      {isWinner && (
        <div style={{
          position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
          background: color, color: "#fff", fontFamily: "var(--font-body)", fontSize: "11px",
          fontWeight: 800, padding: "5px 20px", borderRadius: "20px",
          letterSpacing: "1.5px", textTransform: "uppercase", whiteSpace: "nowrap",
          boxShadow: `0 4px 14px ${color}44`,
        }}>{t("compare.recommended")}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "36px" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 8px 28px ${color}44` }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "#fff" }}>{letter}</span>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "6px" }}>{t("compare.location", { letter })}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "var(--color-text)" }}>{pin ? `${pin.lat}, ${pin.lng}` : "—"}</div>
        </div>
      </div>
      {results && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {[
            { label: t("compare.feasibility"), value: `${results.feasibility}%` },
            { label: t("compare.district"),    value: results.districtName || "Outside Amman" },
            { label: t("compare.competitors"), value: results.competitors },
            { label: t("compare.saturation"),  value: `${results.saturation}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "rgba(255,255,255,.6)", borderRadius: "14px", padding: "20px 22px" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "8px" }}>{label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "var(--color-dark)" }}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_COLOR = { high: "#dc2626", medium: "#b45309", low: "#3f7d58" };

function CompetitorColumn({ letter, color, competitors, t }) {
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? competitors : competitors.slice(0, 5);

  return (
    <div style={{
      background: "var(--color-card)", borderRadius: "var(--radius-lg)",
      border: `1px solid ${color}33`, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "13px 16px", borderBottom: "1px solid rgba(230,211,173,.4)",
        background: `${color}08`,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%", background: color,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, color: "#fff" }}>{letter}</span>
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "1px" }}>
          {t("compare.location", { letter })}
        </span>
        <span style={{
          marginLeft: "auto", background: `${color}20`, color,
          fontSize: "10px", fontWeight: 700, padding: "2px 8px",
          borderRadius: "10px", fontFamily: "monospace",
        }}>
          {competitors.length}
        </span>
      </div>

      {/* Rows */}
      {competitors.length === 0 ? (
        <div style={{ padding: "20px 16px", textAlign: "center", fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)", opacity: .6 }}>
          {t("compare.noCompetitors")}
        </div>
      ) : (
        <>
          {visible.map((c) => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 16px", borderBottom: "1px solid rgba(230,211,173,.25)",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
                background: `linear-gradient(135deg,${color},${color}bb)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontSize: "12px", fontWeight: 700, color: "#fff",
              }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "var(--color-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.name}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "10.5px", color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.address}
                </div>
              </div>
              {c.rating && (
                <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-brand)">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
                  </svg>
                  <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "var(--color-dark)" }}>{c.rating.toFixed(1)}</span>
                </div>
              )}
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: STATUS_COLOR[c.status] ?? "#687280",
              }} title={c.status} />
            </div>
          ))}
          {competitors.length > 5 && (
            <button
              onClick={() => setShowAll(v => !v)}
              style={{
                width: "100%", padding: "10px", background: "none", border: "none",
                fontFamily: "var(--font-body)", fontSize: "11.5px", fontWeight: 600,
                color, cursor: "pointer",
              }}
            >
              {showAll ? t("competitors.showLess") : t("competitors.showAll", { count: competitors.length })}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function CompareSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          height: "72px", borderRadius: "10px",
          background: "linear-gradient(90deg,rgba(99,102,241,.06) 25%,rgba(99,102,241,.12) 50%,rgba(99,102,241,.06) 75%)",
          backgroundSize: "200% 100%",
          animation: `compareShimmer 1.6s infinite ${i * 0.1}s`,
        }} />
      ))}
      <style>{`@keyframes compareShimmer { from{background-position:200% 0} to{background-position:-200% 0} }`}</style>
    </div>
  );
}

export default function ComparePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    comparePin,      setComparePin,
    setComparePicking,
    compareResults,
    hasCompareResults,
    isComparing,
    compareError,
    runCompareAnalysis,
    pin,
    results,
    resetCompare,
    hasResults,
  } = useLocationAnalysis();

  // Compare is triggered manually via the "Run Comparison" button in CompareModal

  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved

  const winner = getOverallWinner(results, compareResults);

  const handlePickOnMap = () => {
    setComparePicking(true);
    navigate("/scan", { state: { returnTo: "/compare" } });
  };

  const handleReset = () => {
    resetCompare();
    setComparePin(null);
    setSaveState("idle");
  };

  const handleSaveComparison = async () => {
    if (saveState !== "idle") return;
    setSaveState("saving");
    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const distA = results?.districtName || "Outside Amman";
        const distB = compareResults?.districtName || "Outside Amman";
        const bt    = results?.businessType ?? "";
        await firestoreSaveReport(uid, {
          title:       `Comparison: ${distA} vs ${distB}`,
          location:    `${distA} vs ${distB}`,
          businessType: bt,
          date:        new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          score:       Math.max(results?.feasibility ?? 0, compareResults?.feasibility ?? 0),
          competitors: (results?.competitors ?? 0) + (compareResults?.competitors ?? 0),
          saturation:  Math.round(((results?.saturation ?? 0) + (compareResults?.saturation ?? 0)) / 2),
          status:      winner === "tie" ? "moderate" : "strong",
          lat:         pin?.lat,
          lng:         pin?.lng,
          radius:      null,
          fullResults: { type: "comparison", winner, pinA: pin, pinB: comparePin, resultsA: results, resultsB: compareResults },
          aiAnalysis:  null,
        });
      }
      setSaveState("saved");
    } catch {
      setSaveState("idle");
    }
  };

  return (
    <div style={{ padding: "32px 36px", width: "100%", boxSizing: "border-box" }}>
      <style>{`
        @keyframes winnerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(63,125,88,.3); }
          50%       { box-shadow: 0 0 0 10px rgba(63,125,88,0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Page header ── */}
      <div className="fade-in" style={{ marginBottom: "36px" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 600, color: "var(--color-brand)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "8px" }}>
          {t("compare.analysis")}
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 700, color: "var(--color-dark)", letterSpacing: "-0.5px", marginBottom: "8px" }}>
              {t("compare.locationComparison")}
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "var(--color-text)", lineHeight: 1.6 }}>
              {t("compare.sideBySideDesc")}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "6px", flexWrap: "wrap" }}>
            {hasCompareResults && (
              <button
                onClick={handleSaveComparison}
                disabled={saveState !== "idle"}
                style={{
                  fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 700,
                  color: saveState === "saved" ? "var(--color-brand)" : "#fff",
                  background: saveState === "saved"
                    ? "rgba(63,125,88,.1)"
                    : "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
                  border: saveState === "saved" ? "1.5px solid rgba(63,125,88,.35)" : "none",
                  borderRadius: "10px", padding: "10px 20px", cursor: saveState !== "idle" ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: "7px",
                  boxShadow: saveState === "saved" ? "none" : "0 4px 14px rgba(63,125,88,.3)",
                  opacity: saveState === "saving" ? 0.7 : 1,
                  transition: "all .2s",
                }}
              >
                {saveState === "saving" ? (
                  <>
                    <svg className="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    {t("scan.saving")}
                  </>
                ) : saveState === "saved" ? (
                  <>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="20,6 9,17 4,12"/></svg>
                    {t("compare.comparisonSaved")}
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17,21 17,13 7,13 7,21"/>
                      <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    {t("compare.saveComparison")}
                  </>
                )}
              </button>
            )}
            {(comparePin || hasCompareResults) && (
              <button
                onClick={handleReset}
                style={{
                  fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600,
                  color: "#dc2626", background: "rgba(220,38,38,.07)",
                  border: "1px solid rgba(220,38,38,.2)", borderRadius: "10px",
                  padding: "10px 20px", cursor: "pointer",
                }}
              >
                {t("compare.resetComparison")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── No scan yet ── */}
      {!hasResults && (
        <div className="fade-in" style={{
          background: "var(--color-card)", borderRadius: "var(--radius-lg)",
          border: "1px solid rgba(230,211,173,.6)", padding: "72px 24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📍</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "10px" }}>
            {t("compare.noScanYet")}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--color-text)", marginBottom: "28px" }}>
            {t("compare.noScanDesc")}
          </p>
          <button
            onClick={() => navigate("/scan")}
            style={{
              fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700,
              color: "#fff", background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
              border: "none", borderRadius: "999px", padding: "14px 32px", cursor: "pointer",
            }}
          >
            {t("compare.goToScan")}
          </button>
        </div>
      )}

      {hasResults && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* ── Winner banner ── */}
          {hasCompareResults && winner && (
            <div className="fade-in" style={{
              borderRadius: "var(--radius-lg)", padding: "24px 28px",
              background: winner === "tie"
                ? "linear-gradient(135deg,rgba(180,83,9,.08),rgba(180,83,9,.03))"
                : winner === "A"
                  ? "linear-gradient(135deg,rgba(63,125,88,.12),rgba(63,125,88,.03))"
                  : "linear-gradient(135deg,rgba(99,102,241,.12),rgba(99,102,241,.03))",
              border: winner === "tie"
                ? "1px solid rgba(180,83,9,.2)"
                : winner === "A"
                  ? "1px solid rgba(63,125,88,.25)"
                  : "1px solid rgba(99,102,241,.25)",
              display: "flex", alignItems: "center", gap: "20px",
              animation: "fadeInUp .5s ease .2s both",
            }}>
              <div style={{
                width: "60px", height: "60px", flexShrink: 0, borderRadius: "50%",
                background: winner === "tie" ? "#b45309" : winner === "A" ? "#3f7d58" : "#6366f1",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 6px 20px ${winner === "tie" ? "rgba(180,83,9,.3)" : winner === "A" ? "rgba(63,125,88,.35)" : "rgba(99,102,241,.35)"}`,
                animation: winner !== "tie" ? "winnerPulse 2s ease infinite" : "none",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "#fff" }}>
                  {winner === "tie" ? "=" : winner}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "5px" }}>
                  {winner === "tie" ? t("compare.evenlyMatched") : t("compare.betterChoice", { winner })}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--color-text)" }}>
                  {winner === "tie"
                    ? t("compare.considerFactors")
                    : winner === "A"
                      ? t("compare.higherFeasibility")
                      : t("compare.betterOpportunity")}
                </div>
              </div>
            </div>
          )}

          {/* ── Location cards row ── */}
          <div className="fade-in fade-in-1" style={{ display: "flex", gap: "20px", alignItems: "stretch", minHeight: "calc(100vh - 320px)" }}>
            <LocationCard letter="A" color="#3f7d58" pin={pin} results={results} isWinner={hasCompareResults && winner === "A"} />

            {/* VS divider */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", flexShrink: 0, padding: "0 8px" }}>
              <div style={{ width: "2px", flex: 1, background: "linear-gradient(to bottom,transparent,rgba(230,211,173,.6),transparent)" }} />
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--color-card)", border: "2px solid var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: "var(--color-text)", flexShrink: 0, boxShadow: "0 4px 16px rgba(0,0,0,.07)" }}>VS</div>
              <div style={{ width: "2px", flex: 1, background: "linear-gradient(to bottom,transparent,rgba(230,211,173,.6),transparent)" }} />
            </div>

            {/* Location B */}
            {!comparePin ? (
              <div
                onClick={handlePickOnMap}
                style={{
                  flex: 1, borderRadius: "var(--radius-lg)",
                  border: "2px dashed rgba(99,102,241,.35)", background: "rgba(99,102,241,.03)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: "28px",
                  cursor: "pointer", transition: "background .2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,.07)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(99,102,241,.03)"}
              >
                <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "rgba(99,102,241,.1)", border: "2px solid rgba(99,102,241,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth={1.8}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <line x1="12" y1="5" x2="12" y2="13"/><line x1="8" y1="9" x2="16" y2="9"/>
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, color: "#6366f1", marginBottom: "12px" }}>{t("compare.pickLocationB")}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "var(--color-text)", lineHeight: 1.7 }}>{t("compare.clickMapSelect")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 28px", borderRadius: "14px", background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.2)" }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth={2.5}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/></svg>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 700, color: "#6366f1" }}>{t("compare.tapMapToPlace")}</span>
                </div>
              </div>
            ) : (
              <LocationCard letter="B" color="#6366f1" pin={comparePin} results={compareResults} isWinner={hasCompareResults && winner === "B"} />
            )}
          </div>

          {/* ── Metrics table ── */}
          {comparePin && (
            <div className="fade-in fade-in-2" style={{ background: "var(--color-card)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(230,211,173,.6)", padding: "28px 32px" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 1fr", gap: "20px", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#3f7d58" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "#3f7d58", textTransform: "uppercase", letterSpacing: "1.5px" }}>{t("compare.locationA")}</span>
                </div>
                <div />
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#6366f1" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "1.5px" }}>{t("compare.locationB")}</span>
                </div>
              </div>

              {isComparing && <CompareSkeleton />}

              {compareError && !isComparing && (
                <div style={{ borderRadius: "var(--radius-md)", background: "#fee2e2", border: "1px solid rgba(220,38,38,.2)", padding: "16px 20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2} style={{ flexShrink: 0, marginTop: "2px" }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#991b1b", display: "block", marginBottom: "4px" }}>{t("compare.compareFailed")}</strong>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#991b1b" }}>{compareError}</span>
                  </div>
                  <button onClick={runCompareAnalysis} style={{ flexShrink: 0, fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, color: "#991b1b", background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", borderRadius: "8px", padding: "8px 14px", cursor: "pointer" }}>
                    {t("common.retry")}
                  </button>
                </div>
              )}

              {hasCompareResults && !isComparing && results && compareResults && (
                <div>
                  {METRICS_CONFIG.map((metric) => (
                    <MetricRow key={metric.key} metric={metric} valueA={results[metric.key]} valueB={compareResults[metric.key]} />
                  ))}
                  {/* District row */}
                  <div style={{ paddingTop: "22px", display: "grid", gridTemplateColumns: "1fr 120px 1fr", gap: "20px", alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "5px" }}>{t("compare.district")}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: "var(--color-dark)" }}>{results.districtName || "Outside Amman"}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "1px" }}>{t("compare.area")}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "5px" }}>{t("compare.district")}</div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 600, color: "var(--color-dark)" }}>{compareResults.districtName || "Outside Amman"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Competitor lists ── */}
          {hasCompareResults && results?.competitorList?.length > 0 && (
            <div className="fade-in fade-in-3" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
            }}>
              <CompetitorColumn
                letter="A"
                color="#3f7d58"
                competitors={results.competitorList}
                t={t}
              />
              <CompetitorColumn
                letter="B"
                color="#6366f1"
                competitors={compareResults?.competitorList ?? []}
                t={t}
              />
            </div>
          )}

          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)", opacity: .55, paddingBottom: "12px" }}>
            ⓘ {t("compare.sameTypeNote")}
          </p>
        </div>
      )}
    </div>
  );
}
