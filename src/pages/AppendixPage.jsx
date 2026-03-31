import React, { useState } from "react";

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div style={{
      background: "var(--color-card)", borderRadius: "var(--radius-lg)",
      border: "1px solid rgba(230,211,173,.6)", overflow: "hidden",
      boxShadow: "var(--shadow-sm)", marginBottom: "20px",
    }}>
      <div style={{
        padding: "16px 22px", borderBottom: "1px solid rgba(230,211,173,.5)",
        display: "flex", alignItems: "center", gap: "10px",
        background: "linear-gradient(135deg,rgba(63,125,88,.04) 0%,transparent 100%)",
      }}>
        <div style={{
          width: "30px", height: "30px", borderRadius: "9px",
          background: "rgba(63,125,88,.1)", border: "1px solid rgba(63,125,88,.18)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700,
          color: "var(--color-dark)", letterSpacing: "-0.2px",
        }}>{title}</span>
      </div>
      <div style={{ padding: "22px" }}>{children}</div>
    </div>
  );
}

// ── Term card ─────────────────────────────────────────────────────────────────
function Term({ name, badge, badgeColor = "var(--color-brand)", badgeBg = "var(--color-success)", formula, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: "1px solid rgba(230,211,173,.4)", paddingBottom: "16px",
      marginBottom: "16px",
    }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          cursor: "pointer", userSelect: "none",
        }}
      >
        <span style={{
          fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: 700,
          color: "var(--color-dark)", flex: 1,
        }}>{name}</span>
        {badge && (
          <span style={{
            background: badgeBg, color: badgeColor,
            fontSize: "10px", fontWeight: 700, padding: "2px 9px",
            borderRadius: "20px", fontFamily: "var(--font-body)", whiteSpace: "nowrap",
          }}>{badge}</span>
        )}
        <svg
          width="14" height="14" fill="none" viewBox="0 0 24 24"
          stroke="var(--color-text)" strokeWidth={2}
          style={{ flexShrink: 0, transition: "transform .18s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>
      {open && (
        <div style={{
          marginTop: "10px", paddingLeft: "4px",
          fontFamily: "var(--font-body)", fontSize: "13px",
          color: "var(--color-text)", lineHeight: 1.7,
        }}>
          {children}
          {formula && (
            <div style={{
              marginTop: "10px", padding: "10px 14px",
              background: "rgba(63,125,88,.06)", borderRadius: "8px",
              border: "1px solid rgba(63,125,88,.15)",
              fontFamily: "monospace", fontSize: "12px", color: "var(--color-dark)",
            }}>
              {formula}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Badge row ─────────────────────────────────────────────────────────────────
function BadgeRow({ label, color, bg, threshold, meaning }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "12px",
      padding: "10px 0", borderBottom: "1px solid rgba(230,211,173,.35)",
    }}>
      <span style={{
        background: bg, color, fontSize: "11px", fontWeight: 700,
        padding: "3px 10px", borderRadius: "20px", fontFamily: "var(--font-body)",
        whiteSpace: "nowrap", flexShrink: 0, minWidth: "80px", textAlign: "center",
      }}>{label}</span>
      <div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "var(--color-dark)", marginBottom: "2px" }}>
          {threshold}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)" }}>
          {meaning}
        </div>
      </div>
    </div>
  );
}

