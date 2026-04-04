import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../firebase";

const storageKey = (uid) => `localyze_tutorial_done_${uid}`;

const PAD    = 10;   // breathing room around the spotlighted element
const RADIUS = 14;   // rounded-corner radius on the cutout
const ARROW  = 8;    // tooltip arrow size
const OVERLAY_RGBA = "rgba(0, 0, 0, 0.72)";

// ── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Localyze!",
    body: "Localyze helps you analyze market viability for any business location. This quick tour will highlight the key parts of the interface.",
    target: '[data-tutorial="welcome-header"]',
    placement: "bottom",
    route: "/dashboard",
  },
  {
    id: "sidebar",
    title: "Navigate the App",
    body: "Use the sidebar to move between sections: Dashboard, Scan, Reports, Compare, and Appendix.",
    target: '[data-tutorial="sidebar"]',
    placement: "right",
  },
  {
    id: "scan-nav",
    title: "Start a New Scan",
    body: 'Click "New Scan" to open the analysis page where you can pick a business type, set a radius, and drop a pin on the map.',
    target: '[data-tutorial="nav-scan"]',
    placement: "right",
  },
  {
    id: "dashboard-stats",
    title: "Your Activity at a Glance",
    body: "The dashboard shows aggregate stats across all your saved reports — feasibility averages, competitor counts, and saturation.",
    target: '[data-tutorial="stat-grid"]',
    placement: "bottom",
    route: "/dashboard",
  },
  {
    id: "save",
    title: "Save & Track Reports",
    body: 'After running a scan, click "Save Report" in the top bar. Saved reports appear on your Dashboard and Reports page.',
    target: '[data-tutorial="save-report"]',
    placement: "bottom",
  },
  {
    id: "cta",
    title: "Ready to Go!",
    body: "That's it! Click the button below to start your first scan. Happy analyzing!",
    target: '[data-tutorial="start-scan-btn"]',
    placement: "top",
    route: "/dashboard",
  },
];

