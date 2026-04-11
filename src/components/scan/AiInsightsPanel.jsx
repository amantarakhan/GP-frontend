import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocationAnalysis } from "../../hooks/useLocationAnalysis";

// ── Inline markdown renderer ──────────────────────────────────────────────────
function inlineFormat(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={i} style={{ fontWeight: 700, color: "var(--color-dark)" }}>
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

// ── Parsing helpers ─────────────────────────────────────────────────────────

/**
 * The ONLY reliable signal we have: the API always uses specific keywords
 * for section names. We scan each line for those keywords.
 * A line is a heading if it CONTAINS a section keyword AND has no long body
 * after the colon (i.e. less than 80 chars total after stripping formatting).
 */

function stripFormatting(line) {
  return line
    .replace(/\*{1,2}/g, "")   // remove * and **
    .replace(/_{1,2}/g, "")     // remove _ and __
    .replace(/^#+\s+/, "")     // remove # headings
    .replace(/^[-•]\s+/, "")   // remove list markers
    .trim();
}

function classifyLine(line) {
  const plain = stripFormatting(line).toLowerCase();

  // Must end with colon (after stripping) to be a heading
  // AND be short enough to not have body text
  const endsWithColon = plain.endsWith(":");
  const isShort = plain.length < 80;

  if (!endsWithColon || !isShort) return null;

  // English keywords
  if (/specific risk|key risk|main risk|risks:|challenges:|concerns:|threats:/.test(plain))
    return "risks";
  if (/suggest|differentiat|strateg|concrete|positioning:|recommendations:/.test(plain))
    return "suggestions";
  if (/summary|overview|plain.language|assessment|opportunit|introduction/.test(plain))
    return "summary";

  // Arabic keywords
  if (/مخاطر|تحديات|مخاوف|تهديدات/.test(plain))
    return "risks";
  if (/استراتيج|اقتراح|توصي|تميز|تمييز|فرص/.test(plain))
    return "suggestions";
  if (/ملخص|نظرة عامة|مقدمة|تقييم|خلاصة/.test(plain))
    return "summary";

  return null; // heading but unknown section
}

function parseAiText(text) {
  if (!text) return { summary: [], risks: [], suggestions: [] };

  const lines       = text.split("\n");
  const summary     = [];
  const risks       = [];
  const suggestions = [];
  let bucket        = "summary";

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const section = classifyLine(line);

    if (section !== null) {
      // It's a section heading
      if (section) bucket = section; // only switch if we recognised the section
      continue;
    }

    // Content line — strip list markers but keep inline bold/italic for inlineFormat
    const clean = line
      .replace(/^[-•*]\s+(?!\*)/, "")  // "- " or "* " but NOT "**"
      .replace(/^\d+\.\s+/, "");

    if (!clean) continue;

    if (bucket === "summary")          summary.push(clean);
    else if (bucket === "risks")       risks.push(clean);
    else if (bucket === "suggestions") suggestions.push(clean);
  }

  return { summary, risks, suggestions };
}

// ── Numbered item ─────────────────────────────────────────────────────────────
function ItemRow({ index, text, accentColor, isLast }) {
  return (
    <div style={{
      display:      "flex",
      gap:          "13px",
      alignItems:   "flex-start",
      padding:      "14px 0",
      borderBottom: isLast ? "none" : "1px solid rgba(230,211,173,.45)",
    }}>
      {/* Number bubble */}
      <div style={{
        flexShrink:     0,
        width:          "24px",
        height:         "24px",
        borderRadius:   "50%",
        background:     `${accentColor}15`,
        border:         `1.5px solid ${accentColor}40`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontFamily:     "var(--font-body)",
        fontSize:       "11px",
        fontWeight:     700,
        color:          accentColor,
        marginTop:      "1px",
      }}>
        {index + 1}
      </div>
      {/* Text — bold part is darker, body is muted */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize:   "13px",
        color:      "#687280",
        lineHeight: 1.75,
        margin:     0,
        flex:       1,
      }}>
        {inlineFormat(text)}
      </p>
    </div>
  );
}

