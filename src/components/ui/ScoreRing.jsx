import React, { useEffect, useState } from "react";

export default function ScoreRing({
  value   = 0,
  max     = 100,
  color   = "#3f7d58",
  track   = "#D1FAE5",
  size    = 80,
  showRaw = false,  // true → show raw number, false → percentage
}) {
  const [animated, setAnimated] = useState(0);
  const radius      = 30;
  const circ        = 2 * Math.PI * radius;
  const dashOffset  = circ - (animated / max) * circ;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 80);
    return () => clearTimeout(t);
  }, [value]);

  const display = showRaw ? value : `${value}%`;

  return (
    <div style={{ position:"relative", width:`${size}px`, height:`${size}px`, flexShrink:0 }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* Track */}
        <circle cx="40" cy="40" r={radius} fill="none" stroke={track}   strokeWidth="7" />
        {/* Progress */}
        <circle
          cx="40" cy="40" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 40 40)"
          style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{
        position:        "absolute",
        inset:           0,
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
      }}>
        <span style={{ fontFamily:"var(--font-display)", fontSize:"17px", fontWeight:700, color:"var(--color-dark)", lineHeight:1 }}>
          {display}
        </span>
      </div>
    </div>
  );
}