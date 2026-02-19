import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
  OverlayView,
} from "@react-google-maps/api";
import { useLocationAnalysis } from "../../hooks/useLocationAnalysis";
import { MOCK_COMPETITORS } from "../../constants";

// ── Map style: clean, muted "Localyze" aesthetic ─────────────────────────────
const MAP_STYLES = [
  { elementType: "geometry",        stylers: [{ color: "#eae8df" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f2e1" }] },
  { elementType: "labels.text.fill",   stylers: [{ color: "#687280" }] },
  { featureType: "water",           elementType: "geometry",        stylers: [{ color: "#c8dde8" }] },
  { featureType: "water",           elementType: "labels.text.fill",stylers: [{ color: "#8aadbe" }] },
  { featureType: "park",            elementType: "geometry",        stylers: [{ color: "#d1fae5" }] },
  { featureType: "road",            elementType: "geometry",        stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial",   elementType: "geometry",        stylers: [{ color: "#f0ece0" }] },
  { featureType: "road.highway",    elementType: "geometry",        stylers: [{ color: "#e0dcd0" }] },
  { featureType: "road.highway",    elementType: "geometry.stroke", stylers: [{ color: "#d4cfc3" }] },
  { featureType: "transit.station", elementType: "geometry",        stylers: [{ color: "#dfd2ae" }] },
  { featureType: "poi",             elementType: "geometry",        stylers: [{ color: "#dfd2ae" }] },
  { featureType: "poi.park",        elementType: "geometry",        stylers: [{ color: "#d1fae5" }] },
  { featureType: "administrative",  elementType: "geometry.stroke", stylers: [{ color: "#c9b99a" }] },
  { featureType: "landscape.man_made", elementType: "geometry",     stylers: [{ color: "#dad8cf" }] },
];

const MAP_OPTIONS = {
  styles:                   MAP_STYLES,
  disableDefaultUI:         false,
  zoomControl:              true,
  mapTypeControl:           false,
  streetViewControl:        false,
  fullscreenControl:        false,
  clickableIcons:           false,
  gestureHandling:          "greedy",
  zoomControlOptions: {
    position: 9, // RIGHT_BOTTOM
  },
};

const CONTAINER_STYLE = { width: "100%", height: "100%" };

// Default center (Amman, Jordan)
const DEFAULT_CENTER = { lat: 31.9454, lng: 35.9284 };

// ── Competitor dot colours ────────────────────────────────────────────────────
const STATUS_COLOR = {
  high:   "#dc2626",
  medium: "#b45309",
  low:    "#3f7d58",
};

const LIBRARIES = ["places"];

export default function MapContainer() {
  const { pin, radius, handleMapClick } = useLocationAnalysis();
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  // Keep competitor dot positions as real lat/lng offsets from pin
  const competitorPositions = MOCK_COMPETITORS.map((c, i) => {
    const center = pin
      ? { lat: Number(pin.lat), lng: Number(pin.lng) }
      : DEFAULT_CENTER;
    const angle  = (i / MOCK_COMPETITORS.length) * 2 * Math.PI;
    const dist   = (radius * 0.3 + (i % 3) * radius * 0.15) / 111000; // deg
    return {
      ...c,
      position: {
        lat: center.lat + dist * Math.cos(angle),
        lng: center.lng + dist * Math.sin(angle),
      },
    };
  });

  // Pan map when pin changes
  useEffect(() => {
    if (pin && mapRef.current) {
      mapRef.current.panTo({ lat: Number(pin.lat), lng: Number(pin.lng) });
    }
  }, [pin]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const onClick = useCallback(
    (e) => {
      const lat = e.latLng.lat().toFixed(4);
      const lng = e.latLng.lng().toFixed(4);
      handleMapClick({ lat, lng, x: 50, y: 50 }); // x/y kept for compat
    },
    [handleMapClick]
  );

  // ── Error / loading states ──────────────────────────────────────────────────
  if (loadError) {
    return (
      <MapError message="Failed to load Google Maps. Check your API key." />
    );
  }

  if (!isLoaded) {
    return (
      <div style={loadingWrapStyle}>
        <svg
          className="spin"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={2.5}
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", marginTop: "10px" }}>
          Loading map…
        </span>
      </div>
    );
  }

  const pinLatLng = pin
    ? { lat: Number(pin.lat), lng: Number(pin.lng) }
    : null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "inherit", overflow: "hidden" }}>
      <GoogleMap
        mapContainerStyle={CONTAINER_STYLE}
        center={pinLatLng ?? DEFAULT_CENTER}
        zoom={13}
        options={MAP_OPTIONS}
        onClick={onClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* ── Radius circle ── */}
        {pinLatLng && (
          <Circle
            center={pinLatLng}
            radius={radius}
            options={{
              strokeColor:   "#3f7d58",
              strokeOpacity: 0.9,
              strokeWeight:  1.8,
              fillColor:     "#3f7d58",
              fillOpacity:   0.09,
              strokeDashArray: "6 4",
            }}
          />
        )}

        {/* ── Main pin ── */}
        {pinLatLng && (
          <Marker
            position={pinLatLng}
            icon={{
              path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
              fillColor:    "#3f7d58",
              fillOpacity:  1,
              strokeColor:  "#2d5c3f",
              strokeWeight: 1.5,
              scale:        1.5,
              anchor:       new window.google.maps.Point(12, 22),
            }}
          />
        )}

        {/* ── Competitor markers ── */}
        {pinLatLng &&
          competitorPositions.map((c) => (
            <Marker
              key={c.id}
              position={c.position}
              title={`${c.name} · ${c.type}`}
              icon={{
                path:         window.google.maps.SymbolPath.CIRCLE,
                scale:        6,
                fillColor:    STATUS_COLOR[c.status] ?? "#687280",
                fillOpacity:  0.85,
                strokeColor:  "#ffffff",
                strokeWeight: 1.5,
              }}
            />
          ))}
      </GoogleMap>

      {/* ── Legend overlay ── */}
      <div style={{ position: "absolute", top: "14px", right: "14px", display: "flex", gap: "7px", pointerEvents: "none" }}>
        {[
          { color: "#c8dde8",  label: "Water" },
          { color: "#d1fae5",  label: "Park" },
          { color: "#3f7d58",  label: "Radius Zone" },
        ].map((l) => (
          <div
            key={l.label}
            style={{
              display:       "flex",
              alignItems:    "center",
              gap:           "5px",
              background:    "rgba(252,252,253,.92)",
              padding:       "4px 9px",
              borderRadius:  "20px",
              border:        "1px solid rgba(230,211,173,.6)",
              backdropFilter:"blur(8px)",
            }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: l.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)", fontWeight: 500 }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Competitor threat key ── */}
      <div
        style={{
          position:      "absolute",
          top:           "14px",
          left:          "14px",
          background:    "rgba(252,252,253,.95)",
          padding:       "8px 13px",
          borderRadius:  "10px",
          border:        "1px solid rgba(230,211,173,.6)",
          backdropFilter:"blur(8px)",
          boxShadow:     "var(--shadow-sm)",
          display:       "flex",
          flexDirection: "column",
          gap:           "5px",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "2px" }}>
          Threat Level
        </span>
        {[
          { color: "#dc2626", label: "High" },
          { color: "#b45309", label: "Medium" },
          { color: "#3f7d58", label: "Low" },
        ].map((t) => (
          <div key={t.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.color }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--color-dark)" }}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* ── Click CTA (shown before pin is placed) ── */}
      {!pinLatLng && (
        <div
          style={{
            position:      "absolute",
            bottom:        "14px",
            left:          "50%",
            transform:     "translateX(-50%)",
            display:       "flex",
            alignItems:    "center",
            gap:           "7px",
            background:    "rgba(252,252,253,.95)",
            padding:       "9px 16px",
            borderRadius:  "10px",
            border:        "1px solid rgba(230,211,173,.6)",
            backdropFilter:"blur(8px)",
            boxShadow:     "var(--shadow-sm)",
            pointerEvents: "none",
          }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2.5}>
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22,2 15,22 11,13 2,9 22,2" />
          </svg>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-dark)", fontWeight: 500 }}>
            Click anywhere on the map to set your target location
          </span>
        </div>
      )}

      {/* ── Coordinates bar (after pin placed) ── */}
      {pinLatLng && (
        <div
          style={{
            position:      "absolute",
            bottom:        "14px",
            left:          "14px",
            right:         "54px", // leave room for zoom controls
            background:    "rgba(252,252,253,.95)",
            borderRadius:  "10px",
            border:        "1px solid rgba(230,211,173,.5)",
            padding:       "9px 15px",
            display:       "flex",
            alignItems:    "center",
            justifyContent:"space-between",
            backdropFilter:"blur(8px)",
            boxShadow:     "var(--shadow-sm)",
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--color-brand)" }} />
            <span style={{ fontFamily: "monospace", fontSize: "11.5px", color: "var(--color-dark)", fontWeight: 500 }}>
              Lat: {pin.lat}, Lng: {pin.lng}
            </span>
          </div>
          <span
            style={{
              background:   "var(--color-accent)",
              color:        "var(--color-dark)",
              fontSize:     "10.5px",
              fontWeight:   700,
              padding:      "3px 10px",
              borderRadius: "20px",
              fontFamily:   "var(--font-body)",
            }}
          >
            {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius}m`} radius
          </span>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function MapError({ message }) {
  return (
    <div style={{ ...loadingWrapStyle, gap: "10px" }}>
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#dc2626", textAlign: "center", maxWidth: "260px" }}>
        {message}
      </span>
    </div>
  );
}

const loadingWrapStyle = {
  width:          "100%",
  height:         "100%",
  display:        "flex",
  flexDirection:  "column",
  alignItems:     "center",
  justifyContent: "center",
  background:     "#eae8df",
  borderRadius:   "inherit",
};