// ── Section column ────────────────────────────────────────────────────────────
function SectionColumn({ title, headerIcon, accentColor, headerBg, borderColor, items }) {
  if (!items.length) return null;
  return (
    <div style={{
      flex:         1,
      minWidth:     0,
      borderRadius: "var(--radius-lg)",
      border:       `1px solid ${borderColor || accentColor + "30"}`,
      overflow:     "hidden",
      background:   "var(--color-card)",
      boxShadow:    "var(--shadow-sm)",
    }}>
      {/* Header */}
      <div style={{
        display:      "flex",
        alignItems:   "center",
        gap:          "9px",
        padding:      "13px 18px",
        background:   headerBg,
        borderBottom: `1px solid ${borderColor || accentColor + "22"}`,
      }}>
        {headerIcon}
        <span style={{
          fontFamily:  "var(--font-body)",
          fontSize:    "13px",
          fontWeight:  700,
          color:       "var(--color-dark)",
          letterSpacing: "-0.1px",
        }}>
          {title}
        </span>
      </div>
      {/* Items */}
      <div style={{ padding: "4px 18px 8px" }}>
        {items.map((text, i) => (
          <ItemRow
            key={i}
            index={i}
            text={text}
            accentColor={accentColor}
            isLast={i === items.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ── Thinking indicator ────────────────────────────────────────────────────────
const THINKING_STEPS = [
  "Reading competitor landscape…",
  "Evaluating market saturation…",
  "Analysing district demographics…",
  "Identifying differentiation angles…",
  "Generating strategic insights…",
];

function ThinkingIndicator() {
  const { t } = useTranslation();
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    const ti = setInterval(() => setStep((s) => (s + 1) % THINKING_STEPS.length), 1800);
    return () => clearInterval(ti);
  }, []);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "var(--color-brand)", display: "inline-block",
            animation: "aiBounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-brand)", fontWeight: 600 }}>
        {(t("ai.thinkingSteps", { returnObjects: true }))[step]}
      </span>
      <style>{`@keyframes aiBounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }`}</style>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function AiSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {["55%","90%","75%","85%","40%","80%","65%","88%"].map((w, i) => (
        <div key={i} style={{
          height: "12px", width: w, borderRadius: "6px",
          background: "linear-gradient(90deg,rgba(63,125,88,.08) 25%,rgba(63,125,88,.16) 50%,rgba(63,125,88,.08) 75%)",
          backgroundSize: "200% 100%",
          animation: `aiShimmer 1.6s infinite ${i * 0.1}s`,
        }} />
      ))}
      <style>{`@keyframes aiShimmer{from{background-position:200% 0}to{background-position:-200% 0}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AiInsightsPanel() {
  const {
    hasResults, isAiLoading, hasAiResults,
    aiAnalysis, aiError, runAiAnalysis, results,
  } = useLocationAnalysis();

  const { t } = useTranslation();
  const [btnHov,   setBtnHov]   = useState(false);
  const [retryHov, setRetryHov] = useState(false);

  if (!hasResults) return null;

  return (
    <div style={{
      background:   "var(--color-card)",
      borderRadius: "var(--radius-lg)",
      border:       "1px solid rgba(230,211,173,.6)",
      overflow:     "hidden",
      boxShadow:    "var(--shadow-sm)",
    }}>

      {/* ── Header ── */}
      <div style={{
        padding:        "14px 18px",
        borderBottom:   (hasAiResults || isAiLoading || aiError) ? "1px solid rgba(230,211,173,.5)" : "none",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Star icon box */}
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "rgba(63,125,88,.1)", border: "1px solid rgba(63,125,88,.2)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
            </svg>
          </div>

          {/* Title + Generated badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 700, color: "var(--color-dark)" }}>
              {t("ai.title")}
            </span>
            {hasAiResults && (
              <span style={{
                background: "rgba(63,125,88,.12)", color: "var(--color-brand)",
                fontSize: "9.5px", fontWeight: 700, padding: "3px 9px",
                borderRadius: "20px", fontFamily: "var(--font-body)",
                letterSpacing: "0.8px", textTransform: "uppercase",
                border: "1px solid rgba(63,125,88,.2)",
              }}>
                {t("ai.generated")}
              </span>
            )}
          </div>

          {/* Subtitle */}
          {hasAiResults && (
            <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--color-text)" }}>
              {t("ai.analysisFor", { district: results?.districtName ?? "your location" })}
            </span>
          )}
        </div>

        {/* Action button */}
        {!isAiLoading && (
          <button
            onClick={runAiAnalysis}
            onMouseEnter={() => setBtnHov(true)}
            onMouseLeave={() => setBtnHov(false)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 15px", borderRadius: "var(--radius-md)",
              border: hasAiResults ? "1px solid rgba(63,125,88,.25)" : "none",
              background: hasAiResults
                ? (btnHov ? "rgba(63,125,88,.12)" : "rgba(63,125,88,.07)")
                : "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)",
              color: hasAiResults ? "var(--color-brand)" : "#fff",
              fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-body)",
              cursor: "pointer", flexShrink: 0,
              boxShadow: !hasAiResults ? "0 4px 14px rgba(63,125,88,.25)" : "none",
              transition: "all .18s",
            }}
          >
            {hasAiResults ? (
              <>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="23,4 23,11 16,11"/><polyline points="1,20 1,13 8,13"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 11M1 13l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                {t("ai.regenerate")}
              </>
            ) : (
              <>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
                </svg>
                {t("ai.getAiSuggestions")}
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Pre-generate teaser ── */}
      {!hasAiResults && !isAiLoading && !aiError && (
        <div style={{ padding: "22px 20px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
            {[
              { icon: "🎯", label: t("ai.chips.marketRisks")         },
              { icon: "🚀", label: t("ai.chips.growthOpportunities") },
              { icon: "⚡", label: t("ai.chips.differentiationTips") },
              { icon: "📊", label: t("ai.chips.competitorInsights")  },
            ].map((chip) => (
              <div key={chip.label} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 12px", borderRadius: "20px",
                background: "var(--color-app-bg)", border: "1px solid rgba(230,211,173,.7)",
                fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 500, color: "var(--color-text)",
              }}>
                <span>{chip.icon}</span>{chip.label}
              </div>
            ))}
          </div>
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "16px",
            padding: "16px 18px", borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, var(--color-app-bg) 0%, rgba(230,211,173,.15) 100%)",
            border: "1px solid rgba(230,211,173,.6)",
          }}>
            <div style={{
              width: "42px", height: "42px", flexShrink: 0, borderRadius: "12px",
              background: "linear-gradient(135deg,rgba(63,125,88,.12),rgba(63,125,88,.04))",
              border: "1px solid rgba(63,125,88,.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
                stroke="var(--color-brand)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--color-dark)", marginBottom: "5px" }}>
                {t("ai.readyToGenerate")}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--color-text)", lineHeight: 1.65, maxWidth: "480px" }}>
                {t("ai.getAiDesc")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {isAiLoading && (
        <div style={{ padding: "24px 20px" }}>
          <ThinkingIndicator />
          <AiSkeleton />
        </div>
      )}

      {/* ── Error ── */}
      {aiError && !isAiLoading && (
        <div style={{ padding: "20px" }}>
          <div style={{
            borderRadius: "var(--radius-md)", background: "#fee2e2",
            border: "1px solid rgba(220,38,38,.2)", padding: "14px 16px",
            display: "flex", gap: "12px", alignItems: "flex-start",
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2} style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div style={{ flex: 1 }}>
              <strong style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#991b1b", display: "block", marginBottom: "3px" }}>
                AI Analysis Failed
              </strong>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#991b1b" }}>{aiError}</span>
            </div>
            <button
              onClick={runAiAnalysis}
              onMouseEnter={() => setRetryHov(true)}
              onMouseLeave={() => setRetryHov(false)}
              style={{
                flexShrink: 0, fontFamily: "var(--font-body)", fontSize: "11px", fontWeight: 700,
                color: "#991b1b",
                background: retryHov ? "rgba(220,38,38,.12)" : "rgba(220,38,38,.07)",
                border: "1px solid rgba(220,38,38,.2)", borderRadius: "8px",
                padding: "6px 12px", cursor: "pointer", transition: "background .15s",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {hasAiResults && aiAnalysis && !isAiLoading && (() => {
        const { summary, risks, suggestions } = parseAiText(aiAnalysis);
        return (
          <div style={{ animation: "aiFadeIn .5s ease both" }}>

            {/* Green accent top line */}
            <div style={{
              height: "3px",
              background: "linear-gradient(90deg, var(--color-brand) 0%, rgba(63,125,88,.08) 100%)",
            }} />

            {/* Summary — white box */}
            {summary.length > 0 && (
              <div style={{
                margin:       "20px 20px 0",
                padding:      "18px 20px",
                background:   "#ffffff",
                borderRadius: "var(--radius-md)",
                border:       "1px solid rgba(230,211,173,.6)",
                boxShadow:    "var(--shadow-sm)",
              }}>
                {summary.map((line, i) => (
                  <p key={i} style={{
                    fontFamily: "var(--font-body)",
                    fontSize:   "13.5px",
                    color:      "var(--color-text)",
                    lineHeight: 1.8,
                    margin:     i === summary.length - 1 ? 0 : "0 0 4px 0",
                  }}>
                    {inlineFormat(line)}
                  </p>
                ))}
              </div>
            )}

            {/* Two columns */}
            {(risks.length > 0 || suggestions.length > 0) && (
              <div style={{
                display: "flex", gap: "16px",
                padding: "20px 20px 24px",
                alignItems: "flex-start",
              }}>
                <SectionColumn
                  title={t("ai.specificRisks")}
                  accentColor="#dc2626"
                  headerBg="rgba(254,226,226,.7)"
                  borderColor="rgba(220,38,38,.18)"
                  items={risks}
                  headerIcon={
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  }
                />
                <SectionColumn
                  title={t("ai.differentiationStrategies")}
                  accentColor="#3f7d58"
                  headerBg="rgba(209,250,229,.6)"
                  borderColor="rgba(63,125,88,.18)"
                  items={suggestions}
                  headerIcon={
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#3f7d58" strokeWidth={2}>
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
                    </svg>
                  }
                />
              </div>
            )}

            {/* Footer */}
            <div style={{
              padding:      "14px 20px",
              borderTop:    "1px solid rgba(230,211,173,.5)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "space-between",
              gap:          "12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="var(--color-text)" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "10.5px", color: "var(--color-text)", opacity: 0.7, lineHeight: 1.5 }}>
                  {t("ai.disclaimer")}
                </span>
              </div>
              <button
                onClick={runAiAnalysis}
                style={{
                  display: "flex", alignItems: "center", gap: "5px", flexShrink: 0,
                  padding: "6px 12px", borderRadius: "8px",
                  border: "1px solid rgba(63,125,88,.2)", background: "transparent",
                  color: "var(--color-brand)", fontSize: "11px", fontWeight: 600,
                  fontFamily: "var(--font-body)", cursor: "pointer", transition: "background .15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(63,125,88,.08)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="23,4 23,11 16,11"/><polyline points="1,20 1,13 8,13"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 11M1 13l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                {t("ai.regenerate")}
              </button>
            </div>
          </div>
        );
      })()}

      <style>{`@keyframes aiFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}