// ── Step ──────────────────────────────────────────────────────────────────────
function Step({ n, title, children }) {
  return (
    <div style={{ display: "flex", gap: "16px", marginBottom: "18px" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 700, color: "#fff",
        marginTop: "2px",
      }}>{n}</div>
      <div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "13.5px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "4px" }}>
          {title}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function AppendixPage() {
  return (
    <div style={{ padding: "28px", maxWidth: "860px" }}>

      {/* Header */}
      <div className="fade-in" style={{ marginBottom: "28px" }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "9.5px", fontWeight: 600, color: "var(--color-brand)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "6px" }}>
          Reference
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700, color: "var(--color-dark)", letterSpacing: "-0.5px", marginBottom: "6px" }}>
          Appendix & Methodology
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13.5px", color: "var(--color-text)", lineHeight: 1.6 }}>
          Definitions for every metric shown in Localyze, and an explanation of how each score is calculated from real data.
          Click any term to expand its full explanation.
        </p>
      </div>

      {/* ── How a scan works ── */}
      <div className="fade-in fade-in-1">
        <Section
          title="How a Scan Works"
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
        >
          <Step n="1" title="Drop a pin & choose a business type">
            You select a location on the map in Amman, a business type (e.g. café, gym, pharmacy), an optional sub-type (e.g. Specialty Coffee, Women-only gym), and a scan radius between 300 m and 5 km.
          </Step>
          <Step n="2" title="Competitor discovery via Google Places">
            The backend queries Google Places Nearby Search within your radius and place type. For restaurants and cafés, results are cross-referenced against a Talabat restaurant database using fuzzy name matching (≥85% confidence) to filter by cuisine — so a search for "Sushi" only counts actual sushi venues, not generic restaurants.
          </Step>
          <Step n="3" title="District demographics lookup">
            Your coordinates are matched to one of Amman's sub-districts using bounding-box geometry (falling back to nearest centroid). Each district carries census data: total population, youth (ages 15–34), elderly (60+), and male/female breakdown.
          </Step>
          <Step n="4" title="Education proximity check">
            For food and beverage business types (café, restaurant, fast food, bakery), the system searches for universities within 1 km and validates them against a whitelist of known Jordanian universities — filtering out false positives like cafeteria entrances or parking lots near campuses.
          </Step>
          <Step n="5" title="Feasibility score computation">
            All collected data is fed into a scoring algorithm (logistic curve + adjustments) and returned alongside raw competitor data, demographic stats, and rating summaries.
          </Step>
          <Step n="6" title="AI insights (optional)">
            The full scan result is sent to Gemini 2.5 Flash with a structured business-consultant prompt. It returns a plain-language summary, key risks, and differentiation suggestions — all grounded in the actual competitor names and numbers from your scan.
          </Step>
        </Section>
      </div>

      {/* ── Score metrics ── */}
      <div className="fade-in fade-in-2">
        <Section
          title="Score Metrics"
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>}
        >
          <Term
            name="Feasibility Score"
            badge="0 – 100"
            badgeBg="var(--color-success)"
            badgeColor="var(--color-brand)"
            formula="base = 100 / (1 + e^(-x))   where x = (ln(pop / comp) − ln(2000)) / 2"
          >
            The headline viability index for opening your chosen business at the selected location. It starts from a logistic (S-curve) function of the <strong>population-to-competitor ratio</strong> — specifically, how many people exist per competing business relative to a baseline of 2,000 people/competitor.
            <br /><br />
            The raw base score is then adjusted by four factors:
            <ul style={{ margin: "8px 0 0 16px", lineHeight: 1.9 }}>
              <li><strong>Competitor rating quality:</strong> For every 0.1 stars below 4.0, the score increases by 1.5 points. Low-rated competitors signal a gap you can fill.</li>
              <li><strong>Competitor review count:</strong> A high average review count (entrenched competitors) penalises the score by up to −15 points.</li>
              <li><strong>Price level:</strong> Competitors priced above 2/4 add up to +5 pts per level — room for affordable positioning. Below 2 subtracts points.</li>
              <li><strong>Education proximity:</strong> Each university within 1 km of your pin adds +5 points (capped at +10). Relevant for F&B businesses that benefit from student foot traffic.</li>
            </ul>
            <br />
            Finally, the score is <strong>multiplied</strong> by a district-level demographic factor:
            <ul style={{ margin: "0 0 0 16px", lineHeight: 1.9 }}>
              <li>Most business types use the district's <strong>youth multiplier</strong> (based on % of 15–34 year-olds vs. the Amman average).</li>
              <li>Gyms additionally weight by gender ratio (male/female) when a gender sub-type is selected.</li>
              <li>Medical/pharmacy businesses use an <strong>elderly multiplier</strong> instead.</li>
            </ul>
          </Term>

          <Term
            name="Foot Traffic"
            badge="0 – 100"
            badgeBg="var(--color-success)"
            badgeColor="var(--color-brand)"
            formula="foot_traffic = min(population_density_per_km² / 20,000 × 100, 100)"
          >
            A 0–100 proxy for the volume of potential customers in the area. Derived directly from the district's <strong>population density</strong> (people per km²). A density of 20,000 people/km² maps to the maximum score of 100.
            <br /><br />
            It is one of two sub-bars shown inside the Feasibility Score card. It does not factor into the feasibility formula directly, but it is used to compute the Demand Signal.
          </Term>

          <Term
            name="Demand Signal"
            badge="0 – 100"
            badgeBg="var(--color-success)"
            badgeColor="var(--color-brand)"
            formula="demand = min(foot_traffic × 0.75 + edu_bonus, 100)   edu_bonus = min(uni_count × 8, 25)"
          >
            An estimate of <strong>demand strength</strong> that combines general footfall with student-driven demand. Foot traffic contributes 75% of the signal; each nearby university adds 8 points (capped at +25). A high Demand Signal alongside high Market Saturation indicates a contested but active market.
          </Term>

          <Term
            name="Market Saturation"
            badge="0 – 100%"
            badgeBg="#fee2e2"
            badgeColor="#991b1b"
            formula="saturation = min(competitor_density_per_km² / 50 × 100, 100)"
          >
            How crowded the market is, expressed as a percentage of a benchmark threshold of <strong>50 similar businesses per km²</strong>. At 50/km², the market is considered fully saturated (100%). Below 35% is considered low-risk; above 60% is saturated territory.
            <br /><br />
            Note: saturation reflects the <em>density</em> of competitors (per km² of your scan area), not the raw count. A large scan radius naturally produces a lower density than a tight radius with the same number of businesses.
          </Term>
        </Section>
      </div>

      {/* ── Competitor metrics ── */}
      <div className="fade-in fade-in-3">
        <Section
          title="Competitor Metrics"
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
        >
          <Term name="Competitor Count" badge="raw number">
            Total number of similar businesses found within your scan radius. Filtered by your chosen business type via the Google Places <code>type</code> field. For restaurants and cafés with a sub-type selected, the list is further filtered using <strong>Talabat category matching</strong> — cross-referencing competitor names against Talabat's Amman restaurant database via fuzzy matching (≥85% confidence threshold). If Talabat returns zero results for that cuisine, the system falls back to keyword search.
          </Term>

          <Term name="Average Rating" badge="1 – 5 stars">
            The simple mean of all Google Maps star ratings across the competitors found. A low average (e.g. below 3.8) indicates the existing options are underperforming — an opportunity to capture market share with higher quality. A high average (e.g. above 4.3) signals entrenched, well-regarded competitors.
          </Term>

          <Term name="Average Price Level" badge="1 – 4">
            The mean of Google Places <code>price_level</code> values across competitors.
            <ul style={{ margin: "8px 0 0 16px", lineHeight: 1.9 }}>
              <li><strong>1</strong> — Inexpensive (budget)</li>
              <li><strong>2</strong> — Moderate</li>
              <li><strong>3</strong> — Expensive</li>
              <li><strong>4</strong> — Very expensive</li>
            </ul>
            A high average price level suggests competitors are premium — a potential opening for an affordable alternative. A low average may signal price pressure in the market. Not all Google Places listings have a price level set, so this average is computed only from listings that do.
          </Term>

          <Term name="Competitor Density" badge="businesses / km²" formula="density = total_competitors / (π × radius_km²)">
            The number of competitors divided by the area of your scan circle. This is the primary input into the Market Saturation calculation. A larger radius covers more area, so raw competitor counts are not directly comparable across scans — density normalises for this.
          </Term>

          <Term name="Threat Level (competitor list)">
            Each competitor in the list is individually classified:
            <ul style={{ margin: "8px 0 0 16px", lineHeight: 1.9 }}>
              <li><strong style={{ color: "#dc2626" }}>High</strong> — rating ≥ 4.3 AND more than 100 reviews. Established, well-rated, and popular. Hardest to displace.</li>
              <li><strong style={{ color: "#d97706" }}>Medium</strong> — rating ≥ 3.8 AND more than 20 reviews. Reasonably good but not dominant.</li>
              <li><strong style={{ color: "#687280" }}>Low</strong> — everything else. Vulnerable to a well-executed offering.</li>
            </ul>
          </Term>
        </Section>
      </div>

      {/* ── Demographics ── */}
      <div className="fade-in fade-in-4">
        <Section
          title="Area Demographics"
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>}
        >
          <Term name="District">
            Amman is divided into administrative sub-districts. Your pin's coordinates are matched to the correct district using boundary polygons. If coordinates fall outside all defined boundaries (e.g. edge-of-city pins), the system assigns the nearest district by centroid distance. Each district carries census-derived demographic data.
          </Term>

          <Term name="Population Density" badge="people / km²">
            The total district population divided by the district's geographic area in km². Used directly to compute Foot Traffic. Districts with higher density (e.g. dense city-centre areas) produce a higher foot traffic score.
          </Term>

          <Term name="Youth Market" badge="% of population">
            The percentage of the district's population aged 15–34, sourced from Jordan's national census data. This is the primary customer demographic for most F&B, fitness, and lifestyle businesses. A higher youth percentage leads to a higher youth multiplier applied to the Feasibility Score.
          </Term>

          <Term name="Youth Rank">
            A comparative ranking of the district's youth concentration relative to all other Amman districts. Rank 1 = highest youth concentration in the city. Used to contextualise whether this district is a youth hotspot or more mixed.
          </Term>

          <Term name="Education Hubs" badge="count within 1 km">
            The number of accredited universities or colleges within 1 km of your pin. Verified against a curated whitelist of Jordanian higher-education institutions (both English and Arabic names) to exclude false positives. Each confirmed university adds up to +8 points to the Demand Signal (capped at +25 total), and contributes +5 to the raw Feasibility Score (capped at +10).
          </Term>
        </Section>
      </div>

      {/* ── Badge thresholds ── */}
      <div className="fade-in fade-in-4">
        <Section
          title="Badge Thresholds"
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>}
        >
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-text)", marginBottom: "16px", lineHeight: 1.6 }}>
            Every metric card shows a badge summarising the result at a glance. Here are the exact thresholds used.
          </p>

          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
              Feasibility Score
            </div>
            <BadgeRow label="Strong"   color="var(--color-brand)" bg="var(--color-success)" threshold="≥ 75 / 100" meaning="The location has strong fundamentals — healthy demand, limited quality competition, or favourable demographics." />
            <BadgeRow label="Moderate" color="var(--color-dark)"  bg="var(--color-accent)"  threshold="55 – 74 / 100" meaning="Viable but competitive. Success will depend on differentiation and execution." />
            <BadgeRow label="Weak"     color="#991b1b"             bg="#fee2e2"               threshold="< 55 / 100" meaning="High competition, low demand, or poor demographics for this business type at this location." />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
              Competitor Density (count)
            </div>
            <BadgeRow label="Low"      color="var(--color-brand)" bg="var(--color-success)" threshold="≤ 10 competitors" meaning="Few direct competitors within the radius — relatively open market." />
            <BadgeRow label="Moderate" color="var(--color-dark)"  bg="var(--color-accent)"  threshold="11 – 30 competitors" meaning="Normal competitive environment. Quality and positioning matter." />
            <BadgeRow label="High"     color="#991b1b"             bg="#fee2e2"               threshold="> 30 competitors" meaning="Crowded space. Requires strong differentiation to stand out." />
          </div>

          <div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700, color: "var(--color-text)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
              Market Saturation (%)
            </div>
            <BadgeRow label="Low Risk"  color="var(--color-brand)" bg="var(--color-success)" threshold="≤ 35%" meaning="Market has room — competitor density is well below the saturation benchmark." />
            <BadgeRow label="Moderate"  color="var(--color-dark)"  bg="var(--color-accent)"  threshold="36 – 60%" meaning="Getting crowded but not saturated. A strong concept can still win here." />
            <BadgeRow label="Saturated" color="#991b1b"             bg="#fee2e2"               threshold="> 60%" meaning="Dense competition relative to area. Very hard to succeed without a clear niche." />
          </div>
        </Section>
      </div>

      {/* ── Data sources ── */}
      <div className="fade-in fade-in-4" style={{ paddingBottom: "28px" }}>
        <Section
          title="Data Sources"
          icon={<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {[
              {
                name: "Google Places API",
                detail: "Competitor discovery — names, addresses, ratings, review counts, price levels, opening hours, and websites. Results are paginated up to 60 listings per query and cached for 1 hour.",
              },
              {
                name: "Talabat Restaurant Database",
                detail: "A curated dataset of Amman restaurants with their cuisine categories, used to filter Google Places results by sub-type (e.g. Sushi, Burgers). Matched using RapidFuzz token-set-ratio with an 85% confidence threshold.",
              },
              {
                name: "Amman District Census Data",
                detail: "District-level population data for Amman's sub-districts, including total population, age breakdowns (youth 15–34, elderly 60+), and gender ratios. Used for Foot Traffic, Demand Signal, and the demographic multiplier in the Feasibility Score.",
              },
              {
                name: "Jordanian Universities Whitelist",
                detail: "A manually curated list of accredited Jordanian universities in both English and Arabic, used to validate nearby-education results from Google Places and exclude non-academic false positives.",
              },
              {
                name: "Google Gemini 2.5 Flash",
                detail: "AI analysis model used to generate the plain-language insights panel. Receives the full structured scan result and returns a business-consultant-style summary, risk list, and differentiation suggestions.",
              },
              {
                name: "Firebase / Firestore",
                detail: "User authentication and cloud storage for saved reports. Reports are stored per user in the saved_reports collection with full scan results, scores, and AI analysis text.",
              },
            ].map((s) => (
              <div key={s.name} style={{
                padding: "14px 16px", borderRadius: "var(--radius-md)",
                background: "rgba(63,125,88,.04)", border: "1px solid rgba(63,125,88,.12)",
              }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12.5px", fontWeight: 700, color: "var(--color-dark)", marginBottom: "5px" }}>
                  {s.name}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)", lineHeight: 1.6 }}>
                  {s.detail}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

    </div>
  );
}
