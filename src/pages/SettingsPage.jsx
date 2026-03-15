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
import { apiService } from "../services/apiService";

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width:        "42px",
        height:       "24px",
        borderRadius: "12px",
        background:   checked ? "var(--color-brand)" : "rgba(104,114,128,.25)",
        position:     "relative",
        cursor:       "pointer",
        flexShrink:   0,
        transition:   "background .2s",
        border:       checked ? "1px solid var(--color-brand)" : "1px solid rgba(104,114,128,.2)",
      }}
    >
      <div style={{
        position:     "absolute",
        top:          "3px",
        left:         checked ? "20px" : "3px",
        width:        "16px",
        height:       "16px",
        borderRadius: "50%",
        background:   "#fff",
        boxShadow:    "0 1px 4px rgba(0,0,0,.18)",
        transition:   "left .2s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function SectionCard({ title, icon, children }) {
  return (
    <div style={{
      background:   "var(--color-card)",
      borderRadius: "var(--radius-lg)",
      border:       "1px solid rgba(230,211,173,.6)",
      overflow:     "hidden",
      boxShadow:    "var(--shadow-sm)",
    }}>
      {/* Header */}
      <div style={{
        padding:      "16px 22px",
        borderBottom: "1px solid rgba(230,211,173,.5)",
        display:      "flex",
        alignItems:   "center",
        gap:          "10px",
        background:   "linear-gradient(135deg, rgba(63,125,88,.04) 0%, transparent 100%)",
      }}>
        <div style={{
          width: "30px", height: "30px", borderRadius: "9px",
          background: "rgba(63,125,88,.1)", border: "1px solid rgba(63,125,88,.18)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700,
          color: "var(--color-dark)", letterSpacing: "-0.2px",
        }}>
          {title}
        </span>
      </div>
      {/* Body */}
      <div style={{ padding: "22px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Field row ─────────────────────────────────────────────────────────────────
function FieldRow({ label, hint, children }) {
  return (
    <div style={{
      display:       "flex",
      alignItems:    "flex-start",
      justifyContent:"space-between",
      gap:           "20px",
      padding:       "14px 0",
      borderBottom:  "1px solid rgba(230,211,173,.4)",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--color-dark)", marginBottom: "2px" }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: "11.5px", color: "var(--color-text)", lineHeight: 1.5 }}>
            {hint}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}

// ── Inline editable input ─────────────────────────────────────────────────────
function EditableField({ value, placeholder, type = "text", onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [val,     setVal]     = useState(value ?? "");
  const inputRef = useRef(null);

  useEffect(() => { setVal(value ?? ""); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const handleSave = async () => {
    await onSave(val);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{
          fontFamily: "var(--font-body)", fontSize: "13px",
          color: val ? "var(--color-dark)" : "var(--color-text)",
        }}>
          {val || placeholder}
        </span>
        <button
          onClick={() => setEditing(true)}
          style={{
            fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 600,
            color: "var(--color-brand)",
            background: "rgba(63,125,88,.08)", border: "1px solid rgba(63,125,88,.2)",
            borderRadius: "7px", padding: "4px 10px", cursor: "pointer",
          }}
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <input
        ref={inputRef}
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
        style={{
          fontFamily: "var(--font-body)", fontSize: "13px",
          padding: "7px 11px", borderRadius: "8px",
          border: "1.5px solid var(--color-brand)",
          background: "var(--color-app-bg)", color: "var(--color-dark)",
          outline: "none", width: "200px",
          boxShadow: "0 0 0 3px rgba(63,125,88,.1)",
        }}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700,
          color: "#fff", background: "var(--color-brand)",
          border: "none", borderRadius: "7px", padding: "6px 12px", cursor: "pointer",
        }}
      >
        {saving ? "…" : "Save"}
      </button>
      <button
        onClick={() => { setEditing(false); setVal(value ?? ""); }}
        style={{
          fontFamily: "var(--font-body)", fontSize: "11px",
          color: "var(--color-text)", background: "transparent",
          border: "1px solid rgba(230,211,173,.7)", borderRadius: "7px",
          padding: "6px 10px", cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const navigate = useNavigate();
  const user     = auth.currentUser;

  // ── Profile state ──────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [email,       setEmail]       = useState(user?.email ?? "");
  const [photoURL,    setPhotoURL]    = useState(user?.photoURL ?? "");
  const [avatarPreview, setAvatarPreview] = useState(user?.photoURL ?? "");
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState(null);
  const fileInputRef = useRef(null);

  // ── Password change ────────────────────────────────────────────────────────
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [pwError,    setPwError]    = useState(null);
  const [pwSuccess,  setPwSuccess]  = useState(false);
  const [pwSaving,   setPwSaving]   = useState(false);

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifScanComplete, setNotifScanComplete] = useState(() =>
    JSON.parse(localStorage.getItem("notif_scan_complete") ?? "true")
  );
  const [notifReportSaved, setNotifReportSaved] = useState(() =>
    JSON.parse(localStorage.getItem("notif_report_saved") ?? "true")
  );

  // ── Theme ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("localyze_theme") ?? "light"
  );

  // ── Data ──────────────────────────────────────────────────────────────────
  const [reportCount,   setReportCount]   = useState(0);
  const [clearConfirm,  setClearConfirm]  = useState(false);
  const [clearDone,     setClearDone]     = useState(false);

  useEffect(() => {
    setReportCount(apiService.getReports().length);
  }, []);

  // ── Persist notifications ──────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem("notif_scan_complete", JSON.stringify(notifScanComplete)); }, [notifScanComplete]);
  useEffect(() => { localStorage.setItem("notif_report_saved",  JSON.stringify(notifReportSaved));  }, [notifReportSaved]);

  // ── Theme apply ────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("localyze_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showSaveMsg = (msg, isError = false) => {
    setSaveMsg({ msg, isError });
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveName = async (val) => {
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: val });
      setDisplayName(val);
      showSaveMsg("Display name updated!");
    } catch (e) {
      showSaveMsg(e.message, true);
    } finally { setSaving(false); }
  };

  const handleSaveEmail = async (val) => {
    setSaving(true);
    try {
      await updateEmail(auth.currentUser, val);
      setEmail(val);
      showSaveMsg("Email updated!");
    } catch (e) {
      showSaveMsg(e.message, true);
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    setPwError(null);
    if (newPw !== confirmPw) { setPwError("Passwords don't match."); return; }
    if (newPw.length < 6)    { setPwError("Password must be at least 6 characters."); return; }
    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPw);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPw);
      setPwSuccess(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (e) {
      setPwError(e.code === "auth/wrong-password" ? "Current password is incorrect." : e.message);
    } finally { setPwSaving(false); }
  };

  const handleClearReports = () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    localStorage.removeItem("localyze_reports");
    setReportCount(0);
    setClearConfirm(false);
    setClearDone(true);
    setTimeout(() => setClearDone(false), 3000);
  };

  const handleExportData = () => {
    const reports = apiService.getReports();
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "localyze_reports.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Avatar initials fallback
  const initials = (displayName || email || "A").charAt(0).toUpperCase();

  return (
    <div style={{ padding: "28px" }}>

      {/* ── Page header ── */}
      <div className="fade-in" style={{ marginBottom: "28px" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 600, color: "var(--color-brand)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "6px" }}>
          Preferences
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700, color: "var(--color-dark)", letterSpacing: "-0.5px", marginBottom: "6px" }}>
          Settings
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13.5px", color: "var(--color-text)" }}>
          Manage your account, notifications, and preferences.
        </p>
      </div>

      {/* ── Save message toast ── */}
      {saveMsg && (
        <div style={{
          position: "fixed", top: "20px", right: "28px", zIndex: 999,
          padding: "12px 18px", borderRadius: "var(--radius-md)",
          background: saveMsg.isError ? "#fee2e2" : "var(--color-success)",
          border: `1px solid ${saveMsg.isError ? "rgba(220,38,38,.2)" : "rgba(63,125,88,.2)"}`,
          color: saveMsg.isError ? "#991b1b" : "var(--color-brand)",
          fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600,
          boxShadow: "var(--shadow-md)", animation: "aiFadeIn .3s ease both",
        }}>
          {saveMsg.msg}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ══ 1. PROFILE ══════════════════════════════════════════════════════ */}
        <div className="fade-in fade-in-1">
          <SectionCard
            title="Profile"
            icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          >
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid rgba(230,211,173,.4)" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", border: "3px solid rgba(63,125,88,.2)",
                  boxShadow: "0 4px 16px rgba(63,125,88,.25)",
                }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, color: "var(--color-accent)" }}>{initials}</span>
                  }
                </div>
                {/* Upload overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: "absolute", bottom: "0", right: "0",
                    width: "24px", height: "24px", borderRadius: "50%",
                    background: "var(--color-brand)", border: "2px solid var(--color-card)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "15px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "3px" }}>
                  {displayName || "No name set"}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)", marginBottom: "10px" }}>
                  {email}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    fontFamily: "var(--font-body)", fontSize: "11.5px", fontWeight: 600,
                    color: "var(--color-brand)",
                    background: "rgba(63,125,88,.08)", border: "1px solid rgba(63,125,88,.2)",
                    borderRadius: "8px", padding: "5px 12px", cursor: "pointer",
                  }}
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* Editable fields */}
            <FieldRow label="Display Name" hint="Your name shown across the app">
              <EditableField value={displayName} placeholder="Enter your name" onSave={handleSaveName} saving={saving} />
            </FieldRow>
            <FieldRow label="Email Address" hint="Used for login and notifications">
              <EditableField value={email} placeholder="Enter email" type="email" onSave={handleSaveEmail} saving={saving} />
            </FieldRow>

            {/* Change password */}
            <div style={{ marginTop: "20px" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--color-dark)", marginBottom: "14px" }}>
                Change Password
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Current password", val: currentPw, set: setCurrentPw },
                  { label: "New password",      val: newPw,     set: setNewPw     },
                  { label: "Confirm new password", val: confirmPw, set: setConfirmPw },
                ].map((f) => (
                  <input
                    key={f.label}
                    type="password"
                    placeholder={f.label}
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    style={{
                      fontFamily: "var(--font-body)", fontSize: "13px",
                      padding: "10px 14px", borderRadius: "var(--radius-md)",
                      border: "1.5px solid var(--color-accent)",
                      background: "var(--color-app-bg)", color: "var(--color-dark)",
                      outline: "none", width: "100%", boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--color-brand)"; e.target.style.boxShadow = "0 0 0 3px rgba(63,125,88,.1)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "none"; }}
                  />
                ))}
                {pwError && (
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#dc2626", padding: "8px 12px", background: "#fee2e2", borderRadius: "8px" }}>
                    {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-brand)", padding: "8px 12px", background: "var(--color-success)", borderRadius: "8px" }}>
                    ✓ Password updated successfully!
                  </div>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                  style={{
                    alignSelf: "flex-start",
                    fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700,
                    color: "var(--color-card)",
                    background: (!currentPw || !newPw || !confirmPw) ? "var(--color-text)" : "linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))",
                    border: "none", borderRadius: "var(--radius-md)",
                    padding: "10px 20px", cursor: "pointer", transition: "all .2s",
                  }}
                >
                  {pwSaving ? "Updating…" : "Update Password"}
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ══ 2. NOTIFICATIONS ════════════════════════════════════════════════ */}
        <div className="fade-in fade-in-2">
          <SectionCard
            title="Notifications"
            icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>}
          >
            <FieldRow
              label="Scan Complete"
              hint="Get notified when a location scan finishes"
            >
              <Toggle checked={notifScanComplete} onChange={setNotifScanComplete} />
            </FieldRow>
            <FieldRow
              label="Report Saved"
              hint="Get notified when a report is saved to your archive"
            >
              <Toggle checked={notifReportSaved} onChange={setNotifReportSaved} />
            </FieldRow>
          </SectionCard>
        </div>

        {/* ══ 3. APPEARANCE ═══════════════════════════════════════════════════ */}
        <div className="fade-in fade-in-3">
          <SectionCard
            title="Appearance"
            icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>}
          >
            <FieldRow label="Theme" hint="Choose how Localyze looks for you">
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { value: "light", label: "☀️ Light" },
                  { value: "dark",  label: "🌙 Dark"  },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    style={{
                      fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600,
                      padding: "7px 16px", borderRadius: "var(--radius-md)",
                      border: theme === t.value ? "1.5px solid var(--color-brand)" : "1.5px solid var(--color-accent)",
                      background: theme === t.value ? "rgba(63,125,88,.1)" : "transparent",
                      color: theme === t.value ? "var(--color-brand)" : "var(--color-text)",
                      cursor: "pointer", transition: "all .18s",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </FieldRow>
          </SectionCard>
        </div>

        {/* ══ 4. DATA & PRIVACY ═══════════════════════════════════════════════ */}
        <div className="fade-in fade-in-4">
          <SectionCard
            title="Data & Privacy"
            icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
          >
            <FieldRow
              label="Saved Reports"
              hint={`${reportCount} report${reportCount !== 1 ? "s" : ""} stored locally on this device`}
            >
              <button
                onClick={handleExportData}
                style={{
                  fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600,
                  color: "var(--color-brand)",
                  background: "rgba(63,125,88,.08)", border: "1px solid rgba(63,125,88,.2)",
                  borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "6px",
                }}
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export JSON
              </button>
            </FieldRow>
            <FieldRow
              label="Clear All Reports"
              hint="Permanently delete all saved reports from this device"
            >
              {clearDone ? (
                <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-brand)", fontWeight: 600 }}>
                  ✓ Cleared
                </span>
              ) : (
                <button
                  onClick={handleClearReports}
                  style={{
                    fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600,
                    color: clearConfirm ? "#fff" : "#dc2626",
                    background: clearConfirm ? "#dc2626" : "rgba(220,38,38,.08)",
                    border: `1px solid ${clearConfirm ? "#dc2626" : "rgba(220,38,38,.25)"}`,
                    borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  {clearConfirm ? "⚠ Confirm Delete" : "Clear Reports"}
                </button>
              )}
            </FieldRow>
          </SectionCard>
        </div>

        {/* ══ Sign out ════════════════════════════════════════════════════════ */}
        <div className="fade-in fade-in-4" style={{ paddingBottom: "28px" }}>
          <button
            onClick={handleSignOut}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600,
              color: "#dc2626",
              background: "transparent", border: "1.5px solid rgba(220,38,38,.25)",
              borderRadius: "var(--radius-md)", padding: "10px 20px", cursor: "pointer",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}