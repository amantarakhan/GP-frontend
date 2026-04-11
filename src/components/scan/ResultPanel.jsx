import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocationAnalysis } from "../../hooks/useLocationAnalysis";
import ScoreRing from "../ui/ScoreRing";
import StatsCard from "../ui/StatsCard";
import SkeletonBlock from "../ui/SkeletonBlock";

export default function ResultPanel() {
  const { t } = useTranslation();
  const { hasResults, isAnalyzing, results } = useLocationAnalysis();

  if (isAnalyzing) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ background: "var(--color-card)", borderRadius: "var(--radius-lg)", padding: "20px", border: "1px solid rgba(230,211,173,.6)" }}>
            <SkeletonBlock width="60%"  height="12px" style={{ marginBottom: "14px" }} />
            <SkeletonBlock width="80px" height="80px" style={{ borderRadius: "50%", margin: "0 auto 14px" }} />
            <SkeletonBlock width="80%"  height="10px" style={{ marginBottom: "8px" }} />
            <SkeletonBlock width="60%"  height="10px" />
          </div>
        ))}
      </div>
    );
  }

  if (!hasResults || !results) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "120px", background: "var(--color-card)", borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--color-accent)", color: "var(--color-text)",
        fontFamily: "var(--font-body)", fontSize: "13px", gap: "8px",
      }}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
        </svg>
        {t("results.emptyState")}
      </div>
    );
  }

  const {
    feasibility, competitors, saturation,
    footTraffic, demandSignal,
    avgRating, avgPriceLevel,
    districtName, districtNameAr,
    youthPercentage, youthRank,
    totalPopulation, educationCount,
    dataPoints, coverage,
  } = results;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* ── 3 metric cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>

        {/* Feasibility */}
        <MetricCard
          icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>}
          label={t("results.feasibilityScore")}
          description={t("results.marketViability")}
          badge={feasibility >= 75 ? t("results.strong") : feasibility >= 55 ? t("results.moderate") : t("results.weak")}
          badgeBg={feasibility >= 75 ? "var(--color-success)" : feasibility >= 55 ? "var(--color-accent)" : "#fee2e2"}
          badgeColor={feasibility >= 75 ? "var(--color-brand)" : "var(--color-dark)"}
          iconColor="var(--color-brand)"
          tooltip={
            <span>
              <strong style={{ color: "#e6d3ad" }}>{t("results.feasibilityTooltip")}</strong><br />
              Measures how viable this location is for your business. Calculated from the population-to-competitor ratio using a logistic curve, then adjusted for competitor quality (low ratings = opportunity), price gaps, nearby universities, and district youth or elderly concentration. <strong style={{ color: "#e6d3ad" }}>≥75 = Strong · 55–74 = Moderate · &lt;55 = Weak</strong>
            </span>
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "4px" }}>
            <ScoreRing value={feasibility} color="var(--color-brand)" track="var(--color-success)" />
            <div style={{ flex: 1 }}>
              <MiniBar label={t("results.footTraffic")}  value={footTraffic}  max={100} color="var(--color-brand)" />
              <MiniBar label={t("results.demandSignal")} value={demandSignal} max={100} color="var(--color-brand)" mt />
            </div>
          </div>
        </MetricCard>

        {/* Competitor Density */}
        <MetricCard
          icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
          label={t("results.competitorDensity")}
          description={`${competitors} ${t("results.similarBusinesses")}`}
          badge={competitors <= 10 ? t("results.low") : competitors <= 30 ? t("results.moderate") : t("results.high")}
          badgeBg={competitors <= 10 ? "var(--color-success)" : competitors <= 30 ? "var(--color-accent)" : "#fee2e2"}
          badgeColor={competitors <= 10 ? "var(--color-brand)" : "var(--color-dark)"}
          iconColor="var(--color-accent)"
          tooltip={
            <span>
              <strong style={{ color: "#e6d3ad" }}>Competitor Density</strong><br />
              Total similar businesses found via Google Places within your chosen radius, filtered by business type. For restaurants and cafés, Talabat listings are cross-referenced to filter by cuisine. <strong style={{ color: "#e6d3ad" }}>Avg Rating</strong> is the mean Google star rating (1–5) — a low average signals a quality gap. <strong style={{ color: "#e6d3ad" }}>Avg Price Level</strong> is 1 (budget) to 4 (expensive).
            </span>
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "4px" }}>
            <ScoreRing value={competitors} max={60} color="var(--color-accent)" track="rgba(230,211,173,.4)" showRaw />
            <div style={{ flex: 1 }}>
              <MiniBar label={t("results.avgRating")}    value={Math.round((parseFloat(avgRating) || 0) * 20)} max={100} color="var(--color-accent)" />
              <MiniBar label={t("results.avgPriceLevel")} value={Math.round((parseFloat(avgPriceLevel) || 0) * 25)} max={100} color="var(--color-accent)" mt />
            </div>
          </div>
        </MetricCard>

        {/* Market Saturation */}
        <MetricCard
          icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>}
          label={t("results.marketSaturation")}
          description={t("results.demandVsSupply")}
          badge={saturation <= 35 ? t("results.lowRisk") : saturation <= 60 ? t("results.moderate") : t("results.saturated")}
          badgeBg={saturation <= 35 ? "var(--color-success)" : saturation <= 60 ? "var(--color-accent)" : "#fee2e2"}
          badgeColor={saturation <= 35 ? "var(--color-brand)" : "var(--color-dark)"}
          iconColor="var(--color-text)"
          tooltip={
            <span>
              <strong style={{ color: "#e6d3ad" }}>Market Saturation (0–100%)</strong><br />
              How crowded the market is relative to a benchmark of 50 businesses/km². Formula: <em>competitor density ÷ 50 × 100</em>, capped at 100%. <strong style={{ color: "#e6d3ad" }}>≤35% = Low Risk · 36–60% = Moderate · &gt;60% = Saturated.</strong> Youth Market % shows ages 15–34 in this district from Jordan census data.
            </span>
          }
        >
          <div style={{ marginTop: "4px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "34px", fontWeight: 700, color: "var(--color-dark)", lineHeight: 1, marginBottom: "8px" }}>
              {saturation}%
            </div>
            {youthPercentage != null && (
              <MiniBar label={t("results.youthRank", { rank: youthRank })} value={Math.round(youthPercentage)} max={100} color="var(--color-brand)" />
            )}
            <MiniBar label={t("results.footTraffic")} value={footTraffic} max={100} color="var(--color-text)" mt={youthPercentage != null} />
          </div>
        </MetricCard>
      </div>

      {/* ── District insight strip ── */}
      {(districtName || educationCount > 0 || totalPopulation) && (
        <div style={{
          background:   "linear-gradient(135deg,var(--color-card) 0%,#ede8d0 100%)",
          borderRadius: "var(--radius-md)",
          border:       "1px solid rgba(230,211,173,.7)",
          padding:      "14px 18px",
          display:      "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap:          "14px",
        }}>
          {districtName && (
            <InsightItem
              label={t("results.district")}
              value={districtName}
              sub={districtNameAr}
            />
          )}
          {totalPopulation != null && (
            <InsightItem
              label={t("results.population")}
              value={totalPopulation.toLocaleString()}
              sub={t("results.peopleInDistrict")}
            />
          )}
          {youthPercentage != null && (
            <InsightItem
              label={t("results.youthMarket")}
              value={`${youthPercentage.toFixed(1)}%`}
              sub={t("results.youthAge", { rank: youthRank })}
            />
          )}
          {educationCount > 0 && (
            <InsightItem
              label={t("results.educationHubs")}
              value={educationCount}
              sub={t("results.nearbyInstitutions")}
            />
          )}
        </div>
      )}

      {/* ── Bottom stat strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
        <StatsCard icon="pin"   label={t("results.district")}    value={districtName || t("results.unknown")} />
        <StatsCard icon="data"  label={t("results.dataPoints")} value={dataPoints} />
        <StatsCard icon="globe" label={t("results.coverage")}    value={coverage} />
      </div>
    </div>
  );
}

// ── InfoTooltip ───────────────────────────────────────────────────────────────
function InfoTooltip({ content }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={t("results.whatDoesThisMean")}
        style={{
          width: "16px", height: "16px", borderRadius: "50%",
          border: "1.5px solid rgba(104,114,128,.35)",
          background: open ? "rgba(63,125,88,.12)" : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", padding: 0, flexShrink: 0,
          color: "rgba(104,114,128,.8)", fontSize: "9.5px",
          fontWeight: 800, fontFamily: "var(--font-body)",
          transition: "background .15s, border-color .15s",
        }}
      >
        i
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "22px", left: "50%",
          transform: "translateX(-40%)",
          background: "#1F2937", color: "#F5F2E1",
          borderRadius: "10px", padding: "13px 15px",
          width: "230px", fontSize: "11.5px",
          fontFamily: "var(--font-body)", lineHeight: 1.65,
          zIndex: 300, boxShadow: "0 10px 36px rgba(0,0,0,.32)",
          pointerEvents: "none",
        }}>
          {/* Arrow */}
          <div style={{
            position: "absolute", top: "-4px", left: "calc(40% - 4px)",
            width: "9px", height: "9px", background: "#1F2937",
            borderRadius: "2px", transform: "rotate(45deg)",
          }} />
          {content}
        </div>
      )}
    </div>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────
