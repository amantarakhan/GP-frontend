import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_REPORTS } from "../constants";

const STATUS_STYLES = {
  strong:   { bg:"var(--color-success)", color:"var(--color-brand)",  label:"Strong"   },
  moderate: { bg:"var(--color-accent)",  color:"var(--color-dark)",   label:"Moderate" },
  weak:     { bg:"#fee2e2",             color:"#991b1b",             label:"Weak"     },
};

export default function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [search, setSearch]   = useState("");

  const filtered = reports.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  const deleteReport = (id) => setReports((prev) => prev.filter((r) => r.id !== id));

  return (
    <div style={{ padding:"28px", maxWidth:"900px" }}>
      {/* Header */}
      <div className="fade-in" style={{ marginBottom:"28px" }}>
        <div style={{ fontFamily:"var(--font-body)", fontSize:"9.5px", fontWeight:600, color:"var(--color-brand)", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"6px" }}>
          Archive
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:"16px" }}>
          <div>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:"30px", fontWeight:700, color:"var(--color-dark)", letterSpacing:"-0.5px", marginBottom:"6px" }}>
              Saved Reports
            </h1>
            <p style={{ fontFamily:"var(--font-body)", fontSize:"13.5px", color:"var(--color-text)" }}>
              {reports.length} reports saved · sorted by date
            </p>
          </div>
          <button
            onClick={() => navigate("/scan")}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "7px",
              padding:      "11px 18px",
              borderRadius: "var(--radius-md)",
              border:       "none",
              background:   "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
              color:        "var(--color-card)",
              fontSize:     "13px",
              fontWeight:   700,
              fontFamily:   "var(--font-body)",
              cursor:       "pointer",
              flexShrink:   0,
              boxShadow:    "0 4px 14px rgba(63,125,88,.35)",
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Scan
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="fade-in fade-in-1" style={{ position:"relative", marginBottom:"20px" }}>
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--color-text)" strokeWidth={2}
          style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)" }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search reports…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width:        "100%",
            padding:      "12px 14px 12px 40px",
            borderRadius: "var(--radius-md)",
            border:       "1.5px solid var(--color-accent)",
            background:   "var(--color-app-bg)",
            color:        "var(--color-dark)",
            fontSize:     "13.5px",
            fontFamily:   "var(--font-body)",
            outline:      "none",
            boxSizing:    "border-box",
          }}
          onFocus={(e) => { e.target.style.borderColor="var(--color-brand)"; e.target.style.boxShadow="0 0 0 3px rgba(63,125,88,.12)"; }}
          onBlur={(e)  => { e.target.style.borderColor="var(--color-accent)"; e.target.style.boxShadow="none"; }}
        />
      </div>

      {/* Reports list */}
      <div className="fade-in fade-in-2" style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
        {filtered.length === 0 && (
          <div style={{
            textAlign:    "center",
            padding:      "48px 20px",
            background:   "var(--color-card)",
            borderRadius: "var(--radius-lg)",
            border:       "1px dashed var(--color-accent)",
            color:        "var(--color-text)",
            fontFamily:   "var(--font-body)",
            fontSize:     "14px",
          }}>
            No reports match your search.
          </div>
        )}

        {filtered.map((r) => {
          const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.moderate;
          return (
            <div
              key={r.id}
              style={{
                background:   "var(--color-card)",
                borderRadius: "var(--radius-lg)",
                border:       "1px solid rgba(230,211,173,.6)",
                padding:      "20px 22px",
                boxShadow:    "var(--shadow-sm)",
                transition:   "transform .18s, box-shadow .18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="var(--shadow-md)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform="none";             e.currentTarget.style.boxShadow="var(--shadow-sm)"; }}
            >
              {/* Top row */}
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px", marginBottom:"16px" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"4px" }}>
                    <span style={{ fontFamily:"var(--font-body)", fontSize:"14px", fontWeight:700, color:"var(--color-dark)" }}>{r.title}</span>
                    <span style={{ background:s.bg, color:s.color, fontSize:"10px", fontWeight:700, padding:"2px 8px", borderRadius:"20px", fontFamily:"var(--font-body)", flexShrink:0 }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{ fontFamily:"var(--font-body)", fontSize:"12px", color:"var(--color-text)" }}>
                    📍 {r.location} · {r.date}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:"8px", flexShrink:0 }}>
                  <button
                    onClick={() => navigate("/scan")}
                    style={{ padding:"7px 14px", borderRadius:"8px", border:"1.5px solid var(--color-accent)", background:"transparent", color:"var(--color-brand)", fontSize:"12px", fontWeight:600, fontFamily:"var(--font-body)", cursor:"pointer" }}
                  >
                    Re-run
                  </button>
                  <button
                    onClick={() => deleteReport(r.id)}
                    style={{ padding:"7px 10px", borderRadius:"8px", border:"1.5px solid rgba(220,38,38,.2)", background:"transparent", color:"#dc2626", fontSize:"12px", cursor:"pointer", display:"flex", alignItems:"center" }}
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Metric strip */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
                {[
                  { label:"Feasibility", value:`${r.score}%`, color: r.score >= 75 ? "var(--color-brand)" : "#b45309" },
                  { label:"Competitors", value:r.competitors, color:"var(--color-dark)" },
                  { label:"Saturation",  value:`${r.saturation}%`, color: r.saturation <= 35 ? "var(--color-brand)" : "#b45309" },
                ].map((m) => (
                  <div key={m.label} style={{ background:"rgba(252,252,253,.7)", borderRadius:"10px", padding:"10px 13px", border:"1px solid rgba(230,211,173,.4)" }}>
                    <div style={{ fontFamily:"var(--font-body)", fontSize:"10px", color:"var(--color-text)", marginBottom:"3px" }}>{m.label}</div>
                    <div style={{ fontFamily:"var(--font-display)", fontSize:"20px", fontWeight:700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}