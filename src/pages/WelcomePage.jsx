import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useTranslation } from "react-i18next";
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
      className={`fade-in fade-in-${index + 2} feature-card`}
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
  <div className="stat-badge" style={{
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
  const { t } = useTranslation();

  const [scrolled, setScrolled] = useState(false);
  const [learnHovered,  setLearnHovered]  = useState(false);
  const [loginHovered,  setLoginHovered]  = useState(false);
  const [signupHovered, setSignupHovered] = useState(false);
  const [analyzeHovered, setAnalyzeHovered] = useState(false);
  const [inputFocused, setInputFocused]   = useState(false);
  const [nicheIndex,   setNicheIndex]   = useState(0);
  const [wordKey,      setWordKey]      = useState(0);
  const [locationVal, setLocationVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

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

  // ── Signup modal state ──
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [modalName,       setModalName]       = useState("");
  const [modalEmail,      setModalEmail]      = useState("");
  const [modalPassword,   setModalPassword]   = useState("");
  const [modalShowPw,     setModalShowPw]     = useState(false);
  const [modalLoading,    setModalLoading]    = useState(false);
  const [modalGLoading,   setModalGLoading]   = useState(false);
  const [modalDone,       setModalDone]       = useState(false);
  const [modalErrors,     setModalErrors]     = useState({});
  const [modalFirebaseErr,setModalFirebaseErr]= useState("");
  const [modalBtnHov,     setModalBtnHov]     = useState(false);
  const [modalGBtnHov,    setModalGBtnHov]    = useState(false);

  const mapAuthError = code => ({
    "auth/email-already-in-use"   : t("signup.errors.emailInUse"),
    "auth/invalid-email"          : t("signup.errors.invalidEmail"),
    "auth/weak-password"          : t("signup.errors.weakPassword"),
    "auth/network-request-failed" : t("signup.errors.networkError"),
    "auth/too-many-requests"      : t("signup.errors.tooManyRequests"),
  }[code] ?? t("signup.errors.default"));

  const closeModal = () => {
    setShowSignupModal(false);
    setModalName(""); setModalEmail(""); setModalPassword("");
    setModalErrors({}); setModalFirebaseErr(""); setModalDone(false);
  };

  const modalValidate = () => {
    const e = {};
    if (!modalName.trim())                 e.name     = t("signup.validation.nameRequired");
    if (!/\S+@\S+\.\S+/.test(modalEmail))  e.email    = t("signup.validation.emailRequired");
    if (modalPassword.length < 8)          e.password = t("signup.validation.minChars");
    return e;
  };

  const modalSubmit = async () => {
    const e = modalValidate();
    if (Object.keys(e).length) { setModalErrors(e); return; }
    setModalErrors({}); setModalFirebaseErr(""); setModalLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, modalEmail, modalPassword);
      setModalDone(true);
      setTimeout(() => { closeModal(); navigate("/scan"); }, 1600);
    } catch (err) {
      setModalFirebaseErr(mapAuthError(err.code));
    } finally {
      setModalLoading(false);
    }
  };

  const modalGoogleSignup = async () => {
    setModalFirebaseErr(""); setModalGLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setModalDone(true);
      setTimeout(() => { closeModal(); navigate("/scan"); }, 1600);
    } catch (err) {
      setModalFirebaseErr(mapAuthError(err.code));
    } finally {
      setModalGLoading(false);
    }
  };

  const handleProtectedAction = () => {
    if (auth.currentUser) {
      navigate("/scan");
    } else {
      navigate("/signup");
    }
  };

  const handleAnalyze = () => handleProtectedAction();

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
          {/* Hanging oversized logo */}
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

          {/* Spacer — class added for responsive shrink */}
          <div className="nav-logo-spacer" style={{ width: "180px", flexShrink: 0 }} />

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* About link — hidden on mobile */}
            <a
              href="#about"
              onClick={scrollToAbout}
              className="nav-learn-link"
              style={{
                fontFamily: "var(--font-body)", fontSize: "0.875rem",
                fontWeight: 500, color: "var(--color-text)",
                textDecoration: "none", padding: "8px 14px",
                borderRadius: "10px", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.color = "var(--color-dark)"; e.target.style.background = "rgba(63,125,88,0.07)"; }}
              onMouseLeave={e => { e.target.style.color = "var(--color-text)"; e.target.style.background = "transparent"; }}
            >{t("welcome.about")}</a>

            {/* Log In — hidden on mobile */}
            <button
              onClick={() => navigate("/login")}
              onMouseEnter={() => setLoginHovered(true)}
              onMouseLeave={() => setLoginHovered(false)}
              className="nav-login-btn"
              style={{
                fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 500,
                color: loginHovered ? "var(--color-dark)" : "var(--color-text)",
                background: loginHovered ? "rgba(63,125,88,0.07)" : "transparent",
                border: "none", padding: "8px 14px",
                borderRadius: "10px", cursor: "pointer", transition: "all 0.2s",
              }}
            >{t("welcome.logIn")}</button>

            {/* Sign Up */}
            <button
              onClick={() => navigate("/signup")}
              onMouseEnter={() => setSignupHovered(true)}
              onMouseLeave={() => setSignupHovered(false)}
              className="nav-signup-btn"
              style={{
                fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)",
                border: "none", padding: "9px 22px",
                borderRadius: "10px", cursor: "pointer",
                boxShadow: signupHovered ? "0 6px 20px rgba(63,125,88,0.42)" : "0 3px 12px rgba(63,125,88,0.28)",
                transform: signupHovered ? "translateY(-1px)" : "translateY(0)",
                transition: "all 0.22s ease",
              }}
            >{t("welcome.signUp")}</button>
          </div>
        </nav>

        {/* ════════════════════════════════════════
            HERO — ASYMMETRIC SPLIT
        ════════════════════════════════════════ */}
        <section
          className="hero-section"
          style={{
            minHeight: "100vh",
            padding: "120px 5% 80px",
            display: "flex", alignItems: "center",
            position: "relative", overflow: "hidden",
          }}
        >
          <DotGrid />

          {/* Ambient background glow */}
          <div style={{
            position: "absolute", top: "15%", left: "35%",
            width: "700px", height: "700px",
            background: "radial-gradient(ellipse at center, rgba(63,125,88,0.09) 0%, transparent 68%)",
            pointerEvents: "none",
          }} />

          {/* Two-column grid */}
          <div
            className="hero-grid"
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "52px",
              alignItems: "center",
              position: "relative", zIndex: 1,
            }}
          >

            {/* ── LEFT: Copy ── */}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "flex-start", justifyContent: "center",
            }}>

              {/* ── Rotating headline ── */}
              <h1
                className="fade-in fade-in-1 hero-h1"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.3rem, 4.2vw, 3.8rem)",
                  fontWeight: 800, color: "var(--color-dark)",
                  margin: "0 0 22px", lineHeight: 1.12,
                  letterSpacing: "-0.028em", maxWidth: "540px",
                }}
              >
                {t("welcome.heroTitle")}{" "}
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
                    {(t("welcome.niches", { returnObjects: true }) || NICHES)[nicheIndex]}
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
                {t("welcome.heroDesc")}
              </p>

              {/* ── Quick Start Location Input ── */}
              <div
                className="fade-in fade-in-3 hero-input-wrapper"
                style={{ width: "100%", maxWidth: "480px", marginBottom: "20px" }}
              >
                <div
                  className="hero-input-inner"
                  style={{
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
                  }}
                >
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
                    placeholder={t("welcome.searchPlaceholder")}
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
                    className="hero-analyze-btn"
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
                    {t("welcome.analyzeArea")} <IconArrow />
                  </button>
                </div>

                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "0.72rem",
                  color: "var(--color-text)", margin: "9px 0 0 4px",
                  opacity: 0.7,
                }}>
                  {t("welcome.trySuggestions")}
                </p>
              </div>

              {/* Learn more link */}
              <div className="fade-in fade-in-3" style={{ marginBottom: "40px" }}>
                <a
                  href="#about"
                  onClick={scrollToAbout}
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
                >{t("welcome.learnMore")}</a>
              </div>

              {/* Social proof strip */}
              <div
                className="fade-in fade-in-4 hero-proof-strip"
                style={{
                  display: "flex", alignItems: "center",
                  paddingTop: "22px",
                  borderTop: "1px solid rgba(230,211,173,.45)",
                }}
              >
                {[
                  { val: "3×",      label: t("welcome.dataSignals")    },
                  { val: "360°",    label: t("welcome.locationView")   },
                  { val: "< 2 min", label: t("welcome.timeToInsight") },
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
            <div
              className="hero-globe-col"
              style={{
                position: "relative", display: "flex",
                alignItems: "center", justifyContent: "center",
                minHeight: "520px",
              }}
            >
              {/* Globe glow backdrop */}
              <div style={{
                position: "absolute",
                width: "480px", height: "480px", borderRadius: "50%",
                background: "radial-gradient(circle at center, rgba(63,125,88,0.15) 0%, rgba(63,125,88,0.05) 55%, transparent 75%)",
                pointerEvents: "none", zIndex: 1,
              }} />

              {/* Globe image */}
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
        <section
          className="pipeline-section"
          style={{
            background: "linear-gradient(180deg, var(--color-card) 0%, rgba(252,252,250,0.6) 100%)",
            borderTop: "1px solid rgba(230,211,173,.4)",
            borderBottom: "1px solid rgba(230,211,173,.4)",
            padding: "72px 5%",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            {/* Section label */}
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.7rem",
                fontWeight: 700, letterSpacing: "0.13em",
                textTransform: "uppercase", color: "var(--color-brand)",
                margin: "0 0 10px",
              }}>{t("welcome.underTheHood")}</p>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)",
                fontWeight: 800, color: "var(--color-dark)",
                margin: 0, letterSpacing: "-0.02em",
              }}>{t("welcome.howItWorks")}</h2>
            </div>

            {/* 3 pipeline steps — class added for responsive stacking */}
            <div
              className="pipeline-steps-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr auto 1fr",
                alignItems: "center",
                gap: "0",
              }}
            >
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
                    }}>{t("welcome.step01")}</span>
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontSize: "1.1rem",
                    fontWeight: 700, color: "var(--color-dark)",
                    margin: "0 0 8px", lineHeight: 1.3,
                  }}>{t("welcome.dataAggregation")}</h3>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.85rem",
                    color: "var(--color-text)", margin: 0, lineHeight: 1.72,
                  }}>{t("welcome.dataAggDesc")}</p>
                </div>
              </div>

              {/* Connector arrow 1 — class added to hide on mobile */}
              <div
                className="pipeline-arrow-connector"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 16px", flexShrink: 0,
                }}
              >
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
                    }}>{t("welcome.step02")}</span>
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontSize: "1.1rem",
                    fontWeight: 700, color: "var(--color-dark)",
                    margin: "0 0 8px", lineHeight: 1.3,
                  }}>{t("welcome.aiAnalysis")}</h3>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.85rem",
                    color: "var(--color-text)", margin: 0, lineHeight: 1.72,
                  }}>{t("welcome.aiAnalysisDesc")}</p>
                </div>
              </div>

              {/* Connector arrow 2 — class added to hide on mobile */}
              <div
                className="pipeline-arrow-connector"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 16px", flexShrink: 0,
                }}
              >
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
                    }}>{t("welcome.step03")}</span>
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontSize: "1.1rem",
                    fontWeight: 700, color: "var(--color-dark)",
                    margin: "0 0 8px", lineHeight: 1.3,
                  }}>{t("welcome.actionableInsights")}</h3>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.85rem",
                    color: "var(--color-text)", margin: 0, lineHeight: 1.72,
                  }}>{t("welcome.actionableDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FEATURES GRID
        ════════════════════════════════════════ */}
        <section
          className="features-section"
          style={{ padding: "96px 5%", maxWidth: "1280px", margin: "0 auto" }}
        >
          <div className="fade-in" style={{ textAlign: "center", marginBottom: "54px" }}>
            <div
              className="section-label-chip"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(63,125,88,0.08)",
                border: "1px solid rgba(63,125,88,0.18)",
                borderRadius: "999px", padding: "5px 15px", marginBottom: "18px",
              }}
            >
              <span style={{
                fontFamily: "var(--font-body)", fontSize: "0.72rem",
                fontWeight: 700, color: "var(--color-brand-dark)",
                letterSpacing: "0.09em", textTransform: "uppercase",
              }}>{t("welcome.capabilities")}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.7rem, 3vw, 2.5rem)",
              fontWeight: 800, color: "var(--color-dark)",
              margin: "0 0 14px", letterSpacing: "-0.022em",
            }}>{t("welcome.capabilitiesTitle")}</h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "1rem",
              color: "var(--color-text)", maxWidth: "480px",
              margin: "0 auto", lineHeight: 1.75,
            }}>{t("welcome.capabilitiesDesc")}</p>
          </div>

          <div
            className="features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "22px",
            }}
          >
            <FeatureCard index={0} icon={<IconFootTraffic />}
              title={t("welcome.footTrafficAnalysis")}
              description={t("welcome.footTrafficDesc")} />
            <FeatureCard index={1} icon={<IconCompetitor />}
              title={t("welcome.competitorDensity")}
              description={t("welcome.competitorDensityDesc")} />
            <FeatureCard index={2} icon={<IconSaturation />}
              title={t("welcome.marketSaturation")}
              description={t("welcome.marketSaturationDesc")} />
          </div>
        </section>

        {/* ════════════════════════════════════════
            DARK STATS BAND
        ════════════════════════════════════════ */}
        <section
          className="stats-band"
          style={{
            background: "linear-gradient(140deg, var(--color-dark) 0%, #162a1f 55%, var(--color-brand-dark) 100%)",
            padding: "76px 5%", position: "relative", overflow: "hidden",
          }}
        >
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
              }}>{t("welcome.insightDriven")}</h2>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.95rem",
                color: "rgba(252,252,253,0.62)", margin: 0,
                maxWidth: "440px", lineHeight: 1.72,
              }}>{t("welcome.insightDesc")}</p>
            </div>
            {/* Badges row — class added for responsive stacking */}
            <div
              className="stats-band-badges"
              style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}
            >
              <StatBadge value="3×"        label={t("welcome.signalsAnalyzed")} />
              <StatBadge value="Real-time" label={t("welcome.demandData")}      />
              <StatBadge value="360°"      label={t("welcome.locationView")}    />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            ABOUT SECTION
        ════════════════════════════════════════ */}
        <section
          id="about"
          className="about-section"
          style={{ padding: "96px 5%", maxWidth: "1280px", margin: "0 auto" }}
        >
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
              }}>{t("welcome.aboutTitle")}</h2>
            </div>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "1.02rem",
              color: "var(--color-text)", margin: "0 0 0 19px",
              maxWidth: "560px", lineHeight: 1.8,
            }}>
              {t("welcome.aboutDesc")}
            </p>
          </div>

          {/* Mission card */}
          <div
            className="fade-in fade-in-1 about-mission-card"
            style={{
              background: "var(--color-card)",
              border: "1px solid rgba(230,211,173,.6)",
              borderRadius: "24px", padding: "44px 40px",
              marginBottom: "22px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              position: "relative", overflow: "hidden",
            }}
          >
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
            }}>{t("welcome.ourMission")}</p>
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)",
              fontWeight: 700, color: "var(--color-dark)",
              margin: "0 0 18px", lineHeight: 1.32,
              maxWidth: "560px", letterSpacing: "-0.015em",
            }}>
              {t("welcome.missionTitle")}
            </h3>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.9rem",
              color: "var(--color-text)", margin: 0,
              lineHeight: 1.87, maxWidth: "640px",
            }}>
              {t("welcome.missionDesc")}
            </p>
          </div>

          {/* Graduation banner */}
          <div
            className="fade-in fade-in-2 about-grad-banner"
            style={{
              background: "linear-gradient(135deg, #1a3a2a 0%, #243d30 50%, #1e4535 100%)",
              border: "1px solid rgba(230,211,173,.17)",
              borderRadius: "20px", padding: "30px 34px",
              display: "flex", alignItems: "center",
              gap: "22px", flexWrap: "wrap",
              boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
              position: "relative", overflow: "hidden",
            }}
          >
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
              }}>{t("welcome.gradProject")}</p>
              <p style={{
                fontFamily: "var(--font-display)", fontSize: "1.05rem",
                fontWeight: 700, color: "#FCFCFD", margin: "0 0 9px", lineHeight: 1.3,
              }}>{t("welcome.gradTitle")}</p>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.865rem",
                color: "rgba(252,252,253,0.72)", margin: 0,
                lineHeight: 1.72, maxWidth: "580px",
              }}>
                {t("welcome.gradDesc")}
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            FINAL CTA BAND
        ════════════════════════════════════════ */}
        <section
          className="cta-section"
          style={{
            padding: "88px 5%", textAlign: "center",
            background: "var(--color-card)",
            borderTop: "1px solid rgba(230,211,173,.35)",
          }}
        >
          <div
            className="section-label-chip"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(63,125,88,0.08)",
              border: "1px solid rgba(63,125,88,0.18)",
              borderRadius: "999px", padding: "5px 15px", marginBottom: "20px",
            }}
          >
            <span style={{
              fontFamily: "var(--font-body)", fontSize: "0.72rem",
              fontWeight: 700, color: "var(--color-brand-dark)",
              letterSpacing: "0.09em", textTransform: "uppercase",
            }}>{t("welcome.readyToStart")}</span>
          </div>
          <h2
            className="cta-h2"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
              fontWeight: 800, color: "var(--color-dark)",
              margin: "0 auto 16px", letterSpacing: "-0.022em",
              maxWidth: "520px", lineHeight: 1.2,
            }}
          >{t("welcome.nextGreatLocation")}</h2>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "1rem",
            color: "var(--color-text)", margin: "0 auto 38px",
            maxWidth: "380px", lineHeight: 1.75,
          }}>{t("welcome.runFirstScan")}</p>
          <button
            onClick={handleProtectedAction}
            style={{
              fontFamily: "var(--font-body)", fontSize: "1rem",
              fontWeight: 700, color: "#fff",
              background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)",
              border: "none", padding: "16px 40px", borderRadius: "14px", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: "10px",
              boxShadow: "0 8px 24px rgba(63,125,88,0.3)", transition: "all 0.24s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(63,125,88,0.44)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(63,125,88,0.3)"; }}
          >{t("welcome.startScan")} <IconArrow /></button>
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
            {/* Top row — logo + link groups */}
            <div
              className="footer-top-row"
              style={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", flexWrap: "wrap", gap: "28px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <img src={logo} alt="Localyze" style={{
                  height: "34px", objectFit: "contain",
                  filter: "brightness(0) invert(1)", opacity: 0.8,
                }} />
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "0.83rem",
                  color: "rgba(255,255,255,0.4)", margin: 0,
                  maxWidth: "230px", lineHeight: 1.7,
                }}>{t("welcome.footerTagline")}</p>
              </div>

              {/* Link groups */}
              <div
                className="footer-links-group"
                style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.68rem",
                    fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: 0,
                  }}>{t("welcome.platform")}</p>
                  {[[t("welcome.startAScan"), "/scan"], [t("welcome.logIn"), "/login"], [t("welcome.signUp"), "/signup"]].map(([label, path]) => (
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
                  }}>{t("welcome.learn")}</p>
                  <a href="#about" onClick={scrollToAbout} style={{
                    fontFamily: "var(--font-body)", fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.52)", textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                    onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.9)"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.52)"}
                  >{t("welcome.about")}</a>
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

            {/* Bottom row */}
            <div
              className="footer-bottom-row"
              style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
              }}
            >
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.78rem",
                color: "rgba(255,255,255,0.25)", margin: 0,
              }}>
                {t("welcome.fullFooter", { year: new Date().getFullYear() })}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--color-brand)", opacity: 0.72,
                }} />
                <span style={{
                  fontFamily: "var(--font-body)", fontSize: "0.76rem",
                  color: "rgba(255,255,255,0.28)",
                }}>{t("common.builtWith")}</span>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* ════════════════════════════════════════
          SIGNUP MODAL OVERLAY
      ════════════════════════════════════════ */}
      {showSignupModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          style={{
            position:"fixed", inset:0, zIndex:999,
            background:"rgba(10,24,15,.72)",
            backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"20px",
            animation:"modalFadeIn .25s ease both",
          }}
        >
          <style>{`
            @keyframes modalFadeIn {
              from { opacity:0; }
              to   { opacity:1; }
            }
            @keyframes modalSlideUp {
              from { opacity:0; transform:translateY(32px) scale(.97); }
              to   { opacity:1; transform:translateY(0) scale(1); }
            }
            @keyframes modal-spin { to { transform:rotate(360deg); } }
            @keyframes modal-bloom {
              0%  { opacity:0; transform:scale(.5) rotate(-15deg); }
              70% { transform:scale(1.12) rotate(3deg); }
              100%{ opacity:1; transform:scale(1) rotate(0deg); }
            }
            @keyframes field-rise {
              from { opacity:0; transform:translateY(14px); }
              to   { opacity:1; transform:translateY(0); }
            }
            @keyframes seg-fill {
              from { transform:scaleX(0); }
              to   { transform:scaleX(1); }
            }
            @keyframes btn-glow {
              0%,100% { box-shadow:0 8px 28px rgba(63,125,88,.38),0 0 0 0 rgba(63,125,88,0); }
              50%     { box-shadow:0 14px 44px rgba(63,125,88,.56),0 0 0 10px rgba(63,125,88,.06); }
            }
          `}</style>

          {/* Modal card — class added for responsive sizing */}
          <div
            className="signup-modal-card"
            style={{
              position:"relative", width:"100%", maxWidth:"420px",
              background:"rgba(255,255,255,.08)",
              backdropFilter:"blur(65px) saturate(180%)",
              WebkitBackdropFilter:"blur(65px) saturate(180%)",
              border:"1px solid rgba(63,125,88,.18)",
              borderRadius:"32px", padding:"48px 40px 40px",
              boxShadow:
                "0 48px 120px rgba(0,0,0,.28)," +
                "0 12px 40px rgba(0,0,0,.18)," +
                "inset 0 2px 0 rgba(255,255,255,.7)," +
                "inset 0 -1px 0 rgba(63,125,88,.07)",
              animation:"modalSlideUp .35s cubic-bezier(.34,1.28,.64,1) both",
            }}
          >

            {/* Close button */}
            <button onClick={closeModal} style={{
              position:"absolute", top:"18px", right:"20px",
              background:"none", border:"none", cursor:"pointer",
              color:"var(--color-text)", opacity:.45, padding:"4px",
              fontSize:"1.2rem", lineHeight:1,
              transition:"opacity .2s",
            }}
              onMouseEnter={e=>e.currentTarget.style.opacity="1"}
              onMouseLeave={e=>e.currentTarget.style.opacity=".45"}
            >✕</button>

            {/* Header lockup */}
            <div style={{ textAlign:"center", marginBottom:"36px" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", marginBottom:"16px" }}>
                <img src={logo1} alt="Localyze" style={{
                  height:"22px", width:"auto", objectFit:"contain",
                  filter:"drop-shadow(0 0 8px rgba(63,125,88,.3))",
                }}/>
                <span style={{
                  fontFamily:"var(--font-display)", fontSize:"1rem", fontWeight:700,
                  color:"var(--color-brand-dark)", letterSpacing:".04em",
                  textShadow:"0 0 12px rgba(63,125,88,.25)",
                }}>{t("common.network")}</span>
              </div>
              <h2 style={{
                fontFamily:"var(--font-display)",
                fontSize:"clamp(1.7rem,4vw,2.1rem)",
                fontWeight:800, color:"var(--color-dark)",
                margin:"0 0 10px", letterSpacing:"-.03em", lineHeight:1.1,
                textShadow:"0 1px 24px rgba(255,255,255,.65)",
              }}>
                {t("signup.createYour")}{"\u00A0"}
                <span style={{
                  background:"linear-gradient(130deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  backgroundClip:"text",
                }}>{t("signup.account")}</span>
              </h2>
              <p style={{
                fontFamily:"var(--font-body)", fontSize:".85rem",
                color:"var(--color-dark)", margin:0, opacity:.6, lineHeight:1.6,
              }}>{t("signup.subtitle")}</p>
            </div>

            {/* Success state */}
            {modalDone ? (
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:"16px",
                padding:"8px 0", animation:"modal-bloom .6s cubic-bezier(.34,1.56,.64,1) both",
              }}>
                <div style={{
                  width:68, height:68, borderRadius:"50%",
                  background:"rgba(63,125,88,.1)", border:"2.5px solid var(--color-brand)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 0 40px rgba(63,125,88,.35)",
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                    stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p style={{
                  fontFamily:"var(--font-display)", fontSize:"1.2rem",
                  fontWeight:800, color:"var(--color-dark)", margin:0,
                }}>{t("signup.youreIn")} {t("signup.launchingDashboard")}</p>
              </div>
            ) : (
              <>
                {/* Firebase error banner */}
                {modalFirebaseErr && (
                  <div style={{
                    marginBottom:"18px", padding:"11px 16px", borderRadius:"12px",
                    background:"rgba(231,76,60,.08)", border:"1px solid rgba(231,76,60,.2)",
                  }}>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:".78rem", fontWeight:600, color:"#e74c3c", margin:0, textAlign:"center" }}>
                      {modalFirebaseErr}
                    </p>
                  </div>
                )}

                {/* ── Fields ── */}
                {(() => {
                  const getPw = pw => {
                    if (!pw) return null;
                    let s = 0;
                    if (pw.length >= 8)          s++;
                    if (/[A-Z]/.test(pw))        s++;
                    if (/[0-9]/.test(pw))        s++;
                    if (/[^A-Za-z0-9]/.test(pw)) s++;
                    return [
                      { s, label:t("signup.pwStrength.tooShort"),  color:"#e74c3c" },
                      { s, label:t("signup.pwStrength.weak"),       color:"#e67e22" },
                      { s, label:t("signup.pwStrength.fair"),       color:"#e6c329" },
                      { s, label:t("signup.pwStrength.good"),       color:"var(--color-brand)" },
                      { s, label:t("signup.pwStrength.strong"),   color:"var(--color-brand-dark)" },
                    ][s];
                  };
                  const pw = getPw(modalPassword);

                  const IUser = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
                  const IMail = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
                  const ILock = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
                  const IEye  = ({ show }) => show
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

                  const ModalField = ({ label, icon, type="text", value, onChange, delay="0s", suffix, errKey }) => {
                    const [focus, setFocus] = React.useState(false);
                    const up = focus || value.length > 0;
                    return (
                      <div>
                        <div style={{ position:"relative", paddingTop:"20px", animation:"field-rise .48s ease both", animationDelay:delay }}>
                          <label style={{
                            position:"absolute", left:"26px",
                            top: up ? "1px" : "25px",
                            fontFamily:"var(--font-body)",
                            fontSize: up ? "0.63rem" : "0.88rem", fontWeight:700,
                            letterSpacing: up ? ".1em" : ".02em",
                            textTransform: up ? "uppercase" : "none",
                            color: focus ? "var(--color-brand)" : up ? "rgba(63,125,88,.65)" : "var(--color-dark)",
                            opacity: up ? 1 : .6, pointerEvents:"none",
                            transition:"all .22s cubic-bezier(.4,0,.2,1)",
                            textShadow: focus ? "0 0 14px rgba(63,125,88,.3)" : "none",
                          }}>{label}</label>
                          <div style={{
                            display:"flex", alignItems:"center",
                            borderBottom:`1.5px solid ${modalErrors[errKey] ? "rgba(231,76,60,.5)" : focus ? "var(--color-brand)" : "rgba(255,255,255,.3)"}`,
                            boxShadow: focus ? "0 2px 0 rgba(63,125,88,.2)" : "none",
                            transition:"border-color .22s, box-shadow .22s",
                          }}>
                            <span style={{
                              color: focus ? "var(--color-brand)" : "rgba(63,125,88,.4)",
                              marginRight:"10px", marginLeft:"2px",
                              display:"flex", alignItems:"center",
                              transition:"color .2s", flexShrink:0,
                            }}>{icon}</span>
                            <input type={type} value={value} onChange={onChange}
                              onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
                              style={{
                                flex:1, border:"none", outline:"none", background:"transparent",
                                fontFamily:"var(--font-body)", fontSize:"0.95rem",
                                color:"var(--color-dark)", padding:"9px 0 10px",
                                caretColor:"var(--color-brand)",
                              }}
                            />
                            {suffix}
                          </div>
                        </div>
                        {modalErrors[errKey] && (
                          <p style={{ fontFamily:"var(--font-body)", fontSize:".7rem", color:"#e74c3c", margin:"5px 0 0" }}>
                            {modalErrors[errKey]}
                          </p>
                        )}
                      </div>
                    );
                  };

                  return (
                    <div style={{ display:"flex", flexDirection:"column", gap:"26px", marginBottom:"28px" }}>
                      <ModalField
                        label={t("signup.fullName")} icon={<IUser/>} errKey="name"
                        value={modalName} delay=".06s"
                        onChange={e=>{ setModalName(e.target.value); setModalErrors(p=>({...p,name:""})); }}
                      />
                      <ModalField
                        label={t("signup.emailLabel")} icon={<IMail/>} type="email" errKey="email"
                        value={modalEmail} delay=".14s"
                        onChange={e=>{ setModalEmail(e.target.value); setModalErrors(p=>({...p,email:""})); }}
                      />
                      <div>
                        <ModalField
                          label={t("signup.passwordLabel")} icon={<ILock/>} errKey="password"
                          type={modalShowPw ? "text" : "password"}
                          value={modalPassword} delay=".22s"
                          onChange={e=>{ setModalPassword(e.target.value); setModalErrors(p=>({...p,password:""})); }}
                          suffix={
                            <button type="button" onClick={()=>setModalShowPw(v=>!v)}
                              style={{ background:"none", border:"none", cursor:"pointer", padding:"0 0 0 8px", color:"var(--color-text)", opacity:.45, display:"flex", alignItems:"center", transition:"opacity .2s" }}
                              onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                              onMouseLeave={e=>e.currentTarget.style.opacity=".45"}
                            ><IEye show={modalShowPw}/></button>
                          }
                        />
                        {pw && (
                          <div style={{ marginTop:"11px", animation:"field-rise .3s ease both" }}>
                            <div style={{ display:"flex", gap:"5px", marginBottom:"5px" }}>
                              {[1,2,3,4].map(i=>(
                                <div key={i} style={{ flex:1, height:"3px", borderRadius:"999px", background:"rgba(255,255,255,.18)", overflow:"hidden" }}>
                                  <div style={{ width:"100%", height:"100%", background: i<=pw.s ? pw.color : "transparent", transformOrigin:"left", animation: i<=pw.s ? "seg-fill .3s ease both" : "none", animationDelay:`${i*.07}s` }}/>
                                </div>
                              ))}
                            </div>
                            <span style={{ fontFamily:"var(--font-body)", fontSize:".66rem", fontWeight:700, letterSpacing:".07em", color:pw.color, textShadow:`0 0 10px ${pw.color}55` }}>{pw.label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Create Account CTA */}
                <button onClick={modalSubmit} disabled={modalLoading||modalGLoading}
                  onMouseEnter={()=>setModalBtnHov(true)} onMouseLeave={()=>setModalBtnHov(false)}
                  style={{
                    width:"100%", fontFamily:"var(--font-body)", fontSize:"1rem",
                    fontWeight:700, color:"#fff",
                    background: modalLoading ? "rgba(63,125,88,.48)" : "linear-gradient(135deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)",
                    border:"none", borderRadius:"999px", padding:"15px 32px",
                    cursor: modalLoading||modalGLoading ? "not-allowed" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
                    animation: modalLoading ? "none" : "btn-glow 6s ease-in-out infinite",
                    transform: modalBtnHov&&!modalLoading&&!modalGLoading ? "translateY(-2px) scale(1.025)" : "translateY(0) scale(1)",
                    transition:"transform .26s cubic-bezier(.34,1.56,.64,1), background .2s",
                    letterSpacing:".02em", marginBottom:"14px",
                  }}>
                  {modalLoading
                    ? <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"modal-spin .7s linear infinite" }}/>{t("signup.creatingAccount")}</>
                    : <>{t("signup.createAccount")} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
                </button>

                {/* OR divider */}
                <div style={{ display:"flex", alignItems:"center", gap:"14px", margin:"4px 0 14px" }}>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,.22)" }}/>
                  <span style={{ fontFamily:"var(--font-body)", fontSize:".66rem", letterSpacing:".08em", color:"var(--color-text)", opacity:.35 }}>{t("common.or")}</span>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,.22)" }}/>
                </div>

                {/* Sign up with Google */}
                <button onClick={modalGoogleSignup} disabled={modalLoading||modalGLoading}
                  onMouseEnter={()=>setModalGBtnHov(true)} onMouseLeave={()=>setModalGBtnHov(false)}
                  style={{
                    width:"100%", fontFamily:"var(--font-body)", fontSize:".9rem",
                    fontWeight:600, color:"var(--color-dark)",
                    background: modalGBtnHov ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.12)",
                    border:"1px solid rgba(255,255,255,.35)", borderRadius:"999px", padding:"13px 32px",
                    cursor: modalLoading||modalGLoading ? "not-allowed" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
                    backdropFilter:"blur(8px)",
                    transform: modalGBtnHov&&!modalLoading&&!modalGLoading ? "translateY(-1px)" : "translateY(0)",
                    transition:"all .22s ease", marginBottom:"22px",
                    boxShadow: modalGBtnHov ? "0 6px 20px rgba(0,0,0,.08)" : "none",
                  }}>
                  {modalGLoading
                    ? <><span style={{ width:14, height:14, border:"2px solid rgba(63,125,88,.3)", borderTop:"2px solid var(--color-brand)", borderRadius:"50%", display:"inline-block", animation:"modal-spin .7s linear infinite" }}/>{t("signup.connecting")}</>
                    : <><svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>{t("signup.signUpGoogle")}</>}
                </button>

                {/* Log in link */}
                <p style={{ fontFamily:"var(--font-body)", fontSize:".82rem", textAlign:"center", margin:0, color:"var(--color-dark)", opacity:.7 }}>
                  {t("signup.hasAccount")}{" "}
                  <button onClick={()=>{ closeModal(); navigate("/login"); }} style={{
                    fontFamily:"var(--font-body)", fontSize:".82rem", fontWeight:700,
                    color:"var(--color-brand-dark)", background:"none", border:"none",
                    padding:0, cursor:"pointer", textDecoration:"underline",
                    textDecorationColor:"rgba(63,125,88,.3)", transition:"color .18s",
                  }}
                    onMouseEnter={e=>e.currentTarget.style.color="var(--color-brand)"}
                    onMouseLeave={e=>e.currentTarget.style.color="var(--color-brand-dark)"}
                  >{t("signup.logIn")}</button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WelcomePage;