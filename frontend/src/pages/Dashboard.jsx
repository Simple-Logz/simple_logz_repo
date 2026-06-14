import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { api } from "../lib/api.js";
import { uploadToStorage } from "../lib/supabase.js";
import styles from "./Dashboard.module.css";

function IconAnalyze() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>; }
function IconCalendar() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IconPlan() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>; }
function IconGlobe() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }

export function Dashboard() {
  const { profile, getToken } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [usage, setUsage] = useState({ daily: 0, total: 0 });
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const [h, u] = await Promise.all([api.getHistory(token), api.getUsage(token)]);
        setHistory(h.history || []);
        setUsage(u);
      } catch {}
    })();
  }, []);

  const sevColor = { CRITICAL:"var(--red)", HIGH:"var(--yellow)", MEDIUM:"var(--accent)", LOW:"var(--green)" };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.welcome}>
          <button
            onClick={() => navigate(-1)}
            style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13,color:"var(--t3)",background:"none",border:"none",cursor:"pointer",padding:"0 0 12px",transition:"color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.color="var(--t1)"}
            onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back
          </button>
          <h1>Dashboard</h1>
          <p>Welcome back, {profile?.name?.split(" ")[0] || "there"}. Here is your activity overview.</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><IconAnalyze/></div>
            <div className={styles.statNum}>{usage.total}</div>
            <div className={styles.statLabel}>Total analyses</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><IconCalendar/></div>
            <div className={styles.statNum}>{usage.daily}</div>
            <div className={styles.statLabel}>Analyses today</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><IconPlan/></div>
            <div className={styles.statNum}>{profile?.plan === "developer" ? "Unlimited" : `${Math.max(0, 2 - usage.daily)}/2`}</div>
            <div className={styles.statLabel}>Remaining today</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><IconGlobe/></div>
            <div className={styles.statNum}>8</div>
            <div className={styles.statLabel}>Platforms supported</div>
          </div>
        </div>

        {profile?.plan !== "developer" && (
          <div className={styles.upgradeBanner}>
            <div>
              <div style={{fontWeight:600,marginBottom:3}}>Upgrade to Developer</div>
              <div style={{fontSize:13,color:"var(--t2)"}}>Unlock unlimited analyses, downloadable reports, and 90-day history.</div>
            </div>
            <Link to="/pricing" className="btn btn-primary btn-sm">Upgrade — $5/month</Link>
          </div>
        )}

        <div className="card">
          <div className={styles.tableHeader}>
            <div style={{fontWeight:600,fontSize:16}}>Recent Analyses</div>
            <Link to="/analyzer" className="btn btn-outline btn-sm">New analysis</Link>
          </div>
          {history.length === 0 ? (
            <div className={styles.emptyState}>
              <IconAnalyze/>
              <div>No analyses yet</div>
              <Link to="/analyzer" style={{color:"var(--accent)",fontSize:14}}>Analyze your first log</Link>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Error Title</th>
                  <th>Severity</th>
                  <th>Source</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td>{h.title}</td>
                    <td><span style={{color:sevColor[h.severity]||"var(--t2)",fontWeight:600,fontSize:12}}>{h.severity}</span></td>
                    <td style={{color:"var(--t2)"}}>{h.source || "—"}</td>
                    <td style={{color:"var(--t3)"}}>{new Date(h.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

const SETTINGS_TABS = ["Profile", "Appearance", "Billing", "Notifications", "Danger Zone"];

export function Settings() {
  const { profile, signOut, getToken, user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tab,            setTab]            = useState(0);
  const [name,           setName]           = useState(profile?.name || "");
  const [saving,         setSaving]         = useState(false);
  const [avatarPreview,  setAvatarPreview]  = useState(null);
  const [avatarUploading,setAvatarUploading]= useState(false);
  const [darkMode,       setDarkMode]       = useState(document.documentElement.getAttribute("data-theme") === "dark");
  const avatarInputRef = useRef(null);

  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("Image must be under 5MB", "error"); return; }
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const uploadPath = `${user.id}/avatar-${Date.now()}.${ext}`;
      const avatarUrl = await uploadToStorage("avatars", uploadPath, file);
      const token = await getToken();
      await api.updateProfile({ name: profile?.name || name, avatar: avatarUrl }, token);
      await refreshProfile();
      showToast("Profile picture updated!", "success");
    } catch (err) {
      setAvatarPreview(null);
      showToast("Upload failed: " + err.message, "error");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function saveName() {
    setSaving(true);
    try {
      const token = await getToken();
      await api.updateProfile({ name }, token);
      await refreshProfile();
      showToast("Profile saved", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally { setSaving(false); }
  }

  async function openBillingPortal() {
    try {
      const token = await getToken();
      const { url } = await api.openPortal(token);
      window.location.href = url;
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Permanently delete your account and all data? This cannot be undone.")) return;
    try {
      const token = await getToken();
      await api.deleteAccount(token);
      await signOut();
      navigate("/");
      showToast("Account deleted", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function toggleDark(val) {
    setDarkMode(val);
    document.documentElement.setAttribute("data-theme", val ? "dark" : "light");
  }

  return (
    <div className={styles.settingsPage}>
      <div className="container">
        <div className={styles.settingsHeader}>
          <h1>Settings</h1>
          <p>Manage your account, preferences, and billing.</p>
        </div>
        <div className={styles.settingsLayout}>
          <nav className={styles.settingsNav}>
            {SETTINGS_TABS.map((t, i) => (
              <button key={t} className={`${styles.settingsNavItem} ${tab === i ? styles.settingsNavActive : ""}`} onClick={() => setTab(i)}>{t}</button>
            ))}
          </nav>

          <div>
            {tab === 0 && (
              <div>
                <h2 className={styles.sectionTitle}>Profile</h2>
                <p className={styles.sectionSub}>Your display name, profile picture, and email address.</p>
                <div className="card" style={{display:"flex",flexDirection:"column",gap:16}}>

                  {/* Avatar upload */}
                  <div className="form-group">
                    <label className="form-label">Profile Picture</label>
                    <div style={{display:"flex",alignItems:"center",gap:16,paddingTop:4}}>
                      <div style={{
                        width:72,height:72,borderRadius:"50%",overflow:"hidden",flexShrink:0,
                        background:"#6c5ce7",display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:22,fontWeight:700,color:"#fff",
                        border:"2px solid var(--border2)",
                      }}>
                        {(avatarPreview || profile?.avatar)
                          ? <img src={avatarPreview || profile?.avatar} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          : <span>{initials}</span>
                        }
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={avatarUploading}
                        >
                          {avatarUploading ? <><span className="spinner" style={{width:12,height:12,borderWidth:2}}/> Uploading…</> : "Upload photo"}
                        </button>
                        <div style={{fontSize:12,color:"var(--t3)"}}>PNG, JPG, WebP up to 5MB</div>
                      </div>
                      <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{display:"none"}} onChange={handleAvatarUpload}/>
                    </div>
                  </div>

                  <div className="form-group"><label className="form-label">Display Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)}/></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={profile?.email || ""} disabled style={{opacity:.5}}/></div>
                  <button className="btn btn-primary" style={{alignSelf:"flex-start"}} onClick={saveName} disabled={saving}>
                    {saving ? <><span className="spinner"/>Saving…</> : "Save changes"}
                  </button>
                </div>
              </div>
            )}

            {tab === 1 && (
              <div>
                <h2 className={styles.sectionTitle}>Appearance</h2>
                <p className={styles.sectionSub}>Choose how SimpleLogz looks.</p>
                <div className="card">
                  <div className={styles.settingsRow}>
                    <div><div className={styles.rowLabel}>Dark mode</div><div className={styles.rowSub}>Switch between dark and light interface</div></div>
                    <label className="toggle"><input type="checkbox" checked={darkMode} onChange={e => toggleDark(e.target.checked)}/><div className="toggle-slider"/></label>
                  </div>
                </div>
              </div>
            )}

            {tab === 2 && (
              <div>
                <h2 className={styles.sectionTitle}>Billing</h2>
                <p className={styles.sectionSub}>Manage your subscription and invoices.</p>
                <div className="card" style={{marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:16}}>{profile?.plan === "developer" ? "Developer Plan" : "Free Plan"}</div>
                      <div style={{fontSize:14,color:"var(--t2)",marginTop:4}}>{profile?.plan === "developer" ? "Unlimited analyses — $5/month" : "2 analyses per day"}</div>
                    </div>
                    {profile?.plan === "developer"
                      ? <button className="btn btn-outline btn-sm" onClick={openBillingPortal}>Manage subscription</button>
                      : <Link to="/pricing" className="btn btn-primary btn-sm">Upgrade to Developer</Link>
                    }
                  </div>
                </div>
              </div>
            )}

            {tab === 3 && (
              <div>
                <h2 className={styles.sectionTitle}>Notifications</h2>
                <p className={styles.sectionSub}>Choose what emails you receive.</p>
                <div className="card">
                  {[
                    { label:"Forum replies", sub:"When someone replies to your post", def:true },
                    { label:"Product updates", sub:"New features and improvements", def:true },
                    { label:"Marketing", sub:"Tips, use cases, and offers", def:false },
                  ].map(r => (
                    <div key={r.label} className={styles.settingsRow}>
                      <div><div className={styles.rowLabel}>{r.label}</div><div className={styles.rowSub}>{r.sub}</div></div>
                      <label className="toggle"><input type="checkbox" defaultChecked={r.def}/><div className="toggle-slider"/></label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 4 && (
              <div>
                <h2 className={styles.sectionTitle}>Danger Zone</h2>
                <p className={styles.sectionSub}>These actions are permanent and cannot be undone.</p>
                <div className="card" style={{borderColor:"rgba(248,113,113,.2)"}}>
                  <div className={styles.settingsRow}>
                    <div><div className={styles.rowLabel}>Delete account</div><div className={styles.rowSub}>Permanently deletes your account and all data</div></div>
                    <button className="btn btn-danger btn-sm" onClick={deleteAccount}>Delete account</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}