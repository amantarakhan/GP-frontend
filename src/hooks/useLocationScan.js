import { useState, useCallback } from "react";

const SCAN_BASE_URL = "https://localyze.onrender.com";

/**
 * useLocationScan
 *
 * A standalone hook that fetches from the /scan-location endpoint.
 * Use this if you need scan functionality outside of AnalysisContext,
 * for example in a self-contained Search component.
 *
 * Usage:
 *   const { scan, results, isLoading, error } = useLocationScan();
 *
 *   // Then trigger on button click:
 *   <button onClick={() => scan({ lat, lng, radius, place_type })}>
 *     Search
 *   </button>
 */
export function useLocationScan() {
  const [results,   setResults]   = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  /**
   * Trigger a scan.
   * @param {{
   *   lat:        number | string,
   *   lng:        number | string,
   *   radius:     number,
   *   place_type: string,   // matches the API param name exactly
   *   category?:  string,   // optional
   * }} params
   */
  const scan = useCallback(async ({ lat, lng, radius, place_type, category }) => {
    // Guard: require coords and a place type
    if (!lat || !lng || !place_type) {
      setError("lat, lng, and place_type are required.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    const url = new URL(`${SCAN_BASE_URL}/scan-location`);
    url.searchParams.set("lat",        lat);
    url.searchParams.set("lng",        lng);
    url.searchParams.set("radius",     radius ?? 750);
    url.searchParams.set("place_type", place_type);

    if (category && category.trim() !== "") {
      url.searchParams.set("category", category.trim());
    }

    try {
      const response = await fetch(url.toString(), {
        method:  "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      // Distinguish network errors from server errors
      if (err.name === "TypeError") {
        setError("Network error — please check your connection and try again.");
      } else {
        setError(err.message ?? "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Clear everything back to initial state */
  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { scan, results, isLoading, error, reset };
}