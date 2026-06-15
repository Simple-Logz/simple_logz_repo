import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { api } from "../lib/api.js";
import TestimonialModal from "../components/TestimonialModal.jsx";
import styles from "./Landing.module.css";

// ── SVG Icons ────────────────────────────────────────────────
function IconAnalyze() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>;
}
function IconTerminal() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;
}
function IconForum() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IconReport() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function IconLock() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function IconHistory() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg>;
}
function IconChat() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IconSend() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
function IconCopy() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}

// ── Constants ────────────────────────────────────────────────
const EXAMPLES = {
  "K8s CrashLoop": `Events:\n  Warning  BackOff  32s (x5 over 2m)  kubelet  Back-off restarting failed container\n  Warning  Failed   33s (x5 over 2m)  kubelet  Error: failed to create containerd task\nStatus: CrashLoopBackOff — Restart count: 5`,
  "Postgres": `ERROR: could not connect to server: Connection refused\nFATAL: password authentication failed for user "app_user"\nERROR: max_connections reached (100/100)\nHINT: Consider PgBouncer`,
  "AWS Lambda": `START RequestId: 8f3d2c1a Version: $LATEST\n[ERROR] Error: connect ETIMEDOUT 10.0.2.50:3306\nREPORT Duration: 30021.43 ms\nTask timed out after 30.02 seconds`,
  "Nginx 502": `2024/03/15 14:30:45 [error] 12345#12345: *8832 connect() failed (111: Connection refused)\nwhile connecting to upstream: "http://127.0.0.1:3000"\nHTTP/1.1 502 Bad Gateway`,
  "Node.js OOM": `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory\n--max-old-space-size is currently set to: 512MB\nHeap used: 499MB / 512MB\nProcess exited with code 137 (SIGKILL)`,
};

const TABS = ["Overview", "Resolution", "Deep Dive", "Prevention"];

const FEATURES = [
  { icon: <IconAnalyze/>, title: "AI-Powered Analysis", desc: "Paste any error log and receive an instant plain English diagnosis — root cause, severity score, and step-by-step resolution." },
  { icon: <IconTerminal/>, title: "Browser Terminal", desc: "Run diagnostic commands directly in your browser — ping, curl, kubectl, docker ps, netstat and more without leaving the platform." },
  { icon: <IconForum/>, title: "Community Forum", desc: "Share error patterns with thousands of engineers worldwide. Upload log files, comment on threads, and solve problems faster together." },
  { icon: <IconReport/>, title: "Downloadable Reports", desc: "Export a full formatted analysis report — severity, resolution steps, technical context, and prevention tips. Developer plan and above." },
  { icon: <IconLock/>, title: "Federated Identity", desc: "Sign in with Google, GitHub, Microsoft, or Apple. Real OAuth authentication via Supabase. No new passwords to manage." },
  { icon: <IconHistory/>, title: "Analysis History", desc: "Every log analysis is saved to your personal dashboard. Search, revisit, and track recurring issues across your infrastructure." },
];

const API_BASE = import.meta.env.VITE_API_URL || "";

