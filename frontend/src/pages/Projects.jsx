import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import styles from "./Projects.module.css";

// Gradient palette for cards
const GRADIENTS = [
  { strip:"linear-gradient(90deg,#6c5ce7,#a29bfe)", avatar:"linear-gradient(135deg,#6c5ce7,#a29bfe)", accent:"rgba(108,92,231,0.5)" },
  { strip:"linear-gradient(90deg,#0984e3,#74b9ff)", avatar:"linear-gradient(135deg,#0984e3,#74b9ff)", accent:"rgba(9,132,227,0.5)" },
  { strip:"linear-gradient(90deg,#00b894,#55efc4)", avatar:"linear-gradient(135deg,#00b894,#55efc4)", accent:"rgba(0,184,148,0.5)" },
  { strip:"linear-gradient(90deg,#e84393,#fd79a8)", avatar:"linear-gradient(135deg,#e84393,#fd79a8)", accent:"rgba(232,67,147,0.5)" },
  { strip:"linear-gradient(90deg,#e17055,#fab1a0)", avatar:"linear-gradient(135deg,#e17055,#fab1a0)", accent:"rgba(225,112,85,0.5)" },
  { strip:"linear-gradient(90deg,#fdcb6e,#ffeaa7)", avatar:"linear-gradient(135deg,#fdcb6e,#e17055)", accent:"rgba(253,203,110,0.5)" },
];

const STACK_OPTIONS = [
  "Node.js","Python","React","Next.js","Docker","Kubernetes",
  "AWS","GCP","Azure","Postgres","MySQL","MongoDB","Redis",
  "Nginx","Linux","GitHub Actions",
];

const API_BASE = import.meta.env.VITE_API_URL || "";

async function apiFetch(path, opts = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...opts.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function IconFolder() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
}
function IconPlus() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IconAnalyze() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function IconEdit() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function IconTrash() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function IconClose() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IconActivity() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
function IconCalendar() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

