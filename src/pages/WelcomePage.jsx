import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import logo1 from "../assets/logo1.png";
import globeHero from "../assets/logo2.png";

// ─── Keyframe definitions (injected via <style>) ──────────────────────────────
const KEYFRAMES = `
  @keyframes float {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-12px); }
    100% { transform: translateY(0px); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes wordFadeSlide {
    0%   { opacity: 0; transform: translateY(10px); }
    15%  { opacity: 1; transform: translateY(0px); }
    85%  { opacity: 1; transform: translateY(0px); }
    100% { opacity: 0; transform: translateY(-10px); }
  }
  @keyframes pipelineIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Rotating niche words ─────────────────────────────────────────────────────
const NICHES = ["Business.", "Café.", "Boutique.", "Gym.", "Restaurant."];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconFootTraffic = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="var(--color-brand)" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconCompetitor = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="var(--color-brand)" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2"  x2="12" y2="8"  />
    <line x1="12" y1="16" x2="12" y2="22" />
    <line x1="2"  y1="12" x2="8"  y2="12" />
    <line x1="16" y1="12" x2="22" y2="12" />
  </svg>
);

const IconSaturation = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="var(--color-brand)" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <path d="M7 8h2v5H7z"    fill="var(--color-brand)" stroke="none" opacity="0.6" />
    <path d="M11 6h2v7h-2z"  fill="var(--color-brand)" stroke="none" opacity="0.6" />
    <path d="M15 10h2v3h-2z" fill="var(--color-brand)" stroke="none" opacity="0.6" />
  </svg>
);

const IconArrow = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconArrowRight = ({ size = 18, color = "var(--color-brand)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconTrend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

// Pipeline step icons
const IconDatabase = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="var(--color-brand)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const IconCpu = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="var(--color-brand)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
  </svg>
);

const IconTarget = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="var(--color-brand)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Dot-grid decorative background ──────────────────────────────────────────
const DotGrid = () => (
  <svg style={{
    position: "absolute", inset: 0, width: "100%", height: "100%",
    pointerEvents: "none", opacity: 0.04,
  }}>
    <defs>
      <pattern id="dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1.5" fill="var(--color-brand)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dotgrid)" />
  </svg>
);

// ─── Floating glass card 1 — High Foot Traffic pill ──────────────────────────
const FloatingTrafficPill = () => (
  <div style={{
    position: "absolute", top: "10%", left: "-6%",
    background: "rgba(255,255,255,0.93)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(230,211,173,.65)",
    borderRadius: "999px", padding: "11px 18px",
    display: "flex", alignItems: "center", gap: "10px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
    animation: "float 6s ease-in-out infinite",
    animationDelay: "0s",
    zIndex: 4, whiteSpace: "nowrap",
  }}>
    <span style={{
      width: 9, height: 9, borderRadius: "50%",
      background: "var(--color-brand)", flexShrink: 0,
      display: "inline-block",
      animation: "pulse 2s ease-in-out infinite",
    }} />
    <span style={{
      fontFamily: "var(--font-body)", fontSize: "0.8rem",
      fontWeight: 700, color: "var(--color-dark)", letterSpacing: "0.01em",
    }}>High Foot Traffic Detected</span>
    <span style={{
      fontFamily: "var(--font-body)", fontSize: "0.72rem",
      fontWeight: 700, color: "var(--color-brand)",
      background: "rgba(63,125,88,0.1)",
      borderRadius: "999px", padding: "2px 9px",
    }}>+38%</span>
  </div>
);

// ─── Floating glass card 2 — Feasibility Score ───────────────────────────────
const FloatingScoreCard = () => (
  <div style={{
    position: "absolute", bottom: "10%", right: "2%",
    background: "rgba(255,255,255,0.93)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(230,211,173,.65)",
    borderRadius: "18px", padding: "18px 22px", width: "210px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
    animation: "float 6s ease-in-out infinite",
    animationDelay: "1.5s",
    zIndex: 4,
  }}>
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between", marginBottom: "10px",
    }}>
      <span style={{
        fontFamily: "var(--font-body)", fontSize: "0.7rem",
        fontWeight: 700, color: "var(--color-text)",
        letterSpacing: "0.05em", textTransform: "uppercase",
      }}>Feasibility Score</span>
      <IconTrend />
    </div>
    <div style={{
      fontFamily: "var(--font-display)", fontSize: "2rem",
      fontWeight: 800, color: "var(--color-dark)",
      lineHeight: 1, marginBottom: "13px",
    }}>
      82
      <span style={{
        fontSize: "0.95rem", color: "var(--color-text)",
        fontFamily: "var(--font-body)", fontWeight: 600,
      }}>%</span>
    </div>
    <div style={{
      height: "7px", borderRadius: "999px",
      background: "rgba(63,125,88,0.1)", overflow: "hidden",
    }}>
      <div style={{
        width: "82%", height: "100%", borderRadius: "999px",
        background: "linear-gradient(90deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)",
      }} />
    </div>
    <p style={{
      fontFamily: "var(--font-body)", fontSize: "0.7rem",
      color: "var(--color-brand-dark)", margin: "9px 0 0", fontWeight: 600,
    }}>Strong opportunity signal</p>
  </div>
);

// ─── Floating glass card 3 — Competitor breakdown ────────────────────────────
const FloatingCompCard = () => (
  <div style={{
    position: "absolute", top: "40%", right: "-4%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.93)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(230,211,173,.65)",
    borderRadius: "16px", padding: "14px 18px", width: "176px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)",
    animation: "float 6s ease-in-out infinite",
    animationDelay: "3s",
    zIndex: 4,
  }}>
    <p style={{
      fontFamily: "var(--font-body)", fontSize: "0.67rem", fontWeight: 700,
      color: "var(--color-text)", textTransform: "uppercase",
      letterSpacing: "0.07em", margin: "0 0 10px",
    }}>Nearby Competitors</p>
    {[
      { label: "Coffee Shops", count: 4,  pct: 40 },
      { label: "Bakeries",     count: 2,  pct: 20 },
      { label: "Restaurants",  count: 9,  pct: 90 },
    ].map(({ label, count, pct }) => (
      <div key={label} style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{
            fontFamily: "var(--font-body)", fontSize: "0.7rem",
            color: "var(--color-dark)", fontWeight: 500,
          }}>{label}</span>
          <span style={{
            fontFamily: "var(--font-body)", fontSize: "0.7rem",
            color: "var(--color-brand-dark)", fontWeight: 700,
          }}>{count}</span>
        </div>
        <div style={{
          height: "4px", borderRadius: "999px",
          background: "rgba(63,125,88,0.1)", overflow: "hidden",
        }}>
          <div style={{
            width: `${pct}%`, height: "100%", borderRadius: "999px",
            background: "var(--color-brand)", opacity: 0.7,
          }} />
        </div>
      </div>
    ))}
  </div>
);

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, description, index }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`fade-in fade-in-${index + 2}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(63,125,88,0.055)" : "var(--color-card)",
        border: `1px solid ${hovered ? "rgba(63,125,88,0.28)" : "rgba(230,211,173,.5)"}`,
        borderRadius: "20px", padding: "34px 28px",
        display: "flex", flexDirection: "column", gap: "16px",
        boxShadow: hovered
          ? "0 20px 56px rgba(63,125,88,0.12), 0 4px 16px rgba(0,0,0,0.05)"
          : "0 2px 10px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.32s cubic-bezier(0.34,1.56,0.64,1)",
        cursor: "default", position: "relative", overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: 0, right: 0, width: 90, height: 90,
        background: hovered
          ? "radial-gradient(circle at top right, rgba(63,125,88,0.1) 0%, transparent 70%)"
          : "radial-gradient(circle at top right, rgba(230,211,173,0.13) 0%, transparent 70%)",
        pointerEvents: "none", transition: "background 0.3s",
      }} />
      <div style={{
        width: 56, height: 56, borderRadius: "14px",
        background: hovered ? "rgba(63,125,88,0.11)" : "rgba(63,125,88,0.07)",
        border: `1px solid ${hovered ? "rgba(63,125,88,0.22)" : "rgba(230,211,173,.48)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s ease",
      }}>{icon}</div>
      <h3 style={{
        fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700,
        color: hovered ? "var(--color-brand-dark)" : "var(--color-dark)",
        margin: 0, lineHeight: 1.3, transition: "color 0.2s",
      }}>{title}</h3>
      <p style={{
        fontFamily: "var(--font-body)", fontSize: "0.875rem",
        color: "var(--color-text)", margin: 0, lineHeight: 1.78,
      }}>{description}</p>
    </div>
  );
};

// ─── Stat Badge ───────────────────────────────────────────────────────────────
const StatBadge = ({ value, label }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
    padding: "22px 32px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.11)",
    borderRadius: "18px", backdropFilter: "blur(10px)",
  }}>
    <span style={{
      fontFamily: "var(--font-display)", fontSize: "2.1rem",
      fontWeight: 800, color: "#FCFCFD", lineHeight: 1,
    }}>{value}</span>
    <span style={{
      fontFamily: "var(--font-body)", fontSize: "0.75rem",
      color: "rgba(252,252,253,0.6)", textTransform: "uppercase",
      letterSpacing: "0.09em", fontWeight: 600,
    }}>{label}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const WelcomePage = () => {
  const navigate = useNavigate();

  // ── Scrolled state for glass nav ──
  const [scrolled, setScrolled] = useState(false);

  // ── Hover states ──
  const [learnHovered,  setLearnHovered]  = useState(false);
  const [loginHovered,  setLoginHovered]  = useState(false);
  const [signupHovered, setSignupHovered] = useState(false);
  const [analyzeHovered, setAnalyzeHovered] = useState(false);
  const [inputFocused, setInputFocused]   = useState(false);

  // ── Rotating headline state ──
  const [nicheIndex,   setNicheIndex]   = useState(0);
  const [wordKey,      setWordKey]      = useState(0); // forces re-animation

  // ── Location input ──
  const [locationVal, setLocationVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Rotate niche word every 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setNicheIndex(i => (i + 1) % NICHES.length);
      setWordKey(k => k + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const scrollToAbout = (e) => {
    e.preventDefault();
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnalyze = () => navigate("/scan");

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div style={{
        minHeight: "100vh", width: "100%",
        background: "var(--color-app-bg)",
        fontFamily: "var(--font-body)", overflowX: "hidden",
      }}>

        {/* ════════════════════════════════════════
            GLASSMORPHISM STICKY NAV
        ════════════════════════════════════════ */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
          height: "66px", padding: "0 5%",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: scrolled ? "rgba(252,252,253,0.9)" : "rgba(252,252,253,0.75)",
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          borderBottom: `1px solid ${scrolled ? "rgba(230,211,173,.6)" : "rgba(230,211,173,.32)"}`,
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.07)" : "none",
          transition: "all 0.28s ease",
          overflow: "visible",
        }}>
          {/* Hanging oversized logo — overflows below the nav bar */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              position: "absolute",
              top: "-4px",
              left: "20px",
              height: "92px",
              width: "auto",
              zIndex: 301,
              cursor: "pointer",
              filter: "drop-shadow(0 12px 28px rgba(63,125,88,0.22))",
              animation: "float 6s ease-in-out infinite",
            }}
          >
            <img
              src={logo}
              alt="Localyze"
              style={{
                height: "100%",
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          {/* Spacer so nav links don't slide under the logo */}
          <div style={{ width: "180px", flexShrink: 0 }} />

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <a href="#about" onClick={scrollToAbout} style={{
              fontFamily: "var(--font-body)", fontSize: "0.875rem",
              fontWeight: 500, color: "var(--color-text)",
              textDecoration: "none", padding: "8px 14px",
              borderRadius: "10px", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.color = "var(--color-dark)"; e.target.style.background = "rgba(63,125,88,0.07)"; }}
              onMouseLeave={e => { e.target.style.color = "var(--color-text)"; e.target.style.background = "transparent"; }}
            >About</a>

            <button onClick={() => navigate("/login")}
              onMouseEnter={() => setLoginHovered(true)}
              onMouseLeave={() => setLoginHovered(false)}
              style={{
                fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 500,
                color: loginHovered ? "var(--color-dark)" : "var(--color-text)",
                background: loginHovered ? "rgba(63,125,88,0.07)" : "transparent",
                border: "none", padding: "8px 14px",
                borderRadius: "10px", cursor: "pointer", transition: "all 0.2s",
              }}>Log In</button>

            <button onClick={() => navigate("/signup")}
              onMouseEnter={() => setSignupHovered(true)}
              onMouseLeave={() => setSignupHovered(false)}
              style={{
                fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)",
                border: "none", padding: "9px 22px",
                borderRadius: "10px", cursor: "pointer",
                boxShadow: signupHovered ? "0 6px 20px rgba(63,125,88,0.42)" : "0 3px 12px rgba(63,125,88,0.28)",
                transform: signupHovered ? "translateY(-1px)" : "translateY(0)",
                transition: "all 0.22s ease",
              }}>Sign Up</button>
          </div>
        </nav>

        {/* ════════════════════════════════════════
            HERO — ASYMMETRIC SPLIT
        ════════════════════════════════════════ */}
        <section style={{
          minHeight: "100vh",
          padding: "120px 5% 80px",
          display: "flex", alignItems: "center",
          position: "relative", overflow: "hidden",
        }}>
          <DotGrid />

          {/* Ambient background glow */}
          <div style={{
            position: "absolute", top: "15%", left: "35%",
            width: "700px", height: "700px",
            background: "radial-gradient(ellipse at center, rgba(63,125,88,0.09) 0%, transparent 68%)",
            pointerEvents: "none",
          }} />

          {/* Two-column grid */}
          <div style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "52px",
            alignItems: "center",
            position: "relative", zIndex: 1,
          }}>

            {/* ── LEFT: Copy ── */}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "flex-start", justifyContent: "center",
            }}>

              {/* ── Rotating headline ── */}
              <h1 className="fade-in fade-in-1" style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.3rem, 4.2vw, 3.8rem)",
                fontWeight: 800, color: "var(--color-dark)",
                margin: "0 0 22px", lineHeight: 1.12,
                letterSpacing: "-0.028em", maxWidth: "540px",
              }}>
                Find the Perfect Spot for Your Next{" "}
                {/* Dynamic word container — fixed height to prevent layout shift */}
                <span style={{
                  display: "inline-block",
                  position: "relative",
                  overflow: "hidden",
                  verticalAlign: "bottom",
                  minWidth: "3ch",
                }}>
                  <span
                    key={wordKey}
                    style={{
                      display: "inline-block",
                      background: "linear-gradient(130deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      animation: "wordFadeSlide 2.5s ease forwards",
                    }}
                  >
                    {NICHES[nicheIndex]}
                  </span>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="fade-in fade-in-2" style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.95rem, 1.4vw, 1.08rem)",
                color: "var(--color-text)", maxWidth: "440px",
                lineHeight: 1.82, margin: "0 0 32px",
              }}>
                Localyze aggregates foot traffic patterns, competitor density, and real-time demand signals into one clear answer — before you sign the lease.
              </p>

              {/* ── Quick Start Location Input ── */}
              <div className="fade-in fade-in-3" style={{ width: "100%", maxWidth: "480px", marginBottom: "20px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  background: "var(--color-card)",
                  borderRadius: "14px",
                  border: `1.5px solid ${inputFocused ? "rgba(63,125,88,0.45)" : "rgba(230,211,173,.7)"}`,
                  boxShadow: inputFocused
                    ? "0 0 0 4px rgba(63,125,88,0.08), 0 8px 32px rgba(0,0,0,0.08)"
                    : "0 4px 20px rgba(0,0,0,0.07)",
                  transition: "all 0.22s ease",
                  overflow: "hidden",
                }}>
                  {/* Search icon */}
                  <div style={{ padding: "0 0 0 16px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <IconSearch />
                  </div>

                  {/* Input field */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={locationVal}
                    onChange={e => setLocationVal(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                    placeholder="Enter a city, neighborhood, or address..."
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      color: "var(--color-dark)",
                      padding: "16px 12px",
                      minWidth: 0,
                    }}
                  />

                  {/* Analyze button */}
                  <button
                    onClick={handleAnalyze}
                    onMouseEnter={() => setAnalyzeHovered(true)}
                    onMouseLeave={() => setAnalyzeHovered(false)}
                    style={{
                      flexShrink: 0,
                      fontFamily: "var(--font-body)",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "#fff",
                      background: analyzeHovered
                        ? "linear-gradient(135deg, var(--color-brand-dark) 0%, var(--color-brand) 100%)"
                        : "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)",
                      border: "none",
                      padding: "13px 22px",
                      margin: "5px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "7px",
                      boxShadow: analyzeHovered
                        ? "0 6px 20px rgba(63,125,88,0.42)"
                        : "0 3px 12px rgba(63,125,88,0.28)",
                      transform: analyzeHovered ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Analyze Area <IconArrow />
                  </button>
                </div>

                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "0.72rem",
                  color: "var(--color-text)", margin: "9px 0 0 4px",
                  opacity: 0.7,
                }}>
                  Try "Downtown Amman", "Sweifieh", or "Al Abdali"
                </p>
              </div>

              {/* Learn more link */}
              <div className="fade-in fade-in-3" style={{ marginBottom: "40px" }}>
                <a href="#about" onClick={scrollToAbout}
                  onMouseEnter={() => setLearnHovered(true)}
                  onMouseLeave={() => setLearnHovered(false)}
                  style={{
                    fontFamily: "var(--font-body)", fontSize: "0.9rem",
                    fontWeight: 600, color: "var(--color-brand-dark)",
                    textDecoration: "none", padding: "10px 20px",
                    borderRadius: "10px",
                    border: "1.5px solid rgba(63,125,88,0.25)",
                    background: learnHovered ? "rgba(63,125,88,0.09)" : "rgba(63,125,88,0.05)",
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    transition: "all 0.2s ease",
                  }}
                >Learn more about Localyze</a>
              </div>

              {/* Social proof strip */}
              <div className="fade-in fade-in-4" style={{
                display: "flex", alignItems: "center",
                paddingTop: "22px",
                borderTop: "1px solid rgba(230,211,173,.45)",
              }}>
                {[
                  { val: "3×",      label: "Data signals"    },
                  { val: "360°",    label: "Location view"   },
                  { val: "< 2 min", label: "Time to insight" },
                ].map(({ val, label }, i) => (
                  <div key={val} style={{
                    display: "flex", alignItems: "baseline", gap: "6px",
                    paddingRight: i < 2 ? "20px" : 0,
                    marginRight: i < 2 ? "20px" : 0,
                    borderRight: i < 2 ? "1px solid rgba(230,211,173,.4)" : "none",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-display)", fontSize: "1.15rem",
                      fontWeight: 800, color: "var(--color-dark)",
                    }}>{val}</span>
                    <span style={{
                      fontFamily: "var(--font-body)", fontSize: "0.72rem",
                      color: "var(--color-text)", fontWeight: 500,
                    }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Globe + floating cards ── */}
            <div style={{
              position: "relative", display: "flex",
              alignItems: "center", justifyContent: "center",
              minHeight: "520px",
            }}>
              {/* Globe glow backdrop */}
              <div style={{
                position: "absolute",
                width: "480px", height: "480px", borderRadius: "50%",
                background: "radial-gradient(circle at center, rgba(63,125,88,0.15) 0%, rgba(63,125,88,0.05) 55%, transparent 75%)",
                pointerEvents: "none", zIndex: 1,
              }} />

              {/* Globe image — breathing float */}
              <img src={globeHero} alt="Globe" style={{
                width: "85%", maxWidth: "480px",
                opacity: 0.6,
                filter: "drop-shadow(0 0 44px rgba(63,125,88,0.32))",
                position: "relative", zIndex: 2,
                animation: "float 6s ease-in-out infinite",
                animationDelay: "0s",
                pointerEvents: "none", userSelect: "none",
              }} />

              <FloatingTrafficPill />
              <FloatingScoreCard />
              <FloatingCompCard />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            DATA PIPELINE SECTION
        ════════════════════════════════════════ */}
        <section style={{
          background: "linear-gradient(180deg, var(--color-card) 0%, rgba(252,252,250,0.6) 100%)",
          borderTop: "1px solid rgba(230,211,173,.4)",
          borderBottom: "1px solid rgba(230,211,173,.4)",
          padding: "72px 5%",
        }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            {/* Section label */}
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.7rem",
                fontWeight: 700, letterSpacing: "0.13em",
                textTransform: "uppercase", color: "var(--color-brand)",
                margin: "0 0 10px",
              }}>Under the Hood</p>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)",
                fontWeight: 800, color: "var(--color-dark)",
                margin: 0, letterSpacing: "-0.02em",
              }}>How Localyze works</h2>
            </div>

            {/* 3 pipeline steps */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr auto 1fr",
              alignItems: "center",
              gap: "0",
            }}>
              {/* Step 1 */}
              <div style={{
                background: "#fff",
                border: "1px solid rgba(230,211,173,.55)",
                borderRadius: "20px",
                padding: "36px 28px",
                display: "flex", flexDirection: "column", gap: "16px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                animation: "pipelineIn 0.6s ease both",
                animationDelay: "0.1s",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "3px",
                  background: "linear-gradient(90deg, var(--color-brand) 0%, rgba(63,125,88,0.2) 100%)",
                  borderRadius: "20px 20px 0 0",
                }} />
                <div style={{
                  width: 52, height: 52, borderRadius: "14px",
                  background: "rgba(63,125,88,0.08)",
                  border: "1px solid rgba(63,125,88,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconDatabase />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{
                      fontFamily: "var(--font-body)", fontSize: "0.65rem",
                      fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase", color: "var(--color-brand)",
                    }}>Step 01</span>
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontSize: "1.1rem",
                    fontWeight: 700, color: "var(--color-dark)",
                    margin: "0 0 8px", lineHeight: 1.3,
                  }}>Data Aggregation</h3>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.85rem",
                    color: "var(--color-text)", margin: 0, lineHeight: 1.72,
                  }}>Scanning 20,000+ local points of interest and real-time foot traffic signals around any address.</p>
                </div>
              </div>

              {/* Connector arrow 1 */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 16px", flexShrink: 0,
              }}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                }}>
                  <div style={{
                    width: "48px", height: "1.5px",
                    background: "linear-gradient(90deg, rgba(63,125,88,0.3) 0%, var(--color-brand) 100%)",
                  }} />
                  <IconArrowRight size={16} color="var(--color-brand)" />
                </div>
              </div>

              {/* Step 2 */}
              <div style={{
                background: "#fff",
                border: "1px solid rgba(230,211,173,.55)",
                borderRadius: "20px",
                padding: "36px 28px",
                display: "flex", flexDirection: "column", gap: "16px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                animation: "pipelineIn 0.6s ease both",
                animationDelay: "0.25s",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "3px",
                  background: "linear-gradient(90deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)",
                  borderRadius: "20px 20px 0 0",
                }} />
                <div style={{
                  width: 52, height: 52, borderRadius: "14px",
                  background: "rgba(63,125,88,0.08)",
                  border: "1px solid rgba(63,125,88,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconCpu />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{
                      fontFamily: "var(--font-body)", fontSize: "0.65rem",
                      fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase", color: "var(--color-brand)",
                    }}>Step 02</span>
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontSize: "1.1rem",
                    fontWeight: 700, color: "var(--color-dark)",
                    margin: "0 0 8px", lineHeight: 1.3,
                  }}>AI Analysis</h3>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.85rem",
                    color: "var(--color-text)", margin: 0, lineHeight: 1.72,
                  }}>Evaluating competitor density, market saturation, and demand signals using multi-factor intelligence models.</p>
                </div>
              </div>

              {/* Connector arrow 2 */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 16px", flexShrink: 0,
              }}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                }}>
                  <div style={{
                    width: "48px", height: "1.5px",
                    background: "linear-gradient(90deg, rgba(63,125,88,0.3) 0%, var(--color-brand) 100%)",
                  }} />
                  <IconArrowRight size={16} color="var(--color-brand)" />
                </div>
              </div>

              {/* Step 3 */}
              <div style={{
                background: "#fff",
                border: "1px solid rgba(230,211,173,.55)",
                borderRadius: "20px",
                padding: "36px 28px",
                display: "flex", flexDirection: "column", gap: "16px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                animation: "pipelineIn 0.6s ease both",
                animationDelay: "0.4s",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "3px",
                  background: "linear-gradient(90deg, var(--color-brand-dark) 0%, rgba(63,125,88,0.2) 100%)",
                  borderRadius: "20px 20px 0 0",
                }} />
                <div style={{
                  width: 52, height: 52, borderRadius: "14px",
                  background: "rgba(63,125,88,0.08)",
                  border: "1px solid rgba(63,125,88,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconTarget />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{
                      fontFamily: "var(--font-body)", fontSize: "0.65rem",
                      fontWeight: 700, letterSpacing: "0.1em",
                      textTransform: "uppercase", color: "var(--color-brand)",
                    }}>Step 03</span>
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontSize: "1.1rem",
                    fontWeight: 700, color: "var(--color-dark)",
                    margin: "0 0 8px", lineHeight: 1.3,
                  }}>Actionable Insights</h3>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.85rem",
                    color: "var(--color-text)", margin: 0, lineHeight: 1.72,
                  }}>Delivering a confident Feasibility Score and location report you can act on — instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FEATURES GRID
        ════════════════════════════════════════ */}
        <section style={{ padding: "96px 5%", maxWidth: "1280px", margin: "0 auto" }}>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: "54px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(63,125,88,0.08)",
              border: "1px solid rgba(63,125,88,0.18)",
              borderRadius: "999px", padding: "5px 15px", marginBottom: "18px",
            }}>
              <span style={{
                fontFamily: "var(--font-body)", fontSize: "0.72rem",
                fontWeight: 700, color: "var(--color-brand-dark)",
                letterSpacing: "0.09em", textTransform: "uppercase",
              }}>Platform Capabilities</span>
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.7rem, 3vw, 2.5rem)",
              fontWeight: 800, color: "var(--color-dark)",
              margin: "0 0 14px", letterSpacing: "-0.022em",
            }}>Everything you need to choose right.</h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "1rem",
              color: "var(--color-text)", maxWidth: "480px",
              margin: "0 auto", lineHeight: 1.75,
            }}>Three powerful lenses on any location — unified in one seamless analysis flow.</p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px",
          }}>
            <FeatureCard index={0} icon={<IconFootTraffic />}
              title="Foot Traffic Analysis"
              description="Visualize pedestrian and vehicle flow patterns throughout the day and week — pinpoint peak visibility before you commit." />
            <FeatureCard index={1} icon={<IconCompetitor />}
              title="Competitor Density"
              description="Map nearby competitors, understand their clustering, and gauge potential market pressure at any address you're evaluating." />
            <FeatureCard index={2} icon={<IconSaturation />}
              title="Market Saturation"
              description="Discover oversaturated zones and untapped pockets with our saturation index — move where others haven't looked yet." />
          </div>
        </section>

        {/* ════════════════════════════════════════
            DARK STATS BAND
        ════════════════════════════════════════ */}
        <section style={{
          background: "linear-gradient(140deg, var(--color-dark) 0%, #162a1f 55%, var(--color-brand-dark) 100%)",
          padding: "76px 5%", position: "relative", overflow: "hidden",
        }}>
          <svg style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            opacity: 0.05, pointerEvents: "none",
          }}>
            <defs>
              <pattern id="dots2" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots2)" />
          </svg>
          <div style={{
            position: "absolute", top: "-60px", right: "8%",
            width: "380px", height: "380px",
            background: "radial-gradient(circle, rgba(63,125,88,0.22) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{
            maxWidth: "900px", margin: "0 auto",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "44px", position: "relative",
          }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                fontWeight: 700, color: "#FCFCFD",
                margin: "0 0 14px", letterSpacing: "-0.018em",
              }}>Insight-driven decisions, from day one.</h2>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.95rem",
                color: "rgba(252,252,253,0.62)", margin: 0,
                maxWidth: "440px", lineHeight: 1.72,
              }}>Location analytics that used to cost thousands — now at your fingertips.</p>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <StatBadge value="3×"        label="Signals Analyzed" />
              <StatBadge value="Real-time" label="Demand Data"      />
              <StatBadge value="360°"      label="Location View"    />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            ABOUT SECTION
        ════════════════════════════════════════ */}
        <section id="about" style={{ padding: "96px 5%", maxWidth: "1280px", margin: "0 auto" }}>
          <div className="fade-in" style={{ marginBottom: "50px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              <div style={{
                width: 5, height: 44, borderRadius: 99, flexShrink: 0,
                background: "linear-gradient(180deg, var(--color-brand) 0%, var(--color-accent) 100%)",
              }} />
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.9rem, 4vw, 2.9rem)",
                fontWeight: 800, color: "var(--color-dark)",
                margin: 0, letterSpacing: "-0.025em",
              }}>About Localyze</h2>
            </div>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "1.02rem",
              color: "var(--color-text)", margin: "0 0 0 19px",
              maxWidth: "560px", lineHeight: 1.8,
            }}>
              A platform born from the belief that every entrepreneur deserves enterprise-grade location intelligence.
            </p>
          </div>

          {/* Mission card */}
          <div className="fade-in fade-in-1" style={{
            background: "var(--color-card)",
            border: "1px solid rgba(230,211,173,.6)",
            borderRadius: "24px", padding: "44px 40px",
            marginBottom: "22px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, right: 0, width: 220, height: 220,
              background: "radial-gradient(circle at top right, rgba(230,211,173,0.18) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
              width: 4, height: "55%", borderRadius: "0 4px 4px 0",
              background: "linear-gradient(180deg, var(--color-brand) 0%, var(--color-accent) 100%)",
            }} />
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.68rem",
              fontWeight: 700, letterSpacing: "0.13em",
              textTransform: "uppercase", color: "var(--color-brand)", margin: "0 0 14px",
            }}>Our Mission</p>
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)",
              fontWeight: 700, color: "var(--color-dark)",
              margin: "0 0 18px", lineHeight: 1.32,
              maxWidth: "560px", letterSpacing: "-0.015em",
            }}>
              Making smart location decisions accessible to every business owner.
            </h3>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.9rem",
              color: "var(--color-text)", margin: 0,
              lineHeight: 1.87, maxWidth: "640px",
            }}>
              Choosing where to open a business is one of the most consequential decisions an entrepreneur can make. Localyze was built to level the playing field — aggregating foot traffic patterns, competitor density, and real-time demand signals into a single intuitive platform so that independent business owners can make the same caliber of location decisions that enterprise retailers have relied on for decades.
            </p>
          </div>

          {/* Graduation banner */}
          <div className="fade-in fade-in-2" style={{
            background: "linear-gradient(135deg, #1a3a2a 0%, #243d30 50%, #1e4535 100%)",
            border: "1px solid rgba(230,211,173,.17)",
            borderRadius: "20px", padding: "30px 34px",
            display: "flex", alignItems: "center",
            gap: "22px", flexWrap: "wrap",
            boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, right: 0, width: 280, height: "100%",
              background: "radial-gradient(ellipse at right center, rgba(230,211,173,0.07) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />
            <div style={{
              flexShrink: 0, width: 56, height: 56,
              background: "rgba(230,211,173,0.1)",
              border: "1px solid rgba(230,211,173,0.28)",
              borderRadius: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-accent)" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2.21 2.686 4 6 4s6-1.79 6-4v-5" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.67rem",
                fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "var(--color-accent)", margin: "0 0 7px",
              }}>Graduation Project</p>
              <p style={{
                fontFamily: "var(--font-display)", fontSize: "1.05rem",
                fontWeight: 700, color: "#FCFCFD", margin: "0 0 9px", lineHeight: 1.3,
              }}>Final-Year Computer Information Systems Project</p>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.865rem",
                color: "rgba(252,252,253,0.72)", margin: 0,
                lineHeight: 1.72, maxWidth: "580px",
              }}>
                Localyze was developed as a capstone graduation project in the Computer Information Systems program. It demonstrates the integration of geospatial data processing, modern web technologies, and business intelligence design to solve real-world entrepreneurial challenges.
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FINAL CTA BAND
        ════════════════════════════════════════ */}
        <section style={{
          padding: "88px 5%", textAlign: "center",
          background: "var(--color-card)",
          borderTop: "1px solid rgba(230,211,173,.35)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(63,125,88,0.08)",
            border: "1px solid rgba(63,125,88,0.18)",
            borderRadius: "999px", padding: "5px 15px", marginBottom: "20px",
          }}>
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "0.72rem",
              fontWeight: 700, color: "var(--color-brand-dark)",
              letterSpacing: "0.09em", textTransform: "uppercase",
            }}>Ready to start?</span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
            fontWeight: 800, color: "var(--color-dark)",
            margin: "0 auto 16px", letterSpacing: "-0.022em",
            maxWidth: "520px", lineHeight: 1.2,
          }}>Your next great location is waiting to be found.</h2>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "1rem",
            color: "var(--color-text)", margin: "0 auto 38px",
            maxWidth: "380px", lineHeight: 1.75,
          }}>Run your first scan in minutes. No setup required.</p>
          <button onClick={() => navigate("/scan")} style={{
            fontFamily: "var(--font-body)", fontSize: "1rem",
            fontWeight: 700, color: "#fff",
            background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)",
            border: "none", padding: "16px 40px", borderRadius: "14px", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: "10px",
            boxShadow: "0 8px 24px rgba(63,125,88,0.3)", transition: "all 0.24s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(63,125,88,0.44)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(63,125,88,0.3)"; }}
          >Start a new scan <IconArrow /></button>
        </section>

        {/* ════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════ */}
        <footer style={{
          background: "#0e1c13", padding: "48px 5% 34px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{
            maxWidth: "1280px", margin: "0 auto",
            display: "flex", flexDirection: "column", gap: "28px",
          }}>
            <div style={{
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", flexWrap: "wrap", gap: "28px",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <img src={logo} alt="Localyze" style={{
                  height: "34px", objectFit: "contain",
                  filter: "brightness(0) invert(1)", opacity: 0.8,
                }} />
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "0.83rem",
                  color: "rgba(255,255,255,0.4)", margin: 0,
                  maxWidth: "230px", lineHeight: 1.7,
                }}>Location intelligence for entrepreneurs who move fast and think smart.</p>
              </div>

              <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.68rem",
                    fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: 0,
                  }}>Platform</p>
                  {[["Start a Scan", "/scan"], ["Log In", "/login"], ["Sign Up", "/signup"]].map(([label, path]) => (
                    <button key={label} onClick={() => navigate(path)} style={{
                      fontFamily: "var(--font-body)", fontSize: "0.85rem",
                      color: "rgba(255,255,255,0.52)",
                      background: "none", border: "none",
                      cursor: "pointer", padding: 0, textAlign: "left",
                      transition: "color 0.2s",
                    }}
                      onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.9)"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.52)"}
                    >{label}</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.68rem",
                    fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: 0,
                  }}>Learn</p>
                  <a href="#about" onClick={scrollToAbout} style={{
                    fontFamily: "var(--font-body)", fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.52)", textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                    onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.9)"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.52)"}
                  >About</a>
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
            }}>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.78rem",
                color: "rgba(255,255,255,0.25)", margin: 0,
              }}>
                © {new Date().getFullYear()} Localyze · Final-year CIS graduation project · All data is illustrative.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--color-brand)", opacity: 0.72,
                }} />
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: "0.76rem",
                  color: "rgba(255,255,255,0.28)",
                }}>Built with precision</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default WelcomePage;