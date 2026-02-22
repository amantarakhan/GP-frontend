import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";

const SCORE_COLOR = (s) => s >= 75 ? "var(--color-brand)" : s >= 55 ? "#b45309" : "#dc2626";
const SCORE_BG    = (s) => s >= 75 ? "var(--color-success)" : s >= 55 ? "var(--color-accent)" : "#fee2e2";

function StatWidget({ label, value, sub, icon }) {
  return (
    <div style={{
      background: "var(--color-card)", borderRadius: "var(--radius-lg)",
      padding: "20px", border: "1px solid rgba(230,211,173,.6)", boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(63,125,88,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brand)" }}>
          {icon}
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "4px" }}>{value}</div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--color-dark)", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--color-text)" }}>{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate    = useNavigate();
  const [reports,   setReports]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const saved = apiService.getReports();
    setReports(saved);
    setLoading(false);
  }, []);

  // ── Derive stats from real saved reports ──────────────────────────────────
  const totalScans  = reports.length;
  const avgFeasibility = totalScans
    ? Math.round(reports.reduce((sum, r) => sum + (r.score ?? 0), 0) / totalScans)
    : null;
  const totalCoverage = reports.reduce((sum, r) => {
    const km = parseFloat(r.fullResults?.coverage ?? "0");
    return sum + (isNaN(km) ? 0 : km);
  }, 0);

  return (
    <div style={{ padding: "28px", maxWidth: "1200px" }}>
      {/* Header */}
      <div className="fade-in" style={{ marginBottom: "30px" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 600, color: "var(--color-brand)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "6px" }}>
          Overview
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700, color: "var(--color-dark)", letterSpacing: "-0.5px", marginBottom: "8px" }}>
          Welcome back, Analyst
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--color-text)", lineHeight: 1.6 }}>
          {totalScans > 0
            ? `You have ${totalScans} saved scan${totalScans > 1 ? "s" : ""}. Here's your activity summary.`
            : "Run your first scan to start building your market intelligence dashboard."}
        </p>
      </div>

      {/* Stat widgets */}
      <div className="fade-in fade-in-1" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "28px" }}>
        <StatWidget
          label="Saved Reports" value={loading ? "—" : totalScans} sub="Total scans saved"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>}
        />
        <StatWidget
          label="Avg. Feasibility" value={loading ? "—" : avgFeasibility != null ? `${avgFeasibility}%` : "—"} sub="Across all scans"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>}
        />
        <StatWidget
          label="Locations Scanned" value={loading ? "—" : totalScans} sub="All time"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>}
        />
        <StatWidget
          label="Total Coverage" value={loading ? "—" : totalCoverage > 0 ? `${totalCoverage.toFixed(1)} km²` : "—"} sub="Area analyzed"
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>}
        />
      </div>

      {/* Recent Reports */}
      <div className="fade-in fade-in-2">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color: "var(--color-dark)" }}>Recent Reports</h2>
          {totalScans > 0 && (
            <button onClick={() => navigate("/reports")} style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "var(--color-brand)", background: "none", border: "none", cursor: "pointer" }}>
              View all →
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
            <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "6px" }}>
              No scans yet
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", marginBottom: "20px" }}>
              Run your first market scan to see results here
            </div>
            <button
              onClick={() => navigate("/scan")}
              style={{ padding: "11px 22px", borderRadius: "var(--radius-md)", border: "none", background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))", color: "var(--color-card)", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-body)", cursor: "pointer" }}
            >
              Start First Scan →
            </button>
          </div>
        )}

        {/* Reports list — show last 3 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {reports.slice(0, 3).map((r) => (
            <div
              key={r.id}
              onClick={() => navigate("/reports")}
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
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: SCORE_BG(r.score), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: SCORE_COLOR(r.score) }}>{r.score}</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.title}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)" }}>
                  {r.location} · {r.date}
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "var(--color-dark)" }}>{r.competitors}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)" }}>Competitors</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "var(--color-dark)" }}>{r.saturation}%</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)" }}>Saturation</div>
                </div>
              </div>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--color-text)" strokeWidth={2}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="fade-in fade-in-3" style={{
        marginTop: "28px", borderRadius: "var(--radius-xl)",
        background: "linear-gradient(135deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)",
        padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px",
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "#F5F2E1", marginBottom: "6px" }}>
            Ready to find your next location?
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "13.5px", color: "rgba(245,242,225,.75)" }}>
            Run a new scan to get instant market intelligence for any area.
          </div>
        </div>
        <button
          onClick={() => navigate("/scan")}
          style={{ padding: "13px 24px", borderRadius: "var(--radius-md)", border: "none", background: "var(--color-accent)", color: "var(--color-dark)", fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-body)", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}
        >
          Start New Scan →
        </button>
      </div>
    </div>
  );
}