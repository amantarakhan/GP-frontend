import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { createUserProfile } from "../services/dbService";
import logo      from "../assets/logo.png";
import logo1     from "../assets/logo1.png";
import globeHero from "../assets/logo2.png";

const KEYFRAMES = `
  @keyframes logo-float {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-10px); }
  }
  @keyframes rotate-cw {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes rotate-ccw {
    from { transform: translateY(-50%) rotate(0deg); }
    to   { transform: translateY(-50%) rotate(-360deg); }
  }
  @keyframes aura-breathe {
    0%,100% { transform: translate(-50%,-50%) scale(1);    opacity: .10; }
    50%     { transform: translate(-50%,-50%) scale(1.10); opacity: .18; }
  }
  @keyframes btn-glow {
    0%,100% { box-shadow: 0 8px 28px rgba(63,125,88,.38), 0 0 0 0    rgba(63,125,88,0); }
    50%     { box-shadow: 0 14px 44px rgba(63,125,88,.56), 0 0 0 10px rgba(63,125,88,.06); }
  }
  @keyframes portal-in {
    from { opacity: 0; transform: translateY(28px) scale(.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
  @keyframes field-rise {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes seg-fill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes success-bloom {
    0%  { opacity: 0; transform: scale(.5) rotate(-15deg); }
    70% { transform: scale(1.12) rotate(3deg); }
    100%{ opacity: 1; transform: scale(1)  rotate(0deg); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const User = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const Mail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const Lock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const Eye = ({ show }) => show
  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const DotGrid = () => (
  <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
    <defs>
      <pattern id="su-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1.4" fill="var(--color-brand)" opacity=".4"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#su-dots)" opacity=".1"/>
  </svg>
);

const Field = ({ label, icon, type="text", value, onChange, delay="0s", suffix }) => {
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
          marginRight:"10px", marginLeft:"2px", display:"flex", alignItems:"center",
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
  );
};

const getPw = pw => {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return [
    { s, label:"Too short",  color:"#e74c3c" },
    { s, label:"Weak",       color:"#e67e22" },
    { s, label:"Fair",       color:"#e6c329" },
    { s, label:"Good",       color:"var(--color-brand)" },
    { s, label:"Strong ✦",   color:"var(--color-brand-dark)" },
  ][s];
};

const Err = ({ msg }) => msg
  ? <p style={{ fontFamily:"var(--font-body)", fontSize:".7rem", color:"#e74c3c", margin:"5px 0 0" }}>{msg}</p>
  : null;

// ── Maps Firebase error codes to friendly messages shown inside the glass card ──
const mapAuthError = code => ({
  "auth/email-already-in-use"   : "An account with this email already exists.",
  "auth/invalid-email"          : "Please enter a valid email address.",
  "auth/weak-password"          : "Password must be at least 6 characters.",
  "auth/network-request-failed" : "Network error — check your connection.",
  "auth/too-many-requests"      : "Too many attempts. Please try again later.",
  "auth/operation-not-allowed"  : "Email sign-up is not enabled. Contact support.",
}[code] ?? "Something went wrong. Please try again.");

export default function SignUp() {
  const navigate = useNavigate();
  const [name,          setName]          = useState("");
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPw,        setShowPw]        = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [done,          setDone]          = useState(false);
  const [errors,        setErrors]        = useState({});
  const [firebaseError, setFirebaseError] = useState("");
  const [scrolled,      setScrolled]      = useState(false);
  const [btnHov,        setBtnHov]        = useState(false);
  const [gBtnHov,       setGBtnHov]       = useState(false);
  const [logHov,        setLogHov]        = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const pw = getPw(password);

  const validate = () => {
    const e = {};
    if (!name.trim())                e.name     = "Full name required.";
    if (!/\S+@\S+\.\S+/.test(email)) e.email    = "Valid email required.";
    if (password.length < 8)         e.password = "Minimum 8 characters.";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setFirebaseError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(cred.user, { displayName: name });
      setDone(true);
      setTimeout(() => navigate("/dashboard"), 1700);
    } catch (err) {
      setFirebaseError(mapAuthError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setFirebaseError("");
    setGoogleLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await createUserProfile(cred.user);
      setDone(true);
      setTimeout(() => navigate("/dashboard"), 1600);
    } catch (err) {
      setFirebaseError(mapAuthError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={{ minHeight:"100vh", width:"100%", background:"var(--color-app-bg)", fontFamily:"var(--font-body)", overflowX:"hidden", display:"flex", flexDirection:"column" }}>

        {/* NAV */}
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
          <div onClick={() => navigate("/")} style={{
            position:"absolute", top:"0", left:"60px",
            height:"96px", width:"auto", zIndex:301, cursor:"pointer",
            filter:"drop-shadow(0 20px 40px rgba(63,125,88,.3))",
            animation:"logo-float 7s ease-in-out infinite",
          }}>
            <img src={logo} alt="Localyze" style={{ height:"100%", width:"auto", objectFit:"contain", display:"block" }}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <span style={{ fontFamily:"var(--font-body)", fontSize:".83rem", color:"var(--color-text)", opacity:.7 }}>Already have an account?</span>
            <button onClick={() => navigate("/login")}
              onMouseEnter={() => setLogHov(true)} onMouseLeave={() => setLogHov(false)}
              style={{
                fontFamily:"var(--font-body)", fontSize:".83rem", fontWeight:700,
                color: logHov ? "#fff" : "var(--color-brand-dark)",
                background: logHov ? "linear-gradient(135deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)" : "rgba(63,125,88,.08)",
                border:"1.5px solid rgba(63,125,88,.22)", padding:"8px 22px", borderRadius:"999px",
                cursor:"pointer", transition:"all .22s ease",
                boxShadow: logHov ? "0 4px 18px rgba(63,125,88,.32)" : "none",
              }}>Log In</button>
          </div>
        </nav>

        {/* CINEMATIC CANVAS */}
        <main style={{ flex:1, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 5% 64px", minHeight:"100vh", overflow:"hidden" }}>
          <DotGrid />

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

          {/* GLASS FORM CARD */}
          <div style={{
            position:"relative", zIndex:2, width:"100%", maxWidth:"420px",
            background:"rgba(255,255,255,.08)",
            backdropFilter:"blur(65px) saturate(180%)", WebkitBackdropFilter:"blur(65px) saturate(180%)",
            border:"1px solid rgba(63,125,88,.15)", borderRadius:"32px", padding:"52px 44px 44px",
            boxShadow:"0 48px 120px rgba(0,0,0,.1),0 12px 40px rgba(0,0,0,.07),inset 0 2px 0 rgba(255,255,255,.7),inset 0 -1px 0 rgba(63,125,88,.07)",
            animation:"portal-in .75s cubic-bezier(.34,1.28,.64,1) both",
          }}>
            {/* Header */}
            <div style={{ textAlign:"center", marginBottom:"42px" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", marginBottom:"18px" }}>
                <img src={logo1} alt="Localyze" style={{ height:"22px", width:"auto", objectFit:"contain", display:"block", filter:"drop-shadow(0 0 8px rgba(63,125,88,.3))" }}/>
                <span style={{ fontFamily:"var(--font-display)", fontSize:"1rem", fontWeight:700, color:"var(--color-brand-dark)", letterSpacing:".04em", textShadow:"0 0 12px rgba(63,125,88,.25)" }}>Network</span>
              </div>
              <h1 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2rem,4.5vw,2.4rem)", fontWeight:800, color:"var(--color-dark)", margin:"0 0 11px", letterSpacing:"-.034em", lineHeight:1.08, textShadow:"0 1px 24px rgba(255,255,255,.65)" }}>
                Create your{"\u00A0"}
                <span style={{ background:"linear-gradient(130deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", filter:"drop-shadow(0 0 12px rgba(63,125,88,.35))" }}>account.</span>
              </h1>
              <p style={{ fontFamily:"var(--font-body)", fontSize:".9rem", color:"var(--color-dark)", margin:0, lineHeight:1.65, opacity:.6, textShadow:"0 1px 8px rgba(255,255,255,.5)" }}>
                Location intelligence, ready in minutes.
              </p>
            </div>

            {done ? (
              /* SUCCESS STATE */
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"18px", padding:"8px 0 12px", animation:"success-bloom .6s cubic-bezier(.34,1.56,.64,1) both" }}>
                <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(63,125,88,.1)", border:"2.5px solid var(--color-brand)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 40px rgba(63,125,88,.35), 0 0 80px rgba(63,125,88,.12)" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontFamily:"var(--font-display)", fontSize:"1.3rem", fontWeight:800, color:"var(--color-dark)", margin:"0 0 8px", letterSpacing:"-.02em" }}>You're in.</p>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:".85rem", color:"var(--color-text)", margin:0, opacity:.7 }}>Launching your dashboard…</p>
                </div>
              </div>
            ) : (
              <>
                {/* FIREBASE ERROR BANNER */}
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

                {/* FIELDS */}
                <div style={{ display:"flex", flexDirection:"column", gap:"26px", marginBottom:"36px" }}>
                  <div>
                    <Field label="Full Name" icon={<User/>} value={name} onChange={e=>setName(e.target.value)} delay=".06s"/>
                    <Err msg={errors.name}/>
                  </div>
                  <div>
                    <Field label="Email Address" icon={<Mail/>} type="email" value={email} onChange={e=>setEmail(e.target.value)} delay=".14s"/>
                    <Err msg={errors.email}/>
                  </div>
                  <div>
                    <Field label="Password" icon={<Lock/>}
                      type={showPw ? "text" : "password"}
                      value={password} onChange={e=>setPassword(e.target.value)}
                      delay=".22s"
                      suffix={
                        <button type="button" onClick={()=>setShowPw(v=>!v)}
                          style={{ background:"none", border:"none", cursor:"pointer", padding:"0 0 0 8px", color:"var(--color-text)", opacity:.45, display:"flex", alignItems:"center", transition:"opacity .2s" }}
                          onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                          onMouseLeave={e=>e.currentTarget.style.opacity=".45"}
                        ><Eye show={showPw}/></button>
                      }
                    />
                    <Err msg={errors.password}/>
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

                {/* CTA */}
                <button onClick={submit}
                  onMouseEnter={()=>setBtnHov(true)} onMouseLeave={()=>setBtnHov(false)}
                  disabled={loading}
                  style={{
                    width:"100%", fontFamily:"var(--font-body)", fontSize:"1rem", fontWeight:700, color:"#fff",
                    background: loading ? "rgba(63,125,88,.48)" : "linear-gradient(135deg,var(--color-brand) 0%,var(--color-brand-dark) 100%)",
                    border:"none", borderRadius:"999px", padding:"16px 32px",
                    cursor: loading ? "not-allowed" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
                    animation: loading ? "none" : "btn-glow 6s ease-in-out infinite",
                    transform: btnHov&&!loading ? "translateY(-2px) scale(1.025)" : "translateY(0) scale(1)",
                    transition:"transform .26s cubic-bezier(.34,1.56,.64,1), background .2s",
                    letterSpacing:".02em", marginBottom:"26px",
                  }}>
                  {loading
                    ? <><span style={{ width:15, height:15, flexShrink:0, border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }}/>Creating your account…</>
                    : <>Create Account <Arrow/></>}
                </button>

                {/* Google sign-up */}
                <button onClick={handleGoogleSignup}
                  onMouseEnter={()=>setGBtnHov(true)} onMouseLeave={()=>setGBtnHov(false)}
                  disabled={loading || googleLoading}
                  style={{
                    width:"100%", fontFamily:"var(--font-body)", fontSize:".9rem", fontWeight:600,
                    color:"var(--color-dark)",
                    background: gBtnHov ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.12)",
                    border:"1px solid rgba(255,255,255,.35)", borderRadius:"999px", padding:"13px 32px",
                    cursor: (loading||googleLoading) ? "not-allowed" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
                    backdropFilter:"blur(8px)",
                    transform: gBtnHov&&!loading&&!googleLoading ? "translateY(-1px)" : "translateY(0)",
                    transition:"all .22s ease", marginBottom:"26px",
                    boxShadow: gBtnHov ? "0 6px 20px rgba(0,0,0,.08)" : "none",
                  }}>
                  {googleLoading
                    ? <><span style={{ width:15, height:15, flexShrink:0, border:"2px solid rgba(63,125,88,.3)", borderTop:"2px solid var(--color-brand)", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }}/>Connecting…</>
                    : <><GoogleIcon/>Sign up with Google</>}
                </button>

                <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"18px" }}>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,.22)" }}/>
                  <span style={{ fontFamily:"var(--font-body)", fontSize:".66rem", letterSpacing:".08em", color:"var(--color-text)", opacity:.35 }}>OR</span>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,.22)" }}/>
                </div>

                <p style={{ fontFamily:"var(--font-body)", fontSize:".84rem", color:"var(--color-dark)", textAlign:"center", margin:0, opacity:.75 }}>
                  Already have an account?{" "}
                  <button onClick={()=>navigate("/login")} style={{ fontFamily:"var(--font-body)", fontSize:".84rem", fontWeight:700, color:"var(--color-brand-dark)", background:"none", border:"none", padding:0, cursor:"pointer", textDecoration:"underline", textDecorationColor:"rgba(63,125,88,.3)", transition:"color .18s, text-shadow .18s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.color="var(--color-brand)"; e.currentTarget.style.textShadow="0 0 12px rgba(63,125,88,.3)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.color="var(--color-brand-dark)"; e.currentTarget.style.textShadow="none"; }}
                  >Log In</button>
                </p>
              </>
            )}
          </div>
        </main>

        <footer style={{ padding:"16px 5%", borderTop:"1px solid rgba(230,211,173,.18)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"8px" }}>
          <p style={{ fontFamily:"var(--font-body)", fontSize:".72rem", color:"var(--color-text)", margin:0, opacity:.35 }}>
            © {new Date().getFullYear()} Localyze · Graduation project · All data illustrative.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"var(--color-brand)", opacity:.55 }}/>
            <span style={{ fontFamily:"var(--font-body)", fontSize:".7rem", color:"var(--color-text)", opacity:.35 }}>Built with precision</span>
          </div>
        </footer>
      </div>
    </>
  );
}