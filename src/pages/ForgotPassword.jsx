import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useTranslation } from "react-i18next";
import logo      from "../assets/logo.png";
import logo1     from "../assets/logo1.png";
import globeHero from "../assets/logo2.png";

// ═══════════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════════
const Mail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const ArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const InboxIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
    stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// DOT GRID
// ═══════════════════════════════════════════════════════════════════════════════
const DotGrid = () => (
  <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
    <defs>
      <pattern id="fp-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1.4" fill="var(--color-brand)" opacity=".4"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#fp-dots)" opacity=".1"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// FLOATING LABEL FIELD
// ═══════════════════════════════════════════════════════════════════════════════
const Field = ({ label, icon, type="text", value, onChange, delay="0s" }) => {
  const [focus, setFocus] = useState(false);
  const up = focus || value.length > 0;
  return (
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
        borderBottom:`1.5px solid ${focus ? "var(--color-brand)" : "rgba(255,255,255,.3)"}`,
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
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// FIREBASE ERROR CODE → FRIENDLY MESSAGE
// ═══════════════════════════════════════════════════════════════════════════════
const mapAuthError = (code, t) => ({
  "auth/user-not-found"         : t("forgotPassword.errors.userNotFound"),
  "auth/invalid-email"          : t("forgotPassword.errors.invalidEmail"),
  "auth/too-many-requests"      : t("forgotPassword.errors.tooManyRequests"),
  "auth/network-request-failed" : t("forgotPassword.errors.networkError"),
  "auth/missing-email"          : t("forgotPassword.errors.missingEmail"),
}[code] ?? t("forgotPassword.errors.default"));

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email,         setEmail]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [sent,          setSent]          = useState(false);
  const [emailError,    setEmailError]    = useState("");
  const [firebaseError, setFirebaseError] = useState("");
  const [scrolled,      setScrolled]      = useState(false);
  const [btnHov,        setBtnHov]        = useState(false);
  const [backHov,       setBackHov]       = useState(false);
  const [resendHov,     setResendHov]     = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds remaining

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const validate = () => {
    if (!email.trim())               return t("forgotPassword.validation.emailRequired");
    if (!/\S+@\S+\.\S+/.test(email)) return t("forgotPassword.validation.invalidEmail");
    return "";
  };

  // ── Core Firebase action ───────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    const err = validate();
    if (err) { setEmailError(err); return; }
    setEmailError("");
    setFirebaseError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      setResendCooldown(60); // 60-second cooldown before resend
    } catch (err) {
      setFirebaseError(mapAuthError(err.code, t));
    } finally {
      setLoading(false);
    }
  };

  // Allow resend after cooldown
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setFirebaseError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResendCooldown(60);
    } catch (err) {
      setFirebaseError(mapAuthError(err.code, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{
        minHeight:"100vh", width:"100%",
        background:"var(--color-app-bg)",
        fontFamily:"var(--font-body)",
        overflowX:"hidden",
        display:"flex", flexDirection:"column",
      }}>

        {/* ════════════════════════════════════════
            NAV
        ════════════════════════════════════════ */}
        <nav style={{
          position:"fixed", top:0, left:0, right:0, zIndex:200,
          height:"66px", padding:"0 5%",
          display:"flex", alignItems:"center", justifyContent:"flex-end",
          background: scrolled ? "rgba(252,252,253,.9)" : "rgba(252,252,253,.65)",
          backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
          borderBottom:`1px solid ${scrolled ? "rgba(230,211,173,.55)" : "rgba(230,211,173,.2)"}`,
          boxShadow: scrolled ? "0 4px 28px rgba(0,0,0,.07)" : "none",
          transition:"all .3s ease", overflow:"visible",
        }}>
          {/* Floating seal */}
          <div onClick={() => navigate("/")} style={{
            position:"absolute", top:"0", left:"60px",
            height:"96px", width:"auto", zIndex:301, cursor:"pointer",
            filter:"drop-shadow(0 20px 40px rgba(63,125,88,.3))",
            animation:"logo-float 7s ease-in-out infinite",
          }}>
            <img src={logo} alt="Localyze"
              style={{ height:"100%", width:"auto", objectFit:"contain", display:"block" }}/>
          </div>

          {/* Back to login pill */}
          <button
            onClick={() => navigate("/login")}
            onMouseEnter={() => setBackHov(true)}
            onMouseLeave={() => setBackHov(false)}
            style={{
              display:"flex", alignItems:"center", gap:"7px",
              fontFamily:"var(--font-body)", fontSize:".83rem", fontWeight:700,
              color: backHov ? "#fff" : "var(--color-brand-dark)",
              background: backHov
                ? "linear-gradient(135deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)"
                : "rgba(63,125,88,.08)",
              border:"1.5px solid rgba(63,125,88,.22)",
              padding:"8px 20px 8px 16px", borderRadius:"999px",
              cursor:"pointer", transition:"all .22s ease",
              boxShadow: backHov ? "0 4px 18px rgba(63,125,88,.32)" : "none",
            }}
          >
            <ArrowLeft/> {t("forgotPassword.backToLogin")}
          </button>
        </nav>

        {/* ════════════════════════════════════════
            CINEMATIC CANVAS — identical to Login/Signup
        ════════════════════════════════════════ */}
        <main style={{
          flex:1, position:"relative",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"100px 5% 64px", minHeight:"100vh", overflow:"hidden",
        }}>
          <DotGrid />

          {/* Ambient blooms */}
          <div style={{ position:"absolute", top:"-18%", left:"-12%", width:"800px", height:"800px", pointerEvents:"none", zIndex:0, background:"radial-gradient(ellipse at center,rgba(63,125,88,.09) 0%,transparent 65%)" }}/>
          <div style={{ position:"absolute", bottom:"-14%", right:"-10%", width:"700px", height:"700px", pointerEvents:"none", zIndex:0, background:"radial-gradient(ellipse at center,rgba(230,211,173,.13) 0%,transparent 65%)" }}/>

          {/* Upper-left satellite */}
          <img src={globeHero} alt="" aria-hidden="true" style={{
            position:"absolute", left:"0px", top:"2%", width:"340px", height:"auto",
            objectFit:"contain", pointerEvents:"none", userSelect:"none", zIndex:0, opacity:0.08,
            filter:"blur(2px) brightness(0.5) contrast(1.3) saturate(1.2) drop-shadow(0 0 30px rgba(63,125,88,.4))",
            animation:"rotate-ccw 20s linear infinite", animationDelay:"-5s",
          }}/>

          {/* Lower-right satellite with orbital arc */}
          <div style={{ position:"absolute", right:"-180px", bottom:"-180px", width:"340px", height:"340px", pointerEvents:"none", userSelect:"none", zIndex:0 }}>
            <svg width="340" height="340" viewBox="0 0 340 340" style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
              <circle cx="170" cy="170" r="162" fill="none" stroke="rgba(63,125,88,0.2)" strokeWidth="1" strokeDasharray="320 700" strokeDashoffset="0" strokeLinecap="round"/>
              <circle cx="170" cy="170" r="162" fill="none" stroke="rgba(63,125,88,0.08)" strokeWidth="0.5"/>
            </svg>
            <img src={globeHero} alt="" aria-hidden="true" style={{
              position:"absolute", inset:0, width:"340px", height:"auto", objectFit:"contain", opacity:0.08,
              filter:"blur(3px) brightness(0.5) contrast(1.3) saturate(1.2) drop-shadow(0 0 30px rgba(63,125,88,.4))",
              animation:"rotate-ccw 20s linear infinite", animationDelay:"-12s",
            }}/>
          </div>

          {/* Aura ring */}
          <div style={{ position:"absolute", top:"50%", left:"50%", width:"1100px", height:"1100px", borderRadius:"50%", background:"radial-gradient(circle,rgba(63,125,88,.12) 0%,rgba(63,125,88,.04) 45%,transparent 70%)", pointerEvents:"none", zIndex:0, animation:"aura-breathe 6s ease-in-out infinite" }}/>

          {/* Center globe */}
          <img src={globeHero} alt="" aria-hidden="true" style={{
            position:"absolute", top:"50%", left:"50%", width:"900px", height:"auto",
            objectFit:"contain", pointerEvents:"none", userSelect:"none", zIndex:0, opacity:0.25,
            filter:"brightness(0.6) contrast(1.2) saturate(1.4) drop-shadow(0 0 40px rgba(63,125,88,.6)) drop-shadow(0 0 100px rgba(63,125,88,.3))",
            animation:"rotate-cw 30s linear infinite",
          }}/>

          {/* Left satellite */}
          <img src={globeHero} alt="" aria-hidden="true" style={{
            position:"absolute", left:"10%", top:"50%", width:"300px", height:"auto",
            objectFit:"contain", pointerEvents:"none", userSelect:"none", zIndex:0, opacity:0.08,
            filter:"blur(2px) brightness(0.5) contrast(1.3) saturate(1.2) drop-shadow(0 0 30px rgba(63,125,88,.4))",
            animation:"rotate-ccw 20s linear infinite",
          }}/>

          {/* Right satellite */}
          <img src={globeHero} alt="" aria-hidden="true" style={{
            position:"absolute", right:"12%", top:"38%", width:"250px", height:"auto",
            objectFit:"contain", pointerEvents:"none", userSelect:"none", zIndex:0, opacity:0.08,
            filter:"blur(3px) brightness(0.5) contrast(1.3) saturate(1.2) drop-shadow(0 0 30px rgba(63,125,88,.4))",
            animation:"rotate-ccw 20s linear infinite", animationDelay:"-10s",
          }}/>

          {/* ════════════════════════════════════════
              FADED GLASS CARD
          ════════════════════════════════════════ */}
          <div style={{
            position:"relative", zIndex:2,
            width:"100%", maxWidth:"420px",
            background:"rgba(255,255,255,.08)",
            backdropFilter:"blur(65px) saturate(180%)",
            WebkitBackdropFilter:"blur(65px) saturate(180%)",
            border:"1px solid rgba(63,125,88,.15)",
            borderRadius:"32px",
            padding:"52px 44px 44px",
            boxShadow:
              "0 48px 120px rgba(0,0,0,.1)," +
              "0 12px 40px rgba(0,0,0,.07)," +
              "inset 0 2px 0 rgba(255,255,255,.7)," +
              "inset 0 -1px 0 rgba(63,125,88,.07)",
            animation:"portal-in .75s cubic-bezier(.34,1.28,.64,1) both",
          }}>

            {/* ── HEADER ── */}
            <div style={{ textAlign:"center", marginBottom: sent ? "36px" : "42px" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", marginBottom:"18px" }}>
                <img src={logo1} alt="Localyze" style={{
                  height:"22px", width:"auto", objectFit:"contain", display:"block",
                  filter:"drop-shadow(0 0 8px rgba(63,125,88,.3))",
                }}/>
                <span style={{
                  fontFamily:"var(--font-display)", fontSize:"1rem", fontWeight:700,
                  color:"var(--color-brand-dark)", letterSpacing:".04em",
                  textShadow:"0 0 12px rgba(63,125,88,.25)",
                }}>{t("common.network")}</span>
              </div>

              <h1 style={{
                fontFamily:"var(--font-display)",
                fontSize:"clamp(1.75rem,4vw,2.2rem)",
                fontWeight:800, color:"var(--color-dark)",
                margin:"0 0 11px", letterSpacing:"-.034em", lineHeight:1.08,
                textShadow:"0 1px 24px rgba(255,255,255,.65)",
              }}>
                {sent ? t("forgotPassword.checkYour") + " " : t("forgotPassword.resetYour") + " "}
                <span style={{
                  background:"linear-gradient(130deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  backgroundClip:"text",
                  filter:"drop-shadow(0 0 12px rgba(63,125,88,.35))",
                }}>{sent ? t("forgotPassword.inbox") : t("forgotPassword.password")}</span>
              </h1>
              <p style={{
                fontFamily:"var(--font-body)", fontSize:".9rem",
                color:"var(--color-dark)", margin:0, lineHeight:1.65, opacity:.6,
                textShadow:"0 1px 8px rgba(255,255,255,.5)",
              }}>
                {sent
                  ? t("forgotPassword.sentTo", { email })
                  : t("forgotPassword.enterEmail")
                }
              </p>
            </div>

            {/* ════════════ SENT STATE — success-bloom ════════════ */}
            {sent ? (
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:"24px",
                padding:"4px 0 8px",
                animation:"success-bloom .65s cubic-bezier(.34,1.56,.64,1) both",
              }}>
                {/* Inbox icon with emerald-glow pulse */}
                <div style={{
                  width:80, height:80, borderRadius:"50%",
                  background:"rgba(63,125,88,.1)",
                  border:"2px solid rgba(63,125,88,.35)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  animation:"emerald-glow 3s ease-in-out infinite",
                }}>
                  <InboxIcon />
                </div>

                <div style={{ textAlign:"center" }}>
                  <p style={{
                    fontFamily:"var(--font-display)", fontSize:"1.1rem",
                    fontWeight:800, color:"var(--color-dark)",
                    margin:"0 0 6px", letterSpacing:"-.02em",
                  }}>{t("forgotPassword.checkInbox")}</p>
                  <p style={{
                    fontFamily:"var(--font-body)", fontSize:".82rem",
                    color:"var(--color-text)", margin:0, opacity:.65, lineHeight:1.6,
                  }}>
                    {t("forgotPassword.didntReceive")}<br/>{t("forgotPassword.orResend")}
                  </p>
                </div>

                {/* Firebase error (e.g. resend fails) */}
                {firebaseError && (
                  <div style={{
                    width:"100%", padding:"11px 16px", borderRadius:"12px",
                    background:"rgba(231,76,60,.08)", border:"1px solid rgba(231,76,60,.2)",
                    animation:"field-rise .3s ease both",
                  }}>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:".78rem", fontWeight:600, color:"#e74c3c", margin:0, textAlign:"center" }}>
                      {firebaseError}
                    </p>
                  </div>
                )}

                {/* Resend button with cooldown */}
                <button
                  onClick={handleResend}
                  onMouseEnter={() => setResendHov(true)}
                  onMouseLeave={() => setResendHov(false)}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    width:"100%",
                    fontFamily:"var(--font-body)", fontSize:".9rem", fontWeight:700,
                    color: resendCooldown > 0 ? "var(--color-text)" : resendHov ? "#fff" : "var(--color-brand-dark)",
                    background: resendCooldown > 0
                      ? "rgba(255,255,255,.06)"
                      : resendHov
                        ? "linear-gradient(135deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)"
                        : "rgba(63,125,88,.1)",
                    border:`1.5px solid ${resendCooldown > 0 ? "rgba(255,255,255,.15)" : "rgba(63,125,88,.25)"}`,
                    borderRadius:"999px", padding:"13px 32px",
                    cursor: resendCooldown > 0 || loading ? "not-allowed" : "pointer",
                    transition:"all .22s ease",
                    opacity: resendCooldown > 0 ? .5 : 1,
                    boxShadow: resendHov && resendCooldown === 0 ? "0 4px 18px rgba(63,125,88,.32)" : "none",
                  }}
                >
                  {loading
                    ? t("forgotPassword.sending")
                    : resendCooldown > 0
                      ? t("forgotPassword.resendIn", { seconds: resendCooldown })
                      : t("forgotPassword.resendLink")
                  }
                </button>

                {/* Back to login */}
                <button onClick={() => navigate("/login")} style={{
                  fontFamily:"var(--font-body)", fontSize:".82rem",
                  fontWeight:600, color:"var(--color-brand-dark)",
                  background:"none", border:"none", padding:0, cursor:"pointer",
                  opacity:.7, textDecoration:"underline",
                  textDecorationColor:"rgba(63,125,88,.25)",
                  transition:"opacity .18s, color .18s",
                  display:"flex", alignItems:"center", gap:"5px",
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.color="var(--color-brand)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.opacity=".7"; e.currentTarget.style.color="var(--color-brand-dark)"; }}
                >
                  <ArrowLeft/> {t("forgotPassword.backToLogin")}
                </button>
              </div>

            ) : (
              /* ════════════ INPUT STATE ════════════ */
              <>
                {/* Firebase error banner */}
                {firebaseError && (
                  <div style={{
                    marginBottom:"20px", padding:"12px 16px", borderRadius:"12px",
                    background:"rgba(231,76,60,.08)", border:"1px solid rgba(231,76,60,.2)",
                    animation:"field-rise .3s ease both",
                  }}>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:".8rem", fontWeight:600, color:"#e74c3c", margin:0, textAlign:"center", textShadow:"0 0 12px rgba(231,76,60,.2)" }}>
                      {firebaseError}
                    </p>
                  </div>
                )}

                {/* Email field */}
                <div style={{ marginBottom:"32px" }}>
                  <Field
                    label={t("forgotPassword.emailLabel")} icon={<Mail/>} type="email"
                    value={email} onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                    delay=".08s"
                  />
                  {emailError && (
                    <p style={{ fontFamily:"var(--font-body)", fontSize:".7rem", color:"#e74c3c", margin:"5px 0 0" }}>
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Send reset link CTA */}
                <button
                  onClick={handleForgotPassword}
                  onMouseEnter={() => setBtnHov(true)}
                  onMouseLeave={() => setBtnHov(false)}
                  disabled={loading}
                  style={{
                    width:"100%",
                    fontFamily:"var(--font-body)", fontSize:"1rem", fontWeight:700, color:"#fff",
                    background: loading
                      ? "rgba(63,125,88,.48)"
                      : "linear-gradient(135deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)",
                    border:"none", borderRadius:"999px",
                    padding:"16px 32px",
                    cursor: loading ? "not-allowed" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
                    animation: loading ? "none" : "btn-glow 6s ease-in-out infinite",
                    transform: btnHov&&!loading ? "translateY(-2px) scale(1.025)" : "translateY(0) scale(1)",
                    transition:"transform .26s cubic-bezier(.34,1.56,.64,1), background .2s",
                    letterSpacing:".02em", marginBottom:"26px",
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width:15, height:15, flexShrink:0,
                        border:"2px solid rgba(255,255,255,.3)",
                        borderTop:"2px solid #fff",
                        borderRadius:"50%", display:"inline-block",
                        animation:"spin .7s linear infinite",
                      }}/>
                      {t("forgotPassword.sendingLink")}
                    </>
                  ) : <>{t("forgotPassword.sendResetLink")} <ArrowRight/></>}
                </button>

                {/* Divider */}
                <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"18px" }}>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,.22)" }}/>
                  <span style={{ fontFamily:"var(--font-body)", fontSize:".66rem", letterSpacing:".08em", color:"var(--color-text)", opacity:.35 }}>{t("common.or")}</span>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,.22)" }}/>
                </div>

                {/* Footer links */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <button onClick={() => navigate("/login")} style={{
                    fontFamily:"var(--font-body)", fontSize:".82rem", fontWeight:600,
                    color:"var(--color-brand-dark)", background:"none", border:"none",
                    padding:0, cursor:"pointer", opacity:.7,
                    textDecoration:"underline", textDecorationColor:"rgba(63,125,88,.25)",
                    transition:"opacity .18s, color .18s",
                    display:"flex", alignItems:"center", gap:"5px",
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.color="var(--color-brand)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.opacity=".7"; e.currentTarget.style.color="var(--color-brand-dark)"; }}
                  >
                    <ArrowLeft/> {t("signup.logIn")}
                  </button>
                  <button onClick={() => navigate("/signup")} style={{
                    fontFamily:"var(--font-body)", fontSize:".82rem", fontWeight:600,
                    color:"var(--color-brand-dark)", background:"none", border:"none",
                    padding:0, cursor:"pointer", opacity:.7,
                    textDecoration:"underline", textDecorationColor:"rgba(63,125,88,.25)",
                    transition:"opacity .18s, color .18s",
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.color="var(--color-brand)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.opacity=".7"; e.currentTarget.style.color="var(--color-brand-dark)"; }}
                  >
                    {t("forgotPassword.createAccount")}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>

        <footer style={{
          padding:"16px 5%",
          borderTop:"1px solid rgba(230,211,173,.18)",
          display:"flex", alignItems:"center",
          justifyContent:"space-between", flexWrap:"wrap", gap:"8px",
        }}>
          <p style={{ fontFamily:"var(--font-body)", fontSize:".72rem", color:"var(--color-text)", margin:0, opacity:.35 }}>
            {t("common.footer", { year: new Date().getFullYear() })}
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"var(--color-brand)", opacity:.55 }}/>
            <span style={{ fontFamily:"var(--font-body)", fontSize:".7rem", color:"var(--color-text)", opacity:.35 }}>
              {t("common.builtWith")}
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}