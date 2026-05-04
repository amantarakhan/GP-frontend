import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAnalysis } from "../../context/AnalysisContext";

const STATUS_STYLES = {
  high:   { bg: "#fee2e2",              color: "#991b1b",            label: "High Threat"  },
  medium: { bg: "var(--color-accent)",  color: "var(--color-dark)",  label: "Medium"       },
  low:    { bg: "var(--color-success)", color: "var(--color-brand)", label: "Low Threat"   },
};

function PriceDots({ level }) {
  if (!level) return <span style={{ color: "var(--color-text)", fontSize: "11px" }}>—</span>;
  return (
    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-brand)", letterSpacing: "1px" }}>
      {"$".repeat(level)}
      <span style={{ opacity: 0.25 }}>{"$".repeat(Math.max(0, 4 - level))}</span>
    </span>
  );
}

function StarRating({ rating }) {
  const { t } = useTranslation();
  if (!rating) return <span style={{ color: "var(--color-text)", fontSize: "11px" }}>{t("competitors.noRating")}</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--color-brand)">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
      </svg>
      <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: "var(--color-dark)" }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function CompetitorList() {
  const { t } = useTranslation();
  const { hasResults, results } = useAnalysis();
  const [expanded,     setExpanded]     = useState(true);
  const [expandedId,   setExpandedId]   = useState(null);  // for detail row
  const [showAll,      setShowAll]      = useState(false);

  const statusLabels = {
    high:   t("competitors.highThreat"),
    medium: t("competitors.medium"),
    low:    t("competitors.lowThreat"),
  };

  if (!hasResults || !results?.competitorList?.length) return null;

  const competitors = results.competitorList;
  const visible     = showAll ? competitors : competitors.slice(0, 8);

  return (
    <div style={{
      background:   "var(--color-card)",
      borderRadius: "var(--radius-lg)",
      border:       "1px solid rgba(230,211,173,.6)",
      overflow:     "hidden",
      boxShadow:    "var(--shadow-sm)",
    }}>
      {/* ── Header ── */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 700, color: "var(--color-dark)" }}>
            {t("competitors.title")}
          </span>
          <span style={{
            background: "rgba(63,125,88,.15)", color: "var(--color-brand)",
            fontSize: "10px", fontWeight: 700, padding: "2px 7px",
            borderRadius: "10px", fontFamily: "monospace",
          }}>
            {competitors.length}
          </span>
        </div>
        <svg
          width="14" height="14" fill="none" viewBox="0 0 24 24"
          stroke="var(--color-text)" strokeWidth={2}
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>

      {/* ── List ── */}
      {expanded && (
        <div>
          {visible.map((c, i) => {
            const s         = STATUS_STYLES[c.status] ?? STATUS_STYLES.low;
            const isOpen    = expandedId === c.id;
            const dayNames  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
            const todayEn   = dayNames[new Date().getDay()];
            const todayHours = c.hours.find((h) => h.startsWith(todayEn));

            return (
              <div key={c.id}>
                {/* ── Main row ── */}
                <div
                  onClick={() => setExpandedId(isOpen ? null : c.id)}
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "12px",
                    padding:      "12px 18px",
                    borderBottom: "1px solid rgba(230,211,173,.3)",
                    cursor:       "pointer",
                    transition:   "background .15s",
                    background:   isOpen ? "rgba(63,125,88,.04)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = "rgba(245,242,225,.7)"; }}
                  onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: 700, color: "var(--color-accent)",
                    flexShrink: 0, fontFamily: "var(--font-display)",
                  }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + address */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600,
                      color: "var(--color-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {c.name}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--color-text)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {c.address}
                    </div>
                  </div>

                  {/* Rating */}
                  <StarRating rating={c.rating} />

                  {/* Price */}
                  <PriceDots level={c.priceLevel} />

                  {/* Status badge */}
                  <span style={{
                    background: s.bg, color: s.color,
                    fontSize: "10px", fontWeight: 700,
                    padding: "3px 8px", borderRadius: "20px",
                    fontFamily: "var(--font-body)", flexShrink: 0,
                  }}>
                    {statusLabels[c.status] ?? statusLabels.low}
                  </span>

                  {/* Expand chevron */}
                  <svg
                    width="13" height="13" fill="none" viewBox="0 0 24 24"
                    stroke="var(--color-text)" strokeWidth={2}
                    style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}
                  >
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </div>

                {/* ── Detail row ── */}
                {isOpen && (
                  <div style={{
                    padding:    "14px 18px 14px 66px",
                    background: "rgba(63,125,88,.03)",
                    borderBottom: "1px solid rgba(230,211,173,.3)",
                    display:    "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap:        "12px",
                  }}>
                    {/* Today's hours */}
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>
                        {t("competitors.todaysHours")}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-dark)" }}>
                        {todayHours ? todayHours.replace(`${todayEn}: `, "") : t("competitors.hoursNotAvailable")}
                      </div>
                    </div>

                    {/* Reviews */}
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>
                        {t("competitors.reviews")}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-dark)" }}>
                        {c.reviews != null ? `${c.reviews.toLocaleString()} ${t("competitors.reviewsCount")}` : t("competitors.noData")}
                      </div>
                    </div>

                    {/* Phone */}
                    {c.phone && (
                      <div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>
                          {t("competitors.phone")}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-dark)" }}>
                          {c.phone}
                        </div>
                      </div>
                    )}

                    {/* Website */}
                    {c.website && (
                      <div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>
                          {t("competitors.website")}
                        </div>
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-brand)", textDecoration: "underline" }}
                        >
                          {t("competitors.visitSite")}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Show more / less */}
          {competitors.length > 8 && (
            <div style={{ padding: "12px 18px", textAlign: "center" }}>
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600,
                  color: "var(--color-brand)", background: "none", border: "none", cursor: "pointer",
                }}
              >
                {showAll ? t("competitors.showLess") : t("competitors.showAll", { count: competitors.length })}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}