import React, { useEffect, useState } from "react";
import { useLocationAnalysis } from "../../hooks/useLocationAnalysis";

// ── Metric config ─────────────────────────────────────────────────────────────
const METRICS = [
  {
    key:       "feasibility",
    label:     "Feasibility Score",
    icon:      "✦",
    higherWins: true,
    format:    (v) => `${v}%`,
    max:       100,
  },
  {
    key:       "competitors",
    label:     "Competitors Nearby",
    icon:      "⬡",
    higherWins: false,
    format:    (v) => v,
    max:       60,
  },
  {
    key:       "saturation",
    label:     "Market Saturation",
    icon:      "◈",
    higherWins: false,
    format:    (v) => `${v}%`,
    max:       100,
  },
  {
    key:       "footTraffic",
    label:     "Foot Traffic",
    icon:      "◉",
    higherWins: true,
    format:    (v) => `${v}`,
    max:       100,
  },
  {
    key:       "demandSignal",
    label:     "Demand Signal",
    icon:      "◈",
    higherWins: true,
    format:    (v) => `${v}`,
    max:       100,
  },
];

// ── Determine overall winner ──────────────────────────────────────────────────
function getOverallWinner(resultsA, resultsB) {
  if (!resultsA || !resultsB) return null;
  let scoreA = 0, scoreB = 0;
  for (const m of METRICS) {
    const a = resultsA[m.key] ?? 0;
    const b = resultsB[m.key] ?? 0;
    if (m.higherWins) {
      if (a > b) scoreA++;
      else if (b > a) scoreB++;
    } else {
      if (a < b) scoreA++;
      else if (b < a) scoreB++;
    }
  }
  if (scoreA > scoreB) return "A";
  if (scoreB > scoreA) return "B";
  return "tie";
}

