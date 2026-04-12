/**
 * generatePDF.js
 *
 * Builds a structured, data-driven PDF report from a Localyze scan result.
 * Uses jsPDF directly — no screenshots, no html2canvas, no browser-print quirks.
 *
 * Export:
 *   generatePDF({ results, businessType, subType, radius, pin, aiAnalysis })
 */

import { jsPDF } from "jspdf";

// ── Brand colours (match CSS vars exactly) ───────────────────────────────────
const BRAND      = [63,  125, 88];   // --color-brand       #3F7D58
const BRAND_DARK = [45,  92,  63];   // --color-brand-dark  #2D5C3F
const ACCENT     = [230, 211, 173];  // --color-accent      #E6D3AD
const ACCENT_DIM = [235, 224, 198];  // accent at ~45% on card bg — progress tracks, subtle borders
const DARK       = [31,  41,  55];   // --color-dark/sidebar #1F2937
const MID        = [104, 114, 128];  // --color-text        #687280
const CARD_BG    = [245, 242, 225];  // --color-card        #F5F2E1
const APP_BG     = [252, 252, 253];  // --color-app-bg      #FCFCFD
const SUCCESS    = [209, 250, 229];  // --color-success     #D1FAE5
const WARN       = [254, 243, 199];  // amber-100 for moderate states
const DANGER     = [254, 226, 226];  // red-100 for weak/high-risk
const WHITE      = [255, 255, 255];

// ── Layout constants ──────────────────────────────────────────────────────────
const PAGE_W  = 210;  // A4 mm
const PAGE_H  = 297;
const MARGIN  = 18;
const CONTENT = PAGE_W - MARGIN * 2;   // 174 mm

// ── Helpers ───────────────────────────────────────────────────────────────────
function rgb(arr) { return { r: arr[0], g: arr[1], b: arr[2] }; }
function setFill(doc, arr)   { doc.setFillColor(...arr); }
function setDraw(doc, arr)   { doc.setDrawColor(...arr); }
function setColor(doc, arr)  { doc.setTextColor(...arr); }

function rect(doc, x, y, w, h, fillArr, drawArr, radius = 0) {
  if (fillArr) setFill(doc, fillArr);
  if (drawArr) setDraw(doc, drawArr);
  const style = fillArr && drawArr ? "FD" : fillArr ? "F" : "D";
  if (radius > 0) {
    doc.roundedRect(x, y, w, h, radius, radius, style);
  } else {
    doc.rect(x, y, w, h, style);
  }
}

/** Wrap + print text, returns new Y after last line. */
function text(doc, str, x, y, opts = {}) {
  const { size = 10, color = DARK, bold = false, align = "left", maxWidth } = opts;
  doc.setFontSize(size);
  doc.setFont("helvetica", bold ? "bold" : "normal");
  setColor(doc, color);
  if (maxWidth) {
    const lines = doc.splitTextToSize(String(str), maxWidth);
    doc.text(lines, x, y, { align });
    return y + lines.length * (size * 0.352 + 1.5);   // approx line-height
  }
  doc.text(String(str), x, y, { align });
  return y + size * 0.352 + 1.5;
}

/** Horizontal rule */
function hr(doc, y, color = ACCENT) {
  setDraw(doc, color);
  doc.setLineWidth(0.25);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  return y + 3;
}

/** Badge pill — returns width used */
function badge(doc, label, x, y, bgArr, textArr) {
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const w = doc.getTextWidth(label) + 8;
  rect(doc, x, y - 4, w, 6, bgArr, null, 3);
  setColor(doc, textArr);
  doc.text(label, x + w / 2, y, { align: "center" });
  return w;
}

/** Mini progress bar */
function progressBar(doc, x, y, w, value, max, fillArr) {
  const pct = Math.min(value / max, 1);
  rect(doc, x, y, w, 3, ACCENT_DIM, null, 1.5);
  if (pct > 0) rect(doc, x, y, w * pct, 3, fillArr, null, 1.5);
  return y + 5;
}

/** Add a new page and reset cursor */
function newPage(doc) {
  doc.addPage();
  setFill(doc, APP_BG);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  return MARGIN + 10;
}

/** Check remaining space, add page if needed */
function checkPageBreak(doc, y, needed = 20) {
  if (y + needed > PAGE_H - MARGIN) return newPage(doc);
  return y;
}

