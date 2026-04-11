import React, { createContext, useContext, useState, useCallback } from "react";
import { apiService } from "../services/apiService";
import i18n from "i18next";

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [businessType, setBusinessType] = useState("");
  const [category,     setCategory]     = useState("");
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
    // Reset compare too on new primary scan
    setComparePin(null);
    setCompareResults(null);
    setHasCompareResults(false);
    setCompareError(null);
    setCompareMode(false);
    setComparePicking(false);

    try {
      const { normalised, raw } = await apiService.runScan({
        businessType, category, radius,
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
  }, [businessType, category, radius, pin]);

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

  /**
   * Run a comparison scan for the second pin.
   * Uses same businessType, category, radius as the primary scan.
   */
  const runCompareAnalysis = useCallback(async () => {
    if (!businessType || !comparePin) return;
    setIsComparing(true);
    setHasCompareResults(false);
    setCompareError(null);

    try {
      const { normalised } = await apiService.runScan({
        businessType,
        category,
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
  }, [businessType, category, radius, comparePin]);

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
    // form
    setBusinessType("");
    setCategory("");
    setRadius(750);
    setLocation("");
    setPin(null);
    // results
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

  const saveCurrentReport = useCallback(() => {
    if (!results || !pin) return null;
    const report = {
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
    return apiService.saveReport(report);
  }, [results, pin, businessType, radius, aiAnalysis]);

  const value = {
    // form
    businessType, setBusinessType,
    category,     setCategory,
    radius,       setRadius,
    location,     setLocation,
    pin,          setPin,
    // scan results
    isAnalyzing, hasResults, results, rawScanData, scanError,
    // AI
    isAiLoading, hasAiResults, aiAnalysis, aiError,
    runAiAnalysis,
    // compare
    comparePin,        setComparePin,
    compareResults,    setCompareResults,
    isComparing,       setIsComparing,
    hasCompareResults, setHasCompareResults,
    compareError,      setCompareError,
    compareMode,       setCompareMode,
    comparePicking,    setComparePicking,
    runCompareAnalysis,
    resetCompare,
    // actions
    runAnalysis,
    resetAnalysis,
    saveCurrentReport,
  };

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