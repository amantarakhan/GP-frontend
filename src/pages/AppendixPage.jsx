import React, { useState } from "react";
import { useTranslation } from "react-i18next";

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div style={{
      background: "var(--color-card)", borderRadius: "var(--radius-lg)",
      border: "1px solid rgba(230,211,173,.6)", overflow: "hidden",
      boxShadow: "var(--shadow-sm)", marginBottom: "20px",
    }}>
      <div style={{
        padding: "16px 22px", borderBottom: "1px solid rgba(230,211,173,.5)",
        display: "flex", alignItems: "center", gap: "10px",
        background: "linear-gradient(135deg,rgba(63,125,88,.04) 0%,transparent 100%)",
      }}>
        <div style={{
          width: "30px", height: "30px", borderRadius: "9px",
          background: "rgba(63,125,88,.1)", border: "1px solid rgba(63,125,88,.18)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700,
          color: "var(--color-dark)", letterSpacing: "-0.2px",
        }}>{title}</span>
      </div>
      <div style={{ padding: "22px" }}>{children}</div>
    </div>
  );
}

// ── Term card ─────────────────────────────────────────────────────────────────
function Term({ name, badge, badgeColor = "var(--color-brand)", badgeBg = "var(--color-success)", formula, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: "1px solid rgba(230,211,173,.4)", paddingBottom: "16px",
      marginBottom: "16px",
    }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          cursor: "pointer", userSelect: "none",
        }}
      >
        <span style={{
          fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: 700,
          color: "var(--color-dark)", flex: 1,
        }}>{name}</span>
        {badge && (
          <span style={{
            background: badgeBg, color: badgeColor,
            fontSize: "10px", fontWeight: 700, padding: "2px 9px",
            borderRadius: "20px", fontFamily: "var(--font-body)", whiteSpace: "nowrap",
          }}>{badge}</span>
        )}
        <svg
          width="14" height="14" fill="none" viewBox="0 0 24 24"
          stroke="var(--color-text)" strokeWidth={2}
          style={{ flexShrink: 0, transition: "transform .18s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>
      {open && (
        <div style={{
          marginTop: "10px", paddingLeft: "4px",
          fontFamily: "var(--font-body)", fontSize: "13px",
          color: "var(--color-text)", lineHeight: 1.7,
        }}>
          {children}
          {formula && (
            <div style={{
              marginTop: "10px", padding: "10px 14px",
              background: "rgba(63,125,88,.06)", borderRadius: "8px",
              border: "1px solid rgba(63,125,88,.15)",
              fontFamily: "monospace", fontSize: "12px", color: "var(--color-dark)",
            }}>
              {formula}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Badge row ─────────────────────────────────────────────────────────────────
function BadgeRow({ label, color, bg, threshold, meaning }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "12px",
      padding: "10px 0", borderBottom: "1px solid rgba(230,211,173,.35)",
    }}>
      <span style={{
        background: bg, color, fontSize: "11px", fontWeight: 700,
        padding: "3px 10px", borderRadius: "20px", fontFamily: "var(--font-body)",
        whiteSpace: "nowrap", flexShrink: 0, minWidth: "80px", textAlign: "center",
      }}>{label}</span>
      <div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "var(--color-dark)", marginBottom: "2px" }}>
          {threshold}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)" }}>
          {meaning}
        </div>
      </div>
    </div>
  );
}

