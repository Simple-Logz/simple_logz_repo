import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";

function IconAnalyzer() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>; }
function IconTerminal() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>; }
function IconForum()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function IconPricing()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function IconAbout()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
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
];

function SidebarInner({ onThemeToggle, theme, onClose }) {
  const { isLoggedIn, profile, signOut } = useAuth();
  const [userOpen, setUserOpen] = useState(false);
  const userRef  = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setUserOpen(false);
    if (onClose) onClose();
    await signOut();
    navigate("/");
  }

  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      {/* Logo */}
      <Link
        to="/"
        onClick={onClose}
        style={{ display:"flex", alignItems:"center", gap:8, padding:"22px 18px 20px", textDecoration:"none" }}
      >
        <span style={{ color:"var(--t1)", fontSize:15, fontWeight:700, letterSpacing:"-0.3px" }}>
          Simple<span style={{ color:"#6c5ce7" }}>Logz</span>
        </span>
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

      {/* Bottom */}
      <div style={{ marginTop:"auto", borderTop:"0.5px solid var(--border)", padding:"14px 10px" }}>
        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          style={{
            display:"flex", alignItems:"center", gap:8, padding:"8px 10px",
            color:"var(--t2)", fontSize:12, background:"none", border:"none",
            cursor:"pointer", borderRadius:6, width:"100%", marginBottom:6,
          }}
        >
          {theme === "dark" ? <><IconSun/> Light mode</> : <><IconMoon/> Dark mode</>}
        </button>

        {/* Auth */}
        {!isLoggedIn ? (
          <Link
            to="/login"
            onClick={onClose}
            style={{
              display:"flex", alignItems:"center", gap:9, padding:"8px 10px",
              color:"var(--t2)", fontSize:13, textDecoration:"none", borderRadius:6,
            }}
          >
            <IconUser/> Sign in
          </Link>
        ) : (
          <div style={{ position:"relative" }} ref={userRef}>
            <button
              onClick={() => setUserOpen(o => !o)}
              style={{
                display:"flex", alignItems:"center", gap:9, padding:"8px 10px",
                background:"none", border:"none", cursor:"pointer", width:"100%", borderRadius:6,
              }}
            >
              <div style={{
                width:28, height:28, borderRadius:"50%", background:"#6c5ce7", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:700, color:"#fff", overflow:"hidden",
              }}>
                {profile?.avatar
                  ? <img src={profile.avatar} alt={profile.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <span>{initials}</span>}
              </div>
              <span style={{ fontSize:13, color:"var(--t1)", fontWeight:500, flex:1, textAlign:"left", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {profile?.name || "User"}
              </span>
              <IconChevron/>
            </button>

            {userOpen && (
              <div style={{
                position:"absolute", bottom:"calc(100% + 6px)", left:0, right:0,
                background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10,
                boxShadow:"var(--shadow)", padding:"6px 0", zIndex:100,
              }}>
                <div style={{ padding:"10px 14px 8px", borderBottom:"1px solid var(--border)", marginBottom:4 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--t1)" }}>{profile?.name || "User"}</div>
                  <div style={{ fontSize:12, color:"var(--t3)", marginTop:2 }}>{profile?.email}</div>
                  <span className={`badge ${profile?.plan === "developer" ? "badge-green" : "badge-gray"}`} style={{ marginTop:6 }}>
                    {profile?.plan === "developer" ? "Developer" : "Free Plan"}
                  </span>
                </div>
                {[
                  { to:"/dashboard", label:"Dashboard",   Icon:IconDashboard },
                  { to:"/projects",  label:"My projects", Icon:IconFolder    },
                  { to:"/settings",  label:"Settings",    Icon:IconSettings  },
                  { to:"/pricing",   label:"Upgrade plan",Icon:IconUpgrade   },
                ].map(({ to, label, Icon }) => (
                  <Link
                    key={to} to={to}
                    onClick={() => { setUserOpen(false); if (onClose) onClose(); }}
                    style={{
                      display:"flex", alignItems:"center", gap:9, padding:"8px 14px",
                      fontSize:13, color:"var(--t2)", textDecoration:"none",
                    }}
                  >
                    <Icon/> {label}
                  </Link>
                ))}
                <div style={{ height:1, background:"var(--border)", margin:"4px 0" }}/>
                <button
                  onClick={handleSignOut}
                  style={{
                    display:"flex", alignItems:"center", gap:9, padding:"8px 14px",
                    fontSize:13, color:"var(--red)", background:"none", border:"none",
                    cursor:"pointer", width:"100%",
                  }}
                >
                  <IconLogout/> Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function Sidebar({ onThemeToggle, theme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sl-sidebar" style={{
        width:220, minWidth:220, background:"var(--bg2)", borderRight:"0.5px solid var(--border)",
        display:"flex", flexDirection:"column", minHeight:"100vh",
        position:"sticky", top:0, height:"100vh", overflowY:"auto",
      }}>
        <SidebarInner onThemeToggle={onThemeToggle} theme={theme}/>
      </aside>

      {/* Mobile hamburger */}
      <button
        className="sl-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <IconMenu/>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:150, display:"flex", alignItems:"flex-start" }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              width:200, background:"var(--bg2)", height:"100%",
              display:"flex", flexDirection:"column", overflowY:"auto",
              boxShadow:"4px 0 20px rgba(0,0,0,0.25)",
              animation:"slideInLeft .2s ease",
            }}
            onClick={e => e.stopPropagation()}
          >
            <SidebarInner onThemeToggle={onThemeToggle} theme={theme} onClose={() => setMobileOpen(false)}/>
          </div>
        </div>
      )}
    </>
  );
}
