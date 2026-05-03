// Build Localyze frontend documentation PDF using jsPDF.
// Run: node docs/build-pdf.mjs

import { jsPDF } from "jspdf";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Page + typography constants ─────────────────────────────────────────────
const PAGE_W = 210;                 // A4 mm
const PAGE_H = 297;
const MARGIN_X = 18;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 18;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const BRAND      = [63, 125, 88];
const BRAND_DARK = [45, 92, 63];
const DARK       = [31, 41, 55];
const MID        = [104, 114, 128];
const LIGHT      = [230, 211, 173];
const CARD_BG    = [245, 242, 225];
const BG_SOFT    = [252, 250, 241];

// ── Source: markdown-lite documentation ─────────────────────────────────────
const DOC = `# Localyze Frontend — Technical Documentation

A reading guide for the React frontend of Localyze, a location-intelligence web app that scores business feasibility for any map location in Jordan.

> Scope: frontend only. The backend (scan + AI analysis endpoints) is hosted separately at https://localyze.onrender.com and is referenced here only at the boundary (what we call, what we expect back).

## 1. Tech Stack

| Area | Library | Purpose |
| UI framework | React 19 (react, react-dom) | Component model, hooks |
| Build tool | Vite 7 (@vitejs/plugin-react) | Dev server, HMR, production bundle |
| Routing | react-router-dom 7 | Client-side routes, nested layouts, Outlet |
| State (global) | React Context — AnalysisContext, TutorialContext | Scan form + results + compare + tutorial orchestration |
| i18n | i18next + react-i18next + language-detector | English + Arabic; auto RTL/LTR |
| Auth & DB | Firebase 12 (Auth + Firestore) | Sign-in, user profile, saved reports |
| Maps | @react-google-maps/api | Google Maps JS SDK wrapper |
| HTTP | native fetch (axios installed but largely unused) | Calls to the scan/AI backend |
| PDF export | jsPDF | Client-side report export |
| Icons | lucide-react (optional) + inline SVG | Mostly inline SVG |
| Styling | Plain CSS + inline styles + CSS variables | No component library; Tailwind installed but unused |

Source tree:

\`\`\`
src/
  App.jsx                 <- routing
  main.jsx                <- React root, loads i18n + css
  i18n.js                 <- i18next config, sets <html dir>
  firebase.js             <- Firebase app/auth/firestore init
  index.css / responsive.css
  constants/index.js      <- business types, radius presets, mock data
  context/
    AnalysisContext.jsx   <- scan state, compare state, AI state
    TutorialContext.jsx   <- tutorial queue/orchestration
  hooks/
    useLocationAnalysis.js  <- thin wrapper around AnalysisContext
    useLocationScan.js      <- standalone scan hook (unused by main flow)
  locales/
    en.json
    ar.json
  services/
    apiService.js   <- backend calls + localStorage reports
    dbService.js    <- Firestore CRUD
    generatePDF.js  <- jsPDF report builder
  components/
    layout/    <- MainLayout, Sidebar, TopBar
    scan/      <- InputPanel, MapContainer, ResultPanel, ...
    tutorial/  <- TutorialOverlay, CompareSpotlight
    ui/        <- ScoreRing, StatsCard, SkeletonBlock
  pages/
    WelcomePage.jsx  <- public landing page
    LoginPage / SignupPage / ForgotPassword
    DashboardPage / ScanPage / ReportsPage
    ComparePage / SettingsPage / AppendixPage
\`\`\`

## 2. Application Shell — How the App Boots

### main.jsx
Loads i18n.js BEFORE rendering so translations are ready on first paint. Then mounts App inside React.StrictMode at #root. Imports index.css and responsive.css.

### App.jsx
Wraps everything in AnalysisProvider (so scan state survives across routes), then sets up routes:
- Public zone (no sidebar, full-screen): /, /signup, /login, /forgot-password.
- App zone (wrapped in MainLayout, which includes sidebar + topbar): /dashboard, /scan, /reports, /settings, /appendix, /compare.
- * -> Navigate to="/" (fallback).

### i18n.js
- Registers English (en) and Arabic (ar) translation bundles.
- Detection order: localStorage -> browser navigator, cached as localyze_lang.
- On every language change, sets document.documentElement.dir to "rtl" (Arabic) or "ltr" (English) and sets lang. That one attribute is how the whole app flips to RTL.

### firebase.js
Exports singletons:
- auth — Firebase Auth instance
- googleProvider — Google sign-in provider
- sendPasswordResetEmail — re-export of the SDK helper
- db — Firestore instance

## 3. Global State — Contexts

### AnalysisContext (src/context/AnalysisContext.jsx)
The heart of the scan workflow. One provider lives at the top of App so its state survives across every route.

State it owns:
- Form: businessType, subType, radius, location (address string), pin (lat/lng).
- Primary scan result: isAnalyzing, hasResults, results (normalised), rawScanData (raw API response — fed to the AI endpoint), scanError.
- AI analysis: isAiLoading, hasAiResults, aiAnalysis (text/markdown), aiError.
- Compare workflow: comparePin, compareResults, isComparing, hasCompareResults, compareError, compareMode (modal), comparePicking (slim banner).

Actions it exposes:
- runAnalysis() — calls apiService.runScan, stores both raw + normalised.
- runAiAnalysis() — calls apiService.analyzeResults with the raw scan.
- runCompareAnalysis() — second scan on comparePin using the same business type and radius.
- resetAnalysis() / resetCompare() — wipe state.
- saveCurrentReport() — save to localStorage via apiService (Firestore save is done in pages themselves via dbService.saveReport).

Consumer hook: useAnalysis() (throws if used outside the provider). Most components go through the wrapper useLocationAnalysis() instead.

### TutorialContext (src/context/TutorialContext.jsx)
Orchestrates the onboarding tour and the compare-feature spotlight so only one tutorial shows at a time.
- TUTORIAL_IDS.ONBOARDING (priority 100) — full 6-step overlay.
- TUTORIAL_IDS.COMPARE (priority 10) — one-off spotlight on the compare button the first time a user finishes a scan.
- Completion is persisted per-user in localStorage: localyze_tutorial_done_<uid> and localyze_compare_tip_seen_<uid>.
- Provider is mounted inside MainLayout (not App) because tutorials only make sense for authenticated, in-app routes.

Consumer hook: useTutorialManager().

## 4. Hooks

### useLocationAnalysis (src/hooks/useLocationAnalysis.js)
Thin wrapper around useAnalysis(). Adds:
- handleMapClick({ lat, lng }) — sets the pin and fills the location string.
- radiusDisplay — human-readable radius (750m, 1.5 km).
- canRun — true when at least businessType is set.

Components call this hook, never the raw context. It keeps the scan workflow's API stable even if the context is refactored.

### useLocationScan (src/hooks/useLocationScan.js)
A standalone scan hook (not connected to AnalysisContext). Exposes { scan, results, isLoading, error, reset }. Currently NOT used by the main flow — kept for one-off search widgets.

## 5. Services

### apiService.js — Backend + local reports
- runScan({ businessType, subType, radius, lat, lng }) — GETs SCAN_BASE_URL/scan-location with query params. Returns { normalised, raw }.
- analyzeResults(rawScanData, language) — POSTs to SCAN_BASE_URL/analyze with { scan_result, language }. Returns the AI text.
- normaliseResponse(raw, params) — pure function that maps the raw backend shape into what the UI expects:
  - feasibility, competitors, saturation, footTraffic, demandSignal
  - Display strings: dataPoints ("48 POIs"), coverage ("1.77 km^2")
  - District profile (name, youth %, population, etc.)
  - Per-competitor rows with a status derived by deriveStatus(rating, reviews): high / medium / low threat.
- getReports() / saveReport(r) / deleteReport(id) — localStorage-based report store keyed under localyze_reports. Used for guests (not signed in) and as a lightweight cache.

Backend base URL is https://localyze.onrender.com (hard-coded).

### dbService.js — Firestore CRUD
- createUserProfile(user, extra) — writes users/{uid} with email, displayName, subscriptionTier: "Basic", createdAt.
- getUserProfile(uid) / updateUserProfile(uid, fields).
- saveReport(userId, report) — writes users/{uid}/saved_reports/{autoId} with the full report payload (coordinates, feasibility, competitors, saturation, AI text, full scan snapshot, timestamp).
- getUserReports(userId) — lists that subcollection, newest first (sorted client-side so no Firestore composite index is needed).
- deleteReport(userId, reportId).

Note on undefined: A clean() helper round-trips through JSON with undefined -> null so Firestore never rejects writes.

### generatePDF.js — Client-side PDF export
Uses jsPDF to compose a multi-page PDF from a scan result. It is data-driven, not screenshot-based — colours, cards, badges, and sections are all drawn with jsPDF primitives using the brand palette. Called from TopBar's export button.

## 6. Layout Components

### MainLayout.jsx
The shell for every authenticated route.
- Wraps its subtree in TutorialProvider.
- Renders Sidebar on the side and a content column containing TopBar, TutorialOverlay, CompareSpotlight, and Outlet (the active page).
- expanded state controls the collapsed/expanded sidebar width.

### Sidebar.jsx
Left nav (bottom tab-bar on mobile via responsive.css).
- Logo header, nav items (Dashboard, Scan, Reports, Compare, Appendix), settings item, and an ambient glow blob.
- Each nav item is a NavLink with a data-tutorial="nav-<id>" marker so the tutorial can spotlight it.
- Active item shows an accent bar positioned with insetInlineStart so it flips in RTL.

### TopBar.jsx
Thin header above the page content.
- Shows a breadcrumb (Home / <page title>) where the page title comes from t('nav.*') based on the current pathname.
- Right side: an "Analysis Ready" pulse badge (when a scan has results), an Export button (calls generatePDF), and a Save Report button (writes to Firestore via dbService.saveReport for signed-in users, or falls back to apiService.saveReport for guests).

## 7. Scan Components (src/components/scan/)

### InputPanel.jsx
Left panel of the Scan page. Contains:
- BusinessTypeDropdown (business type picker).
- An inline SubCategoryDropdown (sub-type, e.g. "Specialty Coffee"). Labels go through t('subTypes.*') with a toSubKey normaliser so new entries in constants/index.js auto-fall-back to their English label until they're translated.
- Radius slider with MAX_RADIUS clamp per business type.
- Location string/address preview.
- "Run Analysis" button — disabled until canRun AND a pin is set.

### BusinessTypeDropdown.jsx
Custom dropdown (not a native select) rendering each entry as \${emoji}  \${t('businessTypes.<value>')}. Closes on outside click via a ref + mousedown listener.

### MapContainer.jsx
Wraps @react-google-maps/api.
- Custom muted map style (brand palette).
- On click, calls useLocationAnalysis.handleMapClick -> sets the pin.
- Draws the primary marker, and the compare pin when in compare mode.
- API key is loaded via useJsApiLoader.

### ResultPanel.jsx
Appears below the map once a scan completes. Three cards in a row:
1. Feasibility — ScoreRing + foot-traffic/demand-signal MiniBars + an InfoTooltip with the scoring logic.
2. Competitor Density — raw count + rating/price MiniBars.
3. Market Saturation — big percent + youth/foot-traffic MiniBars.

Plus a district insight strip (district name, population, youth %, education hubs) and a bottom stat strip (district, data points, coverage) using StatsCard.

All tooltip content and badge labels go through t() so the panel reads natively in Arabic.

### CompetitorList.jsx
A collapsible list of nearby competitors derived from the scan result:
- Header with count pill, expand/collapse chevron.
- Each row: avatar (first letter), name + address, star rating, price dots, threat badge (high/medium/low from deriveStatus), expand chevron.
- Expanded row shows today's hours (parsed from the Google Places opening_hours strings), review count, phone, website.
- "Show all N" / "Show less" toggle when >8 rows.

### AiInsightsPanel.jsx
Renders the AI analysis text from the /analyze endpoint:
- "Get AI Suggestions" button — calls runAiAnalysis().
- Thinking-steps animation while the call is in flight.
- Inline markdown-lite renderer for bold (**x**) and italics (*x*).
- Groups the response into sections (Risks, Opportunities, Differentiation, Competitor Insights) by scanning for keyword headings.

### CompareModal.jsx
Opens when the user starts a comparison. Lets them pick a second pin on the map, then compares the two results side-by-side using METRICS: feasibility, competitors, saturation, foot traffic, demand signal. A scoring loop decides the overall winner (or "tie").

## 8. Tutorial Components (src/components/tutorial/)

### TutorialOverlay.jsx
Full 6-step onboarding tour, rendered into document.body via a React portal.
- Single dark overlay with a rounded cutout (CSS clip-path: path(evenodd, ...)) around the spotlighted element.
- Tooltip with step title, body, dot indicator, "Skip", "Back", "Next", "Get Started". All strings come from t('tutorial.*').
- Step definitions (target selector, placement, route) live in STEPS in the component; the titles/bodies live in tutorial.steps[i] in both locale files.
- Arrow component flips left/right when dir === "rtl", and the Next-button arrow icon flips via scaleX(-1) in RTL.
- Measured with getBoundingClientRect() and re-measures on step/route change, resize, and scroll.

### CompareSpotlight.jsx
One-off circular spotlight highlighting the Compare nav item. Uses the same clip-path technique but with a circular inner shape. Shown once per user after their first successful scan; dismissal writes localyze_compare_tip_seen_<uid> to localStorage.

## 9. UI Primitives (src/components/ui/)

- ScoreRing.jsx — animated circular progress ring (SVG stroke-dashoffset) used in metric cards and report rows.
- StatsCard.jsx — small icon + label + value card used at the bottom of the ResultPanel. Supports three icons: pin, data, globe.
- SkeletonBlock.jsx — shimmering placeholder for loading states.

## 10. Pages

### WelcomePage.jsx (/)
Public landing page.
- Rotating niche word in the hero ("Business.", "Cafe.", "Boutique.", ...).
- Three floating glass cards (FloatingTrafficPill, FloatingScoreCard, FloatingCompCard) that swap their left/right anchors when dir is rtl.
- Feature grid with FeatureCard components.
- "How it works" pipeline, about section, CTA footer.
- Copy is all i18n-keyed under welcome.*.

### LoginPage.jsx (/login)
Email/password + Google sign-in via Firebase Auth. On successful sign-in, calls createUserProfile to ensure a Firestore user doc exists, then navigates to /dashboard. Shows friendly error toasts for all the common Firebase auth error codes.

### SignupPage.jsx (/signup)
Sibling of LoginPage using createUserWithEmailAndPassword. Includes a live password-strength meter and the same Google sign-in path.

### ForgotPassword.jsx (/forgot-password)
Calls sendPasswordResetEmail. Shows a 60-second cooldown on "Resend" and a success state linking back to /login.

### DashboardPage.jsx (/dashboard)
First page after sign-in.
- Welcome header (first-time vs return user, via profile.firstLoginDone).
- Four StatWidgets: saved reports, avg feasibility, total competitors, avg saturation — computed from the user's reports.
- "Recent Reports" list (top 3).
- CTA band with "Start New Scan" -> navigates to /scan and calls resetAnalysis().

Used by tutorial: data-tutorial="welcome-header", data-tutorial="stat-grid", data-tutorial="start-scan-btn".

### ScanPage.jsx (/scan)
The main workflow page. Two-column layout:
- Left: InputPanel (form).
- Right: map header with reset button -> MapContainer -> once results exist: ResultPanel, AiInsightsPanel, CompetitorList.
- A ResetModal (portal) asks the user to save-or-discard before wiping an unsaved scan.
- CompareModal opens from the compare action.

### ReportsPage.jsx (/reports)
List of saved reports for the current user. Reads from Firestore for signed-in users (getUserReports), falls back to apiService.getReports for guests. Handles three UI states: loading skeletons, empty state, fetch-error banner. Delete uses firestoreDeleteReport. Also exposes "Save Current Scan" if there's unsaved scan state.

### ComparePage.jsx (/compare)
Side-by-side comparison view. Uses METRICS_CONFIG (feasibility, competitors, saturation, foot traffic, demand signal) and getOverallWinner() to pick a recommended location. Renders MetricRows that bar-chart each metric with a "Better" badge on the winning side.

### SettingsPage.jsx (/settings)
User profile + app preferences:
- Profile: change photo (not persisted), display name, email, change password — all via Firebase Auth, with reauthenticateWithCredential when needed and mirrored to Firestore via updateUserProfile.
- Notifications: scan-complete + report-saved toggles.
- Appearance: theme (light/dark) and language (toggles i18n language, which in turn flips <html dir>).
- Data & Privacy: report count, export JSON, clear all reports.
- Sign out.

### AppendixPage.jsx (/appendix)
Documentation page explaining the scoring methodology (feasibility formula, thresholds, data sources). Pure render from t('appendix.*').

## 11. Data Flow: A Full Scan

1. User lands on /scan. AnalysisContext has default empty state.
2. In InputPanel they pick a business type -> setBusinessType().
3. They click on MapContainer -> useLocationAnalysis.handleMapClick -> setPin({ lat, lng }).
4. They click "Run Analysis" -> runAnalysis() in AnalysisContext:
   - Flips isAnalyzing=true, clears previous results + compare state.
   - Calls apiService.runScan, which hits GET /scan-location on the backend.
   - Backend returns raw JSON -> normaliseResponse maps it into UI shape.
   - Stores both results (normalised) and rawScanData (raw).
5. ResultPanel and CompetitorList re-render off results.
6. User optionally clicks "Get AI Suggestions" -> runAiAnalysis() POSTs rawScanData to /analyze with the current i18n language -> stores the returned text in aiAnalysis.
7. AiInsightsPanel re-renders off aiAnalysis.
8. User clicks "Save Report" in TopBar:
   - If signed in -> dbService.saveReport(uid, payload) writes to Firestore.
   - If guest -> apiService.saveReport(payload) writes to localStorage.
9. User clicks "Export" -> generatePDF({...}) builds and downloads a PDF locally with jsPDF.

## 12. Internationalization

All user-facing text is under namespaces per screen area: common.*, nav.*, businessTypes.*, subTypes.*, dashboard.*, scan.*, results.*, competitors.*, ai.*, compare.*, map.*, reports.*, settings.*, tutorial.*, appendix.*, welcome.*, login.*, signup.*, forgotPassword.*, topbar.*, sidebar.*, radius.*.

RTL behaviour:
- i18n.js sets document.documentElement.dir = "rtl" when Arabic is active; the browser then flips most block/inline flow automatically.
- Where physical directions are unavoidable in inline styles, we use CSS logical properties (insetInlineStart, marginInlineStart, border-inline-end) or read dir at render time to swap left / right anchors (see WelcomePage floating cards and TutorialOverlay arrow).

Adding a new language:
1. Create src/locales/<lang>.json with the same key shape as en.json.
2. Register it in i18n.js resources and supportedLngs.
3. If it is RTL, add a branch in applyDir.

## 13. Styling

- index.css defines the design tokens as CSS custom properties (--color-brand, --color-accent, --color-card, --font-display, --radius-md, --shadow-sm, fade-in animations, ...). Components reference them by name, so theme changes are one-file edits.
- responsive.css has breakpoint-driven overrides for mobile, including the sidebar -> bottom-tab-bar transformation.
- Most component-level styling is inline style={{}} objects — there is no component library, on purpose.

## 14. Assets & Constants

- src/assets/ — three logos (logo.png, logo1.png, logo2.png) used on public pages and in the sidebar.
- src/constants/index.js — BUSINESS_TYPES, SUBCATEGORIES, MAX_RADIUS (per-type backend clamp), RADIUS_LABELS, NAV_ITEMS, and mock data for development.

## 15. Build & Run

\`\`\`
npm install
npm run dev          # Vite dev server with HMR
npm run build        # production build into dist/
npm run preview      # serve the build locally
npm run lint         # ESLint
\`\`\`

No environment variables are required for the frontend itself — the Firebase config and backend URL are hard-coded in firebase.js and apiService.js respectively. (Google Maps uses whatever key is supplied to useJsApiLoader inside MapContainer.jsx.)

## 16. Quick Reference — "Where do I change X?"

| I want to... | Edit |
| Change the feasibility scoring display | components/scan/ResultPanel.jsx |
| Change what the scan API is called with | services/apiService.js#runScan |
| Add a new business type | constants/index.js -> BUSINESS_TYPES + keys in both locale files |
| Add a new page | New file in pages/, route in App.jsx, nav entry in constants/index.js -> NAV_ITEMS, locale keys |
| Translate a string | locales/en.json + locales/ar.json; use t('namespace.key') |
| Fix an RTL layout bug | Prefer CSS logical properties (insetInlineStart, marginInlineStart); or read document.documentElement.dir inline |
| Tweak the onboarding tour | components/tutorial/TutorialOverlay.jsx (structure) + locales/*.json tutorial.steps (copy) |
| Change PDF export layout | services/generatePDF.js |
| Add a Firestore field | services/dbService.js (write + read sides) |
`;