// ── Metric bar ────────────────────────────────────────────────────────────────
function MetricRow({ metric, valueA, valueB }) {
  const a   = valueA ?? 0;
  const b   = valueB ?? 0;
  const pctA = Math.min((a / metric.max) * 100, 100);
  const pctB = Math.min((b / metric.max) * 100, 100);

  const aWins = metric.higherWins ? a > b : a < b;
  const bWins = metric.higherWins ? b > a : b < a;
  const tied  = a === b;

  return (
    <div style={{
      display:      "grid",
      gridTemplateColumns: "1fr 80px 1fr",
      alignItems:   "center",
      gap:          "12px",
      padding:      "14px 0",
      borderBottom: "1px solid rgba(230,211,173,.4)",
    }}>
      {/* A side */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700,
            color: aWins ? "#3f7d58" : tied ? "var(--color-dark)" : "var(--color-text)",
          }}>
            {metric.format(a)}
          </span>
          {aWins && !tied && (
            <span style={{
              background: "rgba(63,125,88,.12)", color: "#3f7d58",
              fontSize: "9px", fontWeight: 700, padding: "2px 7px",
              borderRadius: "10px", fontFamily: "var(--font-body)",
              letterSpacing: ".5px", textTransform: "uppercase",
            }}>
              Better
            </span>
          )}
        </div>
        {/* Bar */}
        <div style={{ width: "100%", height: "5px", borderRadius: "4px", background: "rgba(230,211,173,.4)", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width:  `${pctA}%`,
            background: aWins ? "linear-gradient(90deg,#3f7d58,#2d5c3f)" : "rgba(104,114,128,.35)",
            borderRadius: "4px",
            transition: "width 1s cubic-bezier(.4,0,.2,1)",
            marginLeft: "auto",
          }} />
        </div>
      </div>

      {/* Center label */}
      <div style={{
        textAlign:  "center",
        display:    "flex",
        flexDirection: "column",
        alignItems: "center",
        gap:        "4px",
      }}>
        <span style={{
          fontFamily: "var(--font-body)", fontSize: "16px",
          color: "var(--color-brand)",
        }}>
          {metric.icon}
        </span>
        <span style={{
          fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 600,
          color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "1px",
          lineHeight: 1.3, textAlign: "center",
        }}>
          {metric.label}
        </span>
        {tied && (
          <span style={{
            fontFamily: "var(--font-body)", fontSize: "9px", fontWeight: 700,
            color: "#b45309", background: "rgba(180,83,9,.1)",
            padding: "2px 6px", borderRadius: "8px",
          }}>
            TIE
          </span>
        )}
      </div>

      {/* B side */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {bWins && !tied && (
            <span style={{
              background: "rgba(99,102,241,.12)", color: "#6366f1",
              fontSize: "9px", fontWeight: 700, padding: "2px 7px",
              borderRadius: "10px", fontFamily: "var(--font-body)",
              letterSpacing: ".5px", textTransform: "uppercase",
            }}>
              Better
            </span>
          )}
          <span style={{
            fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700,
            color: bWins ? "#6366f1" : tied ? "var(--color-dark)" : "var(--color-text)",
          }}>
            {metric.format(b)}
          </span>
        </div>
        {/* Bar */}
        <div style={{ width: "100%", height: "5px", borderRadius: "4px", background: "rgba(230,211,173,.4)", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width:  `${pctB}%`,
            background: bWins ? "linear-gradient(90deg,#6366f1,#4338ca)" : "rgba(104,114,128,.35)",
            borderRadius: "4px",
            transition: "width 1s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
      </div>
    </div>
  );
}

// ── Location header card ──────────────────────────────────────────────────────
function LocationCard({ letter, color, pin, results, isWinner }) {
  return (
    <div style={{
      flex:         1,
      borderRadius: "var(--radius-lg)",
      border:       `1.5px solid ${isWinner ? color + "55" : "rgba(230,211,173,.5)"}`,
      background:   isWinner
        ? `linear-gradient(135deg, ${color}0a 0%, transparent 60%)`
        : "var(--color-app-bg)",
      padding:      "18px 20px",
      position:     "relative",
      transition:   "border-color .3s",
    }}>
      {isWinner && (
        <div style={{
          position:     "absolute",
          top:          "-10px",
          left:         "50%",
          transform:    "translateX(-50%)",
          background:   color,
          color:        "#fff",
          fontFamily:   "var(--font-body)",
          fontSize:     "9px",
          fontWeight:   800,
          padding:      "3px 12px",
          borderRadius: "20px",
          letterSpacing:"1.5px",
          textTransform:"uppercase",
          whiteSpace:   "nowrap",
          boxShadow:    `0 4px 12px ${color}44`,
        }}>
          ✦ Recommended
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <div style={{
          width:          "38px", height: "38px", borderRadius: "50%",
          background:     color,
          display:        "flex", alignItems: "center", justifyContent: "center",
          flexShrink:     0,
          boxShadow:      `0 4px 14px ${color}44`,
        }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, color: "#fff" }}>
            {letter}
          </span>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "2px" }}>
            Location {letter}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)" }}>
            {pin ? `${pin.lat}, ${pin.lng}` : "—"}
          </div>
        </div>
      </div>

      {results && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            { label: "Feasibility",  value: `${results.feasibility}%` },
            { label: "District",     value: results.districtName ?? "—" },
            { label: "Competitors",  value: results.competitors },
            { label: "Saturation",   value: `${results.saturation}%` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "9px", color: "var(--color-text)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "2px" }}>
                {label}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: "var(--color-dark)" }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Skeleton for loading ──────────────────────────────────────────────────────
function CompareSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          height: "52px", borderRadius: "10px",
          background: "linear-gradient(90deg,rgba(99,102,241,.06) 25%,rgba(99,102,241,.12) 50%,rgba(99,102,241,.06) 75%)",
          backgroundSize: "200% 100%",
          animation: `compareShimmer 1.6s infinite ${i * 0.1}s`,
        }} />
      ))}
      <style>{`
        @keyframes compareShimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MODAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function CompareModal() {
  const {
    compareMode,     setCompareMode,
    comparePicking,  setComparePicking,
    comparePin,      setComparePin,
    compareResults,
    hasCompareResults,
    isComparing,
    compareError,
    runCompareAnalysis,
    pin,
    results,
    resetCompare,
  } = useLocationAnalysis();

  const [animating, setAnimating] = useState(false);

  // Animate modal in
  useEffect(() => {
    if (compareMode) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 400);
      return () => clearTimeout(t);
    }
  }, [compareMode]);

  // When compare pin is set, animate banner back to full modal
  useEffect(() => {
    if (comparePin && !comparePicking) {
      // Pin just dropped — trigger run automatically
      runCompareAnalysis();
    }
  }, [comparePin, comparePicking]);

  // Show picking banner even when compareMode is false (user came from /compare page)
  if (!compareMode && !comparePicking) return null;

  const winner = getOverallWinner(results, compareResults);

  const handleClose = () => {
    resetCompare();
  };

  const handlePickOnMap = () => {
    setComparePicking(true);
  };

  const handleCancelPick = () => {
    setComparePicking(false);
  };

  // ── Slim banner (picking mode) ──────────────────────────────────────────────
  if (comparePicking) {
    return (
      <>
        <style>{`
          @keyframes bannerSlideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>
        <div style={{
          position:   "fixed",
          bottom:     0,
          left:       0,
          right:      0,
          zIndex:     1000,
          animation:  "bannerSlideUp .35s cubic-bezier(.34,1.56,.64,1) both",
        }}>
          <div style={{
            margin:        "0 20px 20px",
            background:    "rgba(15,15,25,.92)",
            backdropFilter:"blur(20px)",
            borderRadius:  "16px",
            border:        "1px solid rgba(99,102,241,.35)",
            padding:       "16px 22px",
            display:       "flex",
            alignItems:    "center",
            justifyContent:"space-between",
            gap:           "16px",
            boxShadow:     "0 -4px 40px rgba(99,102,241,.2), 0 8px 40px rgba(0,0,0,.3)",
          }}>
            {/* Left: icon + text */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Animated pin icon */}
              <div style={{
                width:          "40px",
                height:         "40px",
                borderRadius:   "12px",
                background:     "linear-gradient(135deg,rgba(99,102,241,.25),rgba(99,102,241,.1))",
                border:         "1px solid rgba(99,102,241,.4)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                flexShrink:     0,
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth={2}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5" fill="#818cf8"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700, color: "#f1f5f9", marginBottom: "2px" }}>
                  Tap the map to set Location B
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(148,163,184,.8)" }}>
                  A pulsing crosshair marks the target — click anywhere to confirm
                </div>
              </div>
            </div>

            {/* Right: dots + cancel */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
              {/* Animated dots */}
              <div style={{ display: "flex", gap: "5px" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width:     "6px",
                    height:    "6px",
                    borderRadius: "50%",
                    background:"#818cf8",
                    animation: `bannerDot 1.4s ease-in-out infinite ${i * 0.2}s`,
                  }} />
                ))}
              </div>
              <button
                onClick={handleCancelPick}
                style={{
                  fontFamily:    "var(--font-body)",
                  fontSize:      "12px",
                  fontWeight:    700,
                  color:         "rgba(148,163,184,.9)",
                  background:    "rgba(255,255,255,.07)",
                  border:        "1px solid rgba(255,255,255,.12)",
                  borderRadius:  "10px",
                  padding:       "8px 16px",
                  cursor:        "pointer",
                  transition:    "background .15s",
                  letterSpacing: ".3px",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,.07)"}
              >
                Cancel
              </button>
            </div>
          </div>
          <style>{`
            @keyframes bannerDot {
              0%, 80%, 100% { transform: scale(1);    opacity: .4; }
              40%            { transform: scale(1.4);  opacity: 1;  }
            }
          `}</style>
        </div>
      </>
    );
  }

  // ── Full modal ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.97) translateY(12px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes winnerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(63,125,88,.3); }
          50%       { box-shadow: 0 0 0 8px rgba(63,125,88,0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position:   "fixed",
          inset:      0,
          background: "rgba(10,12,20,.75)",
          backdropFilter: "blur(6px)",
          zIndex:     999,
          animation:  "backdropIn .3s ease both",
        }}
      />

      {/* Modal */}
      <div style={{
        position:    "fixed",
        top:         "50%",
        left:        "50%",
        transform:   "translate(-50%, -50%)",
        zIndex:      1000,
        width:       "min(860px, 94vw)",
        maxHeight:   "88vh",
        overflowY:   "auto",
        background:  "var(--color-app-bg)",
        borderRadius:"var(--radius-xl)",
        border:      "1px solid rgba(230,211,173,.6)",
        boxShadow:   "0 32px 80px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.06)",
        animation:   animating ? "modalIn .4s cubic-bezier(.34,1.56,.64,1) both" : "none",
      }}>

        {/* ── Modal header ── */}
        <div style={{
          padding:        "20px 24px",
          borderBottom:   "1px solid rgba(230,211,173,.5)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          position:       "sticky",
          top:            0,
          background:     "var(--color-app-bg)",
          zIndex:         2,
          borderRadius:   "var(--radius-xl) var(--radius-xl) 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg,rgba(63,125,88,.15),rgba(99,102,241,.15))",
              border: "1px solid rgba(63,125,88,.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}>
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6"  y1="20" x2="6"  y2="14"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 700, color: "var(--color-dark)", letterSpacing: "-0.3px" }}>
                Location Comparison
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--color-text)" }}>
                Side-by-side market analysis
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: "34px", height: "34px", borderRadius: "10px",
              border: "1px solid rgba(230,211,173,.6)",
              background: "var(--color-card)", color: "var(--color-text)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "background .15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(230,211,173,.5)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-card)"}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6"  y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Modal body ── */}
        <div style={{ padding: "24px" }}>

          {/* Winner banner */}
          {hasCompareResults && winner && (
            <div style={{
              marginBottom: "22px",
              borderRadius: "var(--radius-md)",
              padding:      "16px 20px",
              background:   winner === "tie"
                ? "linear-gradient(135deg,rgba(180,83,9,.08),rgba(180,83,9,.04))"
                : winner === "A"
                  ? "linear-gradient(135deg,rgba(63,125,88,.12),rgba(63,125,88,.04))"
                  : "linear-gradient(135deg,rgba(99,102,241,.12),rgba(99,102,241,.04))",
              border: winner === "tie"
                ? "1px solid rgba(180,83,9,.2)"
                : winner === "A"
                  ? "1px solid rgba(63,125,88,.25)"
                  : "1px solid rgba(99,102,241,.25)",
              display:     "flex",
              alignItems:  "center",
              gap:         "14px",
              animation:   "fadeInUp .5s ease .2s both",
            }}>
              <div style={{
                width:          "44px", height: "44px", flexShrink: 0,
                borderRadius:   "50%",
                background:     winner === "tie" ? "#b45309" : winner === "A" ? "#3f7d58" : "#6366f1",
                display:        "flex", alignItems: "center", justifyContent: "center",
                boxShadow:      `0 4px 16px ${winner === "tie" ? "rgba(180,83,9,.3)" : winner === "A" ? "rgba(63,125,88,.35)" : "rgba(99,102,241,.35)"}`,
                animation:      winner !== "tie" ? "winnerPulse 2s ease infinite" : "none",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                  {winner === "tie" ? "=" : winner}
                </span>
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700,
                  color: "var(--color-dark)", marginBottom: "3px",
                }}>
                  {winner === "tie"
                    ? "Both locations are evenly matched"
                    : `Location ${winner} is the better choice`}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)" }}>
                  {winner === "tie"
                    ? "Consider additional factors like rent and accessibility"
                    : winner === "A"
                      ? "Higher feasibility and stronger market conditions"
                      : "Better market opportunity with lower competition"}
                </div>
              </div>
            </div>
          )}

          {/* Location header cards */}
          <div style={{ display: "flex", gap: "14px", marginBottom: "22px" }}>
            <LocationCard
              letter="A"
              color="#3f7d58"
              pin={pin}
              results={results}
              isWinner={hasCompareResults && winner === "A"}
            />

            {/* VS divider */}
            <div style={{
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              gap:            "6px",
              flexShrink:     0,
              padding:        "0 4px",
            }}>
              <div style={{ width: "1px", flex: 1, background: "linear-gradient(to bottom,transparent,rgba(230,211,173,.6),transparent)" }} />
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "var(--color-card)", border: "1.5px solid var(--color-accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700,
                color: "var(--color-text)",
              }}>
                VS
              </div>
              <div style={{ width: "1px", flex: 1, background: "linear-gradient(to bottom,transparent,rgba(230,211,173,.6),transparent)" }} />
            </div>

            {/* Location B card */}
            {!comparePin ? (
              /* Pick location B prompt */
              <div style={{
                flex: 1, borderRadius: "var(--radius-lg)",
                border: "1.5px dashed rgba(99,102,241,.35)",
                background: "rgba(99,102,241,.03)",
                padding: "18px 20px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "14px", cursor: "pointer", transition: "background .2s",
              }}
                onClick={handlePickOnMap}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,.06)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(99,102,241,.03)"}
              >
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  background: "rgba(99,102,241,.1)", border: "1.5px solid rgba(99,102,241,.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth={2}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <line x1="12" y1="5" x2="12" y2="13"/>
                    <line x1="8"  y1="9" x2="16" y2="9"/>
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 700, color: "#6366f1", marginBottom: "4px" }}>
                    Pick Location B
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "11.5px", color: "var(--color-text)", lineHeight: 1.5 }}>
                    Click to select a second<br />location on the map
                  </div>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "10px",
                  background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.2)",
                }}>
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth={2.5}>
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                  </svg>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "#6366f1" }}>
                    Tap map to place pin
                  </span>
                </div>
              </div>
            ) : (
              <LocationCard
                letter="B"
                color="#6366f1"
                pin={comparePin}
                results={compareResults}
                isWinner={hasCompareResults && winner === "B"}
              />
            )}
          </div>

          {/* ── Metric comparison table ── */}
          {comparePin && (
            <div style={{
              background:   "var(--color-card)",
              borderRadius: "var(--radius-lg)",
              border:       "1px solid rgba(230,211,173,.6)",
              padding:      "20px 22px",
              animation:    "fadeInUp .4s ease .1s both",
            }}>
              {/* Table header */}
              <div style={{
                display:             "grid",
                gridTemplateColumns: "1fr 80px 1fr",
                gap:                 "12px",
                marginBottom:        "6px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", justifyContent: "flex-end" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3f7d58" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, color: "#3f7d58", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                    Location A
                  </span>
                </div>
                <div />
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#6366f1" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                    Location B
                  </span>
                </div>
              </div>

              {/* Loading skeleton */}
              {isComparing && <CompareSkeleton />}

              {/* Error */}
              {compareError && !isComparing && (
                <div style={{
                  borderRadius: "var(--radius-md)",
                  background: "#fee2e2", border: "1px solid rgba(220,38,38,.2)",
                  padding: "14px 16px",
                  display: "flex", gap: "10px", alignItems: "flex-start",
                }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2} style={{ flexShrink: 0, marginTop: "1px" }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8"  x2="12"    y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#991b1b", display: "block", marginBottom: "3px" }}>
                      Comparison scan failed
                    </strong>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#991b1b" }}>
                      {compareError}
                    </span>
                  </div>
                  <button
                    onClick={runCompareAnalysis}
                    style={{
                      flexShrink: 0, fontFamily: "var(--font-body)", fontSize: "11px",
                      fontWeight: 700, color: "#991b1b",
                      background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)",
                      borderRadius: "8px", padding: "6px 12px", cursor: "pointer",
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Metric rows */}
              {hasCompareResults && !isComparing && results && compareResults && (
                <div>
                  {METRICS.map((metric) => (
                    <MetricRow
                      key={metric.key}
                      metric={metric}
                      valueA={results[metric.key]}
                      valueB={compareResults[metric.key]}
                    />
                  ))}
                  {/* Last row: no bottom border */}
                  <div style={{ paddingTop: "14px", display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: "12px", alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "9px", fontWeight: 600, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "3px" }}>
                        District
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "var(--color-dark)" }}>
                        {results.districtName ?? "—"}
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 600, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Area
                      </span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "9px", fontWeight: 600, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "3px" }}>
                        District
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "var(--color-dark)" }}>
                        {compareResults.districtName ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Footer ── */}
          <div style={{
            marginTop:     "20px",
            display:       "flex",
            alignItems:    "center",
            justifyContent:"space-between",
            gap:           "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="var(--color-text)" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8"  x2="12"    y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "10.5px", color: "var(--color-text)", opacity: .8 }}>
                Same business type and radius used for both scans
              </span>
            </div>
            {comparePin && !hasCompareResults && !isComparing && (
              <button
                onClick={runCompareAnalysis}
                style={{
                  padding: "9px 18px", borderRadius: "var(--radius-md)",
                  border: "none", background: "linear-gradient(135deg,#6366f1,#4338ca)",
                  color: "#fff", fontFamily: "var(--font-body)", fontSize: "12px",
                  fontWeight: 700, cursor: "pointer", flexShrink: 0,
                  boxShadow: "0 4px 14px rgba(99,102,241,.35)",
                }}
              >
                Run Comparison →
              </button>
            )}
            {hasCompareResults && (
              <button
                onClick={() => { setComparePin(null); }}
                style={{
                  padding: "9px 18px", borderRadius: "var(--radius-md)",
                  border: "1.5px solid rgba(99,102,241,.3)",
                  background: "transparent", color: "#6366f1",
                  fontFamily: "var(--font-body)", fontSize: "12px",
                  fontWeight: 700, cursor: "pointer", flexShrink: 0,
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,.07)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                Compare Another →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}