import { useCallback } from "react";
import { useAnalysis } from "../context/AnalysisContext";

/**
 * useLocationAnalysis
 * Wraps the AnalysisContext and exposes helpers for the scan workflow.
 * Components use this hook — they never import the context directly.
 */
export function useLocationAnalysis() {
  const ctx = useAnalysis();

  /**
   * Called when user clicks on the Google Map.
   * @param {{ lat: string|number, lng: string|number }} coords
   */
  const handleMapClick = useCallback(
    ({ lat, lng }) => {
      ctx.setPin({ lat, lng });
      ctx.setLocation(`Lat: ${lat}, Lng: ${lng}`);
    },
    [ctx]
  );

  /** Format the radius value for display */
  const radiusDisplay =
    ctx.radius < 1000
      ? `${ctx.radius}m`
      : `${(ctx.radius / 1000).toFixed(1)} km`;

  /** Whether the form has enough data to run */
  const canRun = Boolean(ctx.businessType);

  return {
    ...ctx,
    handleMapClick,
    radiusDisplay,
    canRun,
  };
}