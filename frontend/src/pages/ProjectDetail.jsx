import React, { useState, useEffect } from "react";
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
function IconHome() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconGithub() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>; }
function IconKey() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>; }
function IconCopy() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>; }
function IconAnalyze() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>; }
function IconAlert() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function IconCheck() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function IconSave() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>; }

const TABS = [
  { id: "overview",  label: "Overview",  icon: <IconHome/> },
  { id: "incidents", label: "Incidents", icon: <IconActivity/> },
  { id: "runbooks",  label: "Runbooks",  icon: <IconBook/> },
  { id: "terminal",  label: "Terminal",  icon: <IconTerminal/> },
  { id: "settings",  label: "Settings",  icon: <IconSettings/> },
];

const SEV_COLOR = { CRITICAL:"var(--red)", HIGH:"var(--yellow)", MEDIUM:"var(--accent)", LOW:"var(--green)" };

// ── Overview Tab ──────────────────────────────────────────────
function OverviewTab({ project, analyses }) {
  const critical = analyses.filter(a => a.severity === "CRITICAL").length;
  const high     = analyses.filter(a => a.severity === "HIGH").length;
  const total    = analyses.length;
  const score    = total === 0 ? 100 : Math.max(0, Math.round(100 - (critical * 15) - (high * 5) - ((total - critical - high) * 1)));
  const scoreColor = score >= 80 ? "var(--green)" : score >= 60 ? "var(--yellow)" : "var(--red)";

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
          <div className={styles.sectionTitle}>Tech Stack</div>
          <div className={styles.stackRow}>
            {project.stack.map(s => <span key={s} className={styles.stackTag}>{s}</span>)}
          </div>
        </div>
      )}

      {/* Recent incidents */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Recent Incidents</div>
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

      {/* AI Insight */}
      {analyses.length >= 3 && (
        <div className={styles.aiInsight}>
          <div className={styles.aiInsightLabel}>AI Insight</div>
          <p className={styles.aiInsightText}>
            {critical > 0
              ? `This project has had ${critical} critical incident${critical > 1 ? "s" : ""}. Consider reviewing your infrastructure for recurring failure patterns.`
              : total > 5
              ? `This project has accumulated ${total} incidents. Review the incident timeline to identify patterns before they become outages.`
              : "Not enough data yet to generate AI insights. Run more analyses to unlock pattern detection."}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Incidents Tab ─────────────────────────────────────────────
function IncidentsTab({ analyses, projectId }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>Incident History</div>
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

// ── Runbooks Tab ──────────────────────────────────────────────
function RunbooksTab({ project }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionTitle}>AI Runbooks</div>
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonIcon}><IconBook/></div>
        <div className={styles.comingSoonTitle}>Runbooks — Coming Soon</div>
        <p className={styles.comingSoonDesc}>
          After analyzing an incident, click "Generate Runbook" to create a step-by-step operations playbook. Every runbook is saved here permanently so your team never solves the same problem twice.
        </p>
        <div className={styles.comingSoonFeatures}>
          <div className={styles.comingSoonFeature}><IconCheck/> Auto-generated from incident analysis</div>
          <div className={styles.comingSoonFeature}><IconCheck/> Saved to this project permanently</div>
          <div className={styles.comingSoonFeature}><IconCheck/> Includes CLI commands and verification steps</div>
          <div className={styles.comingSoonFeature}><IconCheck/> Searchable across all projects</div>
        </div>
      </div>
    </div>
  );
}

// ── Terminal Tab ──────────────────────────────────────────────
function TerminalTab() {
  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionTitle}>Project Terminal</div>
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonIcon}><IconTerminal/></div>
        <div className={styles.comingSoonTitle}>Terminal — Coming Soon</div>
        <p className={styles.comingSoonDesc}>
          Run diagnostic commands directly in your browser — kubectl, docker, curl, ping, netstat — scoped to this project's environment. No SSH session required.
        </p>
        <Link to="/terminal" className="btn btn-outline btn-sm" style={{marginTop:16,display:"inline-flex"}}>
          Use global terminal for now →
        </Link>
      </div>
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────
function SettingsTab({ project, onUpdated }) {
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
          <button className="btn btn-danger btn-sm" style={{marginTop:12}}>Delete this project</button>
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
  const { getToken, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [project,  setProject]  = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("overview");

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    load();
  }, [id, isLoggedIn]);

  async function load() {
    setLoading(true);
    try {
      const token = await getToken();
      const data  = await apiFetch(`/api/projects/${id}`, {}, token);
      setProject(data.project);
      setAnalyses(data.analyses || []);
    } catch (err) {
      showToast("Could not load project", "error");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
      <span className="spinner" style={{width:32,height:32,borderWidth:3}}/>
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
            <div className={styles.projectAvatar} style={{background: avatarBg}}>
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className={styles.projectName}>{project.name}</h1>
              {project.description && <p className={styles.projectDesc}>{project.description}</p>}
            </div>
          </div>
          <div className={styles.headerRight}>
            {project.environment && (
              <span className={styles.envBadge}>{project.environment}</span>
            )}
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
        {tab === "overview"  && <OverviewTab  project={project} analyses={analyses}/>}
        {tab === "incidents" && <IncidentsTab analyses={analyses} projectId={project.id}/>}
        {tab === "runbooks"  && <RunbooksTab  project={project}/>}
        {tab === "terminal"  && <TerminalTab/>}
        {tab === "settings"  && <SettingsTab  project={project} onUpdated={p => setProject(p)}/>}

      </div>
    </div>
  );
}
