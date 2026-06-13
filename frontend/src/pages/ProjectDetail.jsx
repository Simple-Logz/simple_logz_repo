import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import styles from "./ProjectDetail.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "";

async function apiFetch(path, opts = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...opts.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Icons ─────────────────────────────────────────────────────
function IconBack() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function IconSettings() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function IconActivity() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
function IconBook() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>; }
function IconTerminal() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>; }
function IconCode()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>; }
function IconZap()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }
function IconTrend()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }
function IconShield()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function IconBug()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="4"/><path d="M12 9v-3"/><path d="M4.93 10.93l1.41 1.41"/><path d="M2 17h3"/><path d="M19 17h3"/><path d="M17.66 12.34l1.41-1.41"/><path d="M15 9a3 3 0 0 0-6 0"/></svg>; }
function IconSpeed()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>; }
function IconClipboard(){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>; }
function IconTrash()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>; }
function IconBrain()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>; }
function IconHome() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconGithub() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>; }
function IconKey() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>; }
function IconCopy() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>; }
function IconAnalyze() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>; }
function IconAlert() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function IconCheck() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function IconSave() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>; }

const TABS = [
  { id: "overview",       label: "Overview",       icon: <IconHome/> },
  { id: "incidents",      label: "Incidents",      icon: <IconActivity/> },
  { id: "log-analyzer",   label: "Log Analyzer",   icon: <IconZap/> },
  { id: "code-inspector", label: "Code Inspector", icon: <IconCode/> },
  { id: "runbooks",       label: "Runbooks",       icon: <IconBook/> },
  { id: "settings",       label: "Settings",       icon: <IconSettings/> },
];

const SEV_COLOR = { CRITICAL:"var(--red)", HIGH:"var(--yellow)", MEDIUM:"var(--accent)", LOW:"var(--green)" };

// ── Overview Tab ──────────────────────────────────────────────
const TREND_COLOR = { improving:"var(--green)", worsening:"var(--red)", stable:"var(--yellow)" };
const TREND_LABEL = { improving:"↑ Improving", worsening:"↓ Worsening", stable:"→ Stable" };

