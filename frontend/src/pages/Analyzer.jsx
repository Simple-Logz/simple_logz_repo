import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { api } from "../lib/api.js";
import styles from "./Analyzer.module.css";

const EXAMPLES = {
  "K8s CrashLoop": `Events:\n  Warning  BackOff  32s (x5 over 2m)  kubelet  Back-off restarting failed container\n  Warning  Failed   33s (x5 over 2m)  kubelet  Error: failed to create containerd task\nStatus: CrashLoopBackOff — Restart count: 5`,
  "Postgres": `ERROR: could not connect to server: Connection refused\nFATAL: password authentication failed for user "app_user"\nERROR: max_connections reached (100/100)\nHINT: Consider PgBouncer`,
  "AWS Lambda": `START RequestId: 8f3d2c1a Version: $LATEST\n[ERROR] Error: connect ETIMEDOUT 10.0.2.50:3306\nREPORT Duration: 30021.43 ms\nTask timed out after 30.02 seconds`,
  "Nginx 502": `2024/03/15 14:30:45 [error] 12345#12345: *8832 connect() failed (111: Connection refused)\nwhile connecting to upstream: "http://127.0.0.1:3000"\nHTTP/1.1 502 Bad Gateway`,
  "Node.js OOM": `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory\n--max-old-space-size is currently set to: 512MB\nHeap used: 499MB / 512MB\nProcess exited with code 137 (SIGKILL)`,
};

const TABS = ["Overview", "Resolution", "Deep Dive", "Prevention"];

export default function Analyzer() {
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
      <div className="container" style={{flex:1,display:"flex",flexDirection:"column"}}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Log Analyzer</h1>
            <p className={styles.sub}>Paste any error log for an instant AI diagnosis.</p>
          </div>
          {!isPro && isLoggedIn && (
            <div className={styles.usagePill}>
              Free plan · <Link to="/pricing" style={{color:"var(--accent)"}}>Upgrade for unlimited →</Link>
            </div>
          )}
        </div>

        <div className={styles.layout}>
          {/* Input */}
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

          {/* Result */}
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
                      <ol className={styles.steps}>
                        {(result.resolution_steps||[]).map(s => (
                          <li key={s.step} className={styles.step}>
                            <div className={styles.stepNum}>{s.step}</div>
                            <div>
                              <div className={styles.stepAction}>{s.action}</div>
                              {s.command && <code className={styles.cmd}>$ {s.command}</code>}
                            </div>
                          </li>
                        ))}
                      </ol>
                      {!isPro && (
                        <div className={styles.planGate}>
                          <div style={{fontWeight:600,marginBottom:6}}>🔒 Full CLI commands on Developer plan</div>
                          <div style={{fontSize:13,color:"var(--t2)",marginBottom:14}}>Upgrade for complete step-by-step commands and downloadable reports.</div>
                          <Link to="/pricing" className="btn btn-primary btn-sm">Upgrade — $5/mo</Link>
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
  );
}
