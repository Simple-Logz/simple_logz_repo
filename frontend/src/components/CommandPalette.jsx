import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ── Clean SVG icons ──────────────────────────────────────── */
const Icons = {
  Analyzer:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Projects:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Community: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Pricing:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Docs:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  About:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Support:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Dashboard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Settings:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Login:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  Signup:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  Arrow:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

const PAGES = [
  { label:"Analyzer",   desc:"Paste & analyze errors instantly",      path:"/",          Icon: Icons.Analyzer,  group:"Product"  },
  { label:"Projects",   desc:"Your log groups & projects",            path:"/projects",  Icon: Icons.Projects,  group:"Product"  },
  { label:"Pricing",    desc:"Free & Developer plans",                path:"/pricing",   Icon: Icons.Pricing,   group:"Product"  },
  { label:"Community",  desc:"Forum — share tips & solutions",        path:"/forum",     Icon: Icons.Community, group:"Product"  },
  { label:"Docs",       desc:"Full documentation & guides",           path:"/docs",      Icon: Icons.Docs,      group:"Resources"},
  { label:"About",      desc:"What SimpleLogz is all about",          path:"/about",     Icon: Icons.About,     group:"Resources"},
  { label:"Support",    desc:"Get help or contact us",                path:"/support",   Icon: Icons.Support,   group:"Resources"},
  { label:"Dashboard",  desc:"Your activity & analysis history",      path:"/dashboard", Icon: Icons.Dashboard, group:"Account"  },
  { label:"Settings",   desc:"Profile, appearance & billing",         path:"/settings",  Icon: Icons.Settings,  group:"Account"  },
  { label:"Sign in",    desc:"Log in to your account",                path:"/login",     Icon: Icons.Login,     group:"Account"  },
  { label:"Sign up",    desc:"Create a free account",                 path:"/signup",    Icon: Icons.Signup,    group:"Account"  },
];

export default function CommandPalette({ open, onClose }) {
  const [query,  setQuery]  = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef  = useRef(null);
  const navigate = useNavigate();

  const filtered = query.trim()
    ? PAGES.filter(p =>
        p.label.toLowerCase().includes(query.toLowerCase()) ||
        p.desc.toLowerCase().includes(query.toLowerCase())
      )
    : PAGES;

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block:"nearest" });
  }, [active]);

  const go = useCallback((path) => {
    navigate(path);
    window.scrollTo(0, 0);
    onClose();
  }, [navigate, onClose]);

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === "Enter")     { if (filtered[active]) go(filtered[active].path); }
    if (e.key === "Escape")    { onClose(); }
  };

  if (!open) return null;

  /* Group headings only when showing all (no query) */
  let lastGroup = null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:"fixed", inset:0, zIndex:900,
          background:"rgba(0,0,0,0.6)",
          backdropFilter:"blur(6px)",
          animation:"fadeInBg 0.15s ease",
        }}
      />

      {/* Palette */}
      <div style={{
        position:"fixed", top:"14%", left:"50%",
        transform:"translateX(-50%)",
        zIndex:901, width:"min(620px, 94vw)",
        background:"var(--bg2)",
        borderRadius:18,
        border:"1px solid var(--border2)",
        boxShadow:"0 32px 96px rgba(0,0,0,0.55), 0 0 0 1px rgba(108,92,231,0.12)",
        overflow:"hidden",
        animation:"cmdSlideIn 0.2s cubic-bezier(0.34,1.4,0.64,1)",
      }}>

        {/* ── Search input ──────────────────────────────── */}
        <div style={{
          display:"flex", alignItems:"center", gap:14,
          padding:"16px 20px",
          borderBottom:"1px solid var(--border)",
          background:"var(--bg2)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search pages and features…"
            style={{
              flex:1, background:"none", border:"none", outline:"none",
              fontSize:15, color:"var(--t1)", fontFamily:"inherit",
              letterSpacing:"-0.1px",
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              style={{ background:"none", border:"none", color:"var(--t3)", cursor:"pointer", lineHeight:1, padding:0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          ) : (
            <kbd style={{
              fontSize:11, color:"var(--t3)", background:"var(--bg3)",
              border:"1px solid var(--border)", borderRadius:6,
              padding:"3px 8px", letterSpacing:0.3, fontFamily:"inherit", flexShrink:0,
            }}>ESC</kbd>
          )}
        </div>

        {/* ── Results list ──────────────────────────────── */}
        <div
          ref={listRef}
          style={{ maxHeight:380, overflowY:"auto", padding:"8px 0" }}
        >
          {filtered.length === 0 ? (
            <div style={{
              padding:"40px 20px", textAlign:"center",
              color:"var(--t3)", fontSize:14,
            }}>
              No results for <span style={{color:"var(--t2)",fontWeight:500}}>"{query}"</span>
            </div>
          ) : filtered.map((item, i) => {
            const isActive = i === active;
            const showGroup = !query.trim() && item.group !== lastGroup;
            if (showGroup) lastGroup = item.group;
            return (
              <React.Fragment key={item.path}>
                {showGroup && (
                  <div style={{
                    padding:"8px 20px 4px",
                    fontSize:10.5, fontWeight:700, letterSpacing:"0.1em",
                    textTransform:"uppercase", color:"var(--t3)",
                    marginTop: i > 0 ? 4 : 0,
                  }}>
                    {item.group}
                  </div>
                )}
                <button
                  onClick={() => go(item.path)}
                  onMouseEnter={() => setActive(i)}
                  style={{
                    display:"flex", alignItems:"center", gap:14,
                    width:"100%", padding:"9px 20px",
                    background: isActive ? "var(--bg3)" : "transparent",
                    border:"none", cursor:"pointer", textAlign:"left",
                    transition:"background 0.08s",
                    borderLeft: isActive ? "2px solid #6c5ce7" : "2px solid transparent",
                  }}
                >
                  {/* Icon box */}
                  <div style={{
                    width:30, height:30, borderRadius:8, flexShrink:0,
                    background: isActive ? "rgba(108,92,231,0.15)" : "var(--bg3)",
                    border: `1px solid ${isActive ? "rgba(108,92,231,0.25)" : "var(--border)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color: isActive ? "#a29bfe" : "var(--t3)",
                    transition:"all 0.08s",
                  }}>
                    <item.Icon/>
                  </div>

                  {/* Text */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{
                      fontSize:13.5, fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--t1)" : "var(--t1)",
                      letterSpacing:"-0.1px",
                    }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize:12, color:"var(--t3)", marginTop:1 }}>
                      {item.desc}
                    </div>
                  </div>

                  {/* Enter arrow */}
                  {isActive && (
                    <div style={{
                      display:"flex", alignItems:"center", gap:5, flexShrink:0,
                      color:"var(--t3)",
                    }}>
                      <kbd style={{
                        fontSize:10, color:"var(--t3)", background:"var(--bg4)",
                        border:"1px solid var(--border)", borderRadius:5,
                        padding:"2px 7px", fontFamily:"inherit",
                      }}>↵</kbd>
                    </div>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Footer ────────────────────────────────────── */}
        <div style={{
          borderTop:"1px solid var(--border)",
          padding:"10px 20px",
          display:"flex", gap:20, alignItems:"center",
          background:"var(--bg2)",
        }}>
          {[["↑ ↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, hint]) => (
            <span key={key} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <kbd style={{
                fontSize:10.5, color:"var(--t3)", background:"var(--bg3)",
                border:"1px solid var(--border)", borderRadius:5,
                padding:"2px 7px", fontFamily:"inherit", letterSpacing:0.2,
              }}>{key}</kbd>
              <span style={{ fontSize:11.5, color:"var(--t3)" }}>{hint}</span>
            </span>
          ))}
          <div style={{ flex:1 }}/>
          <span style={{ fontSize:11, color:"var(--t3)", opacity:0.6 }}>SimpleLogz</span>
        </div>
      </div>

      <style>{`
        @keyframes cmdSlideIn {
          from { opacity:0; transform:translateX(-50%) translateY(-10px) scale(0.98); }
          to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
