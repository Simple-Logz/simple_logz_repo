import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import styles from "./Projects.module.css";

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

// ── Create / Edit modal ───────────────────────────────────────
export function ProjectModal({ onClose, onCreated, existing = null }) {
  const { getToken, isPro } = useAuth();
  const { showToast } = useToast();
  const [name,   setName]   = useState(existing?.name || "");
  const [desc,   setDesc]   = useState(existing?.description || "");
  const [stack,  setStack]  = useState(existing?.stack || []);
  const [saving, setSaving] = useState(false);

  function toggleStack(s) {
    setStack(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function submit() {
    if (!name.trim()) return showToast("Project name is required", "error");
    setSaving(true);
    try {
      const token = await getToken();
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

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{existing ? "Edit project" : "Create a project"}</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className="form-group">
            <label className="form-label">Project name *</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Production API, E-commerce App"
              autoFocus
            />
          </div>

          <div className="form-group" style={{marginTop:16}}>
            <label className="form-label">Description <span style={{color:"var(--t3)"}}>(optional)</span></label>
            <textarea
              className="form-input"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="What does this project do?"
              rows={3}
            />
          </div>

          <div style={{marginTop:16}}>
            <label className="form-label" style={{display:"block",marginBottom:10}}>Tech stack <span style={{color:"var(--t3)"}}>(select all that apply)</span></label>
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
              <span>⚡</span>
              Free plan includes 1 project. <Link to="/pricing" style={{color:"var(--accent)"}}>Upgrade for unlimited →</Link>
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
    </div>
  );
}

// ── Projects page ─────────────────────────────────────────────
export default function Projects() {
  const { getToken, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [projects,     setProjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editProject,  setEditProject]  = useState(null);

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

  const sevColor = { CRITICAL:"var(--red)", HIGH:"var(--yellow)", MEDIUM:"var(--accent)", LOW:"var(--green)" };

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Projects</h1>
            <p className={styles.sub}>Organise your log analyses by application or infrastructure component.</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
            + New project
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.loading}>
            <span className="spinner" style={{width:28,height:28,borderWidth:3}}/>
          </div>
        ) : projects.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📁</div>
            <div className={styles.emptyTitle}>No projects yet</div>
            <p className={styles.emptySub}>Create your first project to start organising your log analyses by application.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create your first project</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {projects.map(p => (
              <div key={p.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardIcon}>{p.name.charAt(0).toUpperCase()}</div>
                  <div className={styles.cardMeta}>
                    <div className={styles.cardName}>{p.name}</div>
                    {p.description && <div className={styles.cardDesc}>{p.description}</div>}
                  </div>
                </div>

                {p.stack?.length > 0 && (
                  <div className={styles.cardStack}>
                    {p.stack.slice(0, 5).map(s => (
                      <span key={s} className={styles.stackTag}>{s}</span>
                    ))}
                    {p.stack.length > 5 && <span className={styles.stackTag}>+{p.stack.length - 5}</span>}
                  </div>
                )}

                <div className={styles.cardStats}>
                  <div className={styles.cardStat}>
                    <div className={styles.cardStatNum}>{p.analyses?.[0]?.count || 0}</div>
                    <div className={styles.cardStatLabel}>Analyses</div>
                  </div>
                  <div className={styles.cardStat}>
                    <div className={styles.cardStatNum}>{new Date(p.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>
                    <div className={styles.cardStatLabel}>Created</div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <Link to={`/?project=${p.id}`} className="btn btn-primary btn-sm">→ Analyze</Link>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditProject(p); setShowModal(true); }}>Edit</button>
                  <button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}} onClick={() => deleteProject(p.id, p.name)}>Delete</button>
                </div>
              </div>
            ))}

            {/* New project card */}
            <button className={styles.newCard} onClick={() => { setEditProject(null); setShowModal(true); }}>
              <div className={styles.newCardIcon}>+</div>
              <div className={styles.newCardLabel}>New project</div>
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
