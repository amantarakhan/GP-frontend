import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NAV_ITEMS } from "../../constants";
import { useLocationAnalysis } from "../../hooks/useLocationAnalysis";
import { apiService } from "../../services/apiService";
import { useTutorialManager, TUTORIAL_IDS } from "../../context/TutorialContext";

import globeIcon from "../../assets/logo2.png";
import wordmark  from "../../assets/logo1.png";

const COLLAPSED_W = "64px";
const EXPANDED_W  = "248px";

// ── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  dashboard: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  scan: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8"  x2="11" y2="14" />
      <line x1="8"  y1="11" x2="14" y2="11" />
    </svg>
  ),
  reports: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  compare: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  ),
  appendix: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  ),
  howToUse: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  ),
};

// ── Shared NavLink style fn ───────────────────────────────────────────────────
const navLinkStyle = (isActive, expanded) => ({
  display:        "flex",
  alignItems:     "center",
  justifyContent: expanded ? "flex-start" : "center",
  gap:            expanded ? "11px" : "0",
  padding:        expanded ? "10px 12px" : "10px 0",
  width:          "100%",
  borderRadius:   "10px",
  textDecoration: "none",
  fontFamily:     "var(--font-body)",
  fontSize:       "13.5px",
  fontWeight:     isActive ? 600 : 400,
  color:          isActive ? "#F5F2E1" : "#687280",
  background:     isActive
    ? "linear-gradient(90deg,rgba(63,125,88,.22) 0%,rgba(63,125,88,.06) 100%)"
    : "transparent",
  position:       "relative",
  border:         "none",
  overflow:       "hidden",
  whiteSpace:     "nowrap",
  boxSizing:      "border-box",
  transition:     "background .18s, color .18s",
  cursor:         "pointer",
});

// ── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({ item, expanded }) {
  return (
    <NavLink
      to={item.path}
      title={!expanded ? item.label : undefined}
      className="sidebar-nav-item"
      data-tutorial={`nav-${item.id}`}
      style={({ isActive }) => ({
        ...navLinkStyle(isActive, expanded),
        marginBottom: "4px",
      })}
      onMouseEnter={e => { if (!e.currentTarget.style.background.includes("linear")) e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
      onMouseLeave={e => { if (!e.currentTarget.style.background.includes("linear")) e.currentTarget.style.background = "transparent"; }}
    >
      {({ isActive }) => (
        <>
          {/* Active accent bar */}
          {isActive && expanded && (
            <span
              className="sidebar-active-bar"
              style={{
                position: "absolute", left: 0, top: "50%",
                transform: "translateY(-50%)", width: "3px", height: "54%",
                background: "var(--color-brand)", borderRadius: "0 3px 3px 0",
              }}
            />
          )}

          {/* Icon */}
          <span style={{
            color: isActive ? "var(--color-brand)" : "#687280",
            flexShrink: 0, display: "flex", alignItems: "center", minWidth: "18px",
          }}>
            {Icons[item.id]}
          </span>

          {/* Label + badge — shown when expanded, tiny label always present for tab-bar */}
          {expanded ? (
            <span style={{
              display: "flex", alignItems: "center", flex: 1, gap: "8px",
              animation: "sbFadeIn .18s ease both",
            }}>
              <span className="sidebar-label" style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: "rgba(63,125,88,.22)", color: "var(--color-brand)",
                  fontSize: "10px", fontWeight: 700, padding: "2px 7px",
                  borderRadius: "10px", fontFamily: "monospace", flexShrink: 0,
                }}>
                  {item.badge}
                </span>
              )}
            </span>
          ) : (
            /* Tiny label rendered for the mobile tab-bar (hidden on desktop via CSS) */
            <span
              className="sidebar-label"
              style={{ display: "none", fontSize: "9px", fontWeight: 600 }}
            >
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ expanded, setExpanded }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasResults } = useLocationAnalysis();
  const { requestTutorial } = useTutorialManager();
  const location = useLocation();
  const [reportCount, setReportCount] = useState(0);

  // Re-read count whenever the route changes (covers save → navigate back)
  useEffect(() => {
    setReportCount(apiService.getReports().length);
  }, [location.pathname]);

  const navLabelMap = {
    dashboard: t("nav.dashboard"),
    scan:      t("nav.newScan"),
    reports:   t("nav.savedReports"),
    compare:   t("compare.locationComparison"),
  };
  const visibleNavItems = NAV_ITEMS
    .filter(item => item.id !== "compare" || hasResults)
    .map(item => ({ ...item, label: navLabelMap[item.id] || item.label }));
  return (
    <>
      <style>{`
        @keyframes sbFadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <aside
        className="localyze-sidebar"
        data-tutorial="sidebar"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          flexShrink:    0,
          width:         expanded ? EXPANDED_W : COLLAPSED_W,
          minHeight:     "100vh",
          background:    "var(--color-sidebar)",
          display:       "flex",
          flexDirection: "column",
          overflow:      "hidden",
          transition:    "width .26s cubic-bezier(.4,0,.2,1)",
          position:      "relative",
          zIndex:        10,
        }}
      >
        {/* Ambient glow */}
        <div
          className="sidebar-ambient-glow"
          style={{
            position: "absolute", bottom: "-70px", left: "-60px",
            width: "230px", height: "230px",
            background: "radial-gradient(circle,rgba(63,125,88,.13) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Logo ── */}
        <div
          onClick={() => navigate("/")}
          style={{
            height:         "66px",
            padding:        "0 13px",
            borderBottom:   "1px solid rgba(255,255,255,.06)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: expanded ? "flex-start" : "center",
            gap:            "11px",
            flexShrink:     0,
            overflow:       "hidden",
            cursor:         "pointer",
          }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "rgba(63,125,88,.18)", border: "1px solid rgba(63,125,88,.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, overflow: "hidden", boxShadow: "0 0 16px rgba(63,125,88,.35)",
          }}>
            <img
              src={globeIcon} alt=""
              style={{
                width: "34px", height: "34px", objectFit: "contain",
                mixBlendMode: "screen", filter: "brightness(1.8) saturate(1.3)",
              }}
            />
          </div>
          {expanded && (
            <div style={{
              display: "flex", flexDirection: "column", gap: "3px",
              overflow: "hidden", flex: 1,
              animation: "sbFadeIn .2s ease .05s both", whiteSpace: "nowrap",
            }}>
              <img
                src={wordmark} alt="Localyze"
                style={{
                  height: "18px", width: "auto", maxWidth: "150px",
                  objectFit: "contain", objectPosition: "left center",
                  mixBlendMode: "screen", filter: "brightness(1.8) saturate(1.3)",
                  display: "block",
                }}
              />
              <span style={{
                fontFamily: "var(--font-body)", fontSize: "9px", fontWeight: 700,
                color: "var(--color-brand)", letterSpacing: "2.5px",
                textTransform: "uppercase", lineHeight: 1,
              }}>Pro</span>
            </div>
          )}
        </div>

        {/* ── Nav section label ── */}
        {expanded
          ? (
            <div
              className="sidebar-nav-label"
              style={{
                padding: "18px 16px 6px",
                fontFamily: "var(--font-body)", fontSize: "9px", fontWeight: 600,
                color: "#687280", letterSpacing: "2.5px", textTransform: "uppercase",
                whiteSpace: "nowrap", animation: "sbFadeIn .18s ease both",
              }}
            >
              {t("nav.mainMenu")}
            </div>
          )
          : <div className="sidebar-nav-label" style={{ height: "18px" }} />
        }

        {/* ── Main nav ── */}
        <nav
          className="sidebar-nav"
          style={{
            padding: expanded ? "4px 8px" : "4px 0",
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: expanded ? "stretch" : "center",
          }}
        >
          {visibleNavItems.map((item) => (
            <NavItem
              key={item.id}
              item={item.id === "reports" && reportCount > 0
                ? { ...item, badge: reportCount }
                : item}
              expanded={expanded}
            />
          ))}
        </nav>

        {/* ── Divider ── */}
        <div
          className="sidebar-divider"
          style={{
            margin: "0 10px", height: "1px",
            background: "rgba(255,255,255,.06)", flexShrink: 0,
          }}
        />

        {/* ── How to Use ── */}
        <div style={{ padding: expanded ? "4px 8px" : "4px 0", flexShrink: 0 }}>
          <button
            title={!expanded ? t("nav.howToUse") : undefined}
            onClick={() => requestTutorial(TUTORIAL_IDS.ONBOARDING, 100)}
            style={{
              width:          expanded ? "100%" : "38px",
              height:         "38px",
              display:        "flex",
              alignItems:     "center",
              justifyContent: expanded ? "flex-start" : "center",
              gap:            "11px",
              padding:        expanded ? "0 12px" : "0",
              borderRadius:   "10px",
              border:         "none",
              background:     "transparent",
              color:          "#687280",
              fontSize:       "13px",
              fontFamily:     "var(--font-body)",
              cursor:         "pointer",
              transition:     "background .18s",
              overflow:       "hidden",
              whiteSpace:     "nowrap",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,.06)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{Icons.howToUse}</span>
            {expanded && <span style={{ animation: "sbFadeIn .18s ease both" }}>{t("nav.howToUse")}</span>}
          </button>
        </div>

        {/* ── Appendix ── */}
        <div style={{ padding: expanded ? "4px 8px" : "4px 0", flexShrink: 0 }}>
          <NavLink
            to="/appendix"
            title={!expanded ? t("nav.appendix") : undefined}
            style={({ isActive }) => ({
              width:          expanded ? "100%" : "38px",
              height:         "38px",
              display:        "flex",
              alignItems:     "center",
              justifyContent: expanded ? "flex-start" : "center",
              gap:            "11px",
              padding:        expanded ? "0 12px" : "0",
              borderRadius:   "10px",
              border:         "none",
              background:     isActive
                ? "linear-gradient(90deg,rgba(63,125,88,.22) 0%,rgba(63,125,88,.06) 100%)"
                : "transparent",
              color:          isActive ? "#F5F2E1" : "#687280",
              fontSize:       "13px",
              fontFamily:     "var(--font-body)",
              cursor:         "pointer",
              transition:     "background .18s",
              overflow:       "hidden",
              whiteSpace:     "nowrap",
              textDecoration: "none",
            })}
            onMouseEnter={(e) => { if (!e.currentTarget.style.background.includes("linear-gradient(90")) e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
            onMouseLeave={(e) => { if (!e.currentTarget.style.background.includes("linear-gradient(90")) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{Icons.appendix}</span>
            {expanded && <span style={{ animation: "sbFadeIn .18s ease both" }}>{t("nav.appendix")}</span>}
          </NavLink>
        </div>

        {/* ── Settings ── */}
        <div style={{ padding: expanded ? "4px 8px 8px" : "4px 0 8px", flexShrink: 0 }}>
          <NavLink
            to="/settings"
            title={!expanded ? t("nav.settings") : undefined}
            onClick={() => navigate("/settings")}
            style={{
              width:          expanded ? "100%" : "38px",
              height:         "38px",
              display:        "flex",
              alignItems:     "center",
              justifyContent: expanded ? "flex-start" : "center",
              gap:            "11px",
              padding:        expanded ? "0 12px" : "0",
              borderRadius:   "10px",
              border:         "none",
              background:     "transparent",
              color:          "#687280",
              fontSize:       "13px",
              fontFamily:     "var(--font-body)",
              cursor:         "pointer",
              transition:     "background .18s",
              overflow:       "hidden",
              whiteSpace:     "nowrap",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,.06)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{Icons.settings}</span>
            {expanded && <span style={{ animation: "sbFadeIn .18s ease both" }}>{t("nav.settings")}</span>}
          </NavLink>
        </div>

        {/* ── User card ── */}
        <div
          className="sidebar-user-card"
          style={{
            margin: "4px 8px 16px",
            padding: expanded ? "10px 12px" : "10px 0",
            borderRadius: "12px", background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.07)",
            display: "flex", alignItems: "center",
            justifyContent: expanded ? "flex-start" : "center",
            gap: "10px", cursor: "pointer", flexShrink: 0, overflow: "hidden",
          }}
        >
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%",
            background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 700, color: "var(--color-accent)",
            flexShrink: 0, fontFamily: "var(--font-display)",
          }}>A</div>
          {expanded && (
            <>
              <div style={{
                overflow: "hidden", flex: 1,
                animation: "sbFadeIn .18s ease both", whiteSpace: "nowrap",
              }}>
                <div style={{
                  color: "#F5F2E1", fontSize: "13px", fontWeight: 600,
                  fontFamily: "var(--font-body)", overflow: "hidden", textOverflow: "ellipsis",
                }}>{t("sidebar.analystPro")}</div>
                <div style={{ color: "#687280", fontSize: "11px", fontFamily: "var(--font-body)" }}>
                  {t("sidebar.proPlanActive")}
                </div>
              </div>
              <span style={{ animation: "sbFadeIn .18s ease both", flexShrink: 0, display: "flex" }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#687280" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
            </>
          )}
        </div>
      </aside>
    </>
  );
}