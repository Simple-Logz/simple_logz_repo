import React, { useState, useRef } from "react";
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
    <div className={styles.page}>

      {/* ── Brand heading ──────────────────────────────────── */}
      <div style={{ textAlign:"center", padding:"40px 0 8px" }}>
        <h1 style={{ fontSize:"clamp(28px,4vw,42px)", fontWeight:700, letterSpacing:"-1.5px", color:"var(--t1)" }}>
          Simple<span style={{ color:"#6c5ce7" }}>Logz</span>
        </h1>
        <p style={{ color:"var(--t2)", fontSize:15, marginTop:10 }}>
          AI-powered log analysis. Understand any error in seconds.
        </p>
      </div>

      {/* ── Live Analyzer ──────────────────────────────────── */}
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

          <div className={styles.analyzerFrame}>
            <div className={styles.layout}>
              {/* Input panel */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.panelLabel}>INPUT LOG</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
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
                <textarea
                  className={styles.textarea}
                  value={log}
                  onChange={e=>setLog(e.target.value)}
                  onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();runAnalysis();}}}
                  placeholder={"Paste your error log here…\n\nCtrl+Enter to analyze"}
                  spellCheck={false}
                  disabled={status==="analyzing"}
                />
                <div className={styles.panelFooter}>
                  <div className={styles.examples}>
                    <span className={styles.examplesLabel}>Try:</span>
                    {Object.keys(EXAMPLES).map(k => (
                      <button key={k} className={styles.chip} onClick={()=>loadExample(k)}>{k}</button>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    {log && <button className="btn btn-ghost btn-sm" onClick={()=>{setLog("");setResult(null);setStatus("idle");}}>Clear</button>}
                    <button className="btn btn-primary" onClick={runAnalysis} disabled={!canAnalyze}>
                      {status==="analyzing" ? <><span className="spinner"/>Analyzing…</> : "→ Analyze"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Result panel */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.panelLabel}>RESULT</span>
                  {result && isPro && (
                    <button className="btn btn-ghost btn-sm" onClick={exportReport}>↓ Export</button>
                  )}
                  {result && !isPro && (
                    <Link to="/pricing" className="btn btn-outline btn-sm">↓ Export (Developer)</Link>
                  )}
                </div>

                {status === "idle" && (
                  <div className={styles.empty}>
                    <div style={{fontSize:32}}>📋</div>
                    <div>Paste a log and click Analyze</div>
                    <div style={{fontSize:12,color:"var(--t3)"}}>Ctrl+Enter to analyze quickly</div>
                  </div>
                )}

                {status === "analyzing" && (
                  <div className={styles.analyzing}>
                    <span className="spinner" style={{width:28,height:28,borderWidth:3}}/>
                    <div>Analyzing…</div>
                    <div className={styles.scanBar}><div className={styles.scanFill}/></div>
                    <div style={{fontSize:12,color:"var(--t3)"}}>Reading error patterns · Building fix plan</div>
                  </div>
                )}

                {(status === "done" || status === "error") && result && (
                  <div style={{display:"flex",flexDirection:"column",flex:1}}>
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

                    <div className={styles.tabs}>
                      {TABS.map((t, i) => (
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
                              <StepChat key={s.step} step={s} result={result} log={log} />
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
                                {result.related_errors.map((e,i)=><li key={i} style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--t2)",paddingLeft:14,position:"relative"}}>→ {e}</li>)}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Features + CTA + Footer ───────────────── */}
      <div className="container">

        <div className={styles.sectionHead}>
          <div className={styles.sectionEyebrow}>Platform Features</div>
          <h2 className={styles.sectionTitle}>Everything your engineering team needs</h2>
          <p className={styles.sectionSub}>From instant log triage to collaborative debugging and team knowledge sharing.</p>
        </div>

        <div className={styles.features}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div className={styles.ctaSection}>
          <div className={styles.ctaInner}>
            <div className={styles.ctaEyebrow}>Get started today</div>
            <h2 className={styles.ctaTitle}>Stop guessing. Start fixing.</h2>
            <p className={styles.ctaSub}>Join thousands of engineers who use SimpleLogz to debug faster and ship with confidence.</p>
            <div className={styles.ctaActions}>
              <Link to="/signup" className="btn btn-primary btn-lg">Create free account</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign in</Link>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>SL</div>
              <div className={styles.footerBrandName}>SimpleLogz</div>
              <p className={styles.footerDesc}>AI-powered log intelligence for developers and IT teams.</p>
            </div>
            <div>
              <div className={styles.footerHead}>Product</div>
              <div className={styles.footerLinks}>
                <Link to="/terminal">Terminal</Link>
                <Link to="/forum">Community</Link>
                <Link to="/pricing">Pricing</Link>
              </div>
            </div>
            <div>
              <div className={styles.footerHead}>Account</div>
              <div className={styles.footerLinks}>
                <Link to="/login">Sign in</Link>
                <Link to="/signup">Sign up</Link>
                <Link to="/dashboard">Dashboard</Link>
              </div>
            </div>
            <div>
              <div className={styles.footerHead}>Legal</div>
              <div className={styles.footerLinks}>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Security</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 SimpleLogz. All rights reserved.</span>
            <span>Built for engineers worldwide.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
