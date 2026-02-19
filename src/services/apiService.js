/**
 * apiService
 * Centralised API layer. Currently returns mock data.
 * Replace BASE_URL and implement real fetch calls when backend is ready.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://api.localyze.app/v1";

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export const apiService = {
  /**
   * Run a market scan.
   * @param {{ businessType: string, category: string, radius: number, lat: number, lng: number }} params
   * @returns {Promise<object>} analysis results
   */
  async runScan(params) {
    // TODO: replace with real fetch
    await delay(1800);
    return {
      feasibility:  Math.floor(65 + Math.random() * 30),
      competitors:  Math.floor(5  + Math.random() * 20),
      saturation:   Math.floor(20 + Math.random() * 60),
      footTraffic:  Math.floor(60 + Math.random() * 35),
      demandSignal: Math.floor(55 + Math.random() * 40),
      dataPoints:   `${(20000 + Math.floor(Math.random() * 8000)).toLocaleString()} POIs`,
      coverage:     `${(1.2 + Math.random()).toFixed(2)} km²`,
    };
  },

  /**
   * Fetch saved reports for the current user.
   * @returns {Promise<Array>}
   */
  async getReports() {
    await delay(600);
    // Returns MOCK_REPORTS from constants — swap for real call
    const { MOCK_REPORTS } = await import("../constants");
    return MOCK_REPORTS;
  },

  /**
   * Save a report.
   * @param {object} report
   * @returns {Promise<object>}
   */
  async saveReport(report) {
    await delay(400);
    return { ...report, id: Date.now() };
  },

  /**
   * Delete a report by id.
   * @param {number} id
   * @returns {Promise<void>}
   */
  async deleteReport(id) {
    await delay(300);
    return { success: true };
  },
};