/**
 * apiService
 * Centralised API layer — all data comes from the real backend.
 * Local storage is used for report persistence (no /reports endpoint yet).
 */

const SCAN_BASE_URL = "https://localyze.onrender.com";

// ── Response normaliser ───────────────────────────────────────────────────────
// Maps the real API shape to what the UI components expect.
export function normaliseResponse(raw, params) {
  const {
    feasibility_index,
    total_competitors,
    competitor_density_per_km2,
    population_density_per_km2,
    rating_stats,
    price_level_stats,
    district_profile,
    education_institutions_nearby,
    competitors = [],
    lat,
    lng,
    radius_m,
  } = raw;

  // Saturation: density mapped to 0–100 scale
  // 50 competitors/km² = 100% saturated
  const saturation = Math.min(Math.round((competitor_density_per_km2 / 50) * 100), 100);

  // Foot traffic proxy: population density mapped 0–100
  // 20,000 people/km² = 100%
  const footTraffic = Math.min(Math.round((population_density_per_km2 / 20000) * 100), 100);

  // Demand signal: boosted by nearby education institutions
  const eduBoost = education_institutions_nearby?.count
    ? Math.min(education_institutions_nearby.count * 8, 25)
    : 0;
  const demandSignal = Math.min(Math.round(footTraffic * 0.75 + eduBoost), 100);

  // Coverage area from radius
  const radiusKm  = (radius_m ?? params?.radius ?? 1000) / 1000;
  const areaSqKm  = (Math.PI * radiusKm * radiusKm).toFixed(2);

  return {
    // ── Core metrics ──────────────────────────────────────────────────────────
    feasibility:  Math.round(feasibility_index),
    competitors:  total_competitors,
    saturation,
    footTraffic,
    demandSignal,

    // ── Display strings ───────────────────────────────────────────────────────
    dataPoints:   `${total_competitors.toLocaleString()} POIs`,
    coverage:     `${areaSqKm} km²`,

    // ── Rich data for panels ──────────────────────────────────────────────────
    avgRating:        rating_stats?.average?.toFixed(1) ?? "—",
    avgPriceLevel:    price_level_stats?.average?.toFixed(1) ?? "—",
    districtName:     district_profile?.district_name_en ?? "Unknown",
    districtNameAr:   district_profile?.district_name_ar ?? "",
    youthPercentage:  district_profile?.youth_percentage ?? null,
    youthRank:        district_profile?.youth_rank ?? null,
    totalPopulation:  district_profile?.total_population ?? null,
    educationCount:   education_institutions_nearby?.count ?? 0,
    educationList:    education_institutions_nearby?.institutions ?? [],

    // ── Competitor list (raw from API) ────────────────────────────────────────
    competitorList: competitors.map((c, i) => ({
      id:         i + 1,
      name:       c.name,
      address:    c.address,
      phone:      c.phone,
      rating:     c.rating,
      priceLevel: c.price_level,
      reviews:    c.user_total_ratings,
      website:    c.website,
      hours:      c.opening_hours ?? [],
      location:   c.location,
      // Derive threat level from rating + review count
      status: deriveStatus(c.rating, c.user_total_ratings),
    })),

    // ── Scan metadata ─────────────────────────────────────────────────────────
    scannedAt: new Date().toISOString(),
    scanLat:   lat,
    scanLng:   lng,
    scanRadius: radius_m,
  };
}

function deriveStatus(rating, reviews) {
  if (!rating) return "low";
  if (rating >= 4.3 && reviews > 100) return "high";
  if (rating >= 3.8 && reviews > 20)  return "medium";
  return "low";
}

// ── API calls ─────────────────────────────────────────────────────────────────
export const apiService = {
  /**
   * Run a market scan.
   * @param {{ businessType, category, radius, lat, lng }} params
   */
  async runScan({ businessType, category, radius, lat, lng }) {
    const url = new URL(`${SCAN_BASE_URL}/scan-location`);
    url.searchParams.set("lat",        lat);
    url.searchParams.set("lng",        lng);
    url.searchParams.set("radius",     radius);
    url.searchParams.set("place_type", businessType);
    if (category?.trim()) url.searchParams.set("category", category.trim());

    const response = await fetch(url.toString(), {
      method:  "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Scan failed (${response.status}): ${text}`);
    }

    const raw = await response.json();
    return normaliseResponse(raw, { radius });
  },

  // ── Report persistence via localStorage ────────────────────────────────────
  // These replace the mock delay functions. No backend endpoint needed.

  getReports() {
    try {
      const stored = localStorage.getItem("localyze_reports");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveReport(report) {
    try {
      const reports  = this.getReports();
      const newReport = { ...report, id: Date.now() };
      const updated  = [newReport, ...reports];
      localStorage.setItem("localyze_reports", JSON.stringify(updated));
      return newReport;
    } catch (err) {
      throw new Error("Failed to save report: " + err.message);
    }
  },

  deleteReport(id) {
    try {
      const reports = this.getReports().filter((r) => r.id !== id);
      localStorage.setItem("localyze_reports", JSON.stringify(reports));
      return { success: true };
    } catch (err) {
      throw new Error("Failed to delete report: " + err.message);
    }
  },
};