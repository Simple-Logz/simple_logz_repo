import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { api } from "../../lib/api.js";
import { uploadToStorage, supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/Toast.jsx";

function IconAnalyzer() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>; }
function IconTerminal() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>; }
function IconForum()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function IconPricing()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function IconAbout()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function IconSupport()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function IconDocs()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function IconSun()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
function IconMoon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>; }
function IconChevron()  { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>; }
function IconLogout()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function IconDashboard(){ return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function IconSettings() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function IconFolder()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>; }
function IconUpgrade()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>; }
function IconUser()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function IconMenu()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }


const NAV_LINKS = [
  { to: "/",          label: "Analyzer",  Icon: IconAnalyzer },
  { to: "/projects",  label: "Projects",  Icon: IconFolder   },
  { to: "/forum",     label: "Community", Icon: IconForum    },
  { to: "/pricing",   label: "Pricing",   Icon: IconPricing  },
  { to: "/about",     label: "About",     Icon: IconAbout    },
  { to: "/docs",      label: "Docs",      Icon: IconDocs     },
  { to: "/settings",  label: "Settings",  Icon: IconSettings },
  { to: "/support",   label: "Support",   Icon: IconSupport  },
];

function SidebarInner({ onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Logo */}
      <Link
        to="/"
        onClick={onClose}
        style={{ display:"flex", alignItems:"center", padding:"18px 16px 16px", textDecoration:"none" }}
      >
        <img
          src="/simplelogz-logo-dark.png"
          alt="SimpleLogz"
          style={{ height:38, width:"auto", display:"block" }}
        />
      </Link>

      {/* New analysis button */}
      <Link
        to="/"
        onClick={onClose}
        style={{
          display:"flex", alignItems:"center", gap:8, margin:"0 12px 20px",
          padding:"8px 12px", color:"var(--t2)", fontSize:13,
          fontWeight:500, textDecoration:"none",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5"  y1="12" x2="19" y2="12"/>
        </svg>
        New analysis
      </Link>

      {/* Nav links */}
      <nav style={{ marginBottom:8 }}>
        {NAV_LINKS.map(({ to, label, Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"8px 18px", marginBottom:2,
                textDecoration:"none", fontSize:13, transition:"color .15s",
                color: active ? "var(--t1)" : "var(--t2)",
                fontWeight: active ? 600 : 400,
                borderLeft: active ? "2px solid #6c5ce7" : "2px solid transparent",
              }}
            >
              <Icon/> {label}
            </Link>
          );
        })}
      </nav>

      {/* Recent */}
      <div style={{ padding:"14px 18px 6px", fontSize:11, color:"var(--t3)", letterSpacing:"0.06em", textTransform:"uppercase" }}>
        Recent
      </div>
      <div style={{ padding:"6px 18px 8px", fontSize:12, color:"var(--t3)", fontStyle:"italic" }}>
        No recent sessions
      </div>
    </>
  );
}

