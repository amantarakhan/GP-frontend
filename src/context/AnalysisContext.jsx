import React, { createContext, useContext, useState, useCallback } from "react";
import { apiService } from "../services/apiService";

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [businessType, setBusinessType] = useState("");
  const [category,     setCategory]     = useState("");
  const [radius,       setRadius]       = useState(750);
  const [location,     setLocation]     = useState("");
  const [pin,          setPin]          = useState(null); // { lat, lng }

  // ── Result state ────────────────────────────────────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults,  setHasResults]  = useState(false);
  const [results,     setResults]     = useState(null);   // normalised metrics
  const [scanError,   setScanError]   = useState(null);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    if (!businessType || !pin) return;

    setIsAnalyzing(true);
    setHasResults(false);
    setScanError(null);

    try {
      const data = await apiService.runScan({
        businessType,
        category,
        radius,
        lat: pin.lat,
        lng: pin.lng,
      });

      setResults(data);
      setHasResults(true);
    } catch (err) {
      console.error("[AnalysisContext] runAnalysis error:", err);
      setScanError(err.message ?? "An unexpected error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [businessType, category, radius, pin]);

  const resetAnalysis = useCallback(() => {
    setResults(null);
    setHasResults(false);
    setIsAnalyzing(false);
    setScanError(null);
  }, []);

  // ── Save current scan as a report ─────────────────────────────────────────
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
      // Store full results so reports page can show details
      fullResults: results,
    };
    return apiService.saveReport(report);
  }, [results, pin, businessType, radius]);

  const value = {
    // form
    businessType, setBusinessType,
    category,     setCategory,
    radius,       setRadius,
    location,     setLocation,
    pin,          setPin,
    // results
    isAnalyzing,
    hasResults,
    results,
    scanError,
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