function MetricCard({ icon, label, description, badge, badgeBg, badgeColor, iconColor, tooltip, children }) {
  return (
    <div className="fade-in" style={{
      background: "var(--color-card)", borderRadius: "var(--radius-lg)",
      padding: "18px", border: "1px solid rgba(230,211,173,.6)", boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <span style={{ color: iconColor }}>{icon}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, color: "var(--color-dark)" }}>{label}</span>
            {tooltip && <InfoTooltip content={tooltip} />}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--color-text)" }}>{description}</div>
        </div>
        <span style={{ background: badgeBg, color: badgeColor, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", fontFamily: "var(--font-body)", whiteSpace: "nowrap", flexShrink: 0, marginLeft: "8px" }}>
          {badge}
        </span>
      </div>
      {children}
    </div>
  );
}

// ── MiniBar ───────────────────────────────────────────────────────────────────
function MiniBar({ label, value, max = 100, color, mt = false }) {
  return (
    <div style={{ marginTop: mt ? "9px" : 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)" }}>{label}</span>
        <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "var(--color-dark)" }}>{value}</span>
      </div>
      <div style={{ height: "5px", borderRadius: "4px", background: "rgba(230,211,173,.45)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: "4px", transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

// ── InsightItem ───────────────────────────────────────────────────────────────
function InsightItem({ label, value, sub }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 600, color: "var(--color-text)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "3px" }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "1px" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "var(--font-body)", fontSize: "10.5px", color: "var(--color-text)" }}>{sub}</div>
      )}
    </div>
  );
}