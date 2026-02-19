import React, { createContext, useContext, useState, useCallback } from "react";

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [businessType, setBusinessType] = useState("");
  const [category,     setCategory]     = useState("");
  const [radius,       setRadius]       = useState(750);
  const [location,     setLocation]     = useState("");
  const [pin,          setPin]          = useState(null); // { x, y, lat, lng }

  // ── Result state ────────────────────────────────────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults,  setHasResults]  = useState(false);
  const [results,     setResults]     = useState(null);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const runAnalysis = useCallback(() => {
    if (!businessType) return;
    setIsAnalyzing(true);
    setHasResults(false);

    // Simulate API call — swap with apiService.runScan() when ready
    setTimeout(() => {
      setResults({
        feasibility:  Math.floor(65 + Math.random() * 30),
        competitors:  Math.floor(5  + Math.random() * 20),
        saturation:   Math.floor(20 + Math.random() * 60),
        footTraffic:  Math.floor(60 + Math.random() * 35),
        demandSignal: Math.floor(55 + Math.random() * 40),
        dataPoints:   `${(20000 + Math.floor(Math.random() * 8000)).toLocaleString()} POIs`,
        coverage:     `${(1.2 + Math.random()).toFixed(2)} km²`,
      });
      setIsAnalyzing(false);
      setHasResults(true);
    }, 1800);
  }, [businessType]);

  const resetAnalysis = useCallback(() => {
    setResults(null);
    setHasResults(false);
    setIsAnalyzing(false);
  }, []);

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
    // actions
    runAnalysis,
    resetAnalysis,
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