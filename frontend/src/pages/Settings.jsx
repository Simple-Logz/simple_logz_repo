import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { api } from "../lib/api.js";
import { uploadToStorage } from "../lib/supabase.js";

/* ── Icons ─────────────────────────────────────────────────── */
const I = {
  User:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Palette: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  Billing: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Bell:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Shield:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Trash:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Camera:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Check:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Star:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Sun:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
};

const TABS = [
  { id:"profile",       label:"Profile",       Icon: I.User    },
  { id:"appearance",    label:"Appearance",    Icon: I.Palette  },
  { id:"billing",       label:"Billing",       Icon: I.Billing  },
  { id:"notifications", label:"Notifications", Icon: I.Bell     },
  { id:"security",      label:"Security",      Icon: I.Shield   },
  { id:"danger",        label:"Danger Zone",   Icon: I.Trash    },
];

/* ── Reusable row ─────────────────────────────────────────── */
function SettingRow({ label, sub, children, last }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      gap:20, padding:"18px 0",
      borderBottom: last ? "none" : "1px solid var(--border)",
    }}>
      <div>
        <div style={{ fontSize:14, fontWeight:500, color:"var(--t1)" }}>{label}</div>
        {sub && <div style={{ fontSize:12.5, color:"var(--t3)", marginTop:3 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink:0 }}>{children}</div>
    </div>
  );
}

