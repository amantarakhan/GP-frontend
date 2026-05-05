import React, { useCallback, useRef, useEffect, useMemo, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";
import { useAnalysis } from "../../context/AnalysisContext";

// ── Map style ─────────────────────────────────────────────────────────────────
const MAP_STYLES = [
  { elementType: "geometry",           stylers: [{ color: "#eae8df" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f2e1" }] },
  { elementType: "labels.text.fill",   stylers: [{ color: "#687280" }] },
  { featureType: "water",              elementType: "geometry",         stylers: [{ color: "#c8dde8" }] },
  { featureType: "water",              elementType: "labels",           stylers: [{ visibility: "off" }] },
  { featureType: "road",               elementType: "geometry",         stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial",      elementType: "geometry",         stylers: [{ color: "#f0ece0" }] },
  { featureType: "road.highway",       elementType: "geometry",         stylers: [{ color: "#e0dcd0" }] },
  { featureType: "road.highway",       elementType: "geometry.stroke",  stylers: [{ color: "#d4cfc3" }] },
  { featureType: "transit.station",    elementType: "geometry",         stylers: [{ color: "#dfd2ae" }] },
  { featureType: "poi",                elementType: "geometry",         stylers: [{ color: "#dfd2ae" }] },
  { featureType: "poi",                elementType: "labels",           stylers: [{ visibility: "off" }] },
  { featureType: "poi.park",           elementType: "geometry",         stylers: [{ color: "#d1fae5" }] },
  { featureType: "administrative",     elementType: "geometry.stroke",  stylers: [{ color: "#c9b99a" }] },
  { featureType: "landscape.man_made", elementType: "geometry",         stylers: [{ color: "#dad8cf" }] },
];

const MAP_OPTIONS = {
  styles:            MAP_STYLES,
  disableDefaultUI:  false,
  zoomControl:       true,
  mapTypeControl:    false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons:    false,
  gestureHandling:   "greedy",
  zoomControlOptions: { position: 9 },
};

const CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER  = { lat: 31.9454, lng: 35.9284 };

const LIBRARIES = ["places"];

export default function MapContainer() {
  const {
    pin, radius, handleMapClick,
    comparePicking, setComparePin, setComparePicking,
    comparePin,
  } = useAnalysis();

  const mapRef              = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Native overlay refs — managed imperatively to avoid @react-google-maps/api
  // prop-diffing bugs that leave stale circles/markers on the canvas.
  const circleRef            = useRef(null);
  const compareCircleRef     = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  // ── Pan to new primary pin ──────────────────────────────────────────────────
  useEffect(() => {
    if (pin && mapRef.current) {
      mapRef.current.panTo({ lat: Number(pin.lat), lng: Number(pin.lng) });
    }
  }, [pin]);

  // ── Primary radius circle (fully imperative) ────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    // Remove old circle first
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    if (!pin) return;

    circleRef.current = new window.google.maps.Circle({
      center:        { lat: Number(pin.lat), lng: Number(pin.lng) },
      radius,
      map:           mapRef.current,
      strokeColor:   "#3f7d58",
      strokeOpacity: 0.9,
      strokeWeight:  1.8,
      fillColor:     "#3f7d58",
      fillOpacity:   0.09,
    });

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, pin?.lat, pin?.lng, radius]);

  // ── Compare radius circle (fully imperative) ────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (compareCircleRef.current) {
      compareCircleRef.current.setMap(null);
      compareCircleRef.current = null;
    }

    if (!comparePin) return;

    compareCircleRef.current = new window.google.maps.Circle({
      center:        { lat: Number(comparePin.lat), lng: Number(comparePin.lng) },
      radius,
      map:           mapRef.current,
      strokeColor:   "#6366f1",
      strokeOpacity: 0.9,
      strokeWeight:  1.8,
      fillColor:     "#6366f1",
      fillOpacity:   0.09,
    });

    return () => {
      if (compareCircleRef.current) {
        compareCircleRef.current.setMap(null);
        compareCircleRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, comparePin?.lat, comparePin?.lng, radius]);

  // ── Map options (memoized to avoid style flash) ─────────────────────────────
  const mapOptions = useMemo(() => ({
    ...MAP_OPTIONS,
    draggableCursor: comparePicking ? "crosshair" : undefined,
  }), [comparePicking]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  const onUnmount = useCallback(() => {
    // Clean up all native overlays before map is destroyed
    if (circleRef.current)        { circleRef.current.setMap(null);        circleRef.current = null; }
    if (compareCircleRef.current) { compareCircleRef.current.setMap(null); compareCircleRef.current = null; }
    mapRef.current = null;
    setMapReady(false);
  }, []);

  const onClick = useCallback((e) => {
    const lat = e.latLng.lat().toFixed(4);
    const lng = e.latLng.lng().toFixed(4);

    if (comparePicking) {
      // Drop compare pin and collapse picking mode
      setComparePin({ lat, lng });
      setComparePicking(false);
    } else {
      handleMapClick({ lat, lng, x: 50, y: 50 });
    }
  }, [comparePicking, handleMapClick, setComparePin, setComparePicking]);

  if (loadError) return <MapError message="Failed to load Google Maps. Check your API key." />;

  if (!isLoaded) {
    return (
      <div style={loadingWrapStyle}>
        <svg className="spin" width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-brand)" strokeWidth={2.5}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", marginTop: "10px" }}>
          Loading map…
        </span>
      </div>
    );
  }

  const pinLatLng     = pin        ? { lat: Number(pin.lat),        lng: Number(pin.lng) }        : null;
  const comparePinLL  = comparePin ? { lat: Number(comparePin.lat), lng: Number(comparePin.lng) } : null;

  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      borderRadius: "inherit", overflow: "hidden",
      // Subtle blue tint overlay when in picking mode
      outline: comparePicking ? "3px solid rgba(99,102,241,.6)" : "none",
      transition: "outline .3s",
    }}>
      {/* ── Picking mode dim overlay ── */}
      {comparePicking && (
        <div style={{
          position:   "absolute", inset: 0, zIndex: 5,
          background: "rgba(99,102,241,.07)",
          pointerEvents: "none",
          animation: "fadeInOverlay .3s ease both",
        }} />
      )}

      <GoogleMap
        mapContainerStyle={CONTAINER_STYLE}
        center={pinLatLng ?? DEFAULT_CENTER}
        zoom={13}
        options={mapOptions}
        onClick={onClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Circles and competitor markers are managed imperatively via useEffect */}

        {/* ── Primary pin (green) ── */}
        {pinLatLng && (
          <Marker
            position={pinLatLng}
            label={comparePinLL ? {
              text: "A",
              color: "#fff",
              fontWeight: "700",
              fontSize: "11px",
              fontFamily: "var(--font-body)",
            } : undefined}
            icon={{
              path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
              fillColor:    "#3f7d58",
              fillOpacity:  1,
              strokeColor:  "#2d5c3f",
              strokeWeight: 1.5,
              scale:        1.6,
              anchor:       new window.google.maps.Point(12, 22),
            }}
          />
        )}

        {/* ── Compare pin (indigo) ── */}
        {comparePinLL && (
          <Marker
            position={comparePinLL}
            label={{
              text: "B",
              color: "#fff",
              fontWeight: "700",
              fontSize: "11px",
              fontFamily: "var(--font-body)",
            }}
            icon={{
              path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
              fillColor:    "#6366f1",
              fillOpacity:  1,
              strokeColor:  "#4338ca",
              strokeWeight: 1.5,
              scale:        1.6,
              anchor:       new window.google.maps.Point(12, 22),
            }}
          />
        )}

        {/* Competitor markers are managed imperatively via useEffect */}
      </GoogleMap>

      {/* ── Picking mode: animated crosshair in center ── */}
      {comparePicking && (
        <div style={{
          position:      "absolute",
          top:           "50%",
          left:          "50%",
          transform:     "translate(-50%, -50%)",
          zIndex:        10,
          pointerEvents: "none",
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          gap:           "10px",
          animation:     "crosshairDrop .4s cubic-bezier(.34,1.56,.64,1) both",
        }}>
          {/* Outer pulse ring */}
          <div style={{ position: "relative", width: "60px", height: "60px" }}>
            <div style={{
              position:     "absolute", inset: 0,
              borderRadius: "50%",
              border:       "2px solid rgba(99,102,241,.5)",
              animation:    "pulseRing 1.6s ease-out infinite",
            }} />
            <div style={{
              position:     "absolute", inset: "8px",
              borderRadius: "50%",
              border:       "2px solid rgba(99,102,241,.3)",
              animation:    "pulseRing 1.6s ease-out infinite .4s",
            }} />
            {/* Center pin drop */}
            <div style={{
              position:       "absolute",
              top:            "50%",
              left:           "50%",
              transform:      "translate(-50%, -50%)",
              width:          "20px",
              height:         "20px",
              borderRadius:   "50% 50% 50% 0",
              rotate:         "-45deg",
              background:     "linear-gradient(135deg, #6366f1, #4338ca)",
              boxShadow:      "0 4px 14px rgba(99,102,241,.5)",
              animation:      "pinBounce 1s ease-in-out infinite",
            }} />
          </div>
          <div style={{
            background:    "rgba(99,102,241,.9)",
            color:         "#fff",
            fontFamily:    "var(--font-body)",
            fontSize:      "11px",
            fontWeight:    700,
            padding:       "5px 12px",
            borderRadius:  "20px",
            letterSpacing: ".5px",
            backdropFilter:"blur(8px)",
            whiteSpace:    "nowrap",
          }}>
            Click to drop Location B
          </div>
        </div>
      )}

      {/* ── Legend overlay ── */}
      {!comparePicking && (
        <div style={{ position: "absolute", top: "14px", right: "14px", display: "flex", gap: "7px", pointerEvents: "none" }}>
          {[
            { color: "#c8dde8", label: "Water"       },
            { color: "#d1fae5", label: "Park"        },
            { color: "#3f7d58", label: "Radius Zone" },
          ].map((l) => (
            <div key={l.label} style={{
              display: "flex", alignItems: "center", gap: "5px",
              background: "rgba(252,252,253,.92)", padding: "4px 9px",
              borderRadius: "20px", border: "1px solid rgba(230,211,173,.6)",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: l.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--color-text)", fontWeight: 500 }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Pin labels legend (when both pins exist) ── */}
      {pinLatLng && comparePinLL && !comparePicking && (
        <div style={{
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
          gap:           "6px",
          pointerEvents: "none",
          animation:     "fadeInOverlay .3s ease both",
        }}>
          {[
            { letter: "A", color: "#3f7d58", label: "Location A" },
            { letter: "B", color: "#6366f1", label: "Location B" },
          ].map((p) => (
            <div key={p.letter} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{
                width: "18px", height: "18px", borderRadius: "50%",
                background: p.color, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "9px", fontWeight: 700, color: "#fff" }}>
                  {p.letter}
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--color-dark)" }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Threat level key (no pins) ── */}
      {!pinLatLng && (
        <div style={{
          position: "absolute", top: "14px", left: "14px",
          background: "rgba(252,252,253,.95)", padding: "8px 13px",
          borderRadius: "10px", border: "1px solid rgba(230,211,173,.6)",
          backdropFilter: "blur(8px)", boxShadow: "var(--shadow-sm)",
          display: "flex", flexDirection: "column", gap: "5px", pointerEvents: "none",
        }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "2px" }}>
            Threat Level
          </span>
          {[
            { color: "#dc2626", label: "High"   },
            { color: "#b45309", label: "Medium" },
            { color: "#3f7d58", label: "Low"    },
          ].map((t) => (
            <div key={t.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.color }} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--color-dark)" }}>{t.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Click CTA (no pin yet) ── */}
      {!pinLatLng && !comparePicking && (
        <div style={{
          position: "absolute", bottom: "14px", left: "50%",
          transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: "7px",
          background: "rgba(252,252,253,.95)", padding: "9px 16px",
          borderRadius: "10px", border: "1px solid rgba(230,211,173,.6)",
          backdropFilter: "blur(8px)", boxShadow: "var(--shadow-sm)",
          pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2.5}>
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22,2 15,22 11,13 2,9 22,2" />
          </svg>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-dark)", fontWeight: 500 }}>
            Click anywhere on the map to set your target location
          </span>
        </div>
      )}

      {/* ── Coordinates bar ── */}
      {pinLatLng && !comparePicking && (
        <div style={{
          position: "absolute", bottom: "14px", left: "14px", right: "54px",
          background: "rgba(252,252,253,.95)", borderRadius: "10px",
          border: "1px solid rgba(230,211,173,.5)", padding: "9px 15px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backdropFilter: "blur(8px)", boxShadow: "var(--shadow-sm)", pointerEvents: "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--color-brand)" }} />
            <span style={{ fontFamily: "monospace", fontSize: "11.5px", color: "var(--color-dark)", fontWeight: 500 }}>
              Lat: {pin.lat}, Lng: {pin.lng}
            </span>
          </div>
          <span style={{
            background: "var(--color-accent)", color: "var(--color-dark)",
            fontSize: "10.5px", fontWeight: 700, padding: "3px 10px",
            borderRadius: "20px", fontFamily: "var(--font-body)",
          }}>
            {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius}m`} radius
          </span>
        </div>
      )}

      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes crosshairDrop {
          from { opacity: 0; transform: translate(-50%, -60%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes pinBounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0);    }
          50%       { transform: translate(-50%, -50%) translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

function MapError({ message }) {
  return (
    <div style={{ ...loadingWrapStyle, gap: "10px" }}>
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8"  x2="12"    y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#dc2626", textAlign: "center", maxWidth: "260px" }}>
        {message}
      </span>
    </div>
  );
}

const loadingWrapStyle = {
  width: "100%", height: "100%",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  background: "#eae8df", borderRadius: "inherit",
};