// ═════════════════════════════════════════════════════════════════════════════
// Renderer
// ═════════════════════════════════════════════════════════════════════════════
const doc = new jsPDF({ unit: "mm", format: "a4" });

let cursorY = MARGIN_TOP;
let pageNum = 1;

function setFill(rgb)   { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
function setStroke(rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }
function setText(rgb)   { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }

function footer() {
  const y = PAGE_H - 10;
  setText(MID);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Localyze — Frontend Documentation", MARGIN_X, y);
  doc.text(`Page ${pageNum}`, PAGE_W - MARGIN_X, y, { align: "right" });
}

function newPage() {
  footer();
  doc.addPage();
  pageNum++;
  cursorY = MARGIN_TOP;
}

function ensureSpace(h) {
  if (cursorY + h > PAGE_H - MARGIN_BOTTOM) newPage();
}

// Cover page
function renderCover() {
  // Background band
  setFill(BRAND);
  doc.rect(0, 0, PAGE_W, 90, "F");

  setText([255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TECHNICAL DOCUMENTATION", MARGIN_X, 30);

  doc.setFontSize(30);
  doc.text("Localyze", MARGIN_X, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text("Frontend Architecture Guide", MARGIN_X, 62);

  doc.setFontSize(10);
  doc.text("React 19 + Vite + Firebase + i18next", MARGIN_X, 72);

  // Body
  setText(DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const intro =
    "This document is a reading guide for the React frontend of Localyze, a location-intelligence web app that scores business feasibility for any map location in Jordan. It covers every page, component, context, hook, service, and how they interact end-to-end.";
  const wrapped = doc.splitTextToSize(intro, CONTENT_W);
  doc.text(wrapped, MARGIN_X, 110);

  // Contents
  setText(BRAND_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Contents", MARGIN_X, 140);

  setText(DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const toc = [
    "1.  Tech Stack",
    "2.  Application Shell — How the App Boots",
    "3.  Global State — Contexts",
    "4.  Hooks",
    "5.  Services",
    "6.  Layout Components",
    "7.  Scan Components",
    "8.  Tutorial Components",
    "9.  UI Primitives",
    "10. Pages",
    "11. Data Flow: A Full Scan",
    "12. Internationalization",
    "13. Styling",
    "14. Assets & Constants",
    "15. Build & Run",
    '16. Quick Reference — "Where do I change X?"',
  ];
  let y = 150;
  for (const line of toc) {
    doc.text(line, MARGIN_X + 4, y);
    y += 6.5;
  }

  setText(MID);
  doc.setFontSize(8);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    MARGIN_X,
    PAGE_H - 14,
  );
  footer();
  doc.addPage();
  pageNum++;
  cursorY = MARGIN_TOP;
}

// ── Block-level renderers ───────────────────────────────────────────────────
function renderH1(text) {
  ensureSpace(20);
  cursorY += 4;
  setFill(BRAND);
  doc.rect(MARGIN_X, cursorY - 4, 4, 10, "F");
  setText(BRAND_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(text.replace(/^#\s+/, ""), MARGIN_X + 8, cursorY + 3);
  cursorY += 12;
  setStroke(LIGHT);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, cursorY, PAGE_W - MARGIN_X, cursorY);
  cursorY += 5;
}

function renderH2(text) {
  ensureSpace(14);
  cursorY += 4;
  setText(BRAND_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(text.replace(/^##\s+/, ""), MARGIN_X, cursorY + 2);
  cursorY += 7;
  setStroke(LIGHT);
  doc.setLineWidth(0.2);
  doc.line(MARGIN_X, cursorY, PAGE_W - MARGIN_X, cursorY);
  cursorY += 4;
}

function renderH3(text) {
  ensureSpace(10);
  cursorY += 2;
  setText(BRAND);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.text(text.replace(/^###\s+/, ""), MARGIN_X, cursorY + 2);
  cursorY += 6;
}

function renderParagraph(text) {
  setText(DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(text, CONTENT_W);
  for (const ln of lines) {
    ensureSpace(5);
    doc.text(ln, MARGIN_X, cursorY + 2);
    cursorY += 5;
  }
  cursorY += 1.5;
}

function renderBullet(text) {
  setText(DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const indent = 5;
  const lines = doc.splitTextToSize(text, CONTENT_W - indent);
  for (let i = 0; i < lines.length; i++) {
    ensureSpace(5);
    if (i === 0) {
      setFill(BRAND);
      doc.circle(MARGIN_X + 1.5, cursorY, 0.9, "F");
    }
    doc.text(lines[i], MARGIN_X + indent, cursorY + 2);
    cursorY += 5;
  }
}

function renderNumberedItem(num, text) {
  setText(DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const indent = 7;
  const lines = doc.splitTextToSize(text, CONTENT_W - indent);
  for (let i = 0; i < lines.length; i++) {
    ensureSpace(5);
    if (i === 0) {
      setText(BRAND_DARK);
      doc.setFont("helvetica", "bold");
      doc.text(`${num}.`, MARGIN_X, cursorY + 2);
      setText(DARK);
      doc.setFont("helvetica", "normal");
    }
    doc.text(lines[i], MARGIN_X + indent, cursorY + 2);
    cursorY += 5;
  }
}

function renderBlockquote(text) {
  const pad = 3;
  setText(DARK);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(text, CONTENT_W - 8);
  const h = lines.length * 5 + pad * 2;
  ensureSpace(h);
  setFill(BG_SOFT);
  doc.rect(MARGIN_X, cursorY, CONTENT_W, h, "F");
  setFill(BRAND);
  doc.rect(MARGIN_X, cursorY, 1.5, h, "F");
  let y = cursorY + pad + 3;
  for (const ln of lines) {
    doc.text(ln, MARGIN_X + 6, y);
    y += 5;
  }
  cursorY += h + 2;
  doc.setFont("helvetica", "normal");
}

function renderCodeBlock(lines) {
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  const pad = 3;
  const lineH = 4.2;
  // Render in chunks so we can page-break
  let i = 0;
  while (i < lines.length) {
    const remaining = (PAGE_H - MARGIN_BOTTOM - cursorY - pad * 2) / lineH;
    const chunk = lines.slice(i, i + Math.max(1, Math.floor(remaining)));
    const h = chunk.length * lineH + pad * 2;
    setFill([248, 246, 240]);
    doc.rect(MARGIN_X, cursorY, CONTENT_W, h, "F");
    setStroke(LIGHT);
    doc.setLineWidth(0.2);
    doc.rect(MARGIN_X, cursorY, CONTENT_W, h, "S");
    setText([60, 60, 60]);
    let y = cursorY + pad + 3;
    for (const raw of chunk) {
      // truncate long lines to fit monospace width
      const fit = doc.splitTextToSize(raw, CONTENT_W - pad * 2)[0] ?? raw;
      doc.text(fit, MARGIN_X + pad, y);
      y += lineH;
    }
    cursorY += h + 2;
    i += chunk.length;
    if (i < lines.length) newPage();
  }
  doc.setFont("helvetica", "normal");
}

function renderTable(rows) {
  // rows: array of arrays (strings). First row = header.
  if (rows.length === 0) return;
  const colCount = rows[0].length;
  const colW = CONTENT_W / colCount;
  const cellPad = 2;
  doc.setFontSize(9);
  const lineH = 4;

  function rowHeight(cells, font) {
    doc.setFont("helvetica", font);
    let maxLines = 1;
    for (const c of cells) {
      const wrapped = doc.splitTextToSize(c, colW - cellPad * 2);
      if (wrapped.length > maxLines) maxLines = wrapped.length;
    }
    return maxLines * lineH + cellPad * 2;
  }

  // Header
  const headerH = rowHeight(rows[0], "bold");
  ensureSpace(headerH + 2);
  setFill(BRAND);
  doc.rect(MARGIN_X, cursorY, CONTENT_W, headerH, "F");
  setText([255, 255, 255]);
  doc.setFont("helvetica", "bold");
  for (let c = 0; c < colCount; c++) {
    const cell = rows[0][c];
    const wrapped = doc.splitTextToSize(cell, colW - cellPad * 2);
    let y = cursorY + cellPad + 3;
    for (const ln of wrapped) {
      doc.text(ln, MARGIN_X + c * colW + cellPad, y);
      y += lineH;
    }
  }
  cursorY += headerH;

  // Body
  doc.setFont("helvetica", "normal");
  setText(DARK);
  for (let r = 1; r < rows.length; r++) {
    const h = rowHeight(rows[r], "normal");
    ensureSpace(h);
    if (r % 2 === 0) {
      setFill(BG_SOFT);
      doc.rect(MARGIN_X, cursorY, CONTENT_W, h, "F");
    }
    setStroke(LIGHT);
    doc.setLineWidth(0.15);
    doc.line(MARGIN_X, cursorY + h, PAGE_W - MARGIN_X, cursorY + h);

    setText(DARK);
    for (let c = 0; c < colCount; c++) {
      const cell = rows[r][c];
      const wrapped = doc.splitTextToSize(cell, colW - cellPad * 2);
      let y = cursorY + cellPad + 3;
      for (const ln of wrapped) {
        doc.text(ln, MARGIN_X + c * colW + cellPad, y);
        y += lineH;
      }
    }
    cursorY += h;
  }
  cursorY += 3;
  doc.setFont("helvetica", "normal");
  setText(DARK);
}

// ── Very small markdown-lite parser ─────────────────────────────────────────
function parseAndRender(md) {
  const lines = md.split(/\r?\n/);
  let i = 0;
  const flushTable = (tableLines) => {
    // Parse rows from `| a | b |` syntax. Ignore alignment rows.
    const rows = [];
    for (const raw of tableLines) {
      const trimmed = raw.trim();
      if (!trimmed.startsWith("|")) continue;
      const inner = trimmed.replace(/^\|/, "").replace(/\|$/, "");
      const cells = inner.split("|").map((s) => s.trim());
      // skip markdown separator rows (e.g. |---|---|)
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      rows.push(cells);
    }
    if (rows.length > 0) renderTable(rows);
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // Fenced code block
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimEnd().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      renderCodeBlock(codeLines);
      continue;
    }

    // Table (consecutive lines starting with |)
    if (line.startsWith("|")) {
      const tbl = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tbl.push(lines[i]);
        i++;
      }
      flushTable(tbl);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoted = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoted.push(lines[i].slice(2));
        i++;
      }
      renderBlockquote(quoted.join(" "));
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      renderH3(line);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      renderH2(line);
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      renderH1(line);
      i++;
      continue;
    }

    // Numbered list item
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      renderNumberedItem(numMatch[1], numMatch[2]);
      i++;
      continue;
    }

    // Bullet
    if (line.startsWith("- ")) {
      renderBullet(line.slice(2));
      i++;
      continue;
    }

    // Blank
    if (line === "") {
      cursorY += 2;
      i++;
      continue;
    }

    // Paragraph
    renderParagraph(line);
    i++;
  }
}

// ── Run ─────────────────────────────────────────────────────────────────────
renderCover();
parseAndRender(DOC);
footer();

const outPath = path.join(__dirname, "Localyze-Frontend-Documentation.pdf");
const ab = doc.output("arraybuffer");
fs.writeFileSync(outPath, Buffer.from(ab));
console.log("Wrote", outPath, `(${Buffer.from(ab).length} bytes, ${pageNum} pages)`);