/* ── Section wrapper ──────────────────────────────────────── */
function Section({ title, sub, children }) {
  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ marginBottom:16 }}>
        <h2 style={{ fontSize:17, fontWeight:700, color:"var(--t1)", marginBottom:4 }}>{title}</h2>
        {sub && <p style={{ fontSize:13.5, color:"var(--t3)" }}>{sub}</p>}
      </div>
      <div style={{
        background:"var(--bg2)", border:"1px solid var(--border)",
        borderRadius:14, padding:"0 20px",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function Settings() {
  const { profile, signOut, getToken, user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tab,             setTab]             = useState("profile");
  const [name,            setName]            = useState(profile?.name || "");
  const [saving,          setSaving]          = useState(false);
  const [avatarPreview,   setAvatarPreview]   = useState(null);
  const [uploading,       setUploading]       = useState(false);
  const [deleting,        setDeleting]        = useState(false);
  const [theme,           setThemeState]      = useState(
    () => localStorage.getItem("slz_theme") || "dark"
  );
  const avatarRef = useRef(null);

  // Sync name state once profile loads (handles async profile fetch)
  useEffect(() => {
    if (profile?.name && !name) setName(profile.name);
  }, [profile?.name]);

  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)
    : (profile?.email?.[0] || "U").toUpperCase();

  /* ── Avatar upload ──────────────────────────────────────── */
  async function handleAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("Image must be under 5MB", "error"); return; }
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const url  = await uploadToStorage("avatars", path, file);
      const tok  = await getToken();
      // Send only avatar — backend keeps existing name
      await api.updateProfile({ avatar: url }, tok);
      await refreshProfile();
      setAvatarPreview(null); // clear local blob — profile.avatar now has the real URL
      showToast("Profile picture updated!", "success");
    } catch (err) {
      setAvatarPreview(null);
      showToast("Upload failed: " + err.message, "error");
    } finally { setUploading(false); }
  }

  /* ── Save profile ───────────────────────────────────────── */
  async function saveName() {
    if (!name.trim()) { showToast("Name cannot be empty", "error"); return; }
    setSaving(true);
    try {
      const tok = await getToken();
      await api.updateProfile({ name }, tok);
      await refreshProfile();
      showToast("Profile saved!", "success");
    } catch (err) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  }

  /* ── Theme toggle ───────────────────────────────────────── */
  function applyTheme(t) {
    setThemeState(t);
    localStorage.setItem("slz_theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }

  /* ── Billing portal ─────────────────────────────────────── */
  async function openPortal() {
    try {
      const tok = await getToken();
      const { url } = await api.openPortal(tok);
      window.location.href = url;
    } catch (err) { showToast(err.message, "error"); }
  }

  /* ── Delete account ─────────────────────────────────────── */
  async function deleteAccount() {
    if (!window.confirm("This will permanently delete your account and all data. This cannot be undone.")) return;
    setDeleting(true);
    try {
      const tok = await getToken();
      await api.deleteAccount(tok);
      await signOut();
      navigate("/");
      showToast("Account deleted", "info");
    } catch (err) { showToast(err.message, "error"); }
    finally { setDeleting(false); }
  }

  const isDev = profile?.plan === "developer";

  return (
    <div style={{ minHeight:"100vh", paddingTop:80, paddingBottom:60 }}>
      <div style={{ maxWidth:860, margin:"0 auto", padding:"0 24px" }}>

        {/* Page header */}
        <div style={{ marginBottom:36 }}>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.5px", marginBottom:6 }}>Settings</h1>
          <p style={{ fontSize:14, color:"var(--t3)" }}>Manage your account, appearance, billing, and more.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:28, alignItems:"start" }}>

          {/* ── Sidebar nav ────────────────────────────────── */}
          <nav style={{
            background:"var(--bg2)", border:"1px solid var(--border)",
            borderRadius:14, padding:8, position:"sticky", top:24,
          }}>
            {TABS.map(({ id, label, Icon }) => {
              const active = tab === id;
              const isDanger = id === "danger";
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    display:"flex", alignItems:"center", gap:10,
                    width:"100%", padding:"9px 12px", borderRadius:9,
                    background: active ? "var(--bg3)" : "none",
                    border: active ? "1px solid var(--border)" : "1px solid transparent",
                    color: isDanger ? (active ? "var(--red)" : "rgba(248,113,113,0.7)")
                                    : (active ? "var(--t1)" : "var(--t2)"),
                    fontSize:13.5, fontWeight: active ? 600 : 400,
                    cursor:"pointer", textAlign:"left",
                    transition:"all 0.15s", marginBottom:2,
                    borderLeft: active && !isDanger ? "2px solid #6c5ce7" : undefined,
                  }}
                >
                  <Icon/> {label}
                </button>
              );
            })}
          </nav>

          {/* ── Content ────────────────────────────────────── */}
          <div>

            {/* ── PROFILE ──────────────────────────────────── */}
            {tab === "profile" && (
              <div>
                <Section title="Profile" sub="Your public identity on SimpleLogz.">

                  {/* Avatar */}
                  <div style={{ padding:"24px 0 20px", borderBottom:"1px solid var(--border)" }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:14 }}>Profile Picture</div>
                    <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                      {/* Avatar circle */}
                      <div style={{ position:"relative", flexShrink:0 }}>
                        <div style={{
                          width:80, height:80, borderRadius:"50%",
                          background:"linear-gradient(135deg,#6c5ce7,#a29bfe)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:24, fontWeight:800, color:"#fff",
                          overflow:"hidden", border:"2px solid var(--border2)",
                        }}>
                          {(avatarPreview || profile?.avatar)
                            ? <img src={avatarPreview || profile?.avatar} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            : <span>{initials}</span>
                          }
                        </div>
                        {/* Camera overlay */}
                        <button
                          onClick={() => avatarRef.current?.click()}
                          disabled={uploading}
                          style={{
                            position:"absolute", bottom:0, right:0,
                            width:26, height:26, borderRadius:"50%",
                            background:"#6c5ce7", border:"2px solid var(--bg2)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            cursor:"pointer", color:"#fff",
                          }}
                        >
                          {uploading
                            ? <span className="spinner" style={{width:10,height:10,borderWidth:1.5,borderTopColor:"#fff"}}/>
                            : <I.Camera/>
                          }
                        </button>
                        <input ref={avatarRef} type="file" accept="image/png,image/jpeg,image/webp" style={{display:"none"}} onChange={handleAvatar}/>
                      </div>

                      <div>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => avatarRef.current?.click()}
                          disabled={uploading}
                          style={{ marginBottom:6 }}
                        >
                          {uploading ? "Uploading…" : "Upload photo"}
                        </button>
                        <div style={{ fontSize:12, color:"var(--t3)" }}>PNG, JPG or WebP · Max 5 MB</div>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div style={{ padding:"20px 0", borderBottom:"1px solid var(--border)" }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:10 }}>Display Name</div>
                    <div style={{ display:"flex", gap:10 }}>
                      <input
                        className="form-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        style={{ maxWidth:320 }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={saveName} disabled={saving}>
                        {saving ? <><span className="spinner" style={{width:12,height:12,borderWidth:2}}/>Saving…</> : "Save"}
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ padding:"20px 0" }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:10 }}>Email Address</div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <input
                        className="form-input"
                        value={profile?.email || ""}
                        disabled
                        style={{ maxWidth:320, opacity:0.6 }}
                      />
                      <span style={{
                        fontSize:11, fontWeight:600, padding:"3px 8px",
                        background:"rgba(52,211,153,0.12)", color:"var(--green)",
                        borderRadius:6, border:"1px solid rgba(52,211,153,0.2)",
                      }}>Verified</span>
                    </div>
                    <div style={{ fontSize:12, color:"var(--t3)", marginTop:6 }}>
                      Email cannot be changed. Contact support if needed.
                    </div>
                  </div>

                </Section>
              </div>
            )}

            {/* ── APPEARANCE ───────────────────────────────── */}
            {tab === "appearance" && (
              <Section title="Appearance" sub="Control how SimpleLogz looks on your device.">

                {/* Theme picker */}
                <div style={{ padding:"20px 0", borderBottom:"1px solid var(--border)" }}>
                  <div style={{ fontSize:14, fontWeight:500, marginBottom:14 }}>Theme</div>
                  <div style={{ display:"flex", gap:12 }}>
                    {[
                      { val:"dark",  label:"Dark",  bg:"#0e1117", fg:"#f0f4ff" },
                      { val:"light", label:"Light", bg:"#f8faff", fg:"#0f172a" },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => applyTheme(opt.val)}
                        style={{
                          display:"flex", flexDirection:"column", alignItems:"center", gap:10,
                          padding:"16px 24px", borderRadius:12, cursor:"pointer",
                          border: theme === opt.val ? "2px solid #6c5ce7" : "2px solid var(--border)",
                          background: theme === opt.val ? "rgba(108,92,231,0.08)" : "var(--bg3)",
                          transition:"all 0.15s", minWidth:110,
                        }}
                      >
                        {/* Mini preview */}
                        <div style={{
                          width:60, height:40, borderRadius:8,
                          background:opt.bg, border:"1px solid var(--border)",
                          display:"flex", flexDirection:"column",
                          overflow:"hidden",
                        }}>
                          <div style={{ height:10, background: opt.val==="dark" ? "#161b25" : "#fff", borderBottom:"1px solid rgba(0,0,0,0.1)" }}/>
                          <div style={{ padding:"4px 5px", display:"flex", flexDirection:"column", gap:3 }}>
                            <div style={{ height:3, width:"70%", background:opt.fg, borderRadius:2, opacity:0.5 }}/>
                            <div style={{ height:3, width:"50%", background:opt.fg, borderRadius:2, opacity:0.3 }}/>
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          {opt.val === "dark" ? <I.Moon/> : <I.Sun/>}
                          <span style={{ fontSize:13, fontWeight:500, color: theme===opt.val ? "#6c5ce7" : "var(--t2)" }}>
                            {opt.label}
                          </span>
                          {theme === opt.val && <I.Check/>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size hint */}
                <SettingRow label="Compact mode" sub="Reduce spacing and font sizes across the app" last>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked={false}/>
                    <div className="toggle-slider"/>
                  </label>
                </SettingRow>

              </Section>
            )}

            {/* ── BILLING ──────────────────────────────────── */}
            {tab === "billing" && (
              <div>
                {/* Current plan card */}
                <div style={{
                  background: isDev
                    ? "linear-gradient(135deg,rgba(108,92,231,0.12),rgba(162,155,254,0.08))"
                    : "var(--bg2)",
                  border: isDev ? "1px solid rgba(108,92,231,0.3)" : "1px solid var(--border)",
                  borderRadius:14, padding:"24px 24px 20px", marginBottom:20,
                }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        {isDev && <I.Star/>}
                        <span style={{ fontSize:18, fontWeight:800 }}>
                          {isDev ? "Developer Plan" : "Free Plan"}
                        </span>
                        <span style={{
                          fontSize:11, fontWeight:700, padding:"2px 8px",
                          background: isDev ? "rgba(108,92,231,0.2)" : "var(--bg4)",
                          color: isDev ? "#a29bfe" : "var(--t3)",
                          borderRadius:20,
                        }}>
                          {isDev ? "ACTIVE" : "FREE"}
                        </span>
                      </div>
                      <div style={{ fontSize:14, color:"var(--t2)" }}>
                        {isDev ? "Unlimited analyses · Groups · Code & Runbook tools" : "2 analyses per day · Error analysis only"}
                      </div>
                    </div>
                    <div style={{ fontSize:22, fontWeight:800, color: isDev ? "#6c5ce7" : "var(--t2)" }}>
                      {isDev ? "$5/mo" : "$0"}
                    </div>
                  </div>

                  {isDev && (
                    <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid rgba(108,92,231,0.2)", display:"flex", gap:10, flexWrap:"wrap" }}>
                      <button className="btn btn-outline btn-sm" onClick={openPortal}>
                        Manage subscription
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={openPortal}
                        style={{ background:"rgba(248,113,113,0.1)", color:"var(--red)", border:"1px solid rgba(248,113,113,0.2)" }}
                      >
                        Cancel subscription
                      </button>
                    </div>
                  )}
                </div>

                {!isDev && (
                  <Section title="Upgrade to Developer" sub="Unlock the full power of SimpleLogz.">
                    {[
                      "Unlimited error, log & code analyses",
                      "Create Groups & Projects",
                      "Log Analyzer, Code Inspector & Runbook Studio",
                      "Pattern Intelligence across logs",
                      "90-day analysis history",
                      "Priority support",
                    ].map((f, i, arr) => (
                      <SettingRow key={f} label={f} last={i === arr.length - 1}>
                        <I.Check/>
                      </SettingRow>
                    ))}
                    <div style={{
                      margin:"12px 0 4px",
                      background:"rgba(108,92,231,0.08)", border:"1px solid rgba(108,92,231,0.2)",
                      borderRadius:10, padding:"10px 14px",
                      fontSize:13, color:"var(--t2)", lineHeight:1.6,
                    }}>
                      🚀 <strong style={{color:"#a29bfe"}}>Founder's rate:</strong> Subscribe within our first 3 months and lock in <strong style={{color:"var(--t1)"}}>$5/month forever</strong>. Price goes up after the promo ends.
                    </div>
                    <div style={{ padding:"12px 0 4px", display:"flex", gap:10 }}>
                      <Link to="/pricing" className="btn btn-primary">Upgrade — $5/month</Link>
                      <Link to="/pricing" className="btn btn-outline">See all plans</Link>
                    </div>
                  </Section>
                )}

                <Section title="Billing Information" sub="Your invoices and payment details are managed securely via Stripe.">
                  <SettingRow label="Payment method" sub="Manage cards and billing details">
                    <button className="btn btn-outline btn-sm" onClick={openPortal}>Open portal</button>
                  </SettingRow>
                  <SettingRow label="Invoices & receipts" sub="Download past invoices" last>
                    <button className="btn btn-outline btn-sm" onClick={openPortal}>View invoices</button>
                  </SettingRow>
                </Section>
              </div>
            )}

            {/* ── NOTIFICATIONS ────────────────────────────── */}
            {tab === "notifications" && (
              <Section title="Notifications" sub="Choose which emails SimpleLogz sends you.">
                {[
                  { label:"Forum replies",    sub:"When someone replies to your post or comment", def:true  },
                  { label:"Product updates",  sub:"New features, improvements and releases",       def:true  },
                  { label:"Weekly digest",    sub:"Summary of your analysis activity",             def:false },
                  { label:"Marketing emails", sub:"Tips, use cases, and special offers",           def:false },
                ].map((r, i, arr) => (
                  <SettingRow key={r.label} label={r.label} sub={r.sub} last={i === arr.length - 1}>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked={r.def}/>
                      <div className="toggle-slider"/>
                    </label>
                  </SettingRow>
                ))}
              </Section>
            )}

            {/* ── SECURITY ─────────────────────────────────── */}
            {tab === "security" && (
              <div>
                <Section title="Account Security" sub="Control access to your SimpleLogz account.">
                  <SettingRow label="Email" sub={profile?.email || "—"}>
                    <span style={{ fontSize:12, color:"var(--t3)" }}>Cannot change</span>
                  </SettingRow>
                  <SettingRow label="Password" sub="Change your account password" last>
                    <button className="btn btn-outline btn-sm" onClick={() => showToast("Password reset email sent!", "success")}>
                      Reset password
                    </button>
                  </SettingRow>
                </Section>

                <Section title="Connected Accounts" sub="Sign in faster with your social accounts.">
                  {[
                    { name:"Google",    color:"#EA4335", logo:"G" },
                    { name:"GitHub",    color:"var(--t1)", logo:"GH" },
                    { name:"Microsoft", color:"#00A4EF", logo:"M" },
                  ].map((p, i, arr) => (
                    <SettingRow key={p.name} label={p.name} sub={`Sign in with ${p.name}`} last={i === arr.length - 1}>
                      <button className="btn btn-outline btn-sm">Connect</button>
                    </SettingRow>
                  ))}
                </Section>

                <Section title="Sessions" sub="Manage where you're logged in.">
                  <SettingRow label="Current session" sub="This device · Active now" last>
                    <span style={{
                      fontSize:11, fontWeight:600, padding:"3px 8px",
                      background:"rgba(52,211,153,0.12)", color:"var(--green)",
                      borderRadius:6, border:"1px solid rgba(52,211,153,0.2)",
                    }}>Active</span>
                  </SettingRow>
                </Section>
              </div>
            )}

            {/* ── DANGER ZONE ──────────────────────────────── */}
            {tab === "danger" && (
              <div>
                <div style={{
                  background:"rgba(248,113,113,0.04)",
                  border:"1px solid rgba(248,113,113,0.2)",
                  borderRadius:14, padding:"16px 20px", marginBottom:24,
                  fontSize:13.5, color:"var(--red)", lineHeight:1.6,
                }}>
                  ⚠️ Actions in this section are <strong>permanent and irreversible</strong>. Please proceed with caution.
                </div>

                <Section title="Sign Out" sub="End your current session on this device.">
                  <SettingRow label="Sign out" sub="You'll need to log in again to access your account" last>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={async () => { await signOut(); navigate("/"); }}
                    >
                      Sign out
                    </button>
                  </SettingRow>
                </Section>

                <div style={{
                  background:"var(--bg2)",
                  border:"1px solid rgba(248,113,113,0.25)",
                  borderRadius:14, padding:"0 20px",
                }}>
                  <SettingRow
                    label="Delete account"
                    sub="Permanently deletes your account, all projects, analyses, and data. This cannot be undone."
                    last
                  >
                    <button
                      className="btn btn-sm"
                      disabled={deleting}
                      onClick={deleteAccount}
                      style={{
                        background:"rgba(248,113,113,0.12)", color:"var(--red)",
                        border:"1px solid rgba(248,113,113,0.3)", minWidth:120,
                      }}
                    >
                      {deleting ? <><span className="spinner" style={{width:12,height:12,borderWidth:2,borderTopColor:"var(--red)"}}/>Deleting…</> : "Delete account"}
                    </button>
                  </SettingRow>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