// ── Status helpers ────────────────────────────────────────────────────────────
function feasibilityStatus(score) {
  if (score >= 75) return { label: "STRONG",   bg: SUCCESS, text: BRAND };
  if (score >= 55) return { label: "MODERATE", bg: WARN,    text: [146, 100, 10] };
  return                   { label: "WEAK",    bg: DANGER,  text: [185, 28,  28] };
}
function competitorStatus(count) {
  if (count <= 10) return { label: "LOW",      bg: SUCCESS, text: BRAND };
  if (count <= 30) return { label: "MODERATE", bg: WARN,    text: [146, 100, 10] };
  return                   { label: "HIGH",    bg: DANGER,  text: [185, 28,  28] };
}
function saturationStatus(pct) {
  if (pct <= 35) return { label: "LOW RISK",  bg: SUCCESS, text: BRAND };
  if (pct <= 60) return { label: "MODERATE",  bg: WARN,    text: [146, 100, 10] };
  return                 { label: "SATURATED", bg: DANGER, text: [185, 28,  28] };
}
function threatLabel(status) {
  if (status === "high")   return { label: "High",   bg: DANGER,  text: [185, 28, 28] };
  if (status === "medium") return { label: "Medium", bg: WARN,    text: [146, 100, 10] };
  return                          { label: "Low",    bg: SUCCESS, text: BRAND };
}

// ── Strip markdown for plain text output ─────────────────────────────────────
function stripMd(str) {
  return str
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
    .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^[-•]\s+/gm, "• ");
}