// ── Per-step chat ─────────────────────────────────────────────
function StepChat({ step, result, log }) {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState(false);
  const bottomRef = useRef(null);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text.trim() };
    const next = [...msgs, userMsg];
    setMsgs(next); setInput(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stepchat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, log, analysis: result, messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setMsgs(m => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Sorry, I couldn't answer that right now." }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  function copyCmd() {
    navigator.clipboard.writeText(step.command);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={styles.stepWrap}>
      <div className={styles.stepHeader}>
        <div className={styles.stepNum}>{step.step}</div>
        <div className={styles.stepContent}>
          <div className={styles.stepAction}>{step.action}</div>
          {step.command && (
            <div className={styles.cmdWrap}>
              <code className={styles.cmd}>$ {step.command}</code>
              <button className={styles.copyBtn} onClick={copyCmd}><IconCopy/> {copied ? "Copied!" : "Copy"}</button>
            </div>
          )}
        </div>
      </div>
      <button className={`${styles.chatToggle} ${open ? styles.chatToggleOpen : ""}`} onClick={() => setOpen(o => !o)}>
        <IconChat/>
        {open ? "Hide chat" : msgs.length > 0 ? `${msgs.filter(m=>m.role==="assistant").length} replies · Ask more` : "Ask about this step"}
      </button>
      {open && (
        <div className={styles.chatBox}>
          {msgs.length === 0 && (
            <div className={styles.chatEmpty}>
              <div>Ask anything about this step — "What does this command do?", "I got a different error", "Is this safe to run in production?"</div>
              <div className={styles.chatSuggestions}>
                {["What does this mean?", "I got an error", "Is this safe?", "Show me an example"].map(q => (
                  <button key={q} className={styles.suggestion} onClick={() => sendMessage(q)}>{q}</button>
                ))}
              </div>
            </div>
          )}
          <div className={styles.chatMsgs}>
            {msgs.map((m, i) => (
              <div key={i} className={`${styles.chatMsg} ${m.role === "user" ? styles.chatUser : styles.chatBot}`}>
                {m.role === "assistant" && <div className={styles.chatBotLabel}>AI</div>}
                <div className={styles.chatMsgText}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.chatMsg} ${styles.chatBot}`}>
                <div className={styles.chatBotLabel}>AI</div>
                <div className={styles.chatMsgText}><span className={styles.typingDots}><span/><span/><span/></span></div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
          <div className={styles.chatInputWrap}>
            <input className={styles.chatInput} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
              placeholder="Ask a follow-up question…" disabled={loading}/>
            <button className={styles.chatSend} onClick={() => sendMessage(input)} disabled={!input.trim() || loading}><IconSend/></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CursorDemo ────────────────────────────────────────────────
const DEMO_LOG_SHORT = "ERROR: CrashLoopBackOff\nkubelet: Back-off restarting failed container\nExit code 1 — OOMKilled";
const GROUP_NAME     = "Production APIs";

const DEMO_PHASES = [
  { id:"idle",        scene:"analyzer",      cx:200, cy:120, dur:800,  label:"Opening SimpleLogz…"              },
  { id:"typing",      scene:"analyzer",      cx:200, cy:120, dur:2200, label:"Pasting a K8s error log…"         },
  { id:"click-btn",   scene:"analyzer",      cx:330, cy:215, dur:500,  label:"Running AI analysis…",    clicking:true },
  { id:"analyzing",   scene:"analyzing",     cx:200, cy:165, dur:1600, label:"AI analyzing patterns…"           },
  { id:"results",     scene:"results",       cx:155, cy:265, dur:1000, label:"Diagnosis: CrashLoopBackOff ✓"    },
  { id:"res-tab",     scene:"results",       cx:155, cy:265, dur:500,  label:"Viewing resolution steps…", clicking:true },
  { id:"res-steps",   scene:"results-steps", cx:200, cy:300, dur:1600, label:"Step-by-step fix plan"            },
  { id:"nav-proj",    scene:"results-steps", cx:22,  cy:120, dur:500,  label:"Going to Projects…",      clicking:true },
  { id:"projects",    scene:"projects",      cx:290, cy:52,  dur:1200, label:"Your project groups"              },
  { id:"new-grp-clk", scene:"projects",      cx:290, cy:52,  dur:500,  label:"Creating a new group…",   clicking:true },
  { id:"naming",      scene:"new-group",     cx:200, cy:165, dur:1800, label:"Creating 'Production APIs'…"      },
  { id:"grp-dash",    scene:"group-dash",    cx:200, cy:145, dur:1000, label:"Inside your project group"        },
  { id:"grp-log-clk", scene:"group-dash",    cx:72,  cy:230, dur:500,  label:"Opening Log Analyzer…",   clicking:true },
  { id:"log-tab",     scene:"group-log",     cx:200, cy:200, dur:1300, label:"Analyze logs inside a group"      },
  { id:"code-clk",    scene:"group-log",     cx:160, cy:230, dur:500,  label:"Inspecting code…",        clicking:true },
  { id:"inspect",     scene:"group-code",    cx:200, cy:200, dur:1300, label:"Code Inspector — 3 issues found"  },
  { id:"runbook-clk", scene:"group-code",    cx:238, cy:230, dur:500,  label:"Opening Runbook Studio…", clicking:true },
  { id:"runbook",     scene:"group-runbook", cx:200, cy:200, dur:1500, label:"AI-generated runbook ready"       },
  { id:"git-clk",     scene:"group-runbook", cx:312, cy:230, dur:500,  label:"Linking Git repo…",       clicking:true },
  { id:"git",         scene:"group-git",     cx:200, cy:200, dur:1800, label:"GitHub repo connected ✓"          },
  { id:"done",        scene:"analyzer",      cx:200, cy:120, dur:700,  label:"And it starts again…"            },
];

function GroupTabBar({ activeIndex, clickingTabIndex }) {
  const tabs = ["Log Analyzer","Code Inspector","Runbooks","Git","Analytics"];
  return (
    <div style={{display:"flex",padding:"0 6px",gap:0,borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
      {tabs.map((t,i) => (
        <div key={t} style={{
          padding:"6px 7px", fontSize:7.5, fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:.4,
          borderBottom:"2px solid transparent", whiteSpace:"nowrap",
          color: activeIndex===i ? "#4f8ef7" : "rgba(255,255,255,.25)",
          borderBottomColor: activeIndex===i ? "rgba(79,142,247,.6)" : "transparent",
          opacity: clickingTabIndex===i ? 0.6 : 1,
          transform: clickingTabIndex===i ? "scale(0.93)" : "scale(1)",
        }}>{t}</div>
      ))}
    </div>
  );
}

function CursorDemo() {
  const cardRef = useRef(null);

  function onMouseMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width  / 2;
    const cy = rect.height / 2;
    const ry =  ((x - cx) / cx) * 14;
    const rx = -((y - cy) / cy) * 9;
    el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
    el.style.transition = "transform 0.1s ease";
    // move glare
    const glare = el.querySelector("[data-glare]");
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,.13) 0%, transparent 55%)`;
    }
  }

  function onMouseLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(1200px) rotateX(3deg) rotateY(-8deg) scale(1)";
    el.style.transition = "transform 0.9s cubic-bezier(.22,1,.36,1)";
    const glare = el.querySelector("[data-glare]");
    if (glare) glare.style.background = "none";
  }

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [typed,    setTyped]    = useState("");
  const [grpTyped, setGrpTyped] = useState("");
  const phase = DEMO_PHASES[phaseIdx];

  useEffect(() => {
    const t = setTimeout(() => setPhaseIdx(i => (i+1) % DEMO_PHASES.length), phase.dur);
    return () => clearTimeout(t);
  }, [phaseIdx]);

  useEffect(() => {
    if (phase.id === "typing") {
      let i = 0;
      const iv = setInterval(() => { i++; setTyped(DEMO_LOG_SHORT.slice(0,i)); if (i>=DEMO_LOG_SHORT.length) clearInterval(iv); }, 40);
      return () => clearInterval(iv);
    }
    if (phase.id === "idle" || phase.id === "done") setTyped("");
  }, [phase.id]);

  useEffect(() => {
    if (phase.id === "naming") {
      let i = 0;
      const iv = setInterval(() => { i++; setGrpTyped(GROUP_NAME.slice(0,i)); if (i>=GROUP_NAME.length) clearInterval(iv); }, 80);
      return () => clearInterval(iv);
    }
    if (["grp-dash","projects"].includes(phase.id)) setGrpTyped("");
  }, [phase.id]);

  const { scene, clicking, cx, cy } = phase;
  const sidebarActive = ["projects","new-group","group-dash","group-log","group-code","group-runbook","group-git"].includes(scene) ? 1 : 0;
  const groupTabClicking = clicking ? (
    scene==="group-dash" ? 0 : scene==="group-log" ? 1 : scene==="group-code" ? 2 : scene==="group-runbook" ? 3 : -1
  ) : -1;

  const sidebarIcons = [
    <svg key="a" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    <svg key="b" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7a2 2 0 0 1 2-2h3l2 2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
    <svg key="c" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  ];

  return (
    <div className={styles.cursorSection}>
      <div className={styles.cursorLabel}>
        <span className={styles.cursorLiveBadge}>Live Demo</span>
        <span className={styles.cursorLabelText}>{phase.label}</span>
      </div>

      <div className={styles.cursorCard} ref={cardRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
        {/* Window chrome */}
        <div className={styles.cursorChrome}>
          <span className={styles.chromeDot} style={{background:"#ff5f57"}}/>
          <span className={styles.chromeDot} style={{background:"#ffbd2e"}}/>
          <span className={styles.chromeDot} style={{background:"#27c93f"}}/>
          <span className={styles.chromeTitle}>SimpleLogz</span>
        </div>

        {/* Layout: sidebar + content */}
        <div style={{display:"flex",height:340}}>

          {/* Mini sidebar */}
          <div style={{width:42,background:"#1e2a3e",borderRight:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",alignItems:"center",paddingTop:12,gap:6,flexShrink:0}}>
            {sidebarIcons.map((icon,i) => (
              <div key={i} style={{
                width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8,
                color: sidebarActive===i ? "rgba(79,142,247,1)" : "rgba(255,255,255,.25)",
                background: sidebarActive===i ? "rgba(79,142,247,.15)" : "transparent",
              }}>{icon}</div>
            ))}
          </div>

          {/* Content area */}
          <div style={{flex:1,overflow:"hidden",position:"relative",background:"#1a2438"}}>

            {/* SCENE: analyzer */}
            {scene==="analyzer" && (
              <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                <div style={{fontSize:9,fontWeight:700,color:"rgba(79,142,247,.9)",letterSpacing:2,fontFamily:"var(--mono)",textTransform:"uppercase"}}>Log Analyzer</div>
                <div style={{background:"#1c2640",border:"1px solid rgba(79,142,247,.18)",borderRadius:10,overflow:"hidden"}}>
                  <div style={{padding:"6px 12px",background:"rgba(79,142,247,.06)",borderBottom:"1px solid rgba(79,142,247,.12)",fontSize:9,fontFamily:"var(--mono)",color:"rgba(255,255,255,.3)"}}>Auto-detect ▾</div>
                  <div style={{minHeight:90,padding:"10px 12px",fontFamily:"var(--mono)",fontSize:10,color:"rgba(255,255,255,.7)",lineHeight:1.6,whiteSpace:"pre-wrap"}}>
                    {typed || <span style={{color:"rgba(255,255,255,.06)",fontStyle:"italic"}}>Paste your error log here…</span>}
                    {phase.id==="typing" && <span style={{display:"inline-block",width:2,height:11,background:"#4f8ef7",animation:"blink 1s step-end infinite",verticalAlign:"middle",marginLeft:1}}/>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderTop:"1px solid rgba(255,255,255,.05)",background:"rgba(255,255,255,.04)"}}>
                    <span style={{padding:"2px 8px",borderRadius:99,border:"1px solid rgba(255,255,255,.08)",fontSize:8,color:"rgba(255,255,255,.3)"}}>K8s</span>
                    <span style={{padding:"2px 8px",borderRadius:99,border:"1px solid rgba(255,255,255,.08)",fontSize:8,color:"rgba(255,255,255,.3)"}}>AWS</span>
                    <div style={{marginLeft:"auto",padding:"5px 12px",borderRadius:8,background:"linear-gradient(135deg,#4f8ef7,#6366f1)",fontSize:9,fontWeight:700,color:"#fff",fontFamily:"var(--mono)",opacity:clicking?0.7:1,transform:clicking?"scale(0.95)":"scale(1)"}}>→ Analyze</div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE: analyzing */}
            {scene==="analyzing" && (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:12}}>
                <div className={styles.demoSpinner} style={{width:26,height:26,borderWidth:2.5}}/>
                <div style={{fontSize:11,color:"rgba(255,255,255,.5)",fontFamily:"var(--mono)"}}>AI analyzing patterns…</div>
                <div style={{width:140,height:3,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                  <div style={{height:"100%",background:"linear-gradient(90deg,#4f8ef7,#a78bfa)",width:"65%",animation:"scanFill 1.5s ease-in-out infinite"}}/>
                </div>
              </div>
            )}

            {/* SCENE: results / results-steps */}
            {(scene==="results"||scene==="results-steps") && (
              <div style={{display:"flex",flexDirection:"column"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                  <div style={{padding:"8px 12px",borderRight:"1px solid rgba(255,255,255,.05)"}}>
                    <div style={{fontSize:7,textTransform:"uppercase",letterSpacing:1,color:"rgba(255,255,255,.25)",fontFamily:"var(--mono)",marginBottom:3}}>Severity</div>
                    <div style={{fontSize:13,fontWeight:700,color:"#ef4444"}}>CRITICAL</div>
                  </div>
                  <div style={{padding:"8px 12px"}}>
                    <div style={{fontSize:7,textTransform:"uppercase",letterSpacing:1,color:"rgba(255,255,255,.25)",fontFamily:"var(--mono)",marginBottom:3}}>Fix Time</div>
                    <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.9)"}}>~10 min</div>
                  </div>
                </div>
                <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.05)",background:"rgba(255,255,255,.05)",padding:"0 4px",gap:2}}>
                  {["Overview","Resolution","Deep Dive"].map((t,i) => (
                    <div key={t} style={{padding:"6px 10px",fontSize:8,fontFamily:"var(--mono)",textTransform:"uppercase",letterSpacing:.8,
                      color:(scene==="results-steps"&&i===1)?"#4f8ef7":"rgba(255,255,255,.25)",
                      borderBottom:(scene==="results-steps"&&i===1)?"2px solid rgba(79,142,247,.8)":"2px solid transparent",
                      opacity:clicking&&i===1?0.6:1}}>{t}</div>
                  ))}
                </div>
                <div style={{padding:"10px 12px",display:"flex",flexDirection:"column",gap:6}}>
                  {scene==="results" ? (
                    <>
                      <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:4,width:"90%"}}/>
                      <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:4,width:"75%"}}/>
                      <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:4,width:"83%"}}/>
                    </>
                  ) : (
                    ["Check container logs","Inspect image pull policy","Restart deployment"].map((s,i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                        <span style={{width:16,height:16,borderRadius:"50%",background:"rgba(79,142,247,.12)",border:"1px solid rgba(79,142,247,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"rgba(79,142,247,.9)",fontWeight:700,flexShrink:0}}>{i+1}</span>
                        <span style={{fontSize:9,color:"rgba(255,255,255,.5)",lineHeight:1.5}}>{s}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SCENE: projects */}
            {scene==="projects" && (
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.8)"}}>My Groups</div>
                  <div style={{padding:"4px 10px",borderRadius:6,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",fontSize:8,fontWeight:700,color:"#fff",opacity:clicking?0.7:1}}>+ New Group</div>
                </div>
                {["Production APIs","K8s Cluster","Auth Services"].map((name,i) => (
                  <div key={name} style={{padding:"8px 10px",marginBottom:6,borderRadius:8,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:24,height:24,borderRadius:6,background:["rgba(79,142,247,.2)","rgba(167,139,250,.2)","rgba(99,202,99,.2)"][i],flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,.8)"}}>{name}</div>
                      <div style={{fontSize:8,color:"rgba(255,255,255,.25)",marginTop:1}}>{[4,2,6][i]} members · {[12,5,20][i]} analyses</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SCENE: new-group */}
            {scene==="new-group" && (
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",padding:14}}>
                <div style={{background:"#1a2438",border:"1px solid rgba(79,142,247,.25)",borderRadius:12,padding:18,width:"100%"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.9)",marginBottom:14}}>Create New Group</div>
                  <div style={{fontSize:8,color:"rgba(255,255,255,.3)",marginBottom:5,textTransform:"uppercase",letterSpacing:.8,fontFamily:"var(--mono)"}}>Group Name</div>
                  <div style={{padding:"6px 10px",borderRadius:6,border:"1px solid rgba(99,102,241,.35)",background:"rgba(79,142,247,.06)",fontSize:10,color:"rgba(255,255,255,.8)",fontFamily:"var(--mono)",marginBottom:10,minHeight:28}}>
                    {grpTyped}{grpTyped && <span style={{display:"inline-block",width:1.5,height:10,background:"#4f8ef7",animation:"blink 1s step-end infinite",verticalAlign:"middle",marginLeft:1}}/>}
                  </div>
                  <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                    <div style={{padding:"4px 10px",borderRadius:5,border:"1px solid rgba(255,255,255,.08)",fontSize:8,color:"rgba(255,255,255,.3)"}}>Cancel</div>
                    <div style={{padding:"4px 10px",borderRadius:5,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",fontSize:8,fontWeight:700,color:"#fff"}}>Create</div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE: group-dash */}
            {scene==="group-dash" && (
              <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
                <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.9)"}}>Production APIs</div>
                  <div style={{fontSize:8,color:"rgba(255,255,255,.3)",marginTop:2}}>4 members · 12 analyses this week</div>
                </div>
                <GroupTabBar activeIndex={0} clickingTabIndex={clicking?0:-1}/>
                <div style={{padding:"10px 14px",flex:1}}>
                  <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:4,width:"85%",marginBottom:6}}/>
                  <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:4,width:"70%",marginBottom:6}}/>
                  <div style={{height:4,background:"rgba(255,255,255,.06)",borderRadius:4,width:"78%"}}/>
                </div>
              </div>
            )}

            {/* SCENE: group-log */}
            {scene==="group-log" && (
              <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
                <div style={{padding:"6px 14px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,.7)"}}>Production APIs</div>
                </div>
                <GroupTabBar activeIndex={0} clickingTabIndex={clicking?1:-1}/>
                <div style={{padding:"10px 14px",flex:1}}>
                  <div style={{background:"#1c2640",border:"1px solid rgba(79,142,247,.15)",borderRadius:8,padding:"8px 10px",fontSize:9,fontFamily:"var(--mono)",color:"rgba(255,255,255,.6)",lineHeight:1.6}}>
                    ERROR: CrashLoopBackOff container myapp<br/>
                    kubelet: Back-off restarting failed container<br/>
                    <span style={{color:"#ef4444"}}>Exit code: OOMKilled</span>
                  </div>
                  <div style={{marginTop:8,padding:"6px 10px",background:"rgba(79,142,247,.08)",borderRadius:6,fontSize:8,color:"rgba(79,142,247,.9)",fontFamily:"var(--mono)"}}>✓ Analysis complete — CRITICAL severity</div>
                </div>
              </div>
            )}

            {/* SCENE: group-code */}
            {scene==="group-code" && (
              <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
                <div style={{padding:"6px 14px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,.7)"}}>Production APIs</div>
                </div>
                <GroupTabBar activeIndex={1} clickingTabIndex={clicking?2:-1}/>
                <div style={{padding:"10px 14px",flex:1}}>
                  <div style={{background:"#1c2640",border:"1px solid rgba(255,165,0,.2)",borderRadius:8,overflow:"hidden"}}>
                    <div style={{padding:"5px 10px",background:"rgba(255,165,0,.06)",borderBottom:"1px solid rgba(255,165,0,.15)",fontSize:8,color:"rgba(255,165,0,.7)",fontFamily:"var(--mono)"}}>⚠ 3 issues found</div>
                    {[{line:14,msg:"Unhandled promise rejection"},{line:28,msg:"Memory leak — listener not removed"},{line:45,msg:"Deprecated: process.binding()"}].map((issue,i) => (
                      <div key={i} style={{padding:"5px 10px",borderBottom:"1px solid rgba(255,255,255,.04)",display:"flex",gap:8,alignItems:"flex-start"}}>
                        <span style={{fontSize:7,color:"rgba(255,165,0,.7)",fontFamily:"var(--mono)",flexShrink:0}}>L{issue.line}</span>
                        <span style={{fontSize:8,color:"rgba(255,255,255,.45)"}}>{issue.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SCENE: group-runbook */}
            {scene==="group-runbook" && (
              <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
                <div style={{padding:"6px 14px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,.7)"}}>Production APIs</div>
                </div>
                <GroupTabBar activeIndex={2} clickingTabIndex={clicking?3:-1}/>
                <div style={{padding:"10px 14px",flex:1}}>
                  <div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,.7)",marginBottom:8}}>K8s OOMKill Recovery Runbook</div>
                  {["Identify affected pods","Scale memory limits","Restart deployment","Monitor recovery"].map((s,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                      <div style={{width:14,height:14,borderRadius:"50%",background:"rgba(79,142,247,.15)",border:"1px solid rgba(99,102,241,.35)",fontSize:7,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(79,142,247,.9)",flexShrink:0}}>{i+1}</div>
                      <span style={{fontSize:9,color:"rgba(255,255,255,.5)"}}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCENE: group-git */}
            {scene==="group-git" && (
              <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
                <div style={{padding:"6px 14px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                  <div style={{fontSize:9,fontWeight:600,color:"rgba(255,255,255,.7)"}}>Production APIs</div>
                </div>
                <GroupTabBar activeIndex={3} clickingTabIndex={-1}/>
                <div style={{padding:"10px 14px",flex:1}}>
                  <div style={{border:"1px solid rgba(99,102,241,.3)",borderRadius:8,padding:"10px 12px",background:"rgba(79,142,247,.06)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>
                      <div>
                        <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,.9)"}}>github.com/team/production-api</div>
                        <div style={{fontSize:8,color:"rgba(255,255,255,.3)"}}>main branch · last commit 2h ago</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {["12 open PRs","3 failing checks","Last deploy: ✓"].map(badge => (
                        <span key={badge} style={{padding:"2px 8px",borderRadius:99,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",fontSize:7,color:"rgba(255,255,255,.4)"}}>{badge}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>{/* end content */}
        </div>{/* end layout */}

        {/* Animated cursor */}
        <div className={styles.demoCursor} style={{
          left:cx, top:cy,
          transition:"left 0.65s cubic-bezier(.4,0,.2,1), top 0.65s cubic-bezier(.4,0,.2,1)",
          transform:clicking?"scale(0.8)":"scale(1)",
        }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="white" stroke="rgba(0,0,0,.5)" strokeWidth="1.2">
            <path d="M4 2l12 8-6 1-3 6z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Landing() {
  const { isLoggedIn, isPro, getToken } = useAuth();
  const { showToast } = useToast();
  const [showTestimonial, setShowTestimonial] = useState(false);
  const [anchorRect,      setAnchorRect]      = useState(null);
  const reviewBtnRef = useRef(null);

  const [log,          setLog]          = useState("");
  const [source,       setSource]       = useState("auto");
  const [status,       setStatus]       = useState("idle");
  const [result,       setResult]       = useState(null);
  const [activeTab,    setActiveTab]    = useState(0);
  const [reportFormat, setReportFormat] = useState("both");
  const fileRef = useRef(null);

  // ── Guided hint ──────────────────────────────────────────────
  const [hintText,    setHintText]    = useState("");
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    if (log) return;
    const msg = "Paste your error message here…";
    let iv = null;
    let stopped = false;

    function runCycle() {
      if (stopped) return;
      setHintText("");
      setHintVisible(true);
      let i = 0;
      iv = setInterval(() => {
        if (stopped) { clearInterval(iv); return; }
        i++;
        setHintText(msg.slice(0, i));
        if (i >= msg.length) {
          clearInterval(iv);
          // 2-second pause then restart
          setTimeout(runCycle, 2000);
        }
      }, 55);
    }

    const initial = setTimeout(runCycle, 900);
    return () => {
      stopped = true;
      clearTimeout(initial);
      clearInterval(iv);
    };
  }, [log]);

  const canAnalyze = log.trim().length >= 5 && status !== "analyzing";

  function loadExample(key) { setLog(EXAMPLES[key]); setResult(null); setStatus("idle"); }
  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLog(ev.target.result);
    reader.readAsText(file);
  }

  async function runAnalysis() {
    if (!canAnalyze) return;
    setStatus("analyzing"); setResult(null);
    try {
      const token = isLoggedIn ? await getToken() : null;
      const { analysis } = await api.analyze({ log: log.trim(), source }, token);
      setResult(analysis); setStatus("done"); setActiveTab(0);
    } catch (err) {
      setStatus("error");
      showToast(err.message?.includes("Daily limit") ? "Daily limit reached — upgrade for unlimited analyses" : (err.message || "Analysis failed"), "error");
    }
  }

  function exportReport() {
    if (!result) return;
    const showCmds   = reportFormat === "commands" || reportFormat === "both";
    const showPortal = reportFormat === "portal"   || reportFormat === "both";
    const fmtLabel   = { commands: "CLI Commands", portal: "Console/UI Steps", both: "CLI Commands + Console/UI Steps" }[reportFormat];
    const steps = (result.resolution_steps||[]).map(s => {
      let line = `${s.step}. ${s.action}`;
      if (showCmds   && s.command)      line += `\n   $ ${s.command}`;
      if (showPortal && s.portal_steps) line += `\n   UI: ${s.portal_steps}`;
      return line;
    });
    const lines = [
      "═══════════════════════════════════════",
      "  SIMPLELOGZ ANALYSIS REPORT",
      `  ${new Date().toLocaleString()}`,
      `  Format: ${fmtLabel}`,
      "═══════════════════════════════════════",
      `\nSEVERITY: ${result.severity}  |  SOURCE: ${result.source_detected}`,
      `TITLE:    ${result.title}`,
      `ROOT CAUSE: ${result.root_cause_category}  |  FIX TIME: ${result.estimated_fix_time}`,
      `\n── PLAIN ENGLISH\n${result.plain_english}`,
      `\n── RESOLUTION STEPS`, ...steps,
      `\n── VERIFICATION`, ...(result.verification_commands||[]).map(c => `$ ${c}`),
      `\n── TECHNICAL CONTEXT\n${result.technical_context}`,
      `\n── PREVENTION`, ...(result.prevention||[]).map(p => `• ${p}`),
      `\n── ORIGINAL LOG\n${log}`,
      "\n═══════════════════════════════════════",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `simplelogz-${Date.now()}.txt`;
    a.click(); URL.revokeObjectURL(a.href);
  }

  const sevColor = { CRITICAL:"var(--red)", HIGH:"var(--yellow)", MEDIUM:"var(--accent)", LOW:"var(--green)" };

  return (
    <div className={styles.page}>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>AI Log Intelligence Platform</div>
            <h1 className={styles.title}>
              Understand any error.
            </h1>
            <h1 className={styles.titleSub}>
              <span className={styles.gradient}>Fix it in seconds.</span>
            </h1>
            <p className={styles.sub}>
              Paste any error log. Get a plain English diagnosis and a step-by-step fix — instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ── Single-box Analyzer ────────────────────────────── */}
      <div className={styles.analyzerWrap}>
        <div className="container">
          {!isPro && isLoggedIn && (
            <div className={styles.usagePill}>
              Free plan · <Link to="/pricing" style={{color:"var(--accent)"}}>Upgrade for unlimited →</Link>
            </div>
          )}
          {!isLoggedIn && (
            <div className={styles.usagePill}>
              2 free analyses daily · <Link to="/signup" style={{color:"var(--accent)"}}>Sign up for unlimited →</Link>
            </div>
          )}

          {/* ONE rectangular box */}
          <div className={styles.analyzerFrame}>

            {/* Toolbar row */}
            <div className={styles.analyzerToolbar}>
              <span className={styles.panelLabel}>LOG ANALYZER</span>
              <div style={{display:"flex",gap:8,alignItems:"center",marginLeft:"auto"}}>
                <select className={`form-input ${styles.select}`} value={source} onChange={e=>setSource(e.target.value)}>
                  <option value="auto">Auto-detect</option>
                  <option value="kubernetes">Kubernetes</option>
                  <option value="docker">Docker</option>
                  <option value="aws">AWS</option>
                  <option value="nginx">Nginx</option>
                  <option value="postgres">Postgres</option>
                  <option value="nodejs">Node.js</option>
                  <option value="python">Python</option>
                  <option value="linux">Linux/Syslog</option>
                </select>
                <button className="btn btn-ghost btn-sm" onClick={()=>fileRef.current?.click()}>↑ File</button>
                <input ref={fileRef} type="file" accept=".log,.txt,.json" style={{display:"none"}} onChange={handleFile}/>
              </div>
            </div>

            {/* Input area */}
            <div style={{position:"relative"}}>
              <textarea
                className={styles.textarea}
                value={log}
                onChange={e => { setLog(e.target.value); setHintVisible(false); }}
                onFocus={() => setHintVisible(false)}
                onKeyDown={e => { if ((e.ctrlKey||e.metaKey) && e.key === "Enter") { e.preventDefault(); runAnalysis(); }}}
                placeholder=""
                spellCheck={false}
                disabled={status === "analyzing"}
                style={{caretColor:"var(--accent)"}}
              />
              {hintVisible && !log && (
                <div style={{
                  position:"absolute",top:0,left:0,right:0,
                  padding:"16px 20px",pointerEvents:"none",
                  fontFamily:"var(--mono)",fontSize:14,
                  color:"var(--t3)",lineHeight:1.7,
                  letterSpacing:".01em",
                }}>
                  {hintText}
                  {hintText && hintText.length < 30 && (
                    <span style={{display:"inline-block",width:2,height:"1em",background:"var(--accent)",verticalAlign:"middle",marginLeft:2,animation:"blink 1s step-end infinite"}}/>
                  )}
                </div>
              )}
            </div>

            {/* Footer row: examples + action buttons */}
            <div className={styles.analyzerFooter}>
              <div className={styles.examples}>
                <span className={styles.examplesLabel}>Try:</span>
                {Object.keys(EXAMPLES).map(k => (
                  <button key={k} className={styles.chip} onClick={() => loadExample(k)}>{k}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                {log && <button className="btn btn-ghost btn-sm" onClick={() => { setLog(""); setResult(null); setStatus("idle"); }}>Clear</button>}
                <button className="btn btn-primary" onClick={runAnalysis} disabled={!canAnalyze}>
                  {status === "analyzing" ? <><span className="spinner"/>Analyzing…</> : "→ Analyze"}
                </button>
              </div>
            </div>

            {/* Analyzing state */}
            {status === "analyzing" && (
              <div className={styles.analyzing}>
                <span className="spinner" style={{width:28,height:28,borderWidth:3}}/>
                <div>Analyzing…</div>
                <div className={styles.scanBar}><div className={styles.scanFill}/></div>
                <div style={{fontSize:12,color:"var(--t3)"}}>Reading error patterns · Building fix plan</div>
              </div>
            )}

            {/* Results — appear below input in the same box */}
            {(status === "done" || status === "error") && result && (
              <div className={styles.resultsSection}>
                {/* Metrics row */}
                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>Severity</div>
                    <div className={styles.metricValue} style={{color:sevColor[result.severity]||"var(--t1)"}}>{result.severity}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>Source</div>
                    <div className={styles.metricValue}>{result.source_detected}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>Root Cause</div>
                    <div className={styles.metricValue}>{result.root_cause_category}</div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>Fix Time</div>
                    <div className={styles.metricValue}>{result.estimated_fix_time}</div>
                  </div>
                </div>

                {/* Download report */}
                <div style={{display:"flex",justifyContent:"flex-end",padding:"8px 16px",borderBottom:"1px solid var(--border)"}}>
                  {isPro
                    ? <button className="btn btn-ghost btn-sm" onClick={exportReport}>↓ Download Incident Report</button>
                    : <Link to="/pricing" className="btn btn-ghost btn-sm">↓ Download Incident Report</Link>
                  }
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                  {TABS.map((t,i) => (
                    <button key={t} className={`${styles.tab} ${activeTab===i?styles.tabActive:""}`} onClick={()=>setActiveTab(i)}>{t}</button>
                  ))}
                </div>

                <div className={styles.tabBody}>
                  {activeTab === 0 && (
                    <div>
                      <p className={styles.plainEnglish}>{result.plain_english}</p>
                      <div style={{marginTop:14,display:"flex",gap:8,flexWrap:"wrap"}}>
                        <span className="badge badge-blue">{result.root_cause_category}</span>
                        <span className="badge badge-gray">Confidence: {result.confidence}</span>
                      </div>
                    </div>
                  )}
                  {activeTab === 1 && (
                    <div>
                      <div className={styles.stepsIntro}>
                        Follow these steps to resolve the issue. Click <strong>"Ask about this step"</strong> under any step to chat with AI for clarification.
                      </div>
                      <div className={styles.stepsList}>
                        {(result.resolution_steps||[]).map(s => (
                          <StepChat key={s.step} step={s} result={result} log={log}/>
                        ))}
                      </div>
                      {!isPro && (
                        <div className={styles.planGate}>
                          <div style={{fontWeight:600,marginBottom:6}}>🔒 Full CLI commands on Developer plan</div>
                          <div style={{fontSize:13,color:"var(--t2)",marginBottom:14}}>Upgrade for complete step-by-step commands, per-step AI chat, and downloadable reports.</div>
                          <Link to="/pricing" className="btn btn-primary btn-sm">Upgrade — $10/mo</Link>
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === 2 && (
                    <div>
                      <p style={{fontSize:14,color:"var(--t2)",lineHeight:1.8,marginBottom:16}}>{result.technical_context}</p>
                      {(result.related_errors||[]).length > 0 && (
                        <>
                          <div className={styles.sectionLabel}>Related errors</div>
                          <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
                            {result.related_errors.map((e,i) => <li key={i} style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--t2)",paddingLeft:14}}>→ {e}</li>)}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                  {activeTab === 3 && (
                    <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:12}}>
                      {(result.prevention||[]).map((p,i) => (
                        <li key={i} style={{display:"flex",gap:10,fontSize:14}}>
                          <span style={{color:"var(--green)",fontWeight:700,flexShrink:0}}>✓</span>{p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

          </div>{/* end analyzerFrame */}
        </div>
      </div>

      {/* ── Cursor Demo ────────────────────────────────────────── */}
      <CursorDemo />

      {/* ── CTA + Footer ───────────────────────────────────────── */}
      <div className="container">
        <div className={styles.ctaSection}>
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaHeading}>
              Fix Errors &amp; <span className={styles.ctaPurple}>Log Incidents</span>
            </h2>
            <p className={styles.ctaSub}>Paste any error log. Get a plain English diagnosis and a step-by-step fix — instantly.</p>
            <button className={styles.ctaBtnPrimary} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Analyze Logs
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Testimonials carousel ─────────────────────────────── */}
      <TestimonialCarousel/>

      {/* ── Share your experience ─────────────────────────────── */}
      <div className="container">
        <div className={styles.reviewBanner} style={{
          margin:"0 0 100px",
          borderRadius:20,
          background:"linear-gradient(135deg, rgba(108,92,231,0.18) 0%, rgba(130,110,255,0.12) 100%)",
          border:"1px solid rgba(108,92,231,0.3)",
          boxShadow:"0 4px 24px rgba(108,92,231,0.12)",
          padding:"18px 32px",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:24, flexWrap:"wrap",
          position:"relative", overflow:"hidden",
        }}>
          {/* Subtle glow orb */}
          <div style={{
            position:"absolute", top:"-30px", left:"60px",
            width:180, height:180,
            borderRadius:"50%",
            background:"radial-gradient(circle, rgba(108,92,231,0.06) 0%, transparent 70%)",
            pointerEvents:"none",
          }}/>

          <div style={{ display:"flex", alignItems:"center", gap:16, position:"relative" }}>
            {/* Icon mark */}
            <div style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background:"linear-gradient(135deg, rgba(108,92,231,0.2), rgba(162,155,254,0.08))",
              border:"1px solid rgba(108,92,231,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:16,
            }}>⭐</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:"var(--t1)", letterSpacing:"-0.2px" }}>
                Enjoyed using SimpleLogz?
              </div>
              <div style={{ fontSize:12, color:"var(--t3)", marginTop:3, lineHeight:1.5 }}>
                Share a quick review — it helps other engineers discover us.
              </div>
            </div>
          </div>

          {isLoggedIn
            ? (
              <button
                ref={reviewBtnRef}
                onClick={() => {
                  document.documentElement.style.overflow = "hidden";
                  setAnchorRect(reviewBtnRef.current?.getBoundingClientRect() || null);
                  setShowTestimonial(true);
                }}
                style={{
                  flexShrink:0, position:"relative",
                  padding:"9px 20px", borderRadius:10,
                  background:"linear-gradient(135deg, #6c5ce7, #8b7cf8)",
                  border:"1px solid rgba(162,155,254,0.3)",
                  boxShadow:"0 4px 20px rgba(108,92,231,0.35)",
                  color:"#fff", fontSize:13, fontWeight:600,
                  cursor:"pointer", letterSpacing:"-0.1px",
                  transition:"opacity .15s, transform .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity="0.88"; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}
              >
                Write a review
              </button>
            ) : (
              <Link
                to="/login"
                style={{
                  flexShrink:0,
                  padding:"11px 24px", borderRadius:12,
                  background:"linear-gradient(135deg, #6c5ce7, #8b7cf8)",
                  border:"1px solid rgba(162,155,254,0.3)",
                  boxShadow:"0 4px 20px rgba(108,92,231,0.35)",
                  color:"#fff", fontSize:13, fontWeight:600,
                  textDecoration:"none", letterSpacing:"-0.1px",
                }}
              >
                Sign in to leave a review
              </Link>
            )
          }
        </div>
      </div>

      {showTestimonial && (
        <TestimonialModal
          anchorRect={anchorRect}
          onClose={() => { setShowTestimonial(false); setAnchorRect(null); }}
        />
      )}

    </div>
  );
}

const TESTIMONIALS = [
  {
    quote: "SimpleLogz cut our incident response time in half. The AI diagnosis caught a race condition our team had been chasing for two weeks.",
    name: "Samuel Kubiangha",
    role: "Senior Backend Engineer",
    company: "Fintech startup, Lagos",
    initials: "JO",
    color: "#6c5ce7",
    tags: ["Log Analyzer", "AI Diagnosis"],
    icon: "🔍",
    iconBg: "linear-gradient(135deg,#6c5ce7,#a29bfe)",
  },
  {
    quote: "I pasted a 400-line stack trace and got a plain-English explanation with exact file and line numbers in seconds.",
    name: "Sarah Chen",
    role: "DevOps Lead",
    company: "E-commerce platform, Singapore",
    initials: "SC",
    color: "#00b894",
    tags: ["Stack Traces", "Error Analysis"],
    icon: "⚡",
    iconBg: "linear-gradient(135deg,#00b894,#55efc4)",
  },
  {
    quote: "The runbook generator alone is worth the subscription. We went from 2 hours writing incident docs to under 10 minutes.",
    name: "Marcus Rivera",
    role: "Site Reliability Engineer",
    company: "SaaS company, Austin TX",
    initials: "MR",
    color: "#e17055",
    tags: ["Runbook Studio", "Incidents"],
    icon: "📋",
    iconBg: "linear-gradient(135deg,#e17055,#fab1a0)",
  },
  {
    quote: "Our junior devs now resolve production issues independently. SimpleLogz gives them the context they need without escalating every time.",
    name: "Priya Nair",
    role: "Engineering Manager",
    company: "HealthTech, Bangalore",
    initials: "PN",
    color: "#0984e3",
    tags: ["Team Productivity", "Projects"],
    icon: "👥",
    iconBg: "linear-gradient(135deg,#0984e3,#74b9ff)",
  },
  {
    quote: "The Code Inspector found a SQL injection vulnerability that slipped past our review. Like having a senior security engineer on call 24/7.",
    name: "Tom Whitfield",
    role: "Full-Stack Developer",
    company: "Agency, London",
    initials: "TW",
    color: "#fd79a8",
    tags: ["Code Inspector", "Security"],
    icon: "🛡️",
    iconBg: "linear-gradient(135deg,#fd79a8,#fdcfe8)",
  },
  {
    quote: "When an alert fires at 3am, our engineers have a full diagnosis before they even fully wake up. SimpleLogz changed our on-call culture.",
    name: "Amara Diallo",
    role: "Platform Engineer",
    company: "Telecom, Paris",
    initials: "AD",
    color: "#fdcb6e",
    tags: ["On-Call", "Log Analyzer"],
    icon: "🌙",
    iconBg: "linear-gradient(135deg,#fdcb6e,#ffeaa7)",
  },
];

function normalise(t) {
  const initials = t.name ? t.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) : "??";
  return {
    ...t,
    initials,
    color:   t.avatar_color || t.color || "#6c5ce7",
    iconBg:  t.icon_bg      || t.iconBg || "linear-gradient(135deg,#6c5ce7,#a29bfe)",
    icon:    t.icon         || "⚡",
    tags:    Array.isArray(t.tags) ? t.tags : [],
  };
}

function TestimonialCarousel() {
  const [offset, setOffset] = React.useState(0);
  const [data, setData] = React.useState(TESTIMONIALS.map(normalise));

  React.useEffect(() => {
    import("../lib/api.js").then(({ api }) => {
      api.getTestimonials().then(res => {
        if (res.testimonials && res.testimonials.length >= 1)
          setData(res.testimonials.map(normalise));
      }).catch(() => {});
    });
  }, []);
  const timerRef = React.useRef(null);
  const total = data.length;

  function go(dir) {
    setOffset(o => (o + dir + total) % total);
  }

  function restart(dir) {
    clearInterval(timerRef.current);
    go(dir);
    timerRef.current = setInterval(() => go(1), 5000);
  }

  React.useEffect(() => {
    timerRef.current = setInterval(() => go(1), 5000);
    return () => clearInterval(timerRef.current);
  }, [total]);

  // Build visible set: 3 cards centered on current offset
  const visible = [0, 1, 2].map(i => data[(offset + i) % total]);

  return (
    <div className={styles.testimonialSection}>
      <p className={styles.testimonialLabel}>Loved by engineers worldwide</p>

      {/* Track */}
      <div className={styles.testimonialTrack}>
        {visible.map((t, i) => (
          <div key={`${offset}-${i}`} className={`${styles.tCard} ${i === 1 ? styles.tCardCenter : styles.tCardSide}`}>
            {/* Icon */}
            <div className={styles.tIcon} style={{ background: t.iconBg }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
            </div>
            {/* Quote */}
            <p className={styles.tQuote}>"{t.quote}"</p>
            {/* Tags */}
            <div className={styles.tTags}>
              {t.tags.map(tag => (
                <span key={tag} className={styles.tTag}>{tag}</span>
              ))}
            </div>
            {/* Author */}
            <div className={styles.tDivider}/>
            <div className={styles.tAuthor}>
              <div className={styles.tAvatar} style={{ background: t.color }}>{t.initials}</div>
              <div>
                <div className={styles.tName}>{t.name}</div>
                <div className={styles.tRole}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className={styles.testimonialControls}>
        <button className={styles.tArrow} onClick={() => restart(-1)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div className={styles.tDots}>
          {data.map((_, i) => (
            <button
              key={i}
              className={`${styles.tDot} ${i === offset ? styles.tDotActive : ""}`}
              onClick={() => { clearInterval(timerRef.current); setOffset(i); timerRef.current = setInterval(() => go(1), 5000); }}
            />
          ))}
        </div>
        <button className={styles.tArrow} onClick={() => restart(1)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}
