import React from "react";
import { useLocationAnalysis } from "../../hooks/useLocationAnalysis";
import ScoreRing from "../ui/ScoreRing";
import StatsCard from "../ui/StatsCard";
import SkeletonBlock from "../ui/SkeletonBlock";

export default function ResultPanel() {
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
        Select a business type, drop a pin on the map, and run analysis
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
          label="Feasibility Score"
          description="Market viability index"
          badge={feasibility >= 75 ? "Strong" : feasibility >= 55 ? "Moderate" : "Weak"}
          badgeBg={feasibility >= 75 ? "var(--color-success)" : feasibility >= 55 ? "var(--color-accent)" : "#fee2e2"}
          badgeColor={feasibility >= 75 ? "var(--color-brand)" : "var(--color-dark)"}
          iconColor="var(--color-brand)"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "4px" }}>
            <ScoreRing value={feasibility} color="var(--color-brand)" track="var(--color-success)" />
            <div style={{ flex: 1 }}>
              <MiniBar label="Foot Traffic"  value={footTraffic}  max={100} color="var(--color-brand)" />
              <MiniBar label="Demand Signal" value={demandSignal} max={100} color="var(--color-brand)" mt />
            </div>
          </div>
        </MetricCard>

        {/* Competitor Density */}
        <MetricCard
          icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
          label="Competitor Density"
          description={`${competitors} similar businesses found`}
          badge={competitors <= 10 ? "Low" : competitors <= 30 ? "Moderate" : "High"}
          badgeBg={competitors <= 10 ? "var(--color-success)" : competitors <= 30 ? "var(--color-accent)" : "#fee2e2"}
          badgeColor={competitors <= 10 ? "var(--color-brand)" : "var(--color-dark)"}
          iconColor="var(--color-accent)"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "4px" }}>
            <ScoreRing value={competitors} max={60} color="var(--color-accent)" track="rgba(230,211,173,.4)" showRaw />
            <div style={{ flex: 1 }}>
              <MiniBar label="Avg Rating"    value={Math.round((parseFloat(avgRating) || 0) * 20)} max={100} color="var(--color-accent)" />
              <MiniBar label="Avg Price Lvl" value={Math.round((parseFloat(avgPriceLevel) || 0) * 25)} max={100} color="var(--color-accent)" mt />
            </div>
          </div>
        </MetricCard>

        {/* Market Saturation */}
        <MetricCard
          icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>}
          label="Market Saturation"
          description="Demand vs supply ratio"
          badge={saturation <= 35 ? "Low Risk" : saturation <= 60 ? "Moderate" : "Saturated"}
          badgeBg={saturation <= 35 ? "var(--color-success)" : saturation <= 60 ? "var(--color-accent)" : "#fee2e2"}
          badgeColor={saturation <= 35 ? "var(--color-brand)" : "var(--color-dark)"}
          iconColor="var(--color-text)"
        >
          <div style={{ marginTop: "4px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "34px", fontWeight: 700, color: "var(--color-dark)", lineHeight: 1, marginBottom: "8px" }}>
              {saturation}%
            </div>
            {youthPercentage != null && (
              <MiniBar label={`Youth ${youthRank}`} value={Math.round(youthPercentage)} max={100} color="var(--color-brand)" />
            )}
            <MiniBar label="Foot Traffic" value={footTraffic} max={100} color="var(--color-text)" mt={youthPercentage != null} />
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
              label="District"
              value={districtName}
              sub={districtNameAr}
            />
          )}
          {totalPopulation != null && (
            <InsightItem
              label="Population"
              value={totalPopulation.toLocaleString()}
              sub="people in district"
            />
          )}
          {youthPercentage != null && (
            <InsightItem
              label="Youth Market"
              value={`${youthPercentage.toFixed(1)}%`}
              sub={`Ages 15–34 · ${youthRank}`}
            />
          )}
          {educationCount > 0 && (
            <InsightItem
              label="Education Hubs"
              value={educationCount}
              sub="nearby institutions"
            />
          )}
        </div>
      )}

      {/* ── Bottom stat strip ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
        <StatsCard icon="pin"   label="District"    value={districtName || "Unknown"} />
        <StatsCard icon="data"  label="Data Points" value={dataPoints} />
        <StatsCard icon="globe" label="Coverage"    value={coverage} />
      </div>
    </div>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────
function MetricCard({ icon, label, description, badge, badgeBg, badgeColor, iconColor, children }) {
  return (
    <div className="fade-in" style={{
      background: "var(--color-card)", borderRadius: "var(--radius-lg)",
      padding: "18px", border: "1px solid rgba(230,211,173,.6)", boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <span style={{ color: iconColor }}>{icon}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, color: "var(--color-dark)" }}>{label}</span>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--color-text)" }}>{description}</div>
        </div>
        <span style={{ background: badgeBg, color: badgeColor, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", fontFamily: "var(--font-body)", whiteSpace: "nowrap", flexShrink: 0 }}>
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