// ── Capitalise first letter ───────────────────────────────────────────────────
function cap(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Strip Arabic/RTL glyphs — Helvetica can't render them ────────────────────
// If the string has a Latin portion after a separator (|, -, –), prefer that.
function latinOnly(str) {
  if (!str) return "—";
  // Try to extract the Latin segment after a pipe or dash separator
  const pipeIdx = str.indexOf("|");
  if (pipeIdx !== -1) {
    const after = str.slice(pipeIdx + 1).replace(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g, "").trim();
    if (after.length > 2) return after;
  }
  // Strip Arabic Unicode blocks
  const stripped = str
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s|•·\-–—]+|[\s|•·\-–—]+$/g, "")
    .trim();
  return stripped || str.slice(0, 20);
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export async function generatePDF({ results, businessType, subType, radius, pin, aiAnalysis }) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // Cream background on page 1
  setFill(doc, APP_BG);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  let y = MARGIN;

  // ── 1. HEADER BAND ─────────────────────────────────────────────────────────
  rect(doc, 0, 0, PAGE_W, 28, DARK, null);

  // Logo text
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  setColor(doc, ACCENT);
  doc.text("Localyze", MARGIN, 13);

  // Tagline
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setColor(doc, ACCENT_DIM);
  doc.text("Market Feasibility Report", MARGIN, 20);

  // Date top-right
  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  doc.setFontSize(8);
  setColor(doc, ACCENT_DIM);
  doc.text(dateStr, PAGE_W - MARGIN, 13, { align: "right" });

  // Generated label
  doc.setFontSize(7);
  setColor(doc, MID);
  doc.text("Generated automatically · Localyze platform", PAGE_W - MARGIN, 20, { align: "right" });

  y = 38;

  // ── 2. SCAN SUMMARY BAR ───────────────────────────────────────────────────
  rect(doc, MARGIN, y, CONTENT, 18, CARD_BG, ACCENT, 4);

  const typeLabel  = cap(businessType) + (subType ? ` · ${cap(subType)}` : "");
  const radiusKm   = radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`;
  const distLabel  = results.districtName || "Unknown District";

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  setColor(doc, DARK);
  doc.text(typeLabel, MARGIN + 6, y + 7);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  setColor(doc, MID);
  doc.text(`${distLabel}  ·  Radius ${radiusKm}  ·  ${results.dataPoints}`, MARGIN + 6, y + 13);

  // Feasibility pill on the right
  const fScore  = results.feasibility;
  const fStatus = feasibilityStatus(fScore);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  setColor(doc, BRAND);
  doc.text(`${fScore}`, PAGE_W - MARGIN - 22, y + 11);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  setColor(doc, MID);
  doc.text("/ 100", PAGE_W - MARGIN - 10, y + 11);

  y += 26;

  // ── 3. KEY METRICS (3 columns) ────────────────────────────────────────────
  const colW  = (CONTENT - 8) / 3;
  const boxH  = 54;
  const metrics = [
    {
      title: "FEASIBILITY SCORE",
      value: String(fScore),
      unit:  "/ 100",
      ...fStatus,
      barValue: fScore,
      barMax: 100,
      sub1Label: "Foot Traffic",
      sub1Value: results.footTraffic,
      sub2Label: "Demand Signal",
      sub2Value: results.demandSignal,
    },
    {
      title:    "COMPETITOR DENSITY",
      value:    String(results.competitors),
      unit:     "nearby",
      ...competitorStatus(results.competitors),
      barValue: Math.min(results.competitors, 60),
      barMax:   60,
      sub1Label: "Avg Rating",
      sub1Value: Math.round((parseFloat(results.avgRating) || 0) * 20),
      sub2Label: "Avg Price Level",
      sub2Value: Math.round((parseFloat(results.avgPriceLevel) || 0) * 25),
    },
    {
      title:    "MARKET SATURATION",
      value:    `${results.saturation}%`,
      unit:     "",
      ...saturationStatus(results.saturation),
      barValue: results.saturation,
      barMax:   100,
      sub1Label: "Youth Market",
      sub1Value: results.youthPercentage != null ? Math.round(results.youthPercentage) : null,
      sub2Label: "Foot Traffic",
      sub2Value: results.footTraffic,
    },
  ];

  metrics.forEach((m, i) => {
    const x = MARGIN + i * (colW + 4);
    rect(doc, x, y, colW, boxH, CARD_BG, ACCENT, 3);

    // Title — full width, no badge competing for space
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    setColor(doc, MID);
    doc.text(m.title, x + 5, y + 7);

    // Badge — sits on its own line below the title
    badge(doc, m.label, x + 5, y + 13, m.bg, m.text);

    // Big value — measure width at 22pt BEFORE switching font, so unit lands correctly
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    setColor(doc, DARK);
    doc.text(m.value, x + 5, y + 27);
    const vw22 = doc.getTextWidth(m.value);  // width at 22pt
    if (m.unit) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      setColor(doc, MID);
      doc.text(m.unit, x + 6 + vw22, y + 27);
    }

    // Main bar
    progressBar(doc, x + 5, y + 30, colW - 10, m.barValue, m.barMax, BRAND);

    // Sub bars
    let sy = y + 38;
    [[m.sub1Label, m.sub1Value], [m.sub2Label, m.sub2Value]].forEach(([lbl, val]) => {
      if (val == null) return;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      setColor(doc, MID);
      doc.text(lbl, x + 5, sy);
      doc.setFont("helvetica", "bold");
      setColor(doc, DARK);
      doc.text(String(val), x + colW - 5, sy, { align: "right" });
      sy = progressBar(doc, x + 5, sy + 1, colW - 10, val, 100, ACCENT);
    });
  });

  y += boxH + 8;
  y = hr(doc, y);

  // ── 4. DISTRICT PROFILE ───────────────────────────────────────────────────
  y = checkPageBreak(doc, y, 40);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  setColor(doc, DARK);
  setColor(doc, BRAND_DARK);
  doc.text("DISTRICT PROFILE", MARGIN, y);
  y += 5;

  rect(doc, MARGIN, y, CONTENT, 26, CARD_BG, ACCENT, 3);

  const profileItems = [
    { label: "District",    value: results.districtName || "—",                       sub: "" },
    { label: "Population",  value: results.totalPopulation ? results.totalPopulation.toLocaleString() : "—", sub: "residents" },
    { label: "Youth Market",value: results.youthPercentage != null ? `${results.youthPercentage.toFixed(1)}%` : "—", sub: results.youthRank ? `Rank #${results.youthRank}` : "ages 15–34" },
    { label: "Education",   value: results.educationCount > 0 ? String(results.educationCount) : "—", sub: "nearby institutions" },
    { label: "Coverage",    value: results.coverage || "—",                            sub: "scan area" },
  ].filter(item => item.value !== "—");

  const pColW = CONTENT / Math.max(profileItems.length, 1);
  profileItems.forEach((item, i) => {
    const x = MARGIN + i * pColW;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    setColor(doc, MID);
    doc.text(item.label.toUpperCase(), x + 4, y + 7);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    setColor(doc, DARK);
    doc.text(item.value, x + 4, y + 17);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    setColor(doc, MID);
    doc.text(item.sub, x + 4, y + 22);
  });

  y += 34;
  y = hr(doc, y);

  // ── 5. COMPETITOR TABLE ───────────────────────────────────────────────────
  const competitors = results.competitorList ?? [];

  if (competitors.length > 0) {
    y = checkPageBreak(doc, y, 15);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    setColor(doc, BRAND_DARK);
    doc.text("COMPETITOR OVERVIEW", MARGIN, y);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    setColor(doc, MID);
    doc.text(`Top ${Math.min(competitors.length, 10)} of ${competitors.length} found`, PAGE_W - MARGIN, y, { align: "right" });
    y += 5;

    // Table header
    const cols = [
      { label: "#",       w: 8  },
      { label: "Name",    w: 68 },
      { label: "Rating",  w: 20 },
      { label: "Price",   w: 18 },
      { label: "Reviews", w: 22 },
      { label: "Threat",  w: 26 },
    ];
    const rowH = 8;

    rect(doc, MARGIN, y, CONTENT, rowH, DARK, null, 2);
    let cx = MARGIN + 3;
    cols.forEach(col => {
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      setColor(doc, ACCENT);
      doc.text(col.label, cx, y + 5.5);
      cx += col.w;
    });
    y += rowH;

    const rows = competitors.slice(0, 10);
    rows.forEach((c, idx) => {
      y = checkPageBreak(doc, y, rowH + 2);

      const rowBg = idx % 2 === 0 ? WHITE : APP_BG;
      rect(doc, MARGIN, y, CONTENT, rowH, rowBg, null);

      // Subtle bottom border
      setDraw(doc, ACCENT);
      doc.setLineWidth(0.1);
      doc.line(MARGIN, y + rowH, MARGIN + CONTENT, y + rowH);

      cx = MARGIN + 3;
      const cells = [
        { value: String(c.id),                               w: cols[0].w },
        { value: latinOnly(c.name),                           w: cols[1].w, truncate: 38 },
        { value: c.rating ? `${c.rating} / 5` : "—",        w: cols[2].w },
        { value: c.priceLevel ? "$".repeat(Math.round(c.priceLevel)) : "—", w: cols[3].w },
        { value: c.reviews ? c.reviews.toLocaleString() : "—", w: cols[4].w },
        { value: null, threat: c.status,                     w: cols[5].w },
      ];

      cells.forEach(cell => {
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        setColor(doc, DARK);

        if (cell.threat) {
          const t = threatLabel(cell.threat);
          badge(doc, t.label, cx, y + 5.5, t.bg, t.text);
        } else {
          const val = cell.truncate && cell.value?.length > cell.truncate
            ? cell.value.slice(0, cell.truncate) + "…"
            : cell.value;
          doc.text(String(val), cx, y + 5.5);
        }
        cx += cell.w;
      });

      y += rowH;
    });

    y += 6;
    y = hr(doc, y);
  }

  // ── 6. AI INSIGHTS ────────────────────────────────────────────────────────
  if (aiAnalysis && aiAnalysis.trim().length > 0) {
    y = checkPageBreak(doc, y, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    setColor(doc, BRAND_DARK);
    doc.text("AI INSIGHTS", MARGIN, y);
    y += 5;

    const clean = stripMd(aiAnalysis);
    const lines = clean.split("\n").filter(l => l.trim().length > 0);

    lines.forEach(line => {
      y = checkPageBreak(doc, y, 14);

      const isHeading = line.startsWith("##") || (line.trim().endsWith(":") && line.trim().length < 60);
      const isBullet  = line.trimStart().startsWith("•");
      const stripped  = line.replace(/^#{1,3}\s*/, "").replace(/^•\s*/, "").trim();

      if (isHeading) {
        y += 2;
        rect(doc, MARGIN, y - 4, CONTENT, 9, SUCCESS, null, 2);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        setColor(doc, BRAND);
        doc.text(stripped, MARGIN + 4, y + 1);
        y += 8;
      } else if (isBullet) {
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        setColor(doc, MID);
        doc.text("•", MARGIN + 3, y);
        const wrapped = doc.splitTextToSize(stripped, CONTENT - 12);
        setColor(doc, DARK);
        doc.text(wrapped, MARGIN + 8, y);
        y += wrapped.length * 4.5 + 1;
      } else {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        setColor(doc, DARK);
        const wrapped = doc.splitTextToSize(stripped, CONTENT);
        doc.text(wrapped, MARGIN, y);
        y += wrapped.length * 4.5 + 1.5;
      }
    });

    y += 4;
    y = hr(doc, y);
  }

  // ── 7. FOOTER ─────────────────────────────────────────────────────────────
  // Draw footer on EVERY page
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    setFill(doc, DARK);
    doc.rect(0, PAGE_H - 14, PAGE_W, 14, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    setColor(doc, ACCENT_DIM);
    doc.text("Localyze · Market Intelligence Platform", MARGIN, PAGE_H - 6);
    if (pin) {
      setColor(doc, MID);
      doc.text(`Coordinates: ${parseFloat(pin.lat).toFixed(5)}, ${parseFloat(pin.lng).toFixed(5)}`, PAGE_W / 2, PAGE_H - 6, { align: "center" });
    }
    setColor(doc, ACCENT_DIM);
    doc.text(`Page ${p} of ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 6, { align: "right" });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeName = (businessType || "scan").replace(/[^a-z0-9]/gi, "_");
  const safeDistrict = (results.districtName || "report").replace(/[^a-z0-9]/gi, "_");
  await doc.save(`Localyze_${safeName}_${safeDistrict}.pdf`, { returnPromise: true });
}
