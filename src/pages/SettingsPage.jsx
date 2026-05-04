import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from "firebase/auth";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import {
  getUserProfile,
  updateUserProfile,
  getUserReports,
  deleteReport as firestoreDeleteReport,
} from "../services/dbService";

/* ── Toggle ───────────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: "44px", height: "24px", borderRadius: "12px",
        background: checked ? "var(--color-brand)" : "rgba(104,114,128,.2)",
        position: "relative", cursor: "pointer", flexShrink: 0,
        transition: "background .2s",
      }}
    >
      <div style={{
        position: "absolute", top: "3px", left: checked ? "22px" : "3px",
        width: "18px", height: "18px", borderRadius: "50%",
        background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.2)",
        transition: "left .2s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

/* ── Password input with show/hide ────────────────────────────────────────── */
function PwInput({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        placeholder={label}
        value={value}
        onChange={onChange}
        style={{
          fontFamily: "var(--font-body)", fontSize: "13.5px",
          padding: "11px 42px 11px 14px", borderRadius: "10px",
          border: "1.5px solid rgba(230,211,173,.7)",
          background: "var(--color-app-bg)", color: "var(--color-dark)",
          outline: "none", width: "100%", boxSizing: "border-box",
          transition: "border-color .18s, box-shadow .18s",
        }}
        onFocus={e => { e.target.style.borderColor = "var(--color-brand)"; e.target.style.boxShadow = "0 0 0 3px rgba(63,125,88,.1)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(230,211,173,.7)"; e.target.style.boxShadow = "none"; }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", padding: 0,
          color: "var(--color-text)", display: "flex", alignItems: "center",
        }}
      >
        {show
          ? <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  );
}

/* ── Editable field ───────────────────────────────────────────────────────── */
function EditableField({ value, placeholder, type = "text", onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? "");
  const inputRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => { setVal(value ?? ""); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const handleSave = async () => { await onSave(val); setEditing(false); };

  if (!editing) return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: val ? "var(--color-dark)" : "var(--color-text)" }}>
        {val || placeholder}
      </span>
      <button
        onClick={() => setEditing(true)}
        style={{
          fontFamily: "var(--font-body)", fontSize: "11.5px", fontWeight: 600,
          color: "var(--color-brand)", background: "rgba(63,125,88,.08)",
          border: "1px solid rgba(63,125,88,.18)", borderRadius: "7px",
          padding: "5px 13px", cursor: "pointer",
        }}
      >
        {t("common.edit")}
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <input
        ref={inputRef} type={type} value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
        style={{
          fontFamily: "var(--font-body)", fontSize: "13.5px", padding: "9px 13px",
          borderRadius: "9px", border: "1.5px solid var(--color-brand)",
          background: "var(--color-app-bg)", color: "var(--color-dark)",
          outline: "none", width: "220px", boxSizing: "border-box",
          boxShadow: "0 0 0 3px rgba(63,125,88,.1)",
        }}
      />
      <button
        onClick={handleSave} disabled={saving}
        style={{
          fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700,
          color: "#fff", background: "var(--color-brand)",
          border: "none", borderRadius: "8px", padding: "9px 15px", cursor: "pointer",
        }}
      >
        {saving ? "…" : t("common.save")}
      </button>
      <button
        onClick={() => { setEditing(false); setVal(value ?? ""); }}
        style={{
          fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)",
          background: "transparent", border: "1px solid rgba(230,211,173,.7)",
          borderRadius: "8px", padding: "9px 13px", cursor: "pointer",
        }}
      >
        {t("common.cancel")}
      </button>
    </div>
  );
}

/* ── Field row ────────────────────────────────────────────────────────────── */
function Row({ label, hint, children, noBorder }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "24px", padding: "20px 0",
      borderBottom: noBorder ? "none" : "1px solid rgba(230,211,173,.35)",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 600, color: "var(--color-dark)", marginBottom: "2px" }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)", lineHeight: 1.5 }}>
            {hint}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* MAIN PAGE                                                                  */