// ── Modal ─────────────────────────────────────────────────────
export function ProjectModal({ onClose, onCreated, existing = null }) {
  const { getToken, isPro } = useAuth();
  const { showToast } = useToast();
  const [name,   setName]   = useState(existing?.name || "");
  const [desc,   setDesc]   = useState(existing?.description || "");
  const [stack,  setStack]  = useState(existing?.stack || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function toggleStack(s) {
    setStack(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function submit() {
    if (!name.trim()) return showToast("Project name is required", "error");
    setSaving(true);
    try {
      const token  = await getToken();
      const path   = existing ? `/api/projects/${existing.id}` : "/api/projects";
      const method = existing ? "PATCH" : "POST";
      const { project } = await apiFetch(path, {
        method,
        body: JSON.stringify({ name, description: desc, stack }),
      }, token);
      showToast(existing ? "Project updated" : "Project created!", "success");
      onCreated(project);
      onClose();
    } catch (err) {
      if (err.message?.includes("upgrade") || err.message?.includes("limited")) {
        showToast("Free plan allows 1 project — upgrade to Developer for unlimited", "error");
      } else {
        showToast(err.message || "Failed to save project", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>{existing ? "Edit project" : "New project"}</h2>
            <p className={styles.modalSub}>Projects organise all incidents, runbooks and team notes for one application.</p>
          </div>
          <button className={styles.modalClose} onClick={onClose}><IconClose/></button>
        </div>

        <div className={styles.modalBody}>
          <div className="form-group">
            <label className="form-label">Project name *</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Production API, E-commerce App, K8s Cluster"
              autoFocus
            />
          </div>

          <div className="form-group" style={{marginTop:16}}>
            <label className="form-label">Description <span style={{color:"var(--t3)",fontWeight:400}}>(optional)</span></label>
            <textarea
              className="form-input"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="What does this service do? Who owns it?"
              rows={3}
            />
          </div>

          <div style={{marginTop:20}}>
            <label className="form-label" style={{display:"block",marginBottom:10}}>
              Tech stack <span style={{color:"var(--t3)",fontWeight:400}}>(select all that apply)</span>
            </label>
            <div className={styles.stackGrid}>
              {STACK_OPTIONS.map(s => (
                <button
                  key={s}
                  className={`${styles.stackChip} ${stack.includes(s) ? styles.stackChipActive : ""}`}
                  onClick={() => toggleStack(s)}
                  type="button"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {!isPro && !existing && (
            <div className={styles.planNote}>
              <span style={{color:"var(--accent)"}}>⚡</span>
              Free plan includes 1 project.{" "}
              <Link to="/pricing" style={{color:"var(--accent)"}}>Upgrade for unlimited →</Link>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving || !name.trim()}>
            {saving ? <><span className="spinner"/>Saving…</> : existing ? "Save changes" : "Create project"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Projects page ─────────────────────────────────────────────
export default function Projects() {
  const { getToken, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editProject, setEditProject] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    loadProjects();
  }, [isLoggedIn]);

  async function loadProjects() {
    setLoading(true);
    try {
      const token = await getToken();
      const { projects } = await apiFetch("/api/projects", {}, token);
      setProjects(projects || []);
    } catch (err) {
      showToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const token = await getToken();
      await apiFetch(`/api/projects/${id}`, { method: "DELETE" }, token);
      setProjects(p => p.filter(x => x.id !== id));
      showToast("Project deleted", "success");
    } catch (err) {
      showToast("Failed to delete project", "error");
    }
  }

  function onCreated(project) {
    setProjects(p => {
      const exists = p.find(x => x.id === project.id);
      if (exists) return p.map(x => x.id === project.id ? project : x);
      return [project, ...p];
    });
  }

  function getInitial(name) {
    return name?.charAt(0)?.toUpperCase() || "P";
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className={styles.page}>
      <div className="container">

        {/* ── Header ───────────────────────────────── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Projects</h1>
            <p className={styles.sub}>Each project is a dedicated workspace for one application, service, or environment.</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
            <IconPlus/> New project
          </button>
        </div>

        {/* ── Content ──────────────────────────────── */}
        {loading ? (
          <div className={styles.loading}>
            <span className="spinner" style={{width:32,height:32,borderWidth:3}}/>
          </div>
        ) : projects.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIllustration}>
              <IconFolder/>
            </div>
            <h2 className={styles.emptyTitle}>No projects yet</h2>
            <p className={styles.emptySub}>
              Create your first project to start building a dedicated incident workspace for your application — with history, runbooks, and team collaboration all in one place.
            </p>
            <button className="btn btn-primary" style={{marginTop:8}} onClick={() => setShowModal(true)}>
              <IconPlus/> Create your first project
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {projects.map((p, idx) => {
              const palette = GRADIENTS[idx % GRADIENTS.length];
              return (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className={styles.card}
                  style={{ "--cardAccentColor": palette.accent }}
                >
                  {/* Coloured top strip */}
                  <div className={styles.cardStrip} style={{ background: palette.strip }}/>

                  <div className={styles.cardBody}>
                    {/* Avatar + name */}
                    <div className={styles.cardTop}>
                      <div className={styles.cardAvatar} style={{ background: palette.avatar }}>
                        {getInitial(p.name)}
                      </div>
                      <div>
                        <div className={styles.cardName}>{p.name}</div>
                        {p.description && <div className={styles.cardDesc}>{p.description}</div>}
                      </div>
                    </div>

                    {/* Stack tags */}
                    {p.stack?.length > 0 && (
                      <div className={styles.cardStack}>
                        {p.stack.slice(0, 4).map(s => (
                          <span key={s} className={styles.stackTag}>{s}</span>
                        ))}
                        {p.stack.length > 4 && (
                          <span className={styles.stackTag}>+{p.stack.length - 4}</span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className={styles.cardFooter}>
                      <span className={styles.cardDate}>{formatDate(p.created_at)}</span>
                      <span className={styles.cardEnter}>Open workspace →</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* New project card */}
            <button className={styles.newCard} onClick={() => { setEditProject(null); setShowModal(true); }}>
              <div className={styles.newCardInner}>
                <div className={styles.newCardIcon}><IconPlus/></div>
                <div className={styles.newCardLabel}>New project</div>
                <div className={styles.newCardSub}>Add another workspace</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <ProjectModal
          onClose={() => { setShowModal(false); setEditProject(null); }}
          onCreated={onCreated}
          existing={editProject}
        />
      )}
    </div>
  );
}
