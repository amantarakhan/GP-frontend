import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { apiService } from "../services/apiService";
import { auth } from "../firebase";
import { saveReport as firestoreSaveReport } from "../services/dbService";
import i18n from "i18next";

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [businessType, setBusinessType] = useState("");
  const [subType,      setSubType]      = useState("");
  const [radius,       setRadius]       = useState(750);
  const [location,     setLocation]     = useState("");
  const [pin,          setPin]          = useState(null);

  // ── Scan result state ───────────────────────────────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults,  setHasResults]  = useState(false);
  const [results,     setResults]     = useState(null);
  const [rawScanData, setRawScanData] = useState(null);
  const [scanError,   setScanError]   = useState(null);

  // ── AI analysis state ───────────────────────────────────────────────────────
  const [isAiLoading,  setIsAiLoading]  = useState(false);
  const [aiAnalysis,   setAiAnalysis]   = useState(null);
  const [aiError,      setAiError]      = useState(null);
  const [hasAiResults, setHasAiResults] = useState(false);

  // ── Compare state ───────────────────────────────────────────────────────────
  const [comparePin,        setComparePin]        = useState(null);
  const [compareResults,    setCompareResults]    = useState(null);
  const [isComparing,       setIsComparing]       = useState(false);
  const [hasCompareResults, setHasCompareResults] = useState(false);
  const [compareError,      setCompareError]      = useState(null);
  const [compareMode,       setCompareMode]       = useState(false); // modal open
  const [comparePicking,    setComparePicking]    = useState(false); // slim banner mode

  // ── Actions ─────────────────────────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    if (!businessType || !pin) return;

    setIsAnalyzing(true);
    setHasResults(false);
    setScanError(null);
    setAiAnalysis(null);
    setHasAiResults(false);
    setAiError(null);
    setRawScanData(null);
    setComparePin(null);
    setCompareResults(null);
    setHasCompareResults(false);
    setCompareError(null);
    setCompareMode(false);
    setComparePicking(false);

    try {
      const { normalised, raw } = await apiService.runScan({
        businessType, subType, radius,
        lat: pin.lat, lng: pin.lng,
      });
      setResults(normalised);
      setRawScanData(raw);
      setHasResults(true);
    } catch (err) {
      console.error("[AnalysisContext] runAnalysis error:", err);
      setScanError(err.message ?? "An unexpected error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [businessType, subType, radius, pin]);

  const runAiAnalysis = useCallback(async () => {
    if (!rawScanData) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const language = i18n.language?.startsWith("ar") ? "ar" : "en";
      const analysisText = await apiService.analyzeResults(rawScanData, language);
      setAiAnalysis(analysisText);
      setHasAiResults(true);
    } catch (err) {
      console.error("[AnalysisContext] runAiAnalysis error:", err);
      setAiError(err.message ?? "AI analysis failed. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  }, [rawScanData]);

  const runCompareAnalysis = useCallback(async () => {
    if (!businessType || !comparePin) return;
    setIsComparing(true);
    setHasCompareResults(false);
    setCompareError(null);

    try {
      const { normalised } = await apiService.runScan({
        businessType,
        subType,
        radius,
        lat: comparePin.lat,
        lng: comparePin.lng,
      });
      setCompareResults(normalised);
      setHasCompareResults(true);
    } catch (err) {
      console.error("[AnalysisContext] runCompareAnalysis error:", err);
      setCompareError(err.message ?? "Comparison scan failed. Please try again.");
    } finally {
      setIsComparing(false);
    }
  }, [businessType, subType, radius, comparePin]);

  const resetCompare = useCallback(() => {
    setComparePin(null);
    setCompareResults(null);
    setHasCompareResults(false);
    setCompareError(null);
    setIsComparing(false);
    setCompareMode(false);
    setComparePicking(false);
  }, []);

  const resetAnalysis = useCallback(() => {
    setBusinessType("");
    setSubType("");
    setRadius(750);
    setLocation("");
    setPin(null);
    setResults(null);
    setHasResults(false);
    setIsAnalyzing(false);
    setScanError(null);
    setRawScanData(null);
    setAiAnalysis(null);
    setHasAiResults(false);
    setAiError(null);
    resetCompare();
  }, [resetCompare]);

  // Single source of truth for saving a report.
  // Always writes localStorage (sidebar badge stays accurate);
  // also writes Firestore when the user is authenticated.
  const saveCurrentReport = useCallback(async () => {
    if (!results || !pin) return null;
    const payload = {
      title:       `${businessType.charAt(0).toUpperCase() + businessType.slice(1)} — ${results.districtName}`,
      location:    results.districtName,
      date:        new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      score:       results.feasibility,
      competitors: results.competitors,
      saturation:  results.saturation,
      status:      results.feasibility >= 75 ? "strong" : results.feasibility >= 55 ? "moderate" : "weak",
      businessType,
      lat:         pin.lat,
      lng:         pin.lng,
      radius,
      fullResults: results,
      aiAnalysis:  aiAnalysis ?? null,
    };

    apiService.saveReport(payload);

    const user = auth.currentUser;
    if (user) {
      await firestoreSaveReport(user.uid, payload);
    }

    return payload;
  }, [results, pin, businessType, radius, aiAnalysis]);

  // ── Helpers (folded in from the former useLocationAnalysis hook) ────────────
  const handleMapClick = useCallback(({ lat, lng }) => {
    setPin({ lat, lng });
    setLocation(`Lat: ${lat}, Lng: ${lng}`);
  }, []);

  const radiusDisplay =
    radius < 1000 ? `${radius}m` : `${(radius / 1000).toFixed(1)} km`;

  const canRun = Boolean(businessType);

  // ── Memoised value: stable identity unless underlying state changes ─────────
  const value = useMemo(() => ({
    businessType, setBusinessType,
    subType,      setSubType,
    radius,       setRadius,
    location,     setLocation,
    pin,          setPin,
    isAnalyzing, hasResults, results, rawScanData, scanError,
    isAiLoading, hasAiResults, aiAnalysis, aiError,
    runAiAnalysis,
    comparePin,        setComparePin,
    compareResults,    setCompareResults,
    isComparing,       setIsComparing,
    hasCompareResults, setHasCompareResults,
    compareError,      setCompareError,
    compareMode,       setCompareMode,
    comparePicking,    setComparePicking,
    runCompareAnalysis,
    resetCompare,
    runAnalysis,
    resetAnalysis,
    saveCurrentReport,
    handleMapClick,
    radiusDisplay,
    canRun,
  }), [
    businessType, subType, radius, location, pin,
    isAnalyzing, hasResults, results, rawScanData, scanError,
    isAiLoading, hasAiResults, aiAnalysis, aiError,
    comparePin, compareResults, isComparing, hasCompareResults,
    compareError, compareMode, comparePicking,
    runAnalysis, runAiAnalysis, runCompareAnalysis, resetCompare,
    resetAnalysis, saveCurrentReport, handleMapClick,
    radiusDisplay, canRun,
  ]);

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used inside <AnalysisProvider>");
  return ctx;
}