/* ══════════════════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const navigate = useNavigate();
  const user     = auth.currentUser;
  const { t, i18n: i18nInstance } = useTranslation();
  const currentLang = (i18nInstance.language || "en").split("-")[0];

  const [activeTab, setActiveTab] = useState("profile");

  // ── Profile ──────────────────────────────────────────────────────────────
  const [displayName,   setDisplayName]   = useState(user?.displayName ?? "");
  const [email,         setEmail]         = useState(user?.email ?? "");
  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL ?? "");
  const [saving,        setSaving]        = useState(false);
  const [saveMsg,       setSaveMsg]       = useState(null);
  const fileInputRef = useRef(null);

  // ── Security ─────────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError,   setPwError]   = useState(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving,  setPwSaving]  = useState(false);

  // ── Notifications ────────────────────────────────────────────────────────
  const [notifScanComplete, setNotifScanComplete] = useState(() =>
    JSON.parse(localStorage.getItem("notif_scan_complete") ?? "true")
  );
  const [notifReportSaved, setNotifReportSaved] = useState(() =>
    JSON.parse(localStorage.getItem("notif_report_saved") ?? "true")
  );

  // ── Data ─────────────────────────────────────────────────────────────────
  const [reportCount,  setReportCount]  = useState(0);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearDone,    setClearDone]    = useState(false);

  useEffect(() => {
    if (user?.uid) {
      getUserReports(user.uid).then(r => setReportCount(r.length)).catch(() => {});
      getUserProfile(user.uid).then(profile => {
        if (profile) {
          if (profile.displayName) setDisplayName(profile.displayName);
          if (profile.email)       setEmail(profile.email);
        }
      });
    }
  }, []);

  useEffect(() => { localStorage.setItem("notif_scan_complete", JSON.stringify(notifScanComplete)); }, [notifScanComplete]);
  useEffect(() => { localStorage.setItem("notif_report_saved",  JSON.stringify(notifReportSaved));  }, [notifReportSaved]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const showSaveMsg = (msg, isError = false) => {
    setSaveMsg({ msg, isError });
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveName = async (val) => {
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: val });
      await updateUserProfile(auth.currentUser.uid, { displayName: val });
      setDisplayName(val);
      showSaveMsg(t("settings.displayNameUpdated"));
    } catch (e) { showSaveMsg(e.message, true); }
    finally { setSaving(false); }
  };

  const handleSaveEmail = async (val) => {
    setSaving(true);
    try {
      await updateEmail(auth.currentUser, val);
      await updateUserProfile(auth.currentUser.uid, { email: val });
      setEmail(val);
      showSaveMsg(t("settings.emailUpdated"));
    } catch (e) { showSaveMsg(e.message, true); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    setPwError(null);
    if (newPw !== confirmPw) { setPwError(t("settings.passwordsNoMatch")); return; }
    if (newPw.length < 6)    { setPwError(t("settings.passwordMinLength")); return; }
    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPw);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPw);
      setPwSuccess(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (e) {
      setPwError(e.code === "auth/wrong-password" ? t("settings.wrongPassword") : e.message);
    } finally { setPwSaving(false); }
  };

  const handleClearReports = async () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    try {
      if (user?.uid) {
        const reports = await getUserReports(user.uid);
        await Promise.all(reports.map(r => firestoreDeleteReport(user.uid, r.id)));
      }
    } catch { /* best-effort */ }
    setReportCount(0);
    setClearConfirm(false);
    setClearDone(true);
    setTimeout(() => setClearDone(false), 3000);
  };

  const handleExportData = async () => {
    let reports = [];
    try { if (user?.uid) reports = await getUserReports(user.uid); } catch { /* fall through */ }
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "localyze_reports.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => { await signOut(auth); navigate("/login"); };

  const switchLanguage = (lng) => {
    i18n.changeLanguage(lng);
    if (user?.uid) updateUserProfile(user.uid, { preferredLanguage: lng }).catch(() => {});
  };

  const initials = (displayName || email || "A").charAt(0).toUpperCase();

  const TABS = [
    { id: "profile",       label: t("settings.profile") },
    { id: "security",      label: t("settings.changePassword") },
    { id: "notifications", label: t("settings.notifications") },
    { id: "language",      label: t("settings.language") },
    { id: "data",          label: t("settings.dataPrivacy") },
  ];

  const canChangePw = currentPw && newPw && confirmPw;

  return (
    <div style={{ padding: "36px 40px", maxWidth: "800px", margin: "0 auto" }}>

      {/* ── Toast ── */}
      {saveMsg && (
        <div style={{
          position: "fixed", top: "20px", right: "28px", zIndex: 999,
          padding: "12px 20px", borderRadius: "var(--radius-md)",
          background: saveMsg.isError ? "#fee2e2" : "var(--color-success)",
          border: `1px solid ${saveMsg.isError ? "rgba(220,38,38,.2)" : "rgba(63,125,88,.2)"}`,
          color: saveMsg.isError ? "#991b1b" : "var(--color-brand)",
          fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600,
          boxShadow: "var(--shadow-md)", animation: "aiFadeIn .3s ease both",
        }}>
          {saveMsg.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="fade-in" style={{ marginBottom: "32px" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 600, color: "var(--color-brand)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "6px" }}>
          {t("settings.preferences")}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 700, color: "var(--color-dark)", letterSpacing: "-0.5px", marginBottom: "6px" }}>
          {t("settings.title")}
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--color-text)" }}>
          {t("settings.subtitle")}
        </p>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(230,211,173,.5)", marginBottom: "28px", overflowX: "auto" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px 13px",
              border: "none",
              borderBottom: `2.5px solid ${activeTab === tab.id ? "var(--color-brand)" : "transparent"}`,
              background: "none",
              color: activeTab === tab.id ? "var(--color-brand)" : "var(--color-text)",
              fontFamily: "var(--font-body)",
              fontSize: "13.5px",
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: "pointer",
              marginBottom: "-1px",
              transition: "color .18s, border-color .18s",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content card ── */}
      <div
        className="fade-in"
        style={{
          background: "var(--color-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid rgba(230,211,173,.6)",
          overflow: "hidden",
          boxShadow: "0 2px 20px rgba(0,0,0,.04)",
        }}
      >

        {/* ━━━ PROFILE ━━━ */}
        {activeTab === "profile" && (
          <div style={{ padding: "36px 40px" }}>
            {/* Avatar + identity row */}
            <div style={{
              display: "flex", alignItems: "center", gap: "28px",
              paddingBottom: "32px", marginBottom: "8px",
              borderBottom: "1px solid rgba(230,211,173,.35)",
            }}>
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: "88px", height: "88px", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", boxShadow: "0 8px 28px rgba(63,125,88,.28)",
                }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontFamily: "var(--font-display)", fontSize: "34px", fontWeight: 700, color: "var(--color-accent)" }}>{initials}</span>
                  }
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: "absolute", bottom: "2px", right: "2px",
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "var(--color-card)", border: "2px solid var(--color-brand)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.15)",
                  }}
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2.5}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
              </div>

              {/* Name + email */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "4px" }}>
                  {displayName || t("settings.noNameSet")}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "13.5px", color: "var(--color-text)", marginBottom: "16px" }}>
                  {email}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600,
                    color: "var(--color-brand)", background: "rgba(63,125,88,.08)",
                    border: "1px solid rgba(63,125,88,.2)", borderRadius: "8px",
                    padding: "7px 16px", cursor: "pointer",
                  }}
                >
                  {t("settings.changePhoto")}
                </button>
              </div>
            </div>

            {/* Editable fields */}
            <Row label={t("settings.displayName")} hint={t("settings.displayNameHint")}>
              <EditableField value={displayName} placeholder={t("settings.enterName")} onSave={handleSaveName} saving={saving} />
            </Row>
            <Row label={t("settings.emailAddress")} hint={t("settings.emailHint")} noBorder>
              <EditableField value={email} placeholder={t("settings.enterEmail")} type="email" onSave={handleSaveEmail} saving={saving} />
            </Row>
          </div>
        )}

        {/* ━━━ SECURITY ━━━ */}
        {activeTab === "security" && (
          <div style={{ padding: "36px 40px" }}>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "5px" }}>
                {t("settings.changePassword")}
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", margin: 0, lineHeight: 1.6 }}>
                {t("settings.passwordMinLength")}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "380px" }}>
              <PwInput label={t("settings.currentPassword")} value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
              <PwInput label={t("settings.newPassword")}     value={newPw}     onChange={e => setNewPw(e.target.value)} />
              <PwInput label={t("settings.confirmPassword")} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />

              {pwError && (
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12.5px", color: "#dc2626", padding: "10px 14px", background: "#fee2e2", borderRadius: "9px" }}>
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12.5px", color: "var(--color-brand)", padding: "10px 14px", background: "var(--color-success)", borderRadius: "9px" }}>
                  {t("settings.passwordUpdated")}
                </div>
              )}

              <button
                onClick={handleChangePassword}
                disabled={pwSaving || !canChangePw}
                style={{
                  alignSelf: "flex-start", marginTop: "6px",
                  fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 700,
                  color: "#fff",
                  background: !canChangePw
                    ? "rgba(104,114,128,.28)"
                    : "linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))",
                  border: "none", borderRadius: "var(--radius-md)",
                  padding: "12px 24px",
                  cursor: !canChangePw ? "default" : "pointer",
                  transition: "all .2s",
                  boxShadow: !canChangePw ? "none" : "0 4px 14px rgba(63,125,88,.3)",
                }}
              >
                {pwSaving ? t("settings.updating") : t("settings.updatePassword")}
              </button>
            </div>
          </div>
        )}

        {/* ━━━ NOTIFICATIONS ━━━ */}
        {activeTab === "notifications" && (
          <div style={{ padding: "36px 40px" }}>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "5px" }}>
                {t("settings.notifications")}
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", margin: 0, lineHeight: 1.6 }}>
                Choose which in-app notifications you receive.
              </p>
            </div>
            <Row label={t("settings.scanComplete")} hint={t("settings.scanCompleteHint")}>
              <Toggle checked={notifScanComplete} onChange={setNotifScanComplete} />
            </Row>
            <Row label={t("settings.reportSaved")} hint={t("settings.reportSavedHint")} noBorder>
              <Toggle checked={notifReportSaved} onChange={setNotifReportSaved} />
            </Row>
          </div>
        )}

        {/* ━━━ LANGUAGE ━━━ */}
        {activeTab === "language" && (
          <div style={{ padding: "36px 40px" }}>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "5px" }}>
                {t("settings.language")}
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", margin: 0, lineHeight: 1.6 }}>
                {t("settings.languageHint")}
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { value: "en", label: "English",  native: "English",  flag: "🇺🇸" },
                { value: "ar", label: "Arabic",   native: "العربية",  flag: "🇯🇴" },
              ].map(lng => {
                const active = currentLang === lng.value;
                return (
                  <button
                    key={lng.value}
                    onClick={() => switchLanguage(lng.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: "16px",
                      padding: "20px 26px", borderRadius: "14px", width: "230px",
                      border: `2px solid ${active ? "var(--color-brand)" : "rgba(230,211,173,.6)"}`,
                      background: active ? "rgba(63,125,88,.06)" : "transparent",
                      cursor: "pointer", transition: "all .2s", position: "relative",
                      textAlign: "left",
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = "rgba(63,125,88,.35)"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = "rgba(230,211,173,.6)"; }}
                  >
                    <span style={{ fontSize: "32px", lineHeight: 1, flexShrink: 0 }}>{lng.flag}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700, color: active ? "var(--color-brand)" : "var(--color-dark)", marginBottom: "3px" }}>
                        {lng.label}
                      </div>
                      <div style={{ fontFamily: lng.value === "ar" ? "'Noto Sans Arabic', var(--font-body)" : "var(--font-body)", fontSize: "12.5px", color: "var(--color-text)" }}>
                        {lng.native}
                      </div>
                    </div>
                    {active && (
                      <div style={{
                        position: "absolute", top: "12px", right: "12px",
                        width: "22px", height: "22px", borderRadius: "50%",
                        background: "var(--color-brand)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ━━━ DATA & PRIVACY ━━━ */}
        {activeTab === "data" && (
          <div style={{ padding: "36px 40px" }}>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "5px" }}>
                {t("settings.dataPrivacy")}
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", margin: 0, lineHeight: 1.6 }}>
                Manage your saved reports and export your data.
              </p>
            </div>

            {/* Report count stat card */}
            <div style={{
              display: "flex", alignItems: "center", gap: "20px",
              padding: "22px 26px", borderRadius: "14px", marginBottom: "28px",
              background: "linear-gradient(135deg, rgba(63,125,88,.07) 0%, rgba(63,125,88,.02) 100%)",
              border: "1px solid rgba(63,125,88,.15)",
            }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px", flexShrink: 0,
                background: "rgba(63,125,88,.12)", border: "1px solid rgba(63,125,88,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={1.8} strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700, color: "var(--color-dark)", lineHeight: 1 }}>
                  {reportCount}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12.5px", color: "var(--color-text)", marginTop: "5px" }}>
                  {t("settings.savedReportsLabel")}
                </div>
              </div>
              <button
                onClick={handleExportData}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  fontFamily: "var(--font-body)", fontSize: "12.5px", fontWeight: 700,
                  color: "var(--color-brand)", background: "rgba(63,125,88,.1)",
                  border: "1px solid rgba(63,125,88,.25)", borderRadius: "10px",
                  padding: "10px 18px", cursor: "pointer", flexShrink: 0,
                  transition: "all .18s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(63,125,88,.18)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(63,125,88,.1)"}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {t("settings.exportJson")}
              </button>
            </div>

            {/* Clear reports row */}
            <Row label={t("settings.clearAllReports")} hint={t("settings.clearHint")} noBorder>
              {clearDone ? (
                <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-brand)", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="20,6 9,17 4,12"/></svg>
                  {t("settings.cleared")}
                </span>
              ) : (
                <button
                  onClick={handleClearReports}
                  style={{
                    fontFamily: "var(--font-body)", fontSize: "12.5px", fontWeight: 600,
                    color: clearConfirm ? "#fff" : "#dc2626",
                    background: clearConfirm ? "#dc2626" : "rgba(220,38,38,.07)",
                    border: `1.5px solid ${clearConfirm ? "#dc2626" : "rgba(220,38,38,.25)"}`,
                    borderRadius: "9px", padding: "9px 18px",
                    cursor: "pointer", transition: "all .2s",
                  }}
                >
                  {clearConfirm ? t("settings.confirmDelete") : t("settings.clearReports")}
                </button>
              )}
            </Row>
          </div>
        )}
      </div>

      {/* ── Sign out ── */}
      <div style={{ marginTop: "24px", paddingBottom: "32px" }}>
        <button
          onClick={handleSignOut}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600,
            color: "#dc2626", background: "transparent",
            border: "1.5px solid rgba(220,38,38,.25)", borderRadius: "var(--radius-md)",
            padding: "10px 22px", cursor: "pointer", transition: "all .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {t("settings.signOut")}
        </button>
      </div>
    </div>
  );
}
