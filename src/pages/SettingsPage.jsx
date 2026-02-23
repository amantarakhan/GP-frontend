import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail, updateProfile, signOut } from "firebase/auth";
import { auth } from "../firebase";

// ─────────────────────────────────────────────────────────────────────────────
// KEYFRAMES — all animations used across the page
// ─────────────────────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes sp-fade-in {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sp-toast-in {
    0%   { opacity: 0; transform: translateX(28px) scale(.96); }
    14%  { opacity: 1; transform: translateX(0)    scale(1); }
    86%  { opacity: 1; transform: translateX(0)    scale(1); }
    100% { opacity: 0; transform: translateX(28px) scale(.96); }
  }
  @keyframes btn-glow {
    0%,100% { box-shadow: 0 8px 28px rgba(63,125,88,.38), 0 0 0 0    rgba(63,125,88,0); }
    50%     { box-shadow: 0 14px 44px rgba(63,125,88,.56), 0 0 0 10px rgba(63,125,88,.06); }
  }
  @keyframes spin-slow {
    to { transform: rotate(360deg); }
  }
  @keyframes icon-glow-pulse {
    0%,100% { filter: drop-shadow(0 0 4px rgba(63,125,88,.4)); }
    50%     { filter: drop-shadow(0 0 10px rgba(63,125,88,.85)); }
  }
  @keyframes success-bloom {
    0%  { opacity: 0; transform: scale(.5) rotate(-15deg); }
    70% { transform: scale(1.12) rotate(3deg); }
    100%{ opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes aura-drift {
    0%,100% { transform: scale(1);    opacity: .07; }
    50%     { transform: scale(1.08); opacity: .13; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// ICON SYSTEM — dual-tone emerald, glow on hover via parent's CSS class
// ─────────────────────────────────────────────────────────────────────────────
const IconUser = ({ glowing }) => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24"
    stroke={glowing ? "var(--color-brand)" : "rgba(63,125,88,.65)"}
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "stroke .22s", filter: glowing ? "drop-shadow(0 0 6px rgba(63,125,88,.7))" : "none" }}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconShield = ({ glowing }) => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24"
    stroke={glowing ? "var(--color-brand)" : "rgba(63,125,88,.65)"}
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "stroke .22s", filter: glowing ? "drop-shadow(0 0 6px rgba(63,125,88,.7))" : "none" }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconBell = ({ glowing }) => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24"
    stroke={glowing ? "var(--color-brand)" : "rgba(63,125,88,.65)"}
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "stroke .22s", filter: glowing ? "drop-shadow(0 0 6px rgba(63,125,88,.7))" : "none" }}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const IconDanger = ({ glowing }) => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24"
    stroke={glowing ? "#e74c3c" : "rgba(231,76,60,.55)"}
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "stroke .22s", filter: glowing ? "drop-shadow(0 0 6px rgba(231,76,60,.7))" : "none" }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconMail = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconLogOut = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconEdit = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconKey = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);
const IconMoon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const IconArrow = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD — light dashboard style matching AboutPage / var(--color-card)
// Normal : white card, rgba(230,211,173,.6) border, emerald header tint
// Danger  : white card, red border + header tint
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard({ icon, title, accent = false, children, delay = "0s" }) {
  const [hovered, setHovered] = useState(false);

  const borderCol  = accent ? "rgba(231,76,60,.35)"    : "rgba(230,211,173,.6)";
  const borderHov  = accent ? "rgba(231,76,60,.55)"    : "rgba(63,125,88,.35)";
  const headerBg   = accent ? "rgba(231,76,60,.05)"    : "rgba(63,125,88,.05)";
  const headerBord = accent ? "rgba(231,76,60,.18)"    : "rgba(230,211,173,.5)";
  const titleCol   = accent ? "#c0392b"                : "var(--color-brand-dark, #2e6644)";
  const iconBg     = accent ? "rgba(231,76,60,.08)"    : "rgba(63,125,88,.08)";
  const iconBorder = accent ? "rgba(231,76,60,.22)"    : "rgba(63,125,88,.18)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    "var(--color-card, #ffffff)",
        border:        `1px solid ${hovered ? borderHov : borderCol}`,
        borderRadius:  "var(--radius-lg, 16px)",
        overflow:      "auto",
        boxShadow:     hovered ? "var(--shadow-md, 0 8px 32px rgba(0,0,0,.10))"
                                : "var(--shadow-sm, 0 2px 8px rgba(0,0,0,.06))",
        animation:     "sp-fade-in .45s ease both",
        animationDelay: delay,
        transition:    "border-color .22s, box-shadow .22s, transform .22s",
        transform:     hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Card header strip */}
      <div style={{
        padding:      "14px 20px",
        display:      "flex",
        alignItems:   "center",
        gap:          "11px",
        background:   headerBg,
        borderBottom: `1px solid ${headerBord}`,
      }}>
        {/* Icon badge */}
        <div style={{
          width:          "32px",
          height:         "32px",
          borderRadius:   "9px",
          background:     iconBg,
          border:         `1px solid ${iconBorder}`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
          transition:     "box-shadow .22s",
          boxShadow:      hovered
            ? (accent ? "0 0 10px rgba(231,76,60,.2)" : "0 0 10px rgba(63,125,88,.2)")
            : "none",
        }}>
          {React.cloneElement(icon, { glowing: hovered })}
        </div>

        <span style={{
          fontFamily:    "var(--font-body)",
          fontSize:      "11.5px",
          fontWeight:    700,
          color:         titleCol,
          letterSpacing: ".08em",
          textTransform: "uppercase",
        }}>{title}</span>
      </div>

      {/* Card body */}
      <div style={{ padding: "22px 20px" }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE — pill switch, light-background palette
// ─────────────────────────────────────────────────────────────────────────────
function Toggle({ on, onChange, label, description, icon }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "14px 0",
      borderBottom:   "1px solid rgba(230,211,173,.45)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: 1, minWidth: 0 }}>
        {icon && (
          <span style={{
            marginTop:  "2px",
            color:      on ? "var(--color-brand)" : "rgba(63,125,88,.35)",
            flexShrink: 0,
            transition: "color .22s",
          }}>{icon}</span>
        )}
        <div>
          <div style={{
            fontFamily:   "var(--font-body)",
            fontSize:     "13.5px",
            fontWeight:   600,
            color:        on ? "var(--color-dark, #1a2e22)" : "var(--color-text, #4a5568)",
            marginBottom: "3px",
            transition:   "color .22s",
          }}>{label}</div>
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize:   "11.5px",
            color:      "var(--color-text, #687280)",
            opacity:    .75,
            lineHeight: 1.5,
          }}>{description}</div>
        </div>
      </div>

      {/* Pill switch */}
      <button
        onClick={() => onChange(!on)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        aria-checked={on}
        role="switch"
        style={{
          width:        "46px",
          height:       "26px",
          borderRadius: "999px",
          border:       `1.5px solid ${on ? "rgba(63,125,88,.45)" : "rgba(200,210,200,.7)"}`,
          cursor:       "pointer",
          flexShrink:   0,
          marginLeft:   "18px",
          background:   on
            ? "linear-gradient(90deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)"
            : "rgba(200,210,200,.35)",
          position:     "relative",
          transition:   "background .26s ease, border-color .26s, box-shadow .26s",
          boxShadow:    on
            ? "0 0 12px rgba(63,125,88,.35), 0 0 24px rgba(63,125,88,.12)"
            : hov
              ? "0 0 6px rgba(63,125,88,.15)"
              : "none",
        }}
      >
        {/* Thumb */}
        <span style={{
          position:       "absolute",
          top:            "3px",
          left:           on ? "23px" : "3px",
          width:          "18px",
          height:         "18px",
          borderRadius:   "50%",
          background:     "#fff",
          boxShadow:      "0 1px 4px rgba(0,0,0,.18)",
          transition:     "left .26s cubic-bezier(.34,1.56,.64,1)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}>
          {on && (
            <span style={{ color: "var(--color-brand)", display: "flex", lineHeight: 1 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}
        </span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST — slide-in notification banner
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, type = "success" }) {
  const isOk = type === "success";
  return (
    <div style={{
      position:       "fixed",
      top:            "28px",
      right:          "28px",
      zIndex:         9999,
      display:        "flex",
      alignItems:     "center",
      gap:            "10px",
      padding:        "12px 20px",
      borderRadius:   "14px",
      background:     isOk ? "rgba(63,125,88,.16)"   : "rgba(231,76,60,.14)",
      border:         `1px solid ${isOk ? "rgba(63,125,88,.38)" : "rgba(231,76,60,.32)"}`,
      backdropFilter: "blur(24px)",
      boxShadow:      isOk
        ? "0 8px 32px rgba(63,125,88,.2)"
        : "0 8px 32px rgba(231,76,60,.15)",
      fontFamily:     "var(--font-body)",
      fontSize:       "13px",
      fontWeight:     600,
      color:          isOk ? "var(--color-brand)" : "#e05555",
      animation:      "sp-toast-in 3.4s ease forwards",
      whiteSpace:     "nowrap",
    }}>
      {isOk
        ? <span style={{ color: "var(--color-brand)", display: "flex" }}><IconCheck /></span>
        : <span style={{ fontSize: "15px", lineHeight: 1 }}>!</span>}
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIVIDER — thin rule used inside cards
// ─────────────────────────────────────────────────────────────────────────────
const Divider = () => (
  <div style={{ height: "1px", background: "rgba(230,211,173,.45)", margin: "2px 0" }} />
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate();
  const user     = auth.currentUser;

  // Profile
  const [displayName,  setDisplayName]  = useState(user?.displayName || "Analyst Pro");
  const [editingName,  setEditingName]  = useState(false);
  const [nameInput,    setNameInput]    = useState(user?.displayName || "Analyst Pro");
  const [savingName,   setSavingName]   = useState(false);

  // Security
  const [resetSent,    setResetSent]    = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetBtnHov,  setResetBtnHov] = useState(false);

  // Preferences
  const [emailNotifs,  setEmailNotifs]  = useState(true);
  const [darkMode,     setDarkMode]     = useState(true);

  // Danger zone
  const [logoutLoading,  setLogoutLoading]  = useState(false);
  const [logoutConfirm,  setLogoutConfirm]  = useState(false);
  const [logoutBtnHov,   setLogoutBtnHov]   = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3400);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput === displayName) { setEditingName(false); return; }
    setSavingName(true);
    try {
      await updateProfile(user, { displayName: nameInput.trim() });
      setDisplayName(nameInput.trim());
      setEditingName(false);
      showToast("Display name updated.");
    } catch {
      showToast("Failed to update name.", "error");
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      showToast("Reset link sent to your inbox.");
    } catch {
      showToast("Failed to send reset email.", "error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!logoutConfirm) { setLogoutConfirm(true); return; }
    setLogoutLoading(true);
    try {
      await signOut(auth);
      navigate("/login");
    } catch {
      showToast("Logout failed. Try again.", "error");
      setLogoutLoading(false);
    }
  };

  return (
    <>
      <style>{KEYFRAMES}</style>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* ══ DASHBOARD-NATIVE LIGHT WRAPPER — matches AboutPage / ScanPage ══════ */}
      <div style={{
        flex:       1,
        fontFamily: "var(--font-body)",
        padding:    "28px",
        maxWidth:   "960px",
      }}>

          {/* ── PAGE HEADER ────────────────────────────────────────────────── */}
          <div style={{
            marginBottom: "36px",
            animation:    "sp-fade-in .4s ease both",
          }}>
            {/* Breadcrumb */}
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "6px",
              marginBottom: "18px",
              fontFamily:   "var(--font-body)",
              fontSize:     "11.5px",
              color:        "var(--color-text)",
            }}>
              <span style={{ cursor:"pointer", transition:"color .18s" }}
                onMouseEnter={e=>e.currentTarget.style.color="var(--color-dark)"}
                onMouseLeave={e=>e.currentTarget.style.color="var(--color-text)"}
                onClick={() => navigate("/dashboard")}
              >Dashboard</span>
              <span style={{ opacity:.4, fontSize:"10px" }}>›</span>
              <span style={{ color: "var(--color-brand)", fontWeight: 600 }}>Settings</span>
            </div>

            {/* Title row */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"14px" }}>
              <div>
                <h1 style={{
                  fontFamily:    "var(--font-display, var(--font-body))",
                  fontSize:      "clamp(1.55rem,3vw,2rem)",
                  fontWeight:    800,
                  color:         "var(--color-dark)",
                  margin:        "0 0 6px",
                  letterSpacing: "-.028em",
                  lineHeight:    1.1,
                }}>
                  Account{" "}
                  <span style={{
                    background:           "linear-gradient(130deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor:  "transparent",
                    backgroundClip:       "text",
                  }}>Settings</span>
                </h1>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize:   "13px",
                  color:      "var(--color-text)",
                  margin:     0,
                }}>Manage your profile, security, and preferences.</p>
              </div>

              {/* Active plan badge */}
              <div style={{
                display:       "flex",
                alignItems:    "center",
                gap:           "8px",
                padding:       "7px 16px",
                borderRadius:  "999px",
                background:    "rgba(63,125,88,.1)",
                border:        "1px solid rgba(63,125,88,.24)",
                boxShadow:     "0 0 18px rgba(63,125,88,.1)",
              }}>
                <div style={{
                  width:        "7px",
                  height:       "7px",
                  borderRadius: "50%",
                  background:   "var(--color-brand)",
                  boxShadow:    "0 0 10px rgba(63,125,88,.9), 0 0 20px rgba(63,125,88,.4)",
                }} />
                <span style={{
                  fontFamily:    "var(--font-body)",
                  fontSize:      "11px",
                  fontWeight:    700,
                  color:         "var(--color-brand)",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}>Pro Plan Active</span>
              </div>
            </div>
          </div>

          {/* ── 2-COLUMN GRID ──────────────────────────────────────────────── */}
          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap:                 "20px",
          }}>

            {/* ════════════════════════════════════════
                CARD 1 — PROFILE
            ════════════════════════════════════════ */}
            <GlassCard icon={<IconUser />} title="Profile" delay=".05s">

              {/* Avatar row */}
              <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"26px" }}>
                <div style={{
                  position:       "relative",
                  width:          "56px",
                  height:         "56px",
                  borderRadius:   "50%",
                  background:     "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontFamily:     "var(--font-body)",
                  fontSize:       "22px",
                  fontWeight:     800,
                  color:          "#fff",
                  flexShrink:     0,
                  boxShadow:      "0 0 0 2px rgba(63,125,88,.3), 0 0 24px rgba(63,125,88,.28)",
                  letterSpacing:  "-.02em",
                }}>
                  {displayName.charAt(0).toUpperCase()}
                  {/* Online dot */}
                  <span style={{
                    position:     "absolute",
                    bottom:       "1px",
                    right:        "1px",
                    width:        "11px",
                    height:       "11px",
                    borderRadius: "50%",
                    background:   "var(--color-brand)",
                    border:       "2px solid var(--color-card, #ffffff)",
                    boxShadow:    "0 0 8px rgba(63,125,88,.8)",
                  }} />
                </div>
                <div>
                  <div style={{
                    fontFamily:   "var(--font-body)",
                    fontSize:     "15px",
                    fontWeight:   700,
                    color:        "var(--color-dark)",
                  }}>{displayName}</div>
                  <div style={{
                    display:      "inline-flex",
                    alignItems:   "center",
                    gap:          "5px",
                    padding:      "2px 10px",
                    borderRadius: "999px",
                    background:   "rgba(63,125,88,.12)",
                    border:       "1px solid rgba(63,125,88,.22)",
                    fontFamily:   "var(--font-body)",
                    fontSize:     "10px",
                    fontWeight:   700,
                    color:        "var(--color-brand)",
                    letterSpacing:".1em",
                    textTransform:"uppercase",
                  }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--color-brand)", boxShadow:"0 0 6px rgba(63,125,88,.8)", display:"inline-block" }} />
                    Pro
                  </div>
                </div>
              </div>

              {/* Display name field */}
              <div style={{ marginBottom:"18px" }}>
                <label style={{
                  display:       "block",
                  fontFamily:    "var(--font-body)",
                  fontSize:      "10px",
                  fontWeight:    700,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color:         "var(--color-text)",
                  marginBottom:  "8px",
                }}>Display Name</label>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input
                    value={editingName ? nameInput : displayName}
                    onChange={e => setNameInput(e.target.value)}
                    disabled={!editingName}
                    onKeyDown={e => e.key === "Enter" && handleSaveName()}
                    style={{
                      flex:         1,
                      fontFamily:   "var(--font-body)",
                      fontSize:     "13.5px",
                      fontWeight:   editingName ? 500 : 400,
                      color:        editingName ? "var(--color-dark)" : "var(--color-text)",
                      background:   editingName ? "rgba(63,125,88,.06)" : "rgba(0,0,0,.02)",
                      border:       `1px solid ${editingName ? "rgba(63,125,88,.4)" : "rgba(230,211,173,.7)"}`,
                      borderRadius: "10px",
                      padding:      "10px 14px",
                      outline:      "none",
                      transition:   "all .22s",
                      boxShadow:    editingName ? "0 0 0 3px rgba(63,125,88,.1), 0 0 16px rgba(63,125,88,.1)" : "none",
                    }}
                  />
                  <button
                    onClick={() => {
                      if (editingName) handleSaveName();
                      else { setEditingName(true); setNameInput(displayName); }
                    }}
                    disabled={savingName}
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      width:          "40px",
                      height:         "40px",
                      borderRadius:   "10px",
                      border:         "none",
                      flexShrink:     0,
                      cursor:         savingName ? "not-allowed" : "pointer",
                      background:     editingName
                        ? "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))"
                        : "rgba(230,211,173,.4)",
                      color:          editingName ? "#fff" : "var(--color-text)",
                      boxShadow:      editingName ? "0 4px 16px rgba(63,125,88,.35)" : "none",
                      transition:     "all .22s",
                    }}
                  >
                    {editingName ? <IconCheck /> : <IconEdit />}
                  </button>
                </div>
              </div>

              {/* Email row — read-only */}
              <div>
                <label style={{
                  display:       "block",
                  fontFamily:    "var(--font-body)",
                  fontSize:      "10px",
                  fontWeight:    700,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color:         "var(--color-text)",
                  marginBottom:  "8px",
                }}>Email Address</label>
                <div style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "10px",
                  padding:      "10px 14px",
                  borderRadius: "10px",
                  background:   "rgba(0,0,0,.02)",
                  border:       "1px solid rgba(230,211,173,.6)",
                }}>
                  <span style={{ color:"rgba(63,125,88,.55)", flexShrink:0, display:"flex" }}><IconMail /></span>
                  <span style={{ fontFamily:"var(--font-body)", fontSize:"13.5px", color:"var(--color-text)", flex:1 }}>
                    {user?.email || "No email linked"}
                  </span>
                  <span style={{
                    fontFamily:    "var(--font-body)",
                    fontSize:      "9px",
                    fontWeight:    700,
                    color:         "var(--color-brand)",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    background:    "rgba(63,125,88,.1)",
                    border:        "1px solid rgba(63,125,88,.18)",
                    borderRadius:  "6px",
                    padding:       "2px 8px",
                  }}>Verified</span>
                </div>
              </div>
            </GlassCard>

            {/* ════════════════════════════════════════
                CARD 2 — SECURITY
            ════════════════════════════════════════ */}
            <GlassCard icon={<IconShield />} title="Security" delay=".12s">

              {/* Password reset block */}
              <div style={{
                padding:      "16px",
                borderRadius: "14px",
                background:   "rgba(63,125,88,.05)",
                border:       "1px solid rgba(63,125,88,.1)",
                marginBottom: "18px",
              }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"16px" }}>
                  <div style={{
                    width:          "36px",
                    height:         "36px",
                    borderRadius:   "10px",
                    background:     "rgba(63,125,88,.1)",
                    border:         "1px solid rgba(63,125,88,.18)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    color:          "rgba(63,125,88,.7)",
                    flexShrink:     0,
                  }}><IconKey /></div>
                  <div>
                    <div style={{
                      fontFamily:   "var(--font-body)",
                      fontSize:     "14px",
                      fontWeight:   600,
                      color:        "var(--color-dark)",
                      marginBottom: "4px",
                    }}>Password Reset</div>
                    <div style={{
                      fontFamily: "var(--font-body)",
                      fontSize:   "12px",
                      color:      "var(--color-text)",
                    }}>
                      A reset link will be sent to{" "}
                      <span style={{
                        color:          "var(--color-brand)",
                        fontWeight:     600,
                        textShadow:     "0 0 10px rgba(63,125,88,.3)",
                      }}>{user?.email || "your email"}</span>
                    </div>
                  </div>
                </div>

                {/* ── Reset button — exact LoginPage CTA formula ── */}
                <button
                  onClick={handlePasswordReset}
                  disabled={resetLoading || resetSent}
                  onMouseEnter={() => setResetBtnHov(true)}
                  onMouseLeave={() => setResetBtnHov(false)}
                  style={{
                    width:          "100%",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            "8px",
                    fontFamily:     "var(--font-body)",
                    fontSize:       "13.5px",
                    fontWeight:     700,
                    color:          resetSent ? "var(--color-brand)" : "#fff",
                    background:     resetSent
                      ? "rgba(63,125,88,.1)"
                      : resetLoading
                        ? "rgba(63,125,88,.35)"
                        : "linear-gradient(135deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)",
                    border:         resetSent ? "1px solid rgba(63,125,88,.3)" : "none",
                    borderRadius:   "999px",
                    padding:        "12px 20px",
                    cursor:         resetLoading || resetSent ? "not-allowed" : "pointer",
                    letterSpacing:  ".02em",
                    // btn-glow from LoginPage
                    animation:      !resetSent && !resetLoading ? "btn-glow 6s ease-in-out infinite" : "none",
                    transform:      resetBtnHov && !resetSent && !resetLoading
                      ? "translateY(-2px) scale(1.018)"
                      : "translateY(0) scale(1)",
                    transition:     "transform .26s cubic-bezier(.34,1.56,.64,1), background .2s",
                  }}
                >
                  {resetLoading
                    ? <><span style={{ width:13, height:13, border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"spin-slow .7s linear infinite" }}/>Sending…</>
                    : resetSent
                      ? <><IconCheck />Reset link sent!</>
                      : <><IconMail />Send Reset Email <IconArrow /></>}
                </button>
              </div>

              {/* Session status pill */}
              <div style={{
                display:      "flex",
                alignItems:   "center",
                gap:          "10px",
                padding:      "10px 14px",
                borderRadius: "10px",
                background:   "rgba(63,125,88,.04)",
                border:       "1px solid rgba(63,125,88,.14)",
              }}>
                <div style={{
                  width:        "7px",
                  height:       "7px",
                  borderRadius: "50%",
                  background:   "var(--color-brand)",
                  flexShrink:   0,
                  boxShadow:    "0 0 8px rgba(63,125,88,.8), 0 0 16px rgba(63,125,88,.35)",
                }} />
                <span style={{ fontFamily:"var(--font-body)", fontSize:"12px", color:"var(--color-text)" }}>
                  Session active · Localyze Pro
                </span>
              </div>
            </GlassCard>

            {/* ════════════════════════════════════════
                CARD 3 — PREFERENCES
            ════════════════════════════════════════ */}
            <GlassCard icon={<IconBell />} title="Preferences" delay=".19s">
              <Toggle
                on={emailNotifs}
                onChange={val => {
                  setEmailNotifs(val);
                  showToast(val ? "Email notifications enabled." : "Email notifications disabled.");
                }}
                label="Email Notifications"
                description="Receive scan completions and report summaries by email"
                icon={<IconMail />}
              />
              <Divider />
              <Toggle
                on={darkMode}
                onChange={val => {
                  setDarkMode(val);
                  showToast("Theme preference saved.");
                }}
                label="Dark Mode"
                description="Use the dark dashboard theme across all pages"
                icon={<IconMoon />}
              />

              {/* Hint chip */}
              <div style={{
                marginTop:    "20px",
                padding:      "11px 14px",
                borderRadius: "10px",
                background:   "rgba(63,125,88,.05)",
                border:       "1px solid rgba(63,125,88,.1)",
                display:      "flex",
                alignItems:   "center",
                gap:          "9px",
              }}>
                <span style={{ color:"rgba(63,125,88,.55)", flexShrink:0 }}><IconMoon /></span>
                <span style={{ fontFamily:"var(--font-body)", fontSize:"11.5px", color:"var(--color-text)", lineHeight:1.5 }}>
                  Dark mode is tuned for the{" "}
                  <span style={{ color:"var(--color-brand)", fontWeight:600 }}>emerald-on-dark</span>
                  {" "}design system.
                </span>
              </div>
            </GlassCard>

            {/* ════════════════════════════════════════
                CARD 4 — DANGER ZONE
            ════════════════════════════════════════ */}
            <GlassCard icon={<IconDanger />} title="Danger Zone" accent delay=".26s">

              {/* Warning copy */}
              <div style={{
                padding:      "14px",
                borderRadius: "12px",
                background:   "rgba(231,76,60,.04)",
                border:       "1px solid rgba(231,76,60,.12)",
                marginBottom: "18px",
              }}>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize:   "13px",
                  color:      "var(--color-text)",
                  margin:     0,
                  lineHeight: 1.65,
                }}>
                  Signing out will end your current session. Your saved reports and scan history remain intact when you log back in.
                </p>
              </div>

              {/* Confirm warning */}
              {logoutConfirm && (
                <div style={{
                  padding:      "11px 14px",
                  borderRadius: "10px",
                  background:   "rgba(231,76,60,.07)",
                  border:       "1px solid rgba(231,76,60,.2)",
                  marginBottom: "12px",
                  fontFamily:   "var(--font-body)",
                  fontSize:     "12.5px",
                  fontWeight:   600,
                  color:        "#e05555",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "8px",
                  animation:    "sp-fade-in .2s ease both",
                }}>
                  <IconDanger glowing={false} />
                  Click again to confirm sign out.
                </div>
              )}

              {/* Logout button */}
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                onMouseEnter={() => setLogoutBtnHov(true)}
                onMouseLeave={() => setLogoutBtnHov(false)}
                style={{
                  width:          "100%",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            "8px",
                  fontFamily:     "var(--font-body)",
                  fontSize:       "13.5px",
                  fontWeight:     700,
                  color:          logoutConfirm ? "#fff" : "#e05555",
                  background:     logoutConfirm
                    ? "linear-gradient(135deg,#b03030,#e74c3c)"
                    : logoutBtnHov
                      ? "rgba(231,76,60,.16)"
                      : "rgba(231,76,60,.09)",
                  border:         `1px solid ${logoutConfirm ? "transparent" : "rgba(231,76,60,.25)"}`,
                  borderRadius:   "999px",
                  padding:        "12px 20px",
                  cursor:         logoutLoading ? "not-allowed" : "pointer",
                  letterSpacing:  ".02em",
                  transform:      logoutBtnHov && !logoutLoading ? "translateY(-1px)" : "translateY(0)",
                  transition:     "all .22s ease",
                  boxShadow:      logoutConfirm
                    ? "0 6px 20px rgba(231,76,60,.35)"
                    : logoutBtnHov
                      ? "0 4px 14px rgba(231,76,60,.18)"
                      : "none",
                }}
              >
                {logoutLoading
                  ? <><span style={{ width:13, height:13, border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"spin-slow .7s linear infinite" }}/>Signing out…</>
                  : <><IconLogOut />{logoutConfirm ? "Confirm Sign Out" : "Sign Out"}</>}
              </button>

              {/* Cancel */}
              {logoutConfirm && (
                <button
                  onClick={() => setLogoutConfirm(false)}
                  style={{
                    width:          "100%",
                    marginTop:      "8px",
                    fontFamily:     "var(--font-body)",
                    fontSize:       "12px",
                    color:          "var(--color-text)",
                    background:     "none",
                    border:         "none",
                    cursor:         "pointer",
                    textDecoration: "underline",
                    textDecorationColor: "rgba(85,96,112,.35)",
                    transition:     "color .18s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--color-dark)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--color-text)"}
                >
                  Cancel
                </button>
              )}
            </GlassCard>

          </div>
      </div>
    </>
  );
}