function OverviewTab({ project, analyses }) {
  const { getToken } = useAuth();
  const critical   = analyses.filter(a => a.severity === "CRITICAL").length;
  const high       = analyses.filter(a => a.severity === "HIGH").length;
  const total      = analyses.length;
  const score      = total === 0 ? 100 : Math.max(0, Math.round(100 - (critical * 15) - (high * 5) - ((total - critical - high) * 1)));
  const scoreColor = score >= 80 ? "var(--green)" : score >= 60 ? "var(--yellow)" : "var(--red)";

  const [intel,        setIntel]        = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelError,   setIntelError]   = useState(null);

  async function generateIntel() {
    setIntelLoading(true); setIntelError(null);
    try {
      const token = await getToken();
      const data  = await apiFetch("/api/pattern-intel", {
        method: "POST",
        body: JSON.stringify({
          analyses:    analyses.map(a => ({ severity: a.severity, title: a.title, source: a.source, created_at: a.created_at })),
          projectName: project.name,
          stack:       project.stack,
        }),
      }, token);
      setIntel(data.result);
    } catch (e) { setIntelError(e.message || "Analysis failed. Please retry."); }
    finally { setIntelLoading(false); }
  }

  return (
    <div className={styles.tabContent}>
      {/* Health score */}
      <div className={styles.healthCard}>
        <div className={styles.healthLeft}>
          <div className={styles.healthLabel}>Project Health Score</div>
          <div className={styles.healthScore} style={{color: scoreColor}}>{score}<span className={styles.healthMax}>/100</span></div>
          <div className={styles.healthDesc}>
            {score >= 80 ? "This project is healthy. Keep it up." : score >= 60 ? "Some issues need attention." : "Critical issues detected. Immediate action required."}
          </div>
        </div>
        <div className={styles.healthStats}>
          <div className={styles.healthStat}><span style={{color:"var(--red)"}}>{critical}</span><span>Critical</span></div>
          <div className={styles.healthStat}><span style={{color:"var(--yellow)"}}>{high}</span><span>High</span></div>
          <div className={styles.healthStat}><span style={{color:"var(--t2)"}}>{total - critical - high}</span><span>Other</span></div>
          <div className={styles.healthStat}><span style={{color:"var(--accent)"}}>{total}</span><span>Total</span></div>
        </div>
      </div>

      {/* Stack */}
      {project.stack?.length > 0 && (
        <div className={styles.section}>
          <div className={styles.secLabel}>Tech Stack</div>
          <div className={styles.stackRow}>
            {project.stack.map(s => <span key={s} className={styles.stackTag}>{s}</span>)}
          </div>
        </div>
      )}

      {/* Recent incidents */}
      <div className={styles.section}>
        <div className={styles.secLabel}>Recent Incidents</div>
        {analyses.length === 0 ? (
          <div className={styles.emptySection}>
            <p>No incidents yet. Run your first analysis to start building your incident history.</p>
            <Link to={`/?project=${project.id}`} className="btn btn-primary btn-sm" style={{marginTop:12,display:"inline-flex"}}>
              <IconAnalyze/> Analyze a log
            </Link>
          </div>
        ) : (
          <div className={styles.incidentList}>
            {analyses.slice(0, 5).map(a => (
              <div key={a.id} className={styles.incidentRow}>
                <div className={styles.incidentSev} style={{color: SEV_COLOR[a.severity] || "var(--t2)"}}>{a.severity}</div>
                <div className={styles.incidentTitle}>{a.title || "Untitled incident"}</div>
                <div className={styles.incidentSource}>{a.source}</div>
                <div className={styles.incidentDate}>{new Date(a.created_at).toLocaleDateString("en-GB", {day:"numeric",month:"short"})}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pattern Intelligence */}
      <div className={styles.section}>
        <div className={styles.intelHeader}>
          <div>
            <div className={styles.secLabel}>Pattern Intelligence</div>
            <p className={styles.aiToolDesc} style={{marginTop:4}}>
              {total < 2 ? "Run 2+ analyses to unlock AI pattern detection." : "AI scans your incident history to surface patterns, predict failures, and recommend fixes."}
            </p>
          </div>
          {total >= 2 && !intel && (
            <button
              className="btn btn-outline btn-sm"
              onClick={generateIntel}
              disabled={intelLoading}
              style={{gap:7,flexShrink:0}}
            >
              {intelLoading ? <><span className="spinner" style={{width:12,height:12,borderWidth:2}}/> Analyzing…</> : <><IconBrain/> Generate Report</>}
            </button>
          )}
          {intel && (
            <button className="btn btn-ghost btn-sm" onClick={() => setIntel(null)} style={{flexShrink:0}}>Reset</button>
          )}
        </div>

        {intelError && <div className={styles.aiError}>{intelError}</div>}

        {intel && (
          <div className={styles.intelResult}>
            {/* Trend + hotspot */}
            <div className={styles.intelTopRow}>
              <div className={styles.intelCard}>
                <div className={styles.secLabel} style={{marginBottom:8}}>Trend</div>
                <div className={styles.trendBadge} style={{color: TREND_COLOR[intel.trend], borderColor: TREND_COLOR[intel.trend] + "44", background: TREND_COLOR[intel.trend] + "11"}}>
                  {TREND_LABEL[intel.trend] || intel.trend}
                </div>
                {intel.trend_explanation && <p className={styles.intelCardDesc}>{intel.trend_explanation}</p>}
              </div>
              <div className={styles.intelCard}>
                <div className={styles.secLabel} style={{marginBottom:8}}>Hotspot</div>
                <div className={styles.hotspotLabel}>{intel.hotspot}</div>
                {intel.mttr_estimate && <p className={styles.intelCardDesc}>Est. MTTR: {intel.mttr_estimate}</p>}
              </div>
            </div>

            {intel.summary && <p className={styles.intelSummary}>{intel.summary}</p>}

            {/* Patterns */}
            {intel.patterns?.length > 0 && (
              <div style={{marginBottom:16}}>
                <div className={styles.secLabel} style={{marginBottom:10}}>Detected Patterns</div>
                <div className={styles.patternGrid}>
                  {intel.patterns.map((p, i) => (
                    <div key={i} className={styles.patternCard}>
                      <div className={styles.patternCardTop}>
                        <span className={styles.patternName}>{p.name}</span>
                        <span className={styles.patternCount}>{p.count}×</span>
                        <span className={styles.flaggedSev} style={{color: SEV_DOT[p.risk]}}>{p.risk}</span>
                      </div>
                      <p className={styles.patternDesc}>{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Predictions */}
            {intel.predictions?.length > 0 && (
              <div style={{marginBottom:16}}>
                <div className={styles.secLabel} style={{marginBottom:8}}>Proactive Warnings</div>
                {intel.predictions.map((p, i) => (
                  <div key={i} className={styles.predictionAlert}>
                    <span style={{color:"var(--yellow)",fontWeight:700,marginRight:8}}>⚠</span>{p}
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {intel.recommendations?.length > 0 && (
              <div>
                <div className={styles.secLabel} style={{marginBottom:8}}>Recommendations</div>
                {intel.recommendations.map((r, i) => (
                  <div key={i} className={styles.recItem}><span className={styles.recNum}>{i + 1}</span>{r}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Incidents Tab ─────────────────────────────────────────────
function IncidentsTab({ analyses, projectId }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <div className={styles.secLabel}>Incident History</div>
        <Link to={`/?project=${projectId}`} className="btn btn-primary btn-sm">
          <IconAnalyze/> New analysis
        </Link>
      </div>
      {analyses.length === 0 ? (
        <div className={styles.emptySection}>
          <p>No incidents recorded yet. Every log analysis you run inside this project will appear here.</p>
        </div>
      ) : (
        <div className={styles.incidentFull}>
          {analyses.map(a => (
            <div key={a.id} className={styles.incidentCard}>
              <div className={styles.incidentCardTop}>
                <div className={styles.incidentSevBadge} style={{background: SEV_COLOR[a.severity] + "22", color: SEV_COLOR[a.severity] || "var(--t2)"}}>
                  {a.severity}
                </div>
                <div className={styles.incidentCardTitle}>{a.title || "Untitled incident"}</div>
                <div className={styles.incidentCardDate}>{new Date(a.created_at).toLocaleDateString("en-GB", {day:"numeric",month:"short",year:"numeric"})}</div>
              </div>
              <div className={styles.incidentCardMeta}>
                <span className={styles.incidentSource}>{a.source}</span>
                {a.log_snippet && <span className={styles.incidentSnippet}>{a.log_snippet.slice(0, 80)}…</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared Code Editor with line numbers ──────────────────────
const LINE_H   = 21;    // px per line  (13px font × ~1.6)
const GUTTER_W = 56;    // px gutter width

function CodeEditorPane({ value, onChange, placeholder, activeLine = null, onKeyDown }) {
  const textaRef  = useRef(null);
  const numbersRef = useRef(null);
  const lines = (value || "").split("\n");
  const count = Math.max(lines.length, 1);

  // Keep gutter in sync when textarea scrolls
  function onScroll() {
    if (numbersRef.current && textaRef.current)
      numbersRef.current.style.top = `-${textaRef.current.scrollTop}px`;
  }

  // Jump to a specific line
  useEffect(() => {
    if (activeLine != null && textaRef.current) {
      textaRef.current.scrollTop = Math.max(0, (activeLine - 1) * LINE_H - 60);
      onScroll();
    }
  }, [activeLine]);

  return (
    <div style={{
      position:"relative", border:"1px solid #2a3650",
      borderRadius:12, overflow:"hidden",
      marginBottom:12, minHeight:220,
      background:"#1b2235",
    }}>
      {/* ── Gutter panel (absolute, left side) ── */}
      <div style={{
        position:"absolute", top:0, left:0, bottom:0,
        width:GUTTER_W, background:"#111722",
        borderRight:"2px solid #2a3650",
        overflow:"hidden",
        pointerEvents:"none", userSelect:"none",
      }}>
        {/* Scrolling number list — shifted by textarea.scrollTop */}
        <div ref={numbersRef} style={{ position:"relative", top:0, paddingTop:14 }}>
          {Array.from({ length: count }, (_, i) => (
            <div key={i} style={{
              height:LINE_H, lineHeight:`${LINE_H}px`,
              textAlign:"right", paddingRight:10,
              fontSize:12, fontFamily:"monospace",
              color: activeLine === i + 1 ? "#a29bfe" : "#7a90b8",
              background: activeLine === i + 1 ? "rgba(108,92,231,0.2)" : "transparent",
              fontWeight: activeLine === i + 1 ? 700 : 400,
            }}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* ── Code textarea (left-padded so text clears the gutter) ── */}
      <textarea
        ref={textaRef}
        onScroll={onScroll}
        onChange={onChange}
        onKeyDown={onKeyDown}
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        style={{
          display:"block", width:"100%", boxSizing:"border-box",
          paddingTop:14, paddingBottom:14,
          paddingLeft: GUTTER_W + 12, paddingRight:14,
          minHeight:220, background:"transparent",
          border:"none", outline:"none", resize:"none",
          fontSize:13, fontFamily:"monospace",
          color:"#f0f4ff", lineHeight:`${LINE_H}px`,
        }}
      />
    </div>
  );
}

// ── Log Analyzer Tab ──────────────────────────────────────────
const PLATFORMS = ["auto","Node.js","Python","Docker","Kubernetes","Nginx","Postgres","AWS","Linux","Java","Go","PHP","Ruby"];
const SEV_DOT = { CRITICAL:"var(--red)", HIGH:"var(--yellow)", MEDIUM:"var(--accent)", LOW:"var(--green)", INFO:"var(--t3)", CLEAN:"var(--green)" };

function LogAnalyzerTab({ project }) {
  const { getToken } = useAuth();
  const LKEY = `slz_la_${project.id}`;

  const [log,        setLog]        = useState(() => { try { return localStorage.getItem(`${LKEY}_log`) || ""; } catch { return ""; } });
  const [platform,   setPlatform]   = useState(() => { try { return localStorage.getItem(`${LKEY}_platform`) || "auto"; } catch { return "auto"; } });
  const [result,     setResult]     = useState(() => { try { const r = localStorage.getItem(`${LKEY}_result`); return r ? JSON.parse(r) : null; } catch { return null; } });
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [activeLine, setActiveLine] = useState(null);

  useEffect(() => { try { localStorage.setItem(`${LKEY}_log`,      log);      } catch {} }, [log]);
  useEffect(() => { try { localStorage.setItem(`${LKEY}_platform`,  platform); } catch {} }, [platform]);
  useEffect(() => { try { if (result) localStorage.setItem(`${LKEY}_result`, JSON.stringify(result)); else localStorage.removeItem(`${LKEY}_result`); } catch {} }, [result]);

  async function analyze() {
    if (!log.trim()) return;
    setLoading(true); setError(null); setResult(null); setActiveLine(null);
    try {
      const token = await getToken();
      const data  = await apiFetch("/api/log-analyze", {
        method: "POST", body: JSON.stringify({ log, platform }),
      }, token);
      setResult(data.result);
    } catch (e) { setError(e.message || "Analysis failed. Please retry."); }
    finally { setLoading(false); }
  }

  function jumpTo(lineNum) {
    setActiveLine(lineNum);
    setTimeout(() => setActiveLine(null), 2000); // flash for 2s then clear
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.aiToolHeader}>
        <div>
          <div className={styles.secLabel}>Log Analyzer</div>
          <p className={styles.aiToolDesc}>Paste any log output — AI identifies every error with exact line numbers, root cause, and a specific fix. Click any line badge to jump to it.</p>
        </div>
        <select className={styles.platformSelect} value={platform} onChange={e => setPlatform(e.target.value)}>
          {PLATFORMS.map(p => <option key={p} value={p}>{p === "auto" ? "Auto-detect platform" : p}</option>)}
        </select>
      </div>

      <CodeEditorPane
        value={log}
        onChange={e => { setLog(e.target.value); if (result) setResult(null); }}
        placeholder={"Paste your logs here...\n\nExamples:\n  • Docker container logs\n  • Node.js stack traces\n  • Kubernetes events\n  • Nginx / Postgres errors\n  • Python tracebacks\n  • AWS CloudWatch output"}
        activeLine={activeLine}
      />

      <div className={styles.analyzeRow}>
        <button
          className="btn btn-primary"
          onClick={analyze}
          disabled={loading || !log.trim()}
          style={{gap:8}}
        >
          {loading ? <><span className="spinner" style={{width:14,height:14,borderWidth:2}}/> Analyzing…</> : <><IconZap/> Analyze Logs</>}
        </button>
        {result && <button className="btn btn-outline btn-sm" onClick={() => { setResult(null); setLog(""); try { localStorage.removeItem(`${LKEY}_log`); localStorage.removeItem(`${LKEY}_result`); } catch {} }}>Clear</button>}
      </div>

      {error && <div className={styles.aiError}>{error}</div>}

      {result && (
        <div className={styles.analysisResult}>
          <div className={styles.resultSummaryBar}>
            <div className={styles.resultSevBadge} style={{background: SEV_DOT[result.overall_severity] + "22", color: SEV_DOT[result.overall_severity]}}>
              {result.overall_severity}
            </div>
            <div className={styles.resultPlatformTag}>{result.platform}</div>
            <div className={styles.resultIssueCount}>
              {result.issues_found > 0 ? `${result.issues_found} issue${result.issues_found !== 1 ? "s" : ""} found` : "✓ Clean — no issues"}
            </div>
          </div>

          {result.summary && <p className={styles.resultSummaryText}>{result.summary}</p>}
          {result.root_cause && (
            <div className={styles.rootCauseCard}>
              <span className={styles.rootCauseLabel}>Root cause</span>
              <span className={styles.rootCauseText}>{result.root_cause}</span>
            </div>
          )}

          {result.flagged_lines?.length > 0 && (
            <div className={styles.flaggedSection}>
              <div className={styles.secLabel} style={{marginBottom:10}}>Flagged Lines</div>
              <div className={styles.flaggedTable}>
                {result.flagged_lines.map((fl, i) => (
                  <div key={i} className={styles.flaggedRow}>
                    <div className={styles.flaggedMeta}>
                      <button className={styles.flaggedLineNumBtn} onClick={() => jumpTo(fl.line_number)} title="Jump to this line">
                        ↑ L{fl.line_number}
                      </button>
                      <span className={styles.flaggedSev} style={{color: SEV_DOT[fl.severity]}}>{fl.severity}</span>
                      <span className={styles.flaggedType}>{fl.issue_type}</span>
                    </div>
                    <code className={styles.flaggedContent}>{fl.content?.slice(0, 110)}{fl.content?.length > 110 ? "…" : ""}</code>
                    <div className={styles.flaggedDesc}>{fl.description}</div>
                    {fl.fix && <div className={styles.flaggedFix}><span className={styles.fixLabel}>Fix →</span> {fl.fix}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <div className={styles.recsSection}>
              <div className={styles.secLabel} style={{marginBottom:10}}>Recommendations</div>
              {result.recommendations.map((r, i) => (
                <div key={i} className={styles.recItem}><span className={styles.recNum}>{i + 1}</span>{r}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Code Inspector Tab ─────────────────────────────────────────
const LANGUAGES = ["auto","JavaScript","TypeScript","Python","Go","Java","PHP","Ruby","Rust","C++","C#","Swift","Kotlin","SQL","Bash","YAML"];
const ISSUE_ICON = { Bug: <IconBug/>, Security: <IconShield/>, Performance: <IconSpeed/>, Style: null, Deprecated: null, Logic: <IconBug/> };
const ISSUE_COLOR = { Bug:"var(--red)", Security:"#f97316", Performance:"var(--yellow)", Style:"var(--t3)", Deprecated:"var(--t3)", Logic:"var(--red)" };

function scoreColor(s) {
  if (s >= 85) return "var(--green)";
  if (s >= 65) return "var(--yellow)";
  if (s >= 40) return "var(--accent)";
  return "var(--red)";
}

function CodeInspectorTab({ project }) {
  const { getToken } = useAuth();
  const CKEY = `slz_ci_${project.id}`;

  const [code,        setCode]       = useState(() => { try { return localStorage.getItem(`${CKEY}_code`) || ""; } catch { return ""; } });
  const [lang,        setLang]       = useState(() => { try { return localStorage.getItem(`${CKEY}_lang`) || "auto"; } catch { return "auto"; } });
  const [result,      setResult]     = useState(() => { try { const r = localStorage.getItem(`${CKEY}_result`); return r ? JSON.parse(r) : null; } catch { return null; } });
  const [loading,     setLoading]    = useState(false);
  const [error,       setError]      = useState(null);
  const [resolved,    setResolved]   = useState(() => { try { const r = localStorage.getItem(`${CKEY}_resolved`); return r ? new Set(JSON.parse(r)) : new Set(); } catch { return new Set(); } });
  const [fixingIdx,   setFixingIdx]  = useState(null);
  const [fixingAll,   setFixingAll]  = useState(false);
  const [fixError,    setFixError]   = useState(null);
  const [activeLine,  setActiveLine] = useState(null);
  const [codeHistory, setCodeHistory] = useState([]);

  useEffect(() => { try { localStorage.setItem(`${CKEY}_code`,     code); } catch {} }, [code]);
  useEffect(() => { try { localStorage.setItem(`${CKEY}_lang`,     lang); } catch {} }, [lang]);
  useEffect(() => { try { if (result) localStorage.setItem(`${CKEY}_result`, JSON.stringify(result)); else localStorage.removeItem(`${CKEY}_result`); } catch {} }, [result]);
  useEffect(() => { try { localStorage.setItem(`${CKEY}_resolved`, JSON.stringify([...resolved])); } catch {} }, [resolved]);

  function jumpTo(lineNum) {
    setActiveLine(lineNum);
    setTimeout(() => setActiveLine(null), 2000);
  }

  // Ctrl+Z / Cmd+Z — undo Fix Now changes
  function handleCodeKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && codeHistory.length > 0) {
      e.preventDefault();
      const prev = codeHistory[codeHistory.length - 1];
      setCode(prev);
      setCodeHistory(h => h.slice(0, -1));
      setResult(null);
      setResolved(new Set());
      setFixError(null);
    }
  }

  async function inspect() {
    if (!code.trim()) return;
    setLoading(true); setError(null); setResult(null); setResolved(new Set()); setFixError(null); setActiveLine(null);
    try {
      const token = await getToken();
      const data  = await apiFetch("/api/code-inspect", {
        method: "POST", body: JSON.stringify({ code, language: lang }),
      }, token);
      setResult(data.result);
    } catch (e) { setError(e.message || "Inspection failed. Please retry."); }
    finally { setLoading(false); }
  }

  async function applyFix(idx, iss) {
    const snapshot = code; // save for undo
    setCodeHistory(h => [...h, snapshot]);
    setFixingIdx(idx); setFixError(null);
    try {
      const token = await getToken();
      const data  = await apiFetch("/api/apply-fix", {
        method: "POST",
        body: JSON.stringify({
          code,
          line: iss.line,
          description: iss.description,
          suggestion: iss.suggestion || iss.description,
        }),
      }, token);
      setCode(data.patched_code);
      setResolved(prev => new Set([...prev, idx]));
    } catch (e) {
      setCodeHistory(h => h.slice(0, -1)); // rollback history on error
      setFixError(`Fix failed for L${iss.line}: ${e.message}`);
    } finally { setFixingIdx(null); }
  }

  async function applyAllFixes() {
    const remaining = result.issues.filter((_, i) => !resolved.has(i));
    if (!remaining.length) return;
    const snapshot = code;
    setCodeHistory(h => [...h, snapshot]);
    setFixingAll(true); setFixError(null);
    try {
      const token = await getToken();
      const data  = await apiFetch("/api/apply-all-fixes", {
        method: "POST",
        body: JSON.stringify({
          code,
          issues: remaining.map(iss => ({
            line:        iss.line,
            description: iss.description,
            suggestion:  iss.suggestion || iss.description,
          })),
        }),
      }, token);
      setCode(data.patched_code);
      // Mark all remaining as resolved
      setResolved(prev => {
        const next = new Set(prev);
        result.issues.forEach((_, i) => { if (!prev.has(i)) next.add(i); });
        return next;
      });
    } catch (e) {
      setCodeHistory(h => h.slice(0, -1));
      setFixError(`Fix All failed: ${e.message}`);
    } finally { setFixingAll(false); }
  }

  const visibleIssues = result?.issues?.filter((_, i) => !resolved.has(i)) ?? [];
  const allFixed = result && result.issues?.length > 0 && visibleIssues.length === 0;

  return (
    <div className={styles.tabContent}>
      <div className={styles.aiToolHeader}>
        <div>
          <div className={styles.secLabel}>Code Inspector</div>
          <p className={styles.aiToolDesc}>Paste code for a pre-commit review — AI flags bugs, security holes, and performance issues with exact line numbers.</p>
        </div>
        <select className={styles.platformSelect} value={lang} onChange={e => setLang(e.target.value)}>
          {LANGUAGES.map(l => <option key={l} value={l}>{l === "auto" ? "Auto-detect language" : l}</option>)}
        </select>
      </div>

      <CodeEditorPane
        value={code}
        onChange={e => { setCode(e.target.value); setCodeHistory([]); if (result) { setResult(null); setResolved(new Set()); } }}
        placeholder={"Paste your code here...\n\nThe inspector will check for:\n  • Bugs and logic errors\n  • Security vulnerabilities\n  • Performance bottlenecks\n  • Deprecated patterns\n\nSupports JS, TS, Python, Go, Java, PHP, Ruby, Rust, and more."}
        activeLine={activeLine}
        onKeyDown={handleCodeKeyDown}
      />

      <div className={styles.analyzeRow}>
        <button
          className="btn btn-primary"
          onClick={inspect}
          disabled={loading || !code.trim()}
          style={{gap:8}}
        >
          {loading ? <><span className="spinner" style={{width:14,height:14,borderWidth:2}}/> Inspecting…</> : <><IconCode/> Inspect Code</>}
        </button>
        {result && <button className="btn btn-outline btn-sm" onClick={() => { setResult(null); setCode(""); setResolved(new Set()); try { localStorage.removeItem(`${CKEY}_code`); localStorage.removeItem(`${CKEY}_result`); localStorage.removeItem(`${CKEY}_resolved`); } catch {} }}>Clear</button>}
      </div>

      {error    && <div className={styles.aiError}>{error}</div>}
      {fixError && <div className={styles.aiError}>{fixError}</div>}

      {result && (
        <div className={styles.analysisResult}>
          {/* Score + verdict */}
          <div className={styles.scoreRow}>
            <div className={styles.scoreCircle} style={{borderColor: scoreColor(result.score), color: scoreColor(result.score)}}>
              <span className={styles.scoreNum}>{result.score}</span>
              <span className={styles.scoreDenom}>/100</span>
            </div>
            <div className={styles.scoreDetails}>
              <div className={styles.scoreVerdict}>{result.verdict}</div>
              <div className={styles.scoreLang}>{result.language} · {result.total_lines} lines · {visibleIssues.length} issue{visibleIssues.length !== 1 ? "s" : ""} remaining</div>
              {result.summary && <p className={styles.scoreSummary}>{result.summary}</p>}
            </div>
          </div>

          {/* All fixed celebration */}
          {allFixed && (
            <div className={styles.allFixedCard}>
              <span style={{fontSize:28}}>✅</span>
              <div>
                <div className={styles.allFixedTitle}>All issues resolved!</div>
                <div className={styles.allFixedSub}>Your code is clean. The fixes have been applied to the editor above — copy it out when ready.</div>
              </div>
            </div>
          )}

          {/* Issues */}
          {visibleIssues.length > 0 && (
            <div className={styles.flaggedSection}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
                <div className={styles.secLabel}>
                  Issues Found
                  {resolved.size > 0 && <span style={{marginLeft:8,fontSize:11,color:"var(--green)",fontWeight:500}}>· {resolved.size} fixed</span>}
                </div>
                <button
                  onClick={applyAllFixes}
                  disabled={fixingAll || fixingIdx !== null}
                  style={{
                    display:"flex", alignItems:"center", gap:7,
                    padding:"8px 18px", borderRadius:8,
                    background: fixingAll ? "#5a4bd1" : "#6c5ce7",
                    color:"#fff", border:"none", fontWeight:700,
                    fontSize:13, cursor:"pointer", whiteSpace:"nowrap",
                    opacity: fixingIdx !== null ? 0.5 : 1,
                    boxShadow:"0 2px 10px rgba(108,92,231,0.45)",
                    transition:"background .15s",
                  }}
                >
                  {fixingAll
                    ? <><span className="spinner" style={{width:12,height:12,borderWidth:2}}/> Fixing all…</>
                    : <>⚡ Fix All ({visibleIssues.length})</>}
                </button>
              </div>
              <div className={styles.flaggedTable}>
                {result.issues.map((iss, i) => {
                  if (resolved.has(i)) return null;
                  const isFixing = fixingIdx === i;
                  return (
                    <div key={i} className={styles.flaggedRow}>
                      {/* inline style guarantees flex layout regardless of CSS module issues */}
                      <div className={styles.flaggedRowInner} style={{display:"flex",alignItems:"center",gap:14}}>
                        <div className={styles.flaggedBody} style={{flex:1,minWidth:0}}>
                          <div className={styles.flaggedMeta}>
                            <button className={styles.flaggedLineNumBtn} onClick={() => jumpTo(iss.line)} title="Jump to this line">
                              ↑ L{iss.line}
                            </button>
                            <span className={styles.flaggedSev} style={{color: SEV_DOT[iss.severity]}}>{iss.severity}</span>
                            <span className={styles.flaggedType} style={{color: ISSUE_COLOR[iss.type] || "var(--t2)"}}>{iss.type}</span>
                          </div>
                          <div className={styles.flaggedDesc}>{iss.description}</div>
                          {iss.suggestion && <div className={styles.flaggedFix}><span className={styles.fixLabel}>Fix →</span> {iss.suggestion}</div>}
                        </div>
                        {/* solid inline style — cannot be hidden by CSS modules */}
                        <button
                          onClick={() => applyFix(i, iss)}
                          disabled={fixingIdx !== null || fixingAll}
                          style={{
                            flexShrink:0, whiteSpace:"nowrap",
                            background: isFixing ? "#5a4bd1" : "#6c5ce7",
                            color:"#fff", border:"none",
                            borderRadius:8, padding:"9px 20px",
                            fontSize:13, fontWeight:700, cursor:"pointer",
                            opacity: fixingIdx !== null && !isFixing ? 0.5 : 1,
                            display:"flex", alignItems:"center", gap:6,
                            boxShadow:"0 2px 8px rgba(108,92,231,0.4)",
                          }}
                        >
                          {isFixing
                            ? <><span className="spinner" style={{width:12,height:12,borderWidth:2}}/> Fixing…</>
                            : <>⚡ Fix Now</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strengths + improvements */}
          {!allFixed && (
            <div className={styles.strengthsGrid}>
              {result.strengths?.length > 0 && (
                <div className={styles.strengthsCard}>
                  <div className={styles.secLabel} style={{marginBottom:8,color:"var(--green)"}}>Strengths</div>
                  {result.strengths.map((s, i) => <div key={i} className={styles.strengthItem}><IconCheck/> {s}</div>)}
                </div>
              )}
              {result.improvements?.length > 0 && (
                <div className={styles.strengthsCard}>
                  <div className={styles.secLabel} style={{marginBottom:8,color:"var(--yellow)"}}>Improvements</div>
                  {result.improvements.map((s, i) => <div key={i} className={styles.strengthItem} style={{color:"var(--t2)"}}><IconAnalyze/> {s}</div>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Runbook Studio Tab ─────────────────────────────────────────
function RunbooksTab({ project, analyses }) {
  const { getToken } = useAuth();
  const storageKey   = `slz_runbooks_${project.id}`;
  const [runbooks,    setRunbooks]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  });
  const [selected,    setSelected]    = useState(null);
  const [generating,  setGenerating]  = useState(false);
  const [error,       setError]       = useState(null);
  const [copied,      setCopied]      = useState(false);

  function save(list) {
    setRunbooks(list);
    localStorage.setItem(storageKey, JSON.stringify(list));
  }

  async function generate() {
    if (analyses.length === 0) return;
    setGenerating(true); setError(null);
    try {
      const token = await getToken();
      const data  = await apiFetch("/api/generate-runbook", {
        method: "POST",
        body: JSON.stringify({
          projectName: project.name,
          stack:       project.stack,
          incidents:   analyses.slice(0, 6).map(a => ({ severity: a.severity, title: a.title, source: a.source })),
        }),
      }, token);
      const newList = [{ ...data.runbook, id: Date.now(), created: new Date().toISOString() }, ...runbooks];
      save(newList);
      setSelected(newList[0]);
    } catch (e) { setError(e.message || "Generation failed. Please retry."); }
    finally { setGenerating(false); }
  }

  function deleteRunbook(id) {
    const next = runbooks.filter(r => r.id !== id);
    save(next);
    if (selected?.id === id) setSelected(next[0] || null);
  }

  function copyMarkdown(rb) {
    const md = [
      `# ${rb.title}`,
      `\n${rb.description}`,
      `\n**Severity:** ${rb.severity}  |  **Est. resolution:** ${rb.estimated_resolution_time}`,
      `\n## Triggers\n${rb.triggers?.map(t => `- ${t}`).join("\n")}`,
      `\n## Steps\n${rb.steps?.map(s => `### Step ${s.step}: ${s.title}\n${s.action}${s.command ? `\n\`\`\`\n${s.command}\n\`\`\`` : ""}\n**Verify:** ${s.verification}`).join("\n\n")}`,
      `\n## Escalation\n${rb.escalation}`,
      `\n## Prevention\n${rb.prevention?.map(p => `- ${p}`).join("\n")}`,
    ].join("\n");
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const SEV_C = { CRITICAL:"var(--red)", HIGH:"var(--yellow)", MEDIUM:"var(--accent)", LOW:"var(--green)" };

  return (
    <div className={styles.tabContent}>
      <div className={styles.aiToolHeader}>
        <div>
          <div className={styles.secLabel}>Runbook Studio</div>
          <p className={styles.aiToolDesc}>AI generates production-ready runbooks from your incident history. Saved locally to this project.</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={generate}
          disabled={generating || analyses.length === 0}
          style={{gap:7,flexShrink:0}}
        >
          {generating ? <><span className="spinner" style={{width:12,height:12,borderWidth:2}}/> Generating…</> : <><IconBook/> Generate Runbook</>}
        </button>
      </div>

      {analyses.length === 0 && (
        <div className={styles.emptySection}>
          <p>No incidents yet. Run at least one log analysis first — the AI uses your incident history to generate relevant runbooks.</p>
          <Link to={`/?project=${project.id}`} className="btn btn-primary btn-sm" style={{marginTop:12,display:"inline-flex"}}>
            <IconAnalyze/> Analyze a log
          </Link>
        </div>
      )}

      {error && <div className={styles.aiError}>{error}</div>}

      {runbooks.length === 0 && analyses.length > 0 && !generating && (
        <div className={styles.emptySection}>
          <p>No runbooks yet. Click "Generate Runbook" above — the AI will create a step-by-step playbook based on your {analyses.length} incident{analyses.length !== 1 ? "s" : ""}.</p>
        </div>
      )}

      {runbooks.length > 0 && (
        <div className={styles.runbookLayout}>
          {/* List */}
          <div className={styles.runbookList}>
            {runbooks.map(rb => (
              <div
                key={rb.id}
                className={`${styles.runbookListItem} ${selected?.id === rb.id ? styles.runbookListItemActive : ""}`}
                onClick={() => setSelected(rb)}
              >
                <div className={styles.runbookListTitle}>{rb.title}</div>
                <div className={styles.runbookListMeta}>
                  <span style={{color: SEV_C[rb.severity]}}>{rb.severity}</span>
                  <span>{rb.estimated_resolution_time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className={styles.runbookDetail}>
              <div className={styles.runbookDetailHeader}>
                <div>
                  <div className={styles.runbookTitle}>{selected.title}</div>
                  <div className={styles.runbookMeta}>
                    <span className={styles.resultSevBadge} style={{background: (SEV_C[selected.severity]||"var(--t3)") + "22", color: SEV_C[selected.severity]||"var(--t3)"}}>{selected.severity}</span>
                    <span className={styles.runbookMetaItem}>⏱ {selected.estimated_resolution_time}</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0}}>
                  <button className="btn btn-outline btn-sm" style={{gap:6}} onClick={() => copyMarkdown(selected)}>
                    <IconClipboard/> {copied ? "Copied!" : "Copy MD"}
                  </button>
                  <button className="btn btn-danger btn-sm" style={{gap:6}} onClick={() => deleteRunbook(selected.id)}>
                    <IconTrash/>
                  </button>
                </div>
              </div>

              {selected.description && <p className={styles.runbookDesc}>{selected.description}</p>}

              {selected.triggers?.length > 0 && (
                <div className={styles.runbookSection}>
                  <div className={styles.secLabel} style={{marginBottom:8}}>Triggers</div>
                  {selected.triggers.map((t, i) => <div key={i} className={styles.recItem}><span className={styles.recNum}>!</span>{t}</div>)}
                </div>
              )}

              <div className={styles.runbookSection}>
                <div className={styles.secLabel} style={{marginBottom:10}}>Resolution Steps</div>
                {selected.steps?.map(s => (
                  <div key={s.step} className={styles.runbookStep}>
                    <div className={styles.runbookStepNum}>{s.step}</div>
                    <div className={styles.runbookStepBody}>
                      <div className={styles.runbookStepTitle}>{s.title}</div>
                      <div className={styles.runbookStepAction}>{s.action}</div>
                      {s.command && <code className={styles.runbookCommand}>{s.command}</code>}
                      {s.verification && <div className={styles.runbookVerify}><span style={{color:"var(--green)",fontWeight:600}}>✓ Verify:</span> {s.verification}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {selected.escalation && (
                <div className={styles.runbookSection}>
                  <div className={styles.secLabel} style={{marginBottom:8}}>Escalation</div>
                  <div className={styles.escalationCard}>{selected.escalation}</div>
                </div>
              )}

              {selected.prevention?.length > 0 && (
                <div className={styles.runbookSection}>
                  <div className={styles.secLabel} style={{marginBottom:8}}>Prevention</div>
                  {selected.prevention.map((p, i) => <div key={i} className={styles.recItem}><span className={styles.recNum}>{i + 1}</span>{p}</div>)}
                </div>
              )}

              {selected.tags?.length > 0 && (
                <div className={styles.tagRow}>
                  {selected.tags.map(t => <span key={t} className={styles.stackTag}>{t}</span>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────
function SettingsTab({ project, onUpdated, onDeleted }) {
  const { getToken } = useAuth();
  const { showToast } = useToast();
  const [name,       setName]       = useState(project.name);
  const [desc,       setDesc]       = useState(project.description || "");
  const [githubRepo, setGithubRepo] = useState(project.github_repo || "");
  const [apiKey,     setApiKey]     = useState(project.api_key || `slp_${project.id.replace(/-/g,"").slice(0,24)}`);
  const [saving,     setSaving]     = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [env,        setEnv]        = useState(project.environment || "production");

  async function save() {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description: desc, github_repo: githubRepo, environment: env }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Project updated", "success");
      onUpdated(data.project);
    } catch (err) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.settingsGrid}>

        {/* Project details */}
        <div className={styles.settingsCard}>
          <div className={styles.settingsCardTitle}>Project Details</div>
          <div className="form-group">
            <label className="form-label">Project name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)}/>
          </div>
          <div className="form-group" style={{marginTop:14}}>
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does this service do?"/>
          </div>
          <div className="form-group" style={{marginTop:14}}>
            <label className="form-label">Environment</label>
            <select className="form-input" value={env} onChange={e => setEnv(e.target.value)}>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="qa">QA</option>
              <option value="development">Development</option>
            </select>
          </div>
        </div>

        {/* Git integration - coming soon */}
        <div className={styles.settingsCard}>
          <div className={styles.settingsCardTitle}><IconGithub/> Git Integration</div>
          <p className={styles.settingsCardDesc}>
            Connect your repository from GitHub, GitLab, Bitbucket, or Azure DevOps. Automatically pull error logs from failed pipelines and CI/CD workflows directly into this project.
          </p>
          <div className={styles.comingSoonPill}>Coming in Developer v2</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16}}>
            <div className={styles.comingSoonFeature}><IconCheck/> GitHub, GitLab, Bitbucket, Azure DevOps</div>
            <div className={styles.comingSoonFeature}><IconCheck/> Auto-import failed pipeline logs</div>
            <div className={styles.comingSoonFeature}><IconCheck/> Trigger analysis on push events</div>
            <div className={styles.comingSoonFeature}><IconCheck/> Link commits to incidents</div>
          </div>
        </div>

        {/* API Key */}
        <div className={styles.settingsCard}>
          <div className={styles.settingsCardTitle}><IconKey/> Project API Key</div>
          <p className={styles.settingsCardDesc}>Use this key to send logs directly to this project from your application or CI/CD pipeline.</p>
          <div className={styles.apiKeyBox}>
            <code className={styles.apiKeyText}>{apiKey}</code>
            <button className={styles.copyBtn} onClick={copyKey}>
              {copied ? <><IconCheck/> Copied</> : <><IconCopy/> Copy</>}
            </button>
          </div>
          <div className={styles.apiKeyHint}>Keep this key secret. Do not commit it to version control.</div>
        </div>

        {/* Danger zone */}
        <div className={`${styles.settingsCard} ${styles.dangerCard}`}>
          <div className={styles.settingsCardTitle} style={{color:"var(--red)"}}>Danger Zone</div>
          <p className={styles.settingsCardDesc}>Deleting a project permanently removes all incidents, runbooks, and settings. This cannot be undone.</p>
          <button
            className="btn btn-danger btn-sm"
            style={{marginTop:12}}
            onClick={async () => {
              if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
              const token = await getToken();
              await fetch(`${API_BASE}/api/projects/${project.id}`, {
                method:"DELETE",
                headers:{ Authorization:`Bearer ${token}` },
              });
              showToast("Project deleted","success");
              onDeleted();
            }}
          >
            Delete this project
          </button>
        </div>

      </div>

      <div className={styles.saveRow}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? <><span className="spinner"/> Saving…</> : <><IconSave/> Save changes</>}
        </button>
      </div>
    </div>
  );
}

// ── Main ProjectDetail page ───────────────────────────────────
export default function ProjectDetail() {
  const { id } = useParams();
  const { getToken, isLoggedIn, loading: authLoading, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [project,    setProject]    = useState(null);
  const [analyses,   setAnalyses]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState(false);
  const [tab,        setTab]        = useState("overview");

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { navigate("/login"); return; }
    load();
  }, [id, isLoggedIn, authLoading]);

  async function load() {
    setLoading(true);
    setLoadError(false);
    try {
      const token = await getToken();
      const data  = await apiFetch(`/api/projects/${id}`, {}, token);
      setProject(data.project);
      setAnalyses(data.analyses || []);
    } catch (err) {
      // Don't navigate away — show inline error so user stays on this URL
      setLoadError(true);
      showToast("Could not load project — tap Retry", "error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
      <span className="spinner" style={{width:32,height:32,borderWidth:3}}/>
    </div>
  );

  if (loadError) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:16,color:"var(--t2)"}}>
      <div style={{fontSize:15}}>Could not load project.</div>
      <button className="btn btn-primary btn-sm" onClick={load}>Retry</button>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate("/projects")}>← Back to Projects</button>
    </div>
  );

  if (!project) return null;

  const COLORS = [
    "linear-gradient(135deg,#4f8ef7,#7c6af7)",
    "linear-gradient(135deg,#06b6d4,#4f8ef7)",
    "linear-gradient(135deg,#8b5cf6,#ec4899)",
    "linear-gradient(135deg,#10b981,#06b6d4)",
  ];
  const avatarBg = COLORS[project.name.charCodeAt(0) % COLORS.length];

  return (
    <div className={styles.page}>
      <div className="container">

        {/* ── Header ───────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => navigate("/projects")}>
              <IconBack/> Projects
            </button>
            <div className={styles.projectAvatar} style={{background: project.avatar_url ? "transparent" : avatarBg, overflow:"hidden"}}>
              {project.avatar_url
                ? <img src={project.avatar_url} alt={project.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : project.name.charAt(0).toUpperCase()
              }
            </div>
            <div className={styles.projectMeta}>
              <div className={styles.projectName}>{project.name}</div>
              {project.description && <div className={styles.projectDesc}>{project.description}</div>}
            </div>
          </div>
          <div className={styles.headerRight}>
            {project.environment && (
              <span className={styles.envBadge}>{project.environment}</span>
            )}
            {/* User avatar */}
            <div title={profile?.name || "You"} style={{
              width:34,height:34,borderRadius:"50%",overflow:"hidden",flexShrink:0,
              background:"#6c5ce7",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:13,fontWeight:700,color:"#fff",border:"2px solid var(--border2)",
            }}>
              {profile?.avatar
                ? <img src={profile.avatar} alt={profile?.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <span>{profile?.name?.charAt(0)?.toUpperCase() || "U"}</span>
              }
            </div>
            <Link to={`/?project=${project.id}`} className="btn btn-primary btn-sm">
              <IconAnalyze/> Analyze log
            </Link>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────── */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ──────────────────────────── */}
        {tab === "overview"        && <OverviewTab      project={project} analyses={analyses}/>}
        {tab === "incidents"       && <IncidentsTab     analyses={analyses} projectId={project.id}/>}
        {tab === "log-analyzer"    && <LogAnalyzerTab   project={project}/>}
        {tab === "code-inspector"  && <CodeInspectorTab project={project}/>}
        {tab === "runbooks"        && <RunbooksTab      project={project} analyses={analyses}/>}
        {tab === "settings"        && <SettingsTab      project={project} onUpdated={p => setProject(p)} onDeleted={() => navigate("/projects")}/>}

      </div>
    </div>
  );
}
