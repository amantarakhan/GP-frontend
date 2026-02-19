import React from "react";

export default function SkeletonBlock({ width = "100%", height = "16px", style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: "6px",
        background:   "linear-gradient(90deg, rgba(230,211,173,.4) 25%, rgba(230,211,173,.7) 50%, rgba(230,211,173,.4) 75%)",
        backgroundSize: "200% 100%",
        animation:    "shimmer 1.4s infinite",
        ...style,
      }}
    />
  );
}

// Inject shimmer keyframe once
if (typeof document !== "undefined" && !document.getElementById("skeleton-style")) {
  const s = document.createElement("style");
  s.id = "skeleton-style";
  s.textContent = `@keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }`;
  document.head.appendChild(s);
}