import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { auth } from "../../firebase";
import { useAnalysis } from "../../context/AnalysisContext";

const STORAGE_KEY = (uid) => `localyze_compare_tip_seen_${uid}`;
const PAD    = 12;
const RADIUS = 50;  // large radius → circular cutout around the icon
const ARROW  = 8;
const OVERLAY_RGBA = "rgba(0, 0, 0, 0.72)";

// ── Circular clip-path ───────────────────────────────────────────────────────
// Outer full-screen rect + inner circle via 4 arcs (approximation of a circle
// using cubic Bézier / SVG arcs isn't needed — we use a rounded rect whose
// radius equals half the size, making it a perfect circle).
function buildCircleClipPath(cx, cy, r) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const d = r * 2;

  const outer = `M0,0 H${vw} V${vh} H0 Z`;
  const x = cx - r;
  const y = cy - r;

  // A rounded rect with rx=ry=r and equal width/height = 2r is a circle
  const inner = [
    `M${x + r},${y}`,
    `H${x + d - r}`,
    `Q${x + d},${y} ${x + d},${y + r}`,
    `V${y + d - r}`,
    `Q${x + d},${y + d} ${x + d - r},${y + d}`,
    `H${x + r}`,
    `Q${x},${y + d} ${x},${y + d - r}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    "Z",
  ].join(" ");

  return `path(evenodd, "${outer} ${inner}")`;
}

// ═════════════════════════════════════════════════════════════════════════════
export default function CompareSpotlight() {
  const { hasResults }  = useAnalysis();
  const [show, setShow] = useState(false);
  const [rect, setRect] = useState(null);
  const [exiting, setExiting] = useState(false);
  const prevHasResults  = useRef(false);
  const tooltipRef      = useRef(null);
  const [ttSize, setTtSize] = useState({ w: 300, h: 160 });

  // ── Trigger on first scan completion ───────────────────────────────────────
  useEffect(() => {
    // Detect the transition: hasResults went from false → true
    if (hasResults && !prevHasResults.current) {
      const uid = auth.currentUser?.uid;
      if (uid && !localStorage.getItem(STORAGE_KEY(uid))) {
        // Small delay so the Compare nav item renders & animates in
        setTimeout(() => setShow(true), 600);
      }
    }
    prevHasResults.current = hasResults;
  }, [hasResults]);

  // ── Measure the Compare nav item ──────────────────────────────────────────
  const measure = useCallback(() => {
    const el = document.querySelector('[data-tutorial="nav-compare"]');
    if (!el) { setRect(null); return; }
    const b = el.getBoundingClientRect();
    setRect({ top: b.top, left: b.left, width: b.width, height: b.height,
              right: b.right, bottom: b.bottom });
  }, []);

  useEffect(() => {
    if (!show) return;
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener("resize", measure); };
  }, [show, measure]);

  // ── Measure tooltip ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tooltipRef.current) return;
    setTtSize({ w: tooltipRef.current.offsetWidth, h: tooltipRef.current.offsetHeight });
  }, [rect]);

  // ── Dismiss ────────────────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      const uid = auth.currentUser?.uid;
      if (uid) localStorage.setItem(STORAGE_KEY(uid), "true");
      setShow(false);
      setExiting(false);
    }, 340);
  }, []);

  if (!show || !rect) return null;

  // Circle center = center of the nav icon
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const spotRadius = Math.max(rect.width, rect.height) / 2 + PAD;
  const clipPath = buildCircleClipPath(cx, cy, spotRadius);

  // Tooltip to the right of the icon
  const ttTop  = Math.max(12, cy - ttSize.h / 2);
  const ttLeft = rect.right + PAD + 18;

  return createPortal(
    <div className="compare-spotlight-root">

      {/* ── Overlay with circular cutout ── */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "100vw", height: "100vh",
          zIndex: 9000,
          background: OVERLAY_RGBA,
          clipPath,
          WebkitClipPath: clipPath,
          animation: exiting ? "tut-fadeOut .34s ease forwards" : "tut-fadeIn .3s ease both",
        }}
      />

      {/* ── Circular glow ring ── */}
      <div
        style={{
          position: "fixed", zIndex: 9000,
          top: cy - spotRadius, left: cx - spotRadius,
          width: spotRadius * 2, height: spotRadius * 2,
          borderRadius: "50%",
          border: "2.5px solid rgba(63,125,88,.55)",
          pointerEvents: "none",
          animation: "tut-pulse 2s ease-in-out infinite",
          opacity: exiting ? 0 : 1,
        }}
      />

      {/* ── Tooltip card ── */}
      <div
        ref={tooltipRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", zIndex: 9001,
          width: 300,
          top: ttTop, left: ttLeft,
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
        {/* Arrow pointing left toward the icon */}
        <div style={{
          position: "absolute", width: 0, height: 0, borderStyle: "solid",
          top: "50%", left: -ARROW, transform: "translateY(-50%)",
          borderWidth: `${ARROW}px ${ARROW}px ${ARROW}px 0`,
          borderColor: "transparent var(--color-card) transparent transparent",
        }} />

        <div style={{ padding: "20px 22px 18px" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 20, marginBottom: 12,
            background: "rgba(63,125,88,.1)", border: "1px solid rgba(63,125,88,.25)",
          }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                 stroke="var(--color-brand)" strokeWidth={2.5}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            <span style={{
              fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700,
              color: "var(--color-brand)", textTransform: "uppercase", letterSpacing: 1.5,
            }}>
              New Feature Unlocked
            </span>
          </div>

          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700,
            color: "var(--color-dark)", margin: 0, marginBottom: 8,
          }}>
            Compare Locations
          </h2>

          <p style={{
            fontFamily: "var(--font-body)", fontSize: 13,
            color: "var(--color-text)", lineHeight: 1.65, margin: 0, marginBottom: 18,
          }}>
            You can now compare this location's data with other areas here.
            Use it to find the best spot for your business.
          </p>

          <button
            onClick={dismiss}
            style={{
              fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700,
              color: "#fff", width: "100%",
              background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
              border: "none", borderRadius: "var(--radius-md)",
              padding: "10px 18px", cursor: "pointer",
              boxShadow: "0 4px 14px rgba(63,125,88,.32)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            Got it!
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2.5}>
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
