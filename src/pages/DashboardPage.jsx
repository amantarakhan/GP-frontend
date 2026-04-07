import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiService } from "../services/apiService";
import { useAnalysis } from "../context/AnalysisContext";
import { auth } from "../firebase";
import { getUserProfile, getUserReports } from "../services/dbService";

const SCORE_COLOR = (s) => s >= 75 ? "var(--color-brand)" : s >= 55 ? "#b45309" : "#dc2626";
const SCORE_BG    = (s) => s >= 75 ? "var(--color-success)" : s >= 55 ? "var(--color-accent)" : "#fee2e2";

function StatWidget({ label, value, sub, icon }) {
  return (
    <div style={{
      background: "var(--color-card)", borderRadius: "var(--radius-lg)",
      padding: "20px", border: "1px solid rgba(230,211,173,.6)", boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", marginBottom: "14px",
      }}>
        <div style={{
          width: "38px", height: "38px", borderRadius: "10px",
          background: "rgba(63,125,88,.1)", display: "flex",
          alignItems: "center", justifyContent: "center", color: "var(--color-brand)",
        }}>
          {icon}
        </div>
      </div>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700,
        color: "var(--color-dark)", marginBottom: "4px",
      }}>{value}</div>
      <div style={{
        fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600,
        color: "var(--color-dark)", marginBottom: "2px",
      }}>{label}</div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--color-text)" }}>
        {sub}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate  = useNavigate();
  const { t } = useTranslation();
  const { resetAnalysis } = useAnalysis();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const currentUser = auth.currentUser;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      if (currentUser) {
        const data = await getUserReports(currentUser.uid);
        setReports(data);
      } else {
        setReports(apiService.getReports());
      }
    } catch (err) {
      console.error("[DashboardPage] fetchReports:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  useEffect(() => {
    if (currentUser) {
      getUserProfile(currentUser.uid).then((profile) => {
        const name = profile?.displayName || currentUser.displayName || "";
        setUserName(name);
      });
    }
  }, [currentUser]);

  // Normalize field names — Firestore uses feasibilityScore/competitorCount,
  // localStorage uses score/competitors
  const getScore       = (r) => r.feasibilityScore ?? r.score ?? 0;
  const getCompetitors = (r) => r.competitorCount  ?? r.competitors ?? 0;
  const getSaturation  = (r) => r.saturation ?? 0;
  const getTitle       = (r) => r.reportName ?? r.title ?? "Untitled";
  const getLocation    = (r) => r.location ?? "";
  const getDate        = (r) => r.dateLabel ?? r.date ?? "";

  const totalScans = reports.length;
  const avgFeasibility = totalScans
    ? Math.round(reports.reduce((sum, r) => sum + getScore(r), 0) / totalScans)
    : null;
  const totalCoverage = reports.reduce((sum, r) => {
    const km = parseFloat(r.fullResults?.coverage ?? "0");
    return sum + (isNaN(km) ? 0 : km);
  }, 0);
  const totalCompetitors = reports.reduce((sum, r) => sum + getCompetitors(r), 0);
  const avgSaturation = totalScans
    ? Math.round(reports.reduce((sum, r) => sum + getSaturation(r), 0) / totalScans)
    : null;

  return (
    <div className="dashboard-page" style={{ padding: "28px" }}>

      {/* Header */}
      <div className="fade-in" data-tutorial="welcome-header" style={{ marginBottom: "30px" }}>
        <div style={{
          fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 600,
          color: "var(--color-brand)", letterSpacing: "2.5px",
          textTransform: "uppercase", marginBottom: "6px",
        }}>
          {t("dashboard.overview")}
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700,
          color: "var(--color-dark)", letterSpacing: "-0.5px", marginBottom: "8px",
        }}>
          {t("dashboard.welcomeBack").replace("Analyst", userName || t("dashboard.welcomeBack").split(", ")[1] || "Analyst")}
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--color-text)", lineHeight: 1.6 }}>
          {totalScans > 0
            ? t("dashboard.hasScansSummary", { count: totalScans, s: totalScans > 1 ? "s" : "" })
            : t("dashboard.noScansYet")}
        </p>
      </div>

      {/* Stat widgets — class added for responsive 4→2→1 col grid */}
      <div
        className="fade-in fade-in-1 dashboard-stat-grid"
        data-tutorial="stat-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "28px" }}
      >
        <StatWidget
          label={t("dashboard.savedReports")} value={loading ? "—" : totalScans} sub={t("dashboard.totalScansSaved")}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>}
        />
        <StatWidget
          label={t("dashboard.avgFeasibility")} value={loading ? "—" : avgFeasibility != null ? `${avgFeasibility}%` : "—"} sub={t("dashboard.acrossAllScans")}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>}
        />
        <StatWidget
          label={t("dashboard.competitorsFound")} value={loading ? "—" : totalCompetitors} sub={t("dashboard.totalAcrossScans")}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
        />
        <StatWidget
          label={t("dashboard.avgSaturation")} value={loading ? "—" : avgSaturation != null ? `${avgSaturation}%` : "—"} sub={t("dashboard.marketSaturation")}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>}
        />
      </div>

      {/* Recent Reports */}
      <div className="fade-in fade-in-2">
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "16px",
        }}>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "20px",
            fontWeight: 700, color: "var(--color-dark)",
          }}>{t("dashboard.recentReports")}</h2>
          {totalScans > 0 && (
            <button
              onClick={() => navigate("/reports")}
              style={{
                fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600,
                color: "var(--color-brand)", background: "none", border: "none", cursor: "pointer",
              }}
            >
              {t("common.viewAll")}
            </button>
          )}
        </div>

        {/* Empty state */}
        {!loading && totalScans === 0 && (
          <div style={{
            textAlign: "center", padding: "48px 20px",
            background: "var(--color-card)", borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--color-accent)",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📍</div>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: "18px",
              fontWeight: 700, color: "var(--color-dark)", marginBottom: "6px",
            }}>
              {t("dashboard.noScansTitle")}
            </div>
            <div style={{
              fontFamily: "var(--font-body)", fontSize: "13px",
              color: "var(--color-text)", marginBottom: "20px",
            }}>
              {t("dashboard.noScansDesc")}
            </div>
            <button
              data-tutorial="start-scan-btn"
              onClick={() => { resetAnalysis(); navigate("/scan"); }}
              style={{
                padding: "11px 22px", borderRadius: "var(--radius-md)", border: "none",
                background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
                color: "var(--color-card)", fontSize: "13px", fontWeight: 700,
                fontFamily: "var(--font-body)", cursor: "pointer",
              }}
            >
              {t("dashboard.startFirstScan")}
            </button>
          </div>
        )}

        {/* Reports list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {reports.slice(0, 3).map((r) => (
            <div
              key={r.id}
              onClick={() => navigate("/reports")}
              className="dashboard-report-row"
              style={{
                background: "var(--color-card)", borderRadius: "var(--radius-lg)",
                padding: "18px 20px", border: "1px solid rgba(230,211,173,.6)",
                display: "flex", alignItems: "center", gap: "16px",
                cursor: "pointer", transition: "transform .18s, box-shadow .18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {/* Score ring */}
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: SCORE_BG(getScore(r)), display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: "15px",
                  fontWeight: 700, color: SCORE_COLOR(getScore(r)),
                }}>{getScore(r)}</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700,
                  color: "var(--color-dark)", marginBottom: "2px",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {getTitle(r)}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)" }}>
                  {getLocation(r)} · {getDate(r)}
                </div>
              </div>

              {/* Metrics cluster */}
              <div
                className="dashboard-report-meta-group"
                style={{ display: "flex", gap: "20px", flexShrink: 0 }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: "16px",
                    fontWeight: 700, color: "var(--color-dark)",
                  }}>{getCompetitors(r)}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)" }}>
                    {t("dashboard.competitors")}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: "16px",
                    fontWeight: 700, color: "var(--color-dark)",
                  }}>{getSaturation(r)}%</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)" }}>
                    {t("dashboard.saturation")}
                  </div>
                </div>
              </div>

              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--color-text)" strokeWidth={2}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* CTA band */}
      <div
        className="fade-in fade-in-3 dashboard-cta-band"
        data-tutorial="cta-band"
        style={{
          marginTop: "28px", borderRadius: "var(--radius-xl)",
          background: "linear-gradient(135deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)",
          padding: "28px 32px", display: "flex",
          alignItems: "center", justifyContent: "space-between", gap: "20px",
        }}
      >
        <div>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "22px",
            fontWeight: 700, color: "#F5F2E1", marginBottom: "6px",
          }}>
            {t("dashboard.readyTitle")}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "13.5px", color: "rgba(245,242,225,.75)" }}>
            {t("dashboard.readyDesc")}
          </div>
        </div>
        <button
          data-tutorial="start-scan-btn"
          onClick={() => { resetAnalysis(); navigate("/scan"); }}
          style={{
            padding: "13px 24px", borderRadius: "var(--radius-md)", border: "none",
            background: "var(--color-accent)", color: "var(--color-dark)",
            fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-body)",
            cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
          }}
        >
          {t("dashboard.startNewScan")}
        </button>
      </div>
    </div>
  );
}