// ── Build an SVG path string for clip-path ───────────────────────────────────
// Outer rectangle (clockwise) + inner rounded-rect (counter-clockwise).
// With `evenodd` fill rule the inner rect becomes a transparent cutout.
function buildClipPath(rect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!rect) return "none"; // no clip → full overlay

  const x = rect.left - PAD;
  const y = rect.top  - PAD;
  const w = rect.width  + PAD * 2;
  const h = rect.height + PAD * 2;
  const r = Math.min(RADIUS, w / 2, h / 2);

  // Outer rect
  const outer = `M0,0 H${vw} V${vh} H0 Z`;

  // Inner rounded rect (counter-clockwise so evenodd cuts it out)
  const inner = [
    `M${x + r},${y}`,
    `H${x + w - r}`,
    `Q${x + w},${y} ${x + w},${y + r}`,
    `V${y + h - r}`,
    `Q${x + w},${y + h} ${x + w - r},${y + h}`,
    `H${x + r}`,
    `Q${x},${y + h} ${x},${y + h - r}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    "Z",
  ].join(" ");

  return `path(evenodd, "${outer} ${inner}")`;
}

// ── Tooltip positioning ──────────────────────────────────────────────────────
function computeTooltipPos(rect, placement, tw, th) {
  if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };

  const GAP = 18;
  const vw  = window.innerWidth;
  const vh  = window.innerHeight;
  let top, left;

  switch (placement) {
    case "right":
      top  = rect.top + rect.height / 2 - th / 2;
      left = rect.right + PAD + GAP;
      // fall back to left if off-screen
      if (left + tw > vw - 12) { left = rect.left - PAD - GAP - tw; }
      break;
    case "left":
      top  = rect.top + rect.height / 2 - th / 2;
      left = rect.left - PAD - GAP - tw;
      if (left < 12) { left = rect.right + PAD + GAP; }
      break;
    case "bottom":
      top  = rect.bottom + PAD + GAP;
      left = rect.left + rect.width / 2 - tw / 2;
      if (top + th > vh - 12) { top = rect.top - PAD - GAP - th; }
      break;
    case "top":
    default:
      top  = rect.top - PAD - GAP - th;
      left = rect.left + rect.width / 2 - tw / 2;
      if (top < 12) { top = rect.bottom + PAD + GAP; }
      break;
  }

  top  = Math.max(12, Math.min(top,  vh - th - 12));
  left = Math.max(12, Math.min(left, vw - tw - 12));
  return { top, left };
}

// ── Arrow ────────────────────────────────────────────────────────────────────
function Arrow({ placement }) {
  const s = { position: "absolute", width: 0, height: 0, borderStyle: "solid" };
  const A = ARROW;
  const props = {
    right:  { top: "50%", left: -A, transform: "translateY(-50%)",
              borderWidth: `${A}px ${A}px ${A}px 0`,
              borderColor: "transparent var(--color-card) transparent transparent" },
    left:   { top: "50%", right: -A, transform: "translateY(-50%)",
              borderWidth: `${A}px 0 ${A}px ${A}px`,
              borderColor: "transparent transparent transparent var(--color-card)" },
    top:    { bottom: -A, left: "50%", transform: "translateX(-50%)",
              borderWidth: `${A}px ${A}px 0 ${A}px`,
              borderColor: "var(--color-card) transparent transparent transparent" },
    bottom: { top: -A, left: "50%", transform: "translateX(-50%)",
              borderWidth: `0 ${A}px ${A}px ${A}px`,
              borderColor: "transparent transparent var(--color-card) transparent" },
  };
  return <div style={{ ...s, ...(props[placement] || props.bottom) }} />;
}

// ═════════════════════════════════════════════════════════════════════════════
export default function TutorialOverlay() {
  const [step, setStep]         = useState(0);
  const [visible, setVisible]   = useState(false);
  const [exiting, setExiting]   = useState(false);
  const [rect, setRect]         = useState(null);   // target bounding rect
  const tooltipRef              = useRef(null);
  const [ttSize, setTtSize]     = useState({ w: 320, h: 220 });
  const navigate = useNavigate();
  const location = useLocation();

  // ── Show for first-time users ──────────────────────────────────────────────
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) return;
      if (!localStorage.getItem(storageKey(user.uid))) setVisible(true);
    });
    return unsub;
  }, []);

  // ── Measure the spotlighted element ────────────────────────────────────────
  const measure = useCallback((shouldScroll = false) => {
    const cur = STEPS[step];
    if (!cur?.target) { setRect(null); return; }
    const el = document.querySelector(cur.target);
    if (!el) { setRect(null); return; }

    // Scroll the target into view if it's off-screen
    if (shouldScroll) {
      const b = el.getBoundingClientRect();
      const inView = b.top >= 0 && b.bottom <= window.innerHeight;
      if (!inView) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Re-measure after scroll settles
        setTimeout(() => {
          const b2 = el.getBoundingClientRect();
          setRect({ top: b2.top, left: b2.left, width: b2.width, height: b2.height,
                    right: b2.right, bottom: b2.bottom });
        }, 400);
        return;
      }
    }

    const b = el.getBoundingClientRect();
    setRect({ top: b.top, left: b.left, width: b.width, height: b.height,
              right: b.right, bottom: b.bottom });
  }, [step]);

  // Re-measure on step change, route change, resize, scroll
  useEffect(() => {
    if (!visible) return;

    const cur = STEPS[step];
    if (cur.route && location.pathname !== cur.route) navigate(cur.route);

    // Two passes: immediate + after animations settle (with scroll on first pass)
    const t1 = setTimeout(() => measure(true), 50);
    const t2 = setTimeout(() => measure(false), 400);

    window.addEventListener("resize",  measure);
    window.addEventListener("scroll",  measure, true);
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener("resize",  measure);
      window.removeEventListener("scroll",  measure, true);
    };
  }, [step, visible, measure, navigate, location.pathname]);

  // ── Measure tooltip size for smart positioning ─────────────────────────────
  useEffect(() => {
    if (!tooltipRef.current) return;
    setTtSize({ w: tooltipRef.current.offsetWidth,
                h: tooltipRef.current.offsetHeight });
  }, [step, rect]);

  // ── Dismiss ────────────────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      const uid = auth.currentUser?.uid;
      if (uid) localStorage.setItem(storageKey(uid), "true");
      setVisible(false);
      setExiting(false);
      setStep(0);
    }, 340);
  }, []);

  const next = () => (step < STEPS.length - 1 ? setStep((s) => s + 1) : dismiss());
  const prev = () => step > 0 && setStep((s) => s - 1);

  if (!visible) return null;

  const cur       = STEPS[step];
  const isLast    = step === STEPS.length - 1;
  const hasTarget = !!rect;
  const ttPos     = computeTooltipPos(hasTarget ? rect : null, cur.placement, ttSize.w, ttSize.h);
  const clipPath  = buildClipPath(hasTarget ? rect : null);

  // ── Render into document.body via portal ───────────────────────────────────
  return createPortal(
    <div className="tutorial-root">

      {/* ── OVERLAY — a single div covering the viewport ── */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width:  "100vw",
          height: "100vh",
          zIndex: 9000,
          background: OVERLAY_RGBA,
          clipPath: clipPath,
          WebkitClipPath: clipPath,       /* Safari */
          transition: "clip-path .35s cubic-bezier(.4,0,.2,1), -webkit-clip-path .35s cubic-bezier(.4,0,.2,1)",
          animation: exiting ? "tut-fadeOut .34s ease forwards" : "tut-fadeIn .25s ease both",
        }}
      />

      {/* ── SPOTLIGHT RING — subtle glow around the cutout ── */}
      {hasTarget && (
        <div
          style={{
            position: "fixed",
            zIndex: 9000,
            top:    rect.top  - PAD,
            left:   rect.left - PAD,
            width:  rect.width  + PAD * 2,
            height: rect.height + PAD * 2,
            borderRadius: RADIUS,
            border: "2px solid rgba(63,125,88,.5)",
            pointerEvents: "none",
            transition: "all .35s cubic-bezier(.4,0,.2,1)",
            animation: "tut-pulse 2s ease-in-out infinite",
            opacity: exiting ? 0 : 1,
          }}
        />
      )}

      {/* ── TOOLTIP ── */}
      <div
        ref={tooltipRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          zIndex: 9001,
          width: 320,
          top:  typeof ttPos.top  === "number" ? ttPos.top  : ttPos.top,
          left: typeof ttPos.left === "number" ? ttPos.left : ttPos.left,
          transform: ttPos.transform || "none",
          background: "var(--color-card)",
          borderRadius: 16,
          border: "1px solid rgba(230,211,173,.7)",
          boxShadow: "0 20px 60px rgba(0,0,0,.3), 0 4px 16px rgba(0,0,0,.18)",
          overflow: "visible",
          animation: exiting
            ? "tut-fadeOut .34s ease forwards"
            : "tut-tooltipIn .4s cubic-bezier(.34,1.28,.64,1) both",
        }}
      >
        {hasTarget && cur.placement && <Arrow placement={cur.placement} />}

        {/* Progress bar */}
        <div style={{ height: 3, background: "rgba(230,211,173,.4)",
                      borderRadius: "16px 16px 0 0", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${((step + 1) / STEPS.length) * 100}%`,
            background: "linear-gradient(90deg,var(--color-brand),var(--color-brand-dark))",
            transition: "width .4s ease",
          }} />
        </div>

        <div style={{ padding: "20px 24px 18px" }}>
          {/* Step label */}
          <div style={{
            fontFamily: "var(--font-body)", fontSize: 9.5, fontWeight: 700,
            color: "var(--color-brand)", letterSpacing: 2.5,
            textTransform: "uppercase", marginBottom: 8,
          }}>
            Step {step + 1} of {STEPS.length}
          </div>

          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700,
            color: "var(--color-dark)", letterSpacing: -0.3,
            margin: 0, marginBottom: 8,
          }}>
            {cur.title}
          </h2>

          <p style={{
            fontFamily: "var(--font-body)", fontSize: 13,
            color: "var(--color-text)", lineHeight: 1.65, margin: 0,
          }}>
            {cur.body}
          </p>

          {/* Dots */}
          <div style={{ display: "flex", gap: 5, marginTop: 18, marginBottom: 16 }}>
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)} style={{
                width: i === step ? 20 : 7, height: 7, borderRadius: 4,
                background: i === step ? "var(--color-brand)" : "rgba(230,211,173,.8)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all .3s ease",
              }} />
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center",
                        justifyContent: "space-between", gap: 10 }}>
            <button
              onClick={dismiss}
              style={{
                fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
                color: "var(--color-text)", background: "none", border: "none",
                cursor: "pointer", padding: "6px 4px", opacity: .7,
              }}
            >
              Skip tutorial
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              {step > 0 && (
                <button onClick={prev} style={{
                  fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600,
                  color: "var(--color-brand)", background: "rgba(63,125,88,.07)",
                  border: "1px solid rgba(63,125,88,.2)", borderRadius: "var(--radius-md)",
                  padding: "8px 14px", cursor: "pointer",
                }}>
                  Back
                </button>
              )}

              <button onClick={next} style={{
                fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
                border: "none", borderRadius: "var(--radius-md)",
                padding: "8px 18px", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(63,125,88,.32)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {isLast ? "Get Started" : "Next"}
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2.5}>
                  {isLast
                    ? <polyline points="20,6 9,17 4,12" />
                    : <path d="M5 12h14M12 5l7 7-7 7" />}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
