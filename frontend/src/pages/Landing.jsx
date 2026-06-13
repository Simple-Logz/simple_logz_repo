import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { api } from "../lib/api.js";
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

// ── Analyzer constants ────────────────────────────────────────
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

// ── Per-step chat component ───────────────────────────────────
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
    setMsgs(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/stepchat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step,
          log,
          analysis: result,
          messages: next,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setMsgs(m => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMsgs(m => [...m, { role: "assistant", content: `Sorry, I couldn't answer that right now. Try again in a moment.` }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  function copyCmd() {
    if (!step.command) return;
    navigator.clipboard.writeText(step.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={styles.stepWrap}>
      {/* Step header */}
      <div className={styles.stepHeader}>
        <div className={styles.stepNum}>{step.step}</div>
        <div className={styles.stepContent}>
          <div className={styles.stepAction}>{step.action}</div>
          {step.command && (
            <div className={styles.cmdWrap}>
              <code className={styles.cmd}>$ {step.command}</code>
              <button className={styles.copyBtn} onClick={copyCmd} title="Copy command">
                <IconCopy/> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ask about this step */}
      <button
        className={`${styles.chatToggle} ${open ? styles.chatToggleOpen : ""}`}
        onClick={() => setOpen(o => !o)}
      >
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
                <div className={styles.chatMsgText}>
                  <span className={styles.typingDots}><span/><span/><span/></span>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
          <div className={styles.chatInputWrap}>
            <input
              className={styles.chatInput}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
              placeholder="Ask a follow-up question…"
              disabled={loading}
            />
            <button className={styles.chatSend} onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>
              <IconSend/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Cursor Demo ──────────────────────────────────────────────
// view: 'groups' | 'modal' | 'detail'
// tab:  'overview' | 'log' | 'code' | 'runbook'
const DEMO_SCENES = [
  // 0 – Groups page loads
  { dur:900,  cx:300, cy:200, click:false, view:"groups", modalText:"",             tab:"overview" },
  // 1 – cursor moves to "+ New Group" button
  { dur:900,  cx:476, cy:66,  click:false, view:"groups", modalText:"",             tab:"overview" },
  // 2 – click → modal opens
  { dur:500,  cx:476, cy:66,  click:true,  view:"modal",  modalText:"",             tab:"overview" },
  // 3 – cursor moves to name input
  { dur:700,  cx:310, cy:192, click:false, view:"modal",  modalText:"",             tab:"overview" },
  // 4 – typing group name
  { dur:1400, cx:310, cy:192, click:false, view:"modal",  modalText:"Production API", tab:"overview" },
  // 5 – cursor moves to Create button
  { dur:700,  cx:370, cy:232, click:false, view:"modal",  modalText:"Production API", tab:"overview" },
  // 6 – click Create → group added
  { dur:600,  cx:370, cy:232, click:true,  view:"groups", modalText:"Production API", tab:"overview" },
  // 7 – cursor hovers new group card
  { dur:1200, cx:300, cy:275, click:false, view:"groups", modalText:"Production API", tab:"overview" },
  // 8 – click group → enter detail
  { dur:500,  cx:300, cy:275, click:true,  view:"detail", modalText:"Production API", tab:"overview" },
  // 9 – overview tab visible
  { dur:1100, cx:300, cy:210, click:false, view:"detail", modalText:"Production API", tab:"overview" },
  // 10 – cursor moves to Log Analyzer tab
  { dur:800,  cx:192, cy:76,  click:false, view:"detail", modalText:"Production API", tab:"overview" },
  // 11 – click Log Analyzer
  { dur:500,  cx:192, cy:76,  click:true,  view:"detail", modalText:"Production API", tab:"log" },
  // 12 – browse log analyzer
  { dur:1800, cx:300, cy:240, click:false, view:"detail", modalText:"Production API", tab:"log" },
  // 13 – cursor moves to Code Inspector tab
  { dur:800,  cx:286, cy:76,  click:false, view:"detail", modalText:"Production API", tab:"log" },
  // 14 – click Code Inspector
  { dur:500,  cx:286, cy:76,  click:true,  view:"detail", modalText:"Production API", tab:"code" },
  // 15 – browse code inspector
  { dur:1800, cx:300, cy:220, click:false, view:"detail", modalText:"Production API", tab:"code" },
  // 16 – cursor moves to Runbook tab
  { dur:800,  cx:382, cy:76,  click:false, view:"detail", modalText:"Production API", tab:"code" },
  // 17 – click Runbook Studio
  { dur:500,  cx:382, cy:76,  click:true,  view:"detail", modalText:"Production API", tab:"runbook" },
  // 18 – browse runbook
  { dur:1800, cx:300, cy:230, click:false, view:"detail", modalText:"Production API", tab:"runbook" },
  // 19 – pause before loop
  { dur:900,  cx:300, cy:230, click:false, view:"detail", modalText:"Production API", tab:"runbook" },
];

const SCENE_LABELS = [
  "Your engineering groups — one place for every service",
  "Create a group for any service or team",
  "Opening the group creator…",
  "Name your group",
  "Group name: Production API",
  "Hit Create",
  "Group created and ready",
  "Click to open your group workspace",
  "Entering Production API…",
  "Group overview — health score, recent incidents",
  "Navigate to Log Analyzer",
  "Log Analyzer active",
  "Paste logs → instant AI root cause + fix",
  "Switch to Code Inspector",
  "Code Inspector active",
  "Upload code → AI detects bugs & vulnerabilities",
  "Open Runbook Studio",
  "Runbook Studio active",
  "Auto-generated step-by-step incident runbooks",
  "One group. Every tool your team needs. ⚡",
];

function CursorDemo() {
  const [si, setSi] = useState(0);
  const [ripple, setRipple] = useState(false);
  const [tilt, setTilt] = useState({ x: 8, y: -4 });
  const [hovering, setHovering] = useState(false);
  const sc = DEMO_SCENES[si];

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -16, y: x * 16 });
  }
  function handleMouseEnter() { setHovering(true); }
  function handleMouseLeave() { setHovering(false); setTilt({ x: 8, y: -4 }); }

  useEffect(() => {
    const t = setTimeout(() => setSi(i => (i + 1) % DEMO_SCENES.length), sc.dur);
    return () => clearTimeout(t);
  }, [si]);

  useEffect(() => {
    if (sc.click) {
      setRipple(true);
      const t = setTimeout(() => setRipple(false), 350);
      return () => clearTimeout(t);
    }
  }, [si]);

  const TABS = [
    { key:"overview", label:"Overview",      icon:"📊" },
    { key:"log",      label:"Log Analyzer",  icon:"📋" },
    { key:"code",     label:"Code Inspector",icon:"🔍" },
    { key:"runbook",  label:"Runbook Studio",icon:"📖" },
  ];

  return (
    <div style={{ width:"100%", maxWidth:640, margin:"180px auto 0" }}>
      {/* Label */}
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <span style={{ fontSize:15, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--t2)" }}>
          See how it works
        </span>
      </div>

      {/* 3D perspective wrapper */}
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ perspective:"1100px", perspectiveOrigin:"50% 40%", position:"relative" }}
      >
        {/* Bottom glow that shifts with tilt */}
        <div style={{
          position:"absolute", bottom:-40, left:"10%", right:"10%", height:60,
          background:"radial-gradient(ellipse, rgba(108,92,231,0.45) 0%, transparent 70%)",
          filter:"blur(18px)",
          transform:`translateX(${tilt.y * 1.5}px)`,
          transition:"transform 0.15s ease",
          pointerEvents:"none",
        }}/>

      {/* Demo card */}
      <div style={{
        border:"1px solid rgba(108,92,231,0.3)", borderRadius:14, overflow:"hidden",
        boxShadow:`0 ${24 + Math.abs(tilt.x) * 1.5}px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(108,92,231,0.12)`,
        position:"relative", background:"var(--bg2)", userSelect:"none",
        transform:`rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovering ? 1.01 : 1})`,
        transition: hovering
          ? "transform 0.12s ease, box-shadow 0.12s ease"
          : "transform 0.7s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.7s ease",
        transformStyle:"preserve-3d",
        willChange:"transform",
      }}>

        {/* Browser bar */}
        <div style={{ background:"var(--bg3)", borderBottom:"1px solid var(--border)", padding:"9px 14px", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ display:"flex", gap:5 }}>
            {["#f87171","#fbbf24","#34d399"].map(c => <div key={c} style={{ width:9, height:9, borderRadius:"50%", background:c }}/>)}
          </div>
          <div style={{ flex:1, background:"var(--bg2)", borderRadius:5, padding:"3px 10px", fontSize:10, color:"var(--t3)", textAlign:"center", border:"1px solid var(--border)" }}>
            simplelogz.com
          </div>
        </div>

        {/* App layout */}
        <div style={{ display:"flex", height:380 }}>

          {/* Sidebar */}
          <div style={{ width:110, background:"var(--bg3)", borderRight:"1px solid var(--border)", flexShrink:0, padding:"12px 0", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"0 11px 14px", fontSize:12, fontWeight:800, color:"var(--t1)", letterSpacing:"-0.5px" }}>
              Simple<span style={{ color:"#6c5ce7" }}>Logz</span>
            </div>
            {[
              { label:"Analyzer",  icon:"⚡", active: false },
              { label:"Groups",    icon:"📁", active: true  },
              { label:"Community", icon:"💬", active: false },
              { label:"Pricing",   icon:"💳", active: false },
            ].map(item => (
              <div key={item.label} style={{
                padding:"7px 11px", fontSize:10,
                color: item.active ? "var(--t1)" : "var(--t3)",
                fontWeight: item.active ? 700 : 400,
                borderLeft: item.active ? "2px solid #6c5ce7" : "2px solid transparent",
                background: item.active ? "rgba(108,92,231,0.1)" : "transparent",
                display:"flex", alignItems:"center", gap:6,
              }}>
                {item.icon} {item.label}
              </div>
            ))}
          </div>

          {/* Content pane */}
          <div style={{ flex:1, overflow:"hidden", position:"relative" }}>

            {/* ── Groups list view ── */}
            {(sc.view === "groups" || sc.view === "modal") && (
              <div style={{ padding:"14px", height:"100%", position:"relative" }}>
                {/* Header row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--t1)" }}>My Groups</div>
                  <div style={{
                    background:"#6c5ce7", color:"#fff", borderRadius:6,
                    padding:"4px 10px", fontSize:9, fontWeight:700,
                    display:"flex", alignItems:"center", gap:4,
                  }}>+ New Group</div>
                </div>

                {/* Existing group cards */}
                {[
                  { name:"Auth Service",  env:"staging",    sev:"LOW",      col:"#34d399", score:96 },
                  { name:"Worker Queue",  env:"production", sev:"CRITICAL", col:"#f87171", score:58 },
                ].map((g, i) => (
                  <div key={g.name} style={{
                    background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8,
                    padding:"9px 12px", marginBottom:8,
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                  }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:"var(--t1)", marginBottom:2 }}>{g.name}</div>
                      <div style={{ fontSize:9, color:"var(--t3)", textTransform:"uppercase" }}>{g.env}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:9, fontWeight:700, color:g.col, marginBottom:2 }}>{g.sev}</div>
                      <div style={{ fontSize:9, color:"var(--t3)" }}>Health <strong style={{color:"var(--t1)"}}>{g.score}</strong>/100</div>
                    </div>
                  </div>
                ))}

                {/* Newly created group (appears after creation) */}
                {sc.modalText && (
                  <div style={{
                    background:"var(--bg3)", border:"1px solid #6c5ce7", borderRadius:8,
                    padding:"9px 12px", marginBottom:8,
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    animation:"fadeIn 0.35s ease",
                    boxShadow:"0 0 0 1px rgba(108,92,231,0.2)",
                  }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:"var(--t1)", marginBottom:2 }}>{sc.modalText}</div>
                      <div style={{ fontSize:9, color:"var(--t3)", textTransform:"uppercase" }}>production</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:9, fontWeight:700, color:"#a29bfe", marginBottom:2 }}>NEW</div>
                      <div style={{ fontSize:9, color:"var(--t3)" }}>Health <strong style={{color:"var(--t1)"}}>—</strong>/100</div>
                    </div>
                  </div>
                )}

                {/* Modal overlay */}
                {sc.view === "modal" && (
                  <div style={{
                    position:"absolute", inset:0,
                    background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center",
                    animation:"fadeIn 0.2s ease",
                  }}>
                    <div style={{
                      background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10,
                      padding:"20px", width:240,
                      boxShadow:"0 16px 48px rgba(0,0,0,0.4)",
                    }}>
                      <div style={{ fontSize:12, fontWeight:800, color:"var(--t1)", marginBottom:14 }}>Create a Group</div>
                      <div style={{ fontSize:9, color:"var(--t3)", marginBottom:5 }}>GROUP NAME</div>
                      <div style={{
                        background:"var(--bg3)", border:"1px solid",
                        borderColor: sc.modalText ? "#6c5ce7" : "var(--border)",
                        borderRadius:6, padding:"7px 10px", fontSize:10,
                        color: sc.modalText ? "var(--t1)" : "var(--t3)",
                        marginBottom:14, minHeight:28,
                        transition:"border-color 0.2s",
                      }}>
                        {sc.modalText || "e.g. Production API"}
                        {sc.modalText && <span style={{ animation:"blink 1s step-end infinite", color:"#6c5ce7" }}>|</span>}
                      </div>
                      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                        <div style={{ padding:"5px 12px", fontSize:9, color:"var(--t3)", border:"1px solid var(--border)", borderRadius:6 }}>Cancel</div>
                        <div style={{
                          padding:"5px 12px", fontSize:9, fontWeight:700,
                          background: sc.modalText ? "#6c5ce7" : "rgba(108,92,231,0.3)",
                          color:"#fff", borderRadius:6, transition:"background 0.2s",
                        }}>Create</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Group detail view ── */}
            {sc.view === "detail" && (
              <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>

                {/* Detail header */}
                <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ fontSize:9, color:"var(--t3)" }}>← Groups</div>
                  <div style={{ fontSize:11, fontWeight:800, color:"var(--t1)" }}>Production API</div>
                  <span style={{ marginLeft:"auto", fontSize:8, background:"rgba(248,113,113,0.15)", color:"#f87171", padding:"2px 7px", borderRadius:99, fontWeight:700 }}>HIGH</span>
                </div>

                {/* Tab bar */}
                <div style={{ display:"flex", borderBottom:"1px solid var(--border)", padding:"0 14px" }}>
                  {TABS.map(tab => (
                    <div key={tab.key} style={{
                      padding:"8px 10px", fontSize:9, fontWeight: sc.tab === tab.key ? 700 : 400,
                      color: sc.tab === tab.key ? "var(--t1)" : "var(--t3)",
                      borderBottom: sc.tab === tab.key ? "2px solid #6c5ce7" : "2px solid transparent",
                      marginBottom:"-1px", transition:"all 0.2s", whiteSpace:"nowrap",
                    }}>
                      {tab.icon} {tab.label}
                    </div>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ flex:1, padding:"12px 14px", overflow:"hidden" }}>

                  {/* Overview */}
                  {sc.tab === "overview" && (
                    <div style={{ animation:"fadeIn 0.3s ease" }}>
                      <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                        {[
                          { label:"Health Score", val:"72/100", col:"#fbbf24" },
                          { label:"Open Issues",  val:"3",      col:"#f87171" },
                          { label:"Last Scan",    val:"2m ago", col:"var(--t2)" },
                        ].map(s => (
                          <div key={s.label} style={{ flex:1, background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:7, padding:"8px 10px" }}>
                            <div style={{ fontSize:8, color:"var(--t3)", marginBottom:4 }}>{s.label}</div>
                            <div style={{ fontSize:14, fontWeight:800, color:s.col }}>{s.val}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:7, padding:"9px 12px" }}>
                        <div style={{ fontSize:9, fontWeight:700, color:"var(--t2)", marginBottom:6 }}>Recent Activity</div>
                        {["Log spike detected — 3 FATAL errors","Code scan: 2 vulnerabilities found","Runbook generated for DB timeout"].map((a,i) => (
                          <div key={i} style={{ fontSize:9, color:"var(--t3)", padding:"4px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>• {a}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Log Analyzer */}
                  {sc.tab === "log" && (
                    <div style={{ animation:"fadeIn 0.3s ease" }}>
                      <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:7, padding:"8px 10px", fontFamily:"monospace", fontSize:9, color:"var(--t2)", lineHeight:1.7, marginBottom:8 }}>
                        <span style={{color:"#f87171"}}>FATAL</span> connect ETIMEDOUT 10.0.2.50:3306<br/>
                        <span style={{color:"#fbbf24"}}>WARN</span>  Retry attempt 3 of 3 failed<br/>
                        <span style={{color:"var(--t3)"}}>INFO</span>  RequestId: 8f3d2c1a · Lambda timeout 30s
                      </div>
                      <div style={{ background:"rgba(108,92,231,0.08)", border:"1px solid rgba(108,92,231,0.25)", borderRadius:7, padding:"9px 12px" }}>
                        <div style={{ fontSize:9, fontWeight:700, color:"#a29bfe", marginBottom:5 }}>⚡ AI Diagnosis</div>
                        <div style={{ fontSize:9, color:"var(--t2)", lineHeight:1.65, marginBottom:6 }}><strong style={{color:"var(--t1)"}}>Root cause:</strong> RDS unreachable from Lambda VPC subnet.</div>
                        <div style={{ fontSize:9, color:"#34d399" }}>Fix → Place Lambda in same VPC as RDS. Open TCP 3306 inbound.</div>
                      </div>
                    </div>
                  )}

                  {/* Code Inspector */}
                  {sc.tab === "code" && (
                    <div style={{ animation:"fadeIn 0.3s ease" }}>
                      <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:7, padding:"8px 10px", fontFamily:"monospace", fontSize:9, color:"var(--t2)", lineHeight:1.7, marginBottom:8 }}>
                        <span style={{color:"var(--t3)"}}>1  </span><span style={{color:"#a29bfe"}}>const</span> db = mysql.connect(&#123; host, port &#125;);<br/>
                        <span style={{color:"var(--t3)"}}>2  </span><span style={{color:"#a29bfe"}}>const</span> data = db.query(<span style={{color:"#fbbf24"}}>`SELECT * FROM users`</span>);<br/>
                        <span style={{color:"var(--t3)"}}>3  </span><span style={{color:"var(--t3)"}}>// no connection timeout set</span>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        {[
                          { sev:"HIGH",   msg:"No connection timeout — can hang indefinitely", col:"#f87171" },
                          { sev:"MEDIUM", msg:"Unparameterized query — SQL injection risk",    col:"#fbbf24" },
                        ].map(issue => (
                          <div key={issue.sev} style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:6, padding:"7px 10px", display:"flex", alignItems:"flex-start", gap:8 }}>
                            <span style={{ fontSize:8, fontWeight:700, color:issue.col, background:`${issue.col}18`, padding:"2px 6px", borderRadius:99, flexShrink:0 }}>{issue.sev}</span>
                            <span style={{ fontSize:9, color:"var(--t2)" }}>{issue.msg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Runbook Studio */}
                  {sc.tab === "runbook" && (
                    <div style={{ animation:"fadeIn 0.3s ease" }}>
                      <div style={{ fontSize:10, fontWeight:700, color:"var(--t1)", marginBottom:8 }}>DB Timeout Incident Runbook</div>
                      {[
                        { step:1, action:"Check VPC subnet config in AWS console",          status:"todo" },
                        { step:2, action:"Confirm Lambda + RDS share a subnet",             status:"todo" },
                        { step:3, action:"Open inbound TCP 3306 in DB security group",      status:"todo" },
                        { step:4, action:"Set connectTimeout: 5000 in DB client config",    status:"todo" },
                      ].map(r => (
                        <div key={r.step} style={{ display:"flex", alignItems:"center", gap:9, padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                          <div style={{ width:16, height:16, borderRadius:"50%", border:"1.5px solid var(--border)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"var(--t3)", fontWeight:700 }}>{r.step}</div>
                          <div style={{ fontSize:9, color:"var(--t2)" }}>{r.action}</div>
                        </div>
                      ))}
                      <div style={{ marginTop:10, background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:6, padding:"7px 10px", fontSize:9, color:"#34d399" }}>
                        ✓ Runbook auto-generated from log analysis
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Cursor ── */}
        <div style={{
          position:"absolute",
          left: sc.cx, top: sc.cy,
          transition:"left 0.6s cubic-bezier(0.4,0,0.2,1), top 0.6s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents:"none", zIndex:30,
        }}>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none" style={{ filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.6))", display:"block" }}>
            <path d="M1 1L1 17.5L5.2 13.1L8.5 20L10.5 19L7.3 12.2L13 12.2Z" fill="white" stroke="#1a1a2e" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
          {ripple && (
            <div style={{
              position:"absolute", top:-10, left:-10,
              width:28, height:28, borderRadius:"50%",
              border:"2px solid #6c5ce7", opacity:0,
              animation:"clickRipple 0.35s ease-out forwards",
            }}/>
          )}
        </div>

        {/* Scanline */}
        <div style={{
          position:"absolute", inset:0, borderRadius:14,
          background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.015) 3px,rgba(0,0,0,0.015) 4px)",
          pointerEvents:"none",
        }}/>

        {/* Shine — moves with tilt */}
        <div style={{
          position:"absolute", inset:0, borderRadius:14, pointerEvents:"none", zIndex:25,
          background:`radial-gradient(circle at ${50 + tilt.y * 2.5}% ${50 + tilt.x * 2.5}%, rgba(255,255,255,0.07) 0%, transparent 55%)`,
          transition: hovering ? "background 0.1s ease" : "background 0.6s ease",
        }}/>
      </div>
      </div>{/* end perspective wrapper */}

      {/* Scene label */}
      <p style={{ textAlign:"center", fontSize:12, color:"var(--t3)", marginTop:14, minHeight:18 }}>
        {SCENE_LABELS[si]}
      </p>

      <style>{`
        @keyframes clickRipple {
          0%   { transform:scale(0.5); opacity:0.9; }
          100% { transform:scale(2.2); opacity:0; }
        }
        @keyframes blink {
          0%, 100% { opacity:1; } 50% { opacity:0; }
        }
      `}</style>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function Landing() {
  const { isLoggedIn, isPro, getToken } = useAuth();
  const { showToast } = useToast();

  const [log,       setLog]       = useState("");
  const [source,    setSource]    = useState("auto");
  const [status,    setStatus]    = useState("idle");
  const [result,    setResult]    = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const fileRef = useRef(null);

  const canAnalyze = log.trim().length >= 5 && status !== "analyzing";

  function loadExample(key) {
    setLog(EXAMPLES[key]);
    setResult(null);
    setStatus("idle");
  }

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
      setResult(analysis);
      setStatus("done");
      setActiveTab(0);
    } catch (err) {
      setStatus("error");
      if (err.message?.includes("Daily limit")) {
        showToast("Daily limit reached — upgrade for unlimited analyses", "error");
      } else {
        showToast(err.message || "Analysis failed", "error");
      }
    }
  }

  function exportReport() {
    if (!result) return;
    const lines = [
      "═══════════════════════════════════════",
      "  SIMPLELOGZ ANALYSIS REPORT",
      `  ${new Date().toLocaleString()}`,
      "═══════════════════════════════════════",
      `\nSEVERITY: ${result.severity}  |  SOURCE: ${result.source_detected}`,
      `TITLE:    ${result.title}`,
      `ROOT CAUSE: ${result.root_cause_category}  |  FIX TIME: ${result.estimated_fix_time}`,
      `\n── PLAIN ENGLISH\n${result.plain_english}`,
      `\n── RESOLUTION STEPS`,
      ...(result.resolution_steps||[]).map(s => `${s.step}. ${s.action}${s.command ? `\n   $ ${s.command}` : ""}`),
      `\n── VERIFICATION`,
      ...(result.verification_commands||[]).map(c => `$ ${c}`),
      `\n── TECHNICAL CONTEXT\n${result.technical_context}`,
      `\n── PREVENTION`,
      ...(result.prevention||[]).map(p => `• ${p}`),
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
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"90px 24px 80px", minHeight:"100vh" }}>

      {/* Brand */}
      <h1 style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:700, letterSpacing:"-2px", color:"var(--t1)", marginBottom:8 }}>
        Simple<span style={{ color:"#6c5ce7" }}>Logz</span>
      </h1>
      <p style={{ color:"var(--t2)", fontSize:15, marginBottom:32 }}>
        Paste any error log. Get an instant AI diagnosis.
      </p>

      {/* Search box */}
      <div style={{ width:"100%", maxWidth:720 }}>
        <div style={{
          background:"var(--bg2)", border:"1px solid var(--border)",
          borderRadius:16, overflow:"hidden",
          boxShadow:"0 2px 16px rgba(0,0,0,0.12)",
        }}>
          <textarea
            value={log}
            onChange={e=>setLog(e.target.value)}
            onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();runAnalysis();}}}
            placeholder="Paste your error log here…"
            spellCheck={false}
            disabled={status==="analyzing"}
            style={{
              width:"100%", minHeight:140, padding:"20px 20px 12px",
              background:"transparent", border:"none", outline:"none",
              color:"var(--t1)", fontSize:14, fontFamily:"var(--mono)",
              lineHeight:1.7, resize:"none",
            }}
          />
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"10px 14px", borderTop:"1px solid var(--border)",
          }}>
            <select
              value={source} onChange={e=>setSource(e.target.value)}
              style={{
                background:"var(--bg3)", border:"1px solid var(--border)",
                borderRadius:8, padding:"5px 10px", color:"var(--t2)",
                fontSize:12, outline:"none",
              }}
            >
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
            <button
              onClick={()=>fileRef.current?.click()}
              style={{ background:"none", border:"1px solid var(--border)", borderRadius:8, padding:"5px 10px", color:"var(--t2)", fontSize:12, cursor:"pointer" }}
            >
              ↑ File
            </button>
            <input ref={fileRef} type="file" accept=".log,.txt,.json" style={{display:"none"}} onChange={handleFile}/>
            <div style={{ flex:1 }}/>
            {log && (
              <button
                onClick={()=>{setLog("");setResult(null);setStatus("idle");}}
                style={{ background:"none", border:"none", color:"var(--t3)", fontSize:12, cursor:"pointer", padding:"5px 8px" }}
              >
                Clear
              </button>
            )}
            <button
              onClick={runAnalysis}
              disabled={!canAnalyze}
              style={{
                background:"#6c5ce7", color:"#fff", border:"none",
                borderRadius:8, padding:"7px 18px", fontSize:13,
                fontWeight:600, cursor: canAnalyze ? "pointer" : "not-allowed",
                opacity: canAnalyze ? 1 : 0.45,
              }}
            >
              {status==="analyzing" ? "Analyzing…" : "→ Analyze"}
            </button>
          </div>
        </div>

        {/* Example chips */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:12, flexWrap:"wrap" }}>
          <span style={{ fontSize:12, color:"var(--t3)" }}>Try:</span>
          {Object.keys(EXAMPLES).map(k => (
            <button
              key={k}
              onClick={()=>loadExample(k)}
              style={{
                background:"var(--bg2)", border:"1px solid var(--border)",
                borderRadius:99, padding:"4px 12px", fontSize:12,
                color:"var(--t2)", cursor:"pointer",
              }}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Usage note */}
        {!isLoggedIn && (
          <p style={{ textAlign:"center", fontSize:12, color:"var(--t3)", marginTop:12 }}>
            2 free analyses daily · <Link to="/signup" style={{color:"#6c5ce7"}}>Sign up for unlimited →</Link>
          </p>
        )}
        {!isPro && isLoggedIn && (
          <p style={{ textAlign:"center", fontSize:12, color:"var(--t3)", marginTop:12 }}>
            Free plan · <Link to="/pricing" style={{color:"#6c5ce7"}}>Upgrade for unlimited →</Link>
          </p>
        )}
      </div>

      {/* Analyzing state */}
      {status === "analyzing" && (
        <div style={{ marginTop:48, display:"flex", flexDirection:"column", alignItems:"center", gap:12, color:"var(--t2)" }}>
          <span className="spinner" style={{width:28,height:28,borderWidth:3}}/>
          <div style={{fontSize:14}}>Analyzing your log…</div>
          <div style={{fontSize:12,color:"var(--t3)"}}>Reading error patterns · Building fix plan</div>
        </div>
      )}

      {/* Results */}
      {(status === "done" || status === "error") && result && (
        <div style={{ width:"100%", maxWidth:720, marginTop:32 }}>

          {/* Metrics row */}
          <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
            {[
              { label:"Severity",   value:result.severity,            color:sevColor[result.severity] },
              { label:"Source",     value:result.source_detected },
              { label:"Root Cause", value:result.root_cause_category },
              { label:"Fix Time",   value:result.estimated_fix_time  },
            ].map(m => (
              <div key={m.label} style={{
                flex:1, minWidth:120, background:"var(--bg2)",
                border:"1px solid var(--border)", borderRadius:12, padding:"12px 16px",
              }}>
                <div style={{fontSize:11,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{m.label}</div>
                <div style={{fontSize:14,fontWeight:600,color:m.color||"var(--t1)"}}>{m.value}</div>
              </div>
            ))}
            {isPro
              ? <button className="btn btn-ghost btn-sm" onClick={exportReport}>↓ Export</button>
              : <Link to="/pricing" className="btn btn-outline btn-sm">↓ Export (Pro)</Link>
            }
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:4, borderBottom:"1px solid var(--border)", marginBottom:16 }}>
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={()=>setActiveTab(i)}
                style={{
                  background:"none", border:"none", cursor:"pointer",
                  padding:"8px 16px", fontSize:13,
                  fontWeight: activeTab===i ? 600 : 400,
                  color: activeTab===i ? "var(--t1)" : "var(--t2)",
                  borderBottom: activeTab===i ? "2px solid #6c5ce7" : "2px solid transparent",
                  marginBottom:-1,
                }}
              >{t}</button>
            ))}
          </div>

          {/* Tab body */}
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12, padding:24 }}>
            {activeTab === 0 && (
              <div>
                <p style={{fontSize:15,lineHeight:1.8,color:"var(--t1)",marginBottom:16}}>{result.plain_english}</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <span className="badge badge-blue">{result.root_cause_category}</span>
                  <span className="badge badge-gray">Confidence: {result.confidence}</span>
                </div>
              </div>
            )}
            {activeTab === 1 && (
              <div>
                <div style={{fontSize:13,color:"var(--t2)",marginBottom:16}}>
                  Follow these steps. Click <strong>"Ask about this step"</strong> to chat with AI.
                </div>
                <div className={styles.stepsList}>
                  {(result.resolution_steps||[]).map(s => (
                    <StepChat key={s.step} step={s} result={result} log={log} />
                  ))}
                </div>
                {!isPro && (
                  <div className={styles.planGate}>
                    <div style={{fontWeight:600,marginBottom:6}}>🔒 Full CLI commands on Developer plan</div>
                    <Link to="/pricing" className="btn btn-primary btn-sm">Upgrade — $12/mo</Link>
                  </div>
                )}
              </div>
            )}
            {activeTab === 2 && (
              <div>
                <p style={{fontSize:14,color:"var(--t2)",lineHeight:1.8,marginBottom:16}}>{result.technical_context}</p>
                {(result.related_errors||[]).length > 0 && (
                  <>
                    <div style={{fontSize:11,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Related errors</div>
                    <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:6}}>
                      {result.related_errors.map((e,i)=><li key={i} style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--t2)",paddingLeft:14}}>→ {e}</li>)}
                    </ul>
                  </>
                )}
              </div>
            )}
            {activeTab === 3 && (
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:12}}>
                {(result.prevention||[]).map((p,i)=>(
                  <li key={i} style={{display:"flex",gap:10,fontSize:14}}>
                    <span style={{color:"var(--green)",fontWeight:700,flexShrink:0}}>✓</span>{p}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Cursor demo — always visible below analyzer */}
      <CursorDemo/>

      {/* CTA */}
      <div style={{ position:"relative", textAlign:"center", marginTop:80, marginBottom:40, padding:"60px 24px" }}>

        {/* Ambient glow */}
        <div style={{
          position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          width:500, height:200,
          background:"radial-gradient(ellipse, rgba(108,92,231,0.18) 0%, transparent 70%)",
          pointerEvents:"none",
        }}/>

        {/* Big headline with gradient */}
        <h2 style={{
          fontSize:"clamp(32px,5vw,58px)", fontWeight:900, letterSpacing:"-2px",
          lineHeight:1.1, marginBottom:24,
          background:"linear-gradient(135deg, #a29bfe 0%, #6c5ce7 50%, #4834d4 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          backgroundClip:"text",
        }}>
          Fix your Errors and Log<br/>incidents in seconds.
        </h2>

        {/* Sub */}
        <p style={{ fontSize:16, color:"var(--t3)", maxWidth:380, margin:"0 auto 36px", lineHeight:1.7 }}>
          Paste them. We'll translate chaos into a fix in seconds.
        </p>

        {/* CTA button — glowing border pill */}
        <div style={{ position:"relative", display:"inline-block" }}>
          <div style={{
            position:"absolute", inset:-2, borderRadius:50,
            background:"linear-gradient(135deg,#6c5ce7,#a29bfe,#6c5ce7)",
            backgroundSize:"200% 200%",
            animation:"gradientShift 3s ease infinite",
            filter:"blur(6px)", opacity:0.7,
          }}/>
          <button
            onClick={() => document.querySelector("textarea")?.focus()}
            style={{
              position:"relative", background:"#0f0f1a", color:"#fff",
              border:"1.5px solid rgba(108,92,231,0.6)",
              borderRadius:50, padding:"16px 44px",
              fontSize:16, fontWeight:800, cursor:"pointer",
              letterSpacing:"-0.3px",
              transition:"background 0.2s, transform 0.15s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background="#1a1030"; e.currentTarget.style.transform="scale(1.04)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="#0f0f1a"; e.currentTarget.style.transform="scale(1)"; }}
          >
            Analyze now &nbsp;⚡
          </button>
        </div>

        <style>{`
          @keyframes gradientShift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{
        width:"100%", borderTop:"1px solid var(--border)",
        background:"var(--bg2)", marginTop:40,
        padding:"40px 48px 28px",
      }}>
        <div style={{
          maxWidth:1100, margin:"0 auto",
          display:"flex", gap:60, alignItems:"flex-start",
        }}>

          {/* Brand */}
          <div style={{ minWidth:160 }}>
            <div style={{ fontSize:17, fontWeight:800, letterSpacing:"-0.4px", marginBottom:6 }}>
              Simple<span style={{color:"#6c5ce7"}}>Logz</span>
            </div>
            <p style={{ fontSize:12.5, color:"var(--t3)", lineHeight:1.6, marginBottom:14, maxWidth:180 }}>
              AI-powered error &amp; log analysis for developers.
            </p>
            <a href="mailto:support@simplelogz.com"
              style={{ fontSize:12.5, color:"var(--t3)", textDecoration:"none" }}
              onMouseEnter={e=>e.currentTarget.style.color="var(--t1)"}
              onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}
            >
              support@simplelogz.com
            </a>
          </div>

          {/* Spacer */}
          <div style={{ flex:1 }}/>

          {/* Link columns */}
          <div style={{ display:"flex", gap:60 }}>
            <FooterCol title="Product" links={[
              { label:"Analyzer",  to:"/"         },
              { label:"Projects",  to:"/projects" },
              { label:"Pricing",   to:"/pricing"  },
              { label:"Community", to:"/forum"    },
            ]}/>
            <FooterCol title="Company" links={[
              { label:"About",   to:"/about"   },
              { label:"Docs",    to:"/docs"    },
              { label:"Support", to:"/support" },
            ]}/>
            <FooterCol title="Account" links={[
              { label:"Sign in",  to:"/login"    },
              { label:"Sign up",  to:"/signup"   },
              { label:"Settings", to:"/settings" },
            ]}/>
            <FooterCol title="Legal" links={[
              { label:"Privacy Policy", to:"/privacy" },
              { label:"Terms of Use",   to:"/terms"   },
            ]}/>
          </div>

        </div>

        {/* Bottom */}
        <div style={{
          maxWidth:1100, margin:"28px auto 0",
          paddingTop:18, borderTop:"1px solid var(--border)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <span style={{ fontSize:12, color:"var(--t3)" }}>
            © {new Date().getFullYear()} SimpleLogz. All rights reserved.
          </span>
          <div style={{ display:"flex", gap:16 }}>
            {[
              { title:"GitHub",   href:"https://github.com/Simple-Logz", svg:<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg> },
              { title:"Twitter",  href:"#",                               svg:<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
              { title:"LinkedIn", href:"#",                               svg:<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
            ].map(({title, href, svg}) => (
              <a key={title} href={href} target="_blank" rel="noreferrer" title={title}
                style={{ color:"var(--t3)", transition:"color 0.15s", display:"flex" }}
                onMouseEnter={e=>e.currentTarget.style.color="var(--t1)"}
                onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}
              >{svg}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.09em", color:"var(--t1)", marginBottom:14 }}>
        {title}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {links.map(({ label, to }) => (
          <a
            key={label}
            href={to}
            style={{ fontSize:13, color:"var(--t3)", textDecoration:"none", transition:"color 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.color="var(--t1)"}
            onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