/* ── User section pinned to sidebar bottom ─────────────────────── */
function SidebarUserSection({ onThemeToggle, theme }) {
  const { isLoggedIn, profile, signOut, getToken, user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [userOpen,       setUserOpen]       = useState(false);
  const [avatarHover,    setAvatarHover]    = useState(false);
  const [avatarUploading,setAvatarUploading]= useState(false);
  const [mfaEnabled,     setMfaEnabled]     = useState(null);
  const userRef    = useRef(null);
  const triggerRef = useRef(null);
  const avatarRef  = useRef(null);
  const navigate   = useNavigate();

  useEffect(() => {
    function handleOutside(e) {
      if (userRef.current && !userRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  async function openMenu() {
    setUserOpen(o => !o);
    if (isLoggedIn) {
      try {
        const { data } = await supabase.auth.mfa.listFactors();
        setMfaEnabled(data?.totp?.some(f => f.status === "verified") ?? false);
      } catch { setMfaEnabled(false); }
    }
  }

  async function handleSignOut() {
    setUserOpen(false);
    await signOut();
    navigate("/");
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("Image must be under 5 MB", "error"); return; }
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const url = await uploadToStorage("avatars", `${user.id}/avatar-${Date.now()}.${ext}`, file);
      const token = await getToken();
      await api.updateProfile({ avatar: url }, token);
      await refreshProfile();
      showToast("Profile picture updated!", "success");
    } catch (err) { showToast("Upload failed: " + err.message, "error"); }
    finally { setAvatarUploading(false); }
  }

  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Trigger row — sits at bottom of sidebar */}
      <button
        ref={triggerRef}
        onClick={openMenu}
        style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"12px 14px",
          background:"none", border:"none",
          borderTop:"1px solid var(--border)",
          cursor:"pointer", transition:"background .15s",
          width:"100%", textAlign:"left",
        }}
        onMouseEnter={e => e.currentTarget.style.background="var(--bg3)"}
        onMouseLeave={e => e.currentTarget.style.background="none"}
      >
        {/* Avatar */}
        <div style={{
          width:34, height:34, borderRadius:"50%", background:"#6c5ce7",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:12, fontWeight:700, color:"#fff", overflow:"hidden",
          flexShrink:0, border:"2px solid var(--border)",
        }}>
          {profile?.avatar
            ? <img src={profile.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <span>{initials}</span>}
        </div>
        {/* Name + plan */}
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--t1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {profile?.name || "User"}
          </div>
          <div style={{ fontSize:10, color:"var(--t3)", marginTop:1 }}>
            {profile?.plan === "developer" ? "Developer" : "Free plan"}
          </div>
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      {/* Dropdown — portal so it overlays everything */}
      {userOpen && createPortal(
        <div
          ref={userRef}
          style={{
            position:"fixed",
            bottom: 68,
            left: 8,
            width: 228,
            background:"var(--bg2)",
            border:"1px solid var(--border)",
            borderRadius:14,
            boxShadow:"0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(108,92,231,0.08)",
            zIndex:9999,
            overflow:"hidden",
            animation:"fadeIn .15s ease",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Profile header */}
          <div style={{ padding:"12px 14px 10px", borderBottom:"1px solid var(--border)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div
                style={{ position:"relative", flexShrink:0, cursor:"pointer" }}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
                onClick={() => avatarRef.current?.click()}
                title="Change photo"
              >
                <div style={{
                  width:36, height:36, borderRadius:"50%", background:"#6c5ce7",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, fontWeight:700, color:"#fff", overflow:"hidden",
                }}>
                  {avatarUploading
                    ? <span className="spinner" style={{width:14,height:14,borderWidth:2}}/>
                    : profile?.avatar
                      ? <img src={profile.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : <span>{initials}</span>}
                </div>
                {avatarHover && !avatarUploading && (
                  <div style={{
                    position:"absolute", inset:0, borderRadius:"50%",
                    background:"rgba(0,0,0,0.5)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                )}
                <input ref={avatarRef} type="file" accept="image/png,image/jpeg,image/webp" style={{display:"none"}} onChange={handleAvatarUpload}/>
              </div>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--t1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {profile?.name || "User"}
                </div>
                <div style={{ fontSize:11, color:"var(--t3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {profile?.email}
                </div>
              </div>
              <span style={{
                fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:99, flexShrink:0,
                background: profile?.plan === "developer" ? "rgba(52,211,153,.15)" : "var(--bg3)",
                color: profile?.plan === "developer" ? "var(--green)" : "var(--t3)",
                border: profile?.plan === "developer" ? "1px solid rgba(52,211,153,.3)" : "1px solid var(--border)",
              }}>
                {profile?.plan === "developer" ? "Pro" : "Free"}
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding:"4px 0" }}>
            {[
              { to:"/dashboard", label:"Dashboard",          Icon:IconDashboard },
              { to:"/settings",  label:"Profile & Settings", Icon:IconSettings  },
              { to:"/pricing",   label:"Upgrade plan",       Icon:IconUpgrade   },
            ].map(({ to, label, Icon }) => (
              <Link
                key={to} to={to}
                onClick={() => setUserOpen(false)}
                style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 14px", textDecoration:"none", transition:"background .1s", color:"var(--t1)" }}
                onMouseEnter={e => e.currentTarget.style.background="var(--bg3)"}
                onMouseLeave={e => e.currentTarget.style.background="none"}
              >
                <span style={{ color:"var(--t3)", display:"flex" }}><Icon/></span>
                <span style={{ fontSize:13 }}>{label}</span>
              </Link>
            ))}

            {/* MFA */}
            <Link
              to="/settings" state={{ tab:"security" }}
              onClick={() => setUserOpen(false)}
              style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 14px", textDecoration:"none", transition:"background .1s" }}
              onMouseEnter={e => e.currentTarget.style.background="var(--bg3)"}
              onMouseLeave={e => e.currentTarget.style.background="none"}
            >
              <span style={{ color:"var(--t3)", display:"flex" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              <span style={{ fontSize:13, color:"var(--t1)" }}>Two-factor auth</span>
              {mfaEnabled === null
                ? <span style={{ marginLeft:"auto", fontSize:10, color:"var(--t3)" }}>…</span>
                : mfaEnabled
                  ? <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:99, background:"rgba(52,211,153,.15)", color:"var(--green)", border:"1px solid rgba(52,211,153,.25)" }}>On</span>
                  : <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:99, background:"rgba(248,113,113,.15)", color:"#f87171", border:"1px solid rgba(248,113,113,.2)" }}>Off</span>
              }
            </Link>

            {/* Theme */}
            <button
              onClick={onThemeToggle}
              style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 14px", background:"none", border:"none", cursor:"pointer", width:"100%", transition:"background .1s" }}
              onMouseEnter={e => e.currentTarget.style.background="var(--bg3)"}
              onMouseLeave={e => e.currentTarget.style.background="none"}
            >
              <span style={{ color:"var(--t3)", display:"flex" }}>{theme === "dark" ? <IconSun/> : <IconMoon/>}</span>
              <span style={{ fontSize:13, color:"var(--t1)" }}>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>
          </div>

          {/* Sign out */}
          <div style={{ borderTop:"1px solid var(--border)", padding:"4px 0" }}>
            <button
              onClick={handleSignOut}
              style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 14px", fontSize:13, color:"var(--red)", background:"none", border:"none", cursor:"pointer", width:"100%", transition:"background .1s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(248,113,113,.06)"}
              onMouseLeave={e => e.currentTarget.style.background="none"}
            >
              <IconLogout/>
              <span>Log out</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function Sidebar({ onThemeToggle, theme, open, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { if (open) onToggle(); }, [location.pathname]);

  return (
    <>
      {/* Floating trigger — only visible when sidebar is closed */}
      {!open && (
        <div
          style={{
            position:"fixed", top:20, left:20, zIndex:200,
            display:"flex", alignItems:"center",
            background:"var(--bg2)",
            border:"1px solid var(--border)",
            borderRadius:12,
            boxShadow:"0 4px 20px rgba(0,0,0,0.2), 0 0 0 1px rgba(108,92,231,0.12)",
            overflow:"hidden",
          }}
        >
          {/* Hamburger — opens the sidebar */}
          <button
            onClick={onToggle}
            title="Open menu"
            style={{
              display:"flex", flexDirection:"column", gap:4, flexShrink:0,
              padding:"9px 11px 9px 14px",
              background:"none", border:"none", cursor:"pointer",
              borderRight:"1px solid var(--border)",
            }}
            onMouseEnter={e => e.currentTarget.style.background="var(--bg3)"}
            onMouseLeave={e => e.currentTarget.style.background="none"}
          >
            <div style={{ width:16, height:1.5, background:"#6c5ce7", borderRadius:2 }}/>
            <div style={{ width:11, height:1.5, background:"#a29bfe", borderRadius:2 }}/>
            <div style={{ width:14, height:1.5, background:"#6c5ce7", borderRadius:2 }}/>
          </button>

          {/* Brand name — goes home */}
          <button
            onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "instant" }); }}
            title="Go to Analyzer"
            style={{
              padding:"9px 14px 9px 11px",
              background:"none", border:"none", cursor:"pointer",
              fontSize:13, fontWeight:700, color:"var(--t1)", letterSpacing:"-0.2px",
            }}
            onMouseEnter={e => e.currentTarget.style.background="var(--bg3)"}
            onMouseLeave={e => e.currentTarget.style.background="none"}
          >
            Simple<span style={{color:"#6c5ce7"}}>Logz</span>
          </button>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div
          onClick={onToggle}
          style={{
            position:"fixed", inset:0, zIndex:149,
            background:"rgba(0,0,0,0.4)",
            backdropFilter:"blur(2px)",
            animation:"fadeInBg 0.2s ease",
          }}
        />
      )}

      {/* Sidebar drawer */}
      <aside style={{
        position:"fixed", top:0, left:0, height:"100vh",
        width:220, background:"var(--bg2)",
        borderRight:"0.5px solid var(--border)",
        display:"flex", flexDirection:"column",
        zIndex:150,
        transform: open ? "translateX(0)" : "translateX(-240px)",
        transition:"transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: open ? "4px 0 32px rgba(0,0,0,0.25)" : "none",
      }}>
        {/* Close button inside sidebar */}
        <button
          onClick={onToggle}
          style={{
            position:"absolute", top:14, right:12, zIndex:10,
            background:"var(--bg3)", border:"1px solid var(--border)",
            borderRadius:8, width:28, height:28,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", color:"var(--t2)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Scrollable content */}
        <div style={{ flex:1, overflowY:"auto" }}>
          <SidebarInner onClose={onToggle}/>
        </div>

        {/* User section pinned to bottom */}
        <SidebarUserSection onThemeToggle={onThemeToggle} theme={theme}/>
      </aside>
    </>
  );
}