// ── Step ──────────────────────────────────────────────────────────────────────
function Step({ n, title, children }) {
  return (
    <div style={{ display: "flex", gap: "16px", marginBottom: "18px" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 700, color: "#fff",
        marginTop: "2px",
      }}>{n}</div>
      <div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "4px" }}>
          {title}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function AppendixPage() {
  const { t } = useTranslation();
  const scanSteps = t("appendix.scanSteps", { returnObjects: true }) || [];
  const dataSources = t("appendix.dataSourceItems", { returnObjects: true }) || [];

  return (
    <div style={{ padding: "28px" }}>

      {/* Header */}
      <div className="fade-in" style={{ marginBottom: "28px" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 600, color: "var(--color-brand)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "6px" }}>
          {t("appendix.reference")}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700, color: "var(--color-dark)", letterSpacing: "-0.5px", marginBottom: "6px" }}>
          {t("appendix.title")}
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13.5px", color: "var(--color-text)", lineHeight: 1.6 }}>
          {t("appendix.subtitle")}
        </p>
      </div>

      {/* ── How a scan works ── */}
      <div className="fade-in fade-in-1">
        <Section
          title={t("appendix.howScanWorks")}
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
        >
          {scanSteps.map((step, i) => (
            <Step key={i} n={i + 1} title={step.title}>{step.desc}</Step>
          ))}
        </Section>
      </div>

      {/* ── Score metrics ── */}
      <div className="fade-in fade-in-2">
        <Section
          title={t("appendix.scoreMetrics")}
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>}
        >
          <Term
            name={t("appendix.feasibilityScore")}
            badge={t("appendix.range0100")}
            badgeBg="var(--color-success)"
            badgeColor="var(--color-brand)"
            formula={t("appendix.feasibilityFormula")}
          >
            {t("appendix.feasibilityDesc")}
            <br /><br />
            <ul style={{ margin: "8px 0 0 16px", lineHeight: 1.9 }}>
              <li>{t("appendix.ratingQuality")}</li>
              <li>{t("appendix.competitorReviewCount")}</li>
              <li>{t("appendix.priceLevel")}</li>
              <li>{t("appendix.educationProximity")}</li>
            </ul>
            <br />
            {t("appendix.demographicFactor")}
            <ul style={{ margin: "0 0 0 16px", lineHeight: 1.9 }}>
              <li>{t("appendix.youthMultiplier")}</li>
              <li>{t("appendix.gymGenderWeight")}</li>
              <li>{t("appendix.medicalElderlyMultiplier")}</li>
            </ul>
          </Term>

          <Term
            name={t("appendix.footTrafficTitle")}
            badge={t("appendix.range0100")}
            badgeBg="var(--color-success)"
            badgeColor="var(--color-brand)"
            formula={t("appendix.footTrafficFormula")}
          >
            {t("appendix.footTrafficDesc")}
            <br /><br />
            {t("appendix.footTrafficNote")}
          </Term>

          <Term
            name={t("appendix.demandSignalTitle")}
            badge={t("appendix.range0100")}
            badgeBg="var(--color-success)"
            badgeColor="var(--color-brand)"
            formula={t("appendix.demandSignalFormula")}
          >
            {t("appendix.demandSignalDesc")}
          </Term>

          <Term
            name={t("appendix.marketSatTitle")}
            badge="0 – 100%"
            badgeBg="#fee2e2"
            badgeColor="#991b1b"
            formula={t("appendix.marketSatFormula")}
          >
            {t("appendix.marketSatDesc")}
            <br /><br />
            {t("appendix.marketSatNote")}
          </Term>
        </Section>
      </div>

      {/* ── Competitor metrics ── */}
      <div className="fade-in fade-in-3">
        <Section
          title={t("appendix.competitorMetrics")}
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
        >
          <Term name={t("appendix.competitorCount")} badge={t("appendix.competitorCountBadge")}>
            {t("appendix.competitorCountDesc")}
          </Term>

          <Term name={t("appendix.avgRatingTitle")} badge={t("appendix.avgRatingBadge")}>
            {t("appendix.avgRatingDesc")}
          </Term>

          <Term name={t("appendix.avgPriceLevelTitle")} badge={t("appendix.avgPriceLevelBadge")}>
            {t("appendix.avgPriceLevelDesc")}
            <ul style={{ margin: "8px 0 0 16px", lineHeight: 1.9 }}>
              <li><strong>1</strong> — {t("appendix.priceInexpensive")}</li>
              <li><strong>2</strong> — {t("appendix.priceModerate")}</li>
              <li><strong>3</strong> — {t("appendix.priceExpensive")}</li>
              <li><strong>4</strong> — {t("appendix.priceVeryExpensive")}</li>
            </ul>
            {t("appendix.avgPriceLevelNote")}
          </Term>

          <Term name={t("appendix.compDensityTitle")} badge={t("appendix.compDensityBadge")} formula={t("appendix.compDensityFormula")}>
            {t("appendix.compDensityDesc")}
          </Term>

          <Term name={t("appendix.threatLevelTitle")}>
            {t("appendix.threatLevelDesc")}
            <ul style={{ margin: "8px 0 0 16px", lineHeight: 1.9 }}>
              <li><strong style={{ color: "#dc2626" }}>{t("appendix.threatHigh")}</strong> — {t("appendix.threatHighDesc")}</li>
              <li><strong style={{ color: "#d97706" }}>{t("appendix.threatMedium")}</strong> — {t("appendix.threatMediumDesc")}</li>
              <li><strong style={{ color: "#687280" }}>{t("appendix.threatLow")}</strong> — {t("appendix.threatLowDesc")}</li>
            </ul>
          </Term>
        </Section>
      </div>

      {/* ── Demographics ── */}
      <div className="fade-in fade-in-4">
        <Section
          title={t("appendix.areaDemographics")}
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>}
        >
          <Term name={t("appendix.districtTitle")}>
            {t("appendix.districtDesc")}
          </Term>

          <Term name={t("appendix.popDensityTitle")} badge={t("appendix.popDensityBadge")}>
            {t("appendix.popDensityDesc")}
          </Term>

          <Term name={t("appendix.youthMarketTitle")} badge={t("appendix.youthMarketBadge")}>
            {t("appendix.youthMarketDesc")}
          </Term>

          <Term name={t("appendix.youthRankTitle")}>
            {t("appendix.youthRankDesc")}
          </Term>

          <Term name={t("appendix.eduHubsTitle")} badge={t("appendix.eduHubsBadge")}>
            {t("appendix.eduHubsDesc")}
          </Term>
        </Section>
      </div>

      {/* ── Badge thresholds ── */}
      <div className="fade-in fade-in-4">
        <Section
          title={t("appendix.badgeThresholds")}
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}
        >
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", marginBottom: "16px", lineHeight: 1.6 }}>
            {t("appendix.badgeThresholdsDesc")}
          </p>

          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
              {t("appendix.feasibilityScoreLabel")}
            </div>
            <BadgeRow label={t("appendix.strong")}   color="var(--color-brand)" bg="var(--color-success)" threshold={t("appendix.strongThreshold")} meaning={t("appendix.strongMeaning")} />
            <BadgeRow label={t("appendix.moderate")} color="var(--color-dark)"  bg="var(--color-accent)"  threshold={t("appendix.moderateThreshold")} meaning={t("appendix.moderateMeaning")} />
            <BadgeRow label={t("appendix.weak")}     color="#991b1b"             bg="#fee2e2"               threshold={t("appendix.weakThreshold")} meaning={t("appendix.weakMeaning")} />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
              {t("appendix.compDensityLabel")}
            </div>
            <BadgeRow label={t("appendix.lowLabel")}      color="var(--color-brand)" bg="var(--color-success)" threshold={t("appendix.lowThreshold")} meaning={t("appendix.lowMeaning")} />
            <BadgeRow label={t("appendix.moderate")} color="var(--color-dark)"  bg="var(--color-accent)"  threshold={t("appendix.moderateCompThreshold")} meaning={t("appendix.moderateCompMeaning")} />
            <BadgeRow label={t("appendix.highLabel")}     color="#991b1b"             bg="#fee2e2"               threshold={t("appendix.highThreshold")} meaning={t("appendix.highMeaning")} />
          </div>

          <div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
              {t("appendix.marketSatLabel")}
            </div>
            <BadgeRow label={t("appendix.lowRiskLabel")}  color="var(--color-brand)" bg="var(--color-success)" threshold={t("appendix.lowRiskThreshold")} meaning={t("appendix.lowRiskMeaning")} />
            <BadgeRow label={t("appendix.moderate")}  color="var(--color-dark)"  bg="var(--color-accent)"  threshold={t("appendix.moderateSatThreshold")} meaning={t("appendix.moderateSatMeaning")} />
            <BadgeRow label={t("appendix.saturatedLabel")} color="#991b1b"             bg="#fee2e2"               threshold={t("appendix.saturatedThreshold")} meaning={t("appendix.saturatedMeaning")} />
          </div>
        </Section>
      </div>

      {/* ── Data sources ── */}
      <div className="fade-in fade-in-4" style={{ paddingBottom: "28px" }}>
        <Section
          title={t("appendix.dataSources")}
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {dataSources.map((s, i) => (
              <div key={i} style={{
                padding: "14px 16px", borderRadius: "var(--radius-md)",
                background: "rgba(63,125,88,.04)", border: "1px solid rgba(63,125,88,.12)",
              }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12.5px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "5px" }}>
                  {s.name}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)", lineHeight: 1.6 }}>
                  {s.detail}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

    </div>
  );
}
