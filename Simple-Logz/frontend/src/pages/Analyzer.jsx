import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { api } from "../lib/api.js";
import styles from "./Analyzer.module.css";

const EXAMPLES = {
  "K8s CrashLoop": `Events:\n  Warning  BackOff  32s (x5 over 2m)  kubelet  Back-off restarting failed container\n  Warning  Failed   33s (x5 over 2m)  kubelet  Error: failed to create containerd task\nStatus: CrashLoopBackOff â Restart count: 5`,
  "Postgres": `ERROR: could not connect to server: Connection refused\nFATAL: password authentication failed for user "app_user"\nERROR: max_connections reached (100/100)\nHINT: Consider PgBouncer`,
  "AWS Lambda": `START RequestId: 8f3d2c1a Version: $LATEST\n[ERROR] Error: connect ETIMEDOUT 10.0.2.50:3306\nREPORT Duration: 30021.43 ms\nTask timed out after 30.02 seconds`,
  "Nginx 502": `2024/03/15 14:30:45 [error] 12345#12345: *8832 connect() failed (111: Connection refused)\nwhile connecting to upstream: "http://127.0.0.1:3000"\nHTTP/1.1 502 Bad Gateway`,
  "Node.js OOM": `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory\n--max-old-space-size is currently set to: 512MB\nHeap used: 499MB / 512MB\nProcess exited with code 137 (SIGKILL)`,
};

const TABS = ["Overview", "Resolution", "Deep Dive", "Prevention"];

export default function Analyzer() {
  const { isLoggedIn, isPro, getToken } = useAuth();
  const { showToast } = useToast();

  const [log,          setLog]          = useState("");
  const [source,       setSource]       = useState("auto");
  const [status,       setStatus]       = useState("idle");
  const [result,       setResult]       = useState(null);
  const [activeTab,    setActiveTab]    = useState(0);
  const [reportFormat, setReportFormat] = useState("both"); // "commands"|"portal"|"both"
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
        showToast("Daily limit reached â upgrade for unlimited analyses", "error");
      } else {
        showToast(err.message || "Analysis failed", "error");
      }
    }
  }

  function generateReport() {
    if (!result) return;
    const now = new Date();
    const reportId = `SLZ-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const sevColors = { CRITICAL:"#ef4444", HIGH:"#f97316", MEDIUM:"#3b82f6", LOW:"#22c55e" };
    const sevBg     = { CRITICAL:"#fef2f2", HIGH:"#fff7ed", MEDIUM:"#eff6ff", LOW:"#f0fdf4" };
    const sevCol   = sevColors[result.severity] || "#3b82f6";
    const sevBgCol = sevBg[result.severity]     || "#eff6ff";

    const stepsHtml = (result.resolution_steps || []).map(s => {
      const showCmd    = (reportFormat === "commands" || reportFormat === "both") && s.command;
      const showPortal = (reportFormat === "portal"   || reportFormat === "both");
      return `
        <div style="display:flex;gap:16px;margin-bottom:22px;align-items:flex-start">
          <div style="width:34px;height:34px;border-radius:50%;background:#6c5ce7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0">${s.step}</div>
          <div style="flex:1">
            ${showPortal ? `<div style="font-size:16px;font-weight:600;color:#1e293b;margin-bottom:${showCmd ? "10px" : "0"};line-height:1.5">${s.action}</div>` : ""}
            ${showCmd ? `<div style="background:#0f172a;border-radius:8px;padding:12px 16px;font-family:monospace;font-size:14px;color:#e2e8f0">$ ${s.command}</div>` : ""}
          </div>
        </div>`;
    }).join("");

    const verifyHtml = (result.verification_commands || []).map(c =>
      `<div style="background:#0f172a;border-radius:6px;padding:10px 14px;font-family:monospace;font-size:14px;color:#86efac;margin-bottom:8px">$ ${c}</div>`
    ).join("");

    const preventHtml = (result.prevention || []).map(p =>
      `<div style="display:flex;gap:10px;margin-bottom:12px"><span style="color:#6c5ce7;font-size:20px;line-height:1">Â·</span><span style="font-size:16px;color:#334155;line-height:1.65">${p}</span></div>`
    ).join("");

    const formatLabel = reportFormat === "commands" ? "CLI Commands" : reportFormat === "portal" ? "Console / UI Steps" : "CLI + Console Steps";

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>SimpleLogz Incident Report â ${reportId}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f8fafc;color:#1e293b;font-size:16px;line-height:1.7}
  .page{max-width:820px;margin:0 auto;background:#fff;min-height:100vh}
  @media print{body{background:#fff}@page{margin:20mm}}
</style></head><body>
<div class="page">
  <div style="background:linear-gradient(135deg,#6c5ce7,#a29bfe);padding:36px 48px;color:#fff">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px">
      <div>
        <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px">SimpleLogz</div>
        <div style="font-size:13px;opacity:0.85;letter-spacing:1px;text-transform:uppercase">Incident Report</div>
      </div>
      <div style="text-align:right;font-size:14px;opacity:0.85">
        <div style="font-weight:600;font-size:16px">${reportId}</div>
        <div>${now.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</div>
        <div>${now.toLocaleTimeString()}</div>
      </div>
    </div>
    <div style="margin-top:28px">
      <div style="font-size:26px;font-weight:700;line-height:1.3">${result.title || "Log Analysis"}</div>
    </div>
  </div>

  <div style="padding:40px 48px">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:36px">
      ${[["Severity",result.severity,sevCol,sevBgCol],["Source",result.source_detected,"#64748b","#f8fafc"],["Root Cause",result.root_cause_category,"#64748b","#f8fafc"],["Est. Fix Time",result.estimated_fix_time,"#64748b","#f8fafc"]].map(([label,val,col,bg]) => `
        <div style="background:${bg};border:1px solid #e2e8f0;border-radius:12px;padding:16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:6px">${label}</div>
          <div style="font-size:17px;font-weight:700;color:${col}">${val||"â"}</div>
        </div>`).join("")}
    </div>

    <div style="margin-bottom:36px">
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:12px">What happened</div>
      <div style="font-size:17px;color:#334155;line-height:1.75;background:#f8fafc;border-left:4px solid #6c5ce7;padding:20px 24px;border-radius:0 10px 10px 0">${result.plain_english}</div>
    </div>

    <div style="margin-bottom:36px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8">Resolution Steps</div>
        <div style="font-size:12px;background:#ede9fe;color:#6c5ce7;padding:3px 10px;border-radius:99px;font-weight:600">${formatLabel}</div>
      </div>
      ${stepsHtml}
    </div>

    ${verifyHtml ? `<div style="margin-bottom:36px">
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:12px">Verification</div>
      ${verifyHtml}
    </div>` : ""}

    <div style="margin-bottom:36px">
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:12px">Technical Context</div>
      <div style="font-size:16px;color:#334155;line-height:1.75">${result.technical_context||""}</div>
    </div>

    ${preventHtml ? `<div style="margin-bottom:36px">
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:12px">Prevention</div>
      ${preventHtml}
    </div>` : ""}

    <div style="margin-bottom:36px">
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:12px">Original Log</div>
      <pre style="background:#0f172a;color:#94a3b8;padding:20px;border-radius:10px;font-size:13px;line-height:1.65;overflow-x:auto;white-space:pre-wrap;word-break:break-all">${log.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
    </div>

    <div style="border-top:1px solid #e2e8f0;padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
      <div style="font-size:14px;color:#94a3b8">Generated by <strong style="color:#6c5ce7">SimpleLogz</strong></div>
      <div style="font-size:13px;color:#cbd5e1">${reportId}</div>
    </div>
  </div>
</div>
<script>window.addEventListener("load",()=>{setTimeout(()=>window.print(),400);})<\/script>
</body></html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
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
              Free plan Â· <Link to="/pricing" style={{color:"var(--accent)"}}>Upgrade for unlimited â</Link>
            </div>
          )}
        </div>

        <div className={styles.layout}>
          {/* ââ Input panel âââââââââââââââââââââââââââââââ */}
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
                <button className="btn btn-ghost btn-sm" onClick={()=>fileRef.current?.click()}>â File</button>
                <input ref={fileRef} type="file" accept=".log,.txt,.json" style={{display:"none"}} onChange={handleFile}/>
              </div>
            </div>
            <textarea
              className={styles.textarea}
              value={log}
              onChange={e=>setLog(e.target.value)}
              onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();runAnalysis();}}}
              placeholder={"Paste your error log hereâ¦\n\nCtrl+Enter to analyze"}
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
                  {status==="analyzing" ? <><span className="spinner"/>Analyzingâ¦</> : "â Analyze"}
                </button>
              </div>
            </div>
          </div>

          {/* ââ Result panel âââââââââââââââââââââââââââââââ */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelLabel}>RESULT</span>
            </div>

            {status === "idle" && (
              <div className={styles.empty}>
                <div style={{fontSize:32}}>ð</div>
                <div>Paste a log and click Analyze</div>
                <div style={{fontSize:12,color:"var(--t3)"}}>Ctrl+Enter to analyze quickly</div>
              </div>
            )}

            {status === "analyzing" && (
              <div className={styles.analyzing}>
                <span className="spinner" style={{width:28,height:28,borderWidth:3}}/>
                <div>Analyzingâ¦</div>
                <div className={styles.scanBar}><div className={styles.scanFill}/></div>
                <div style={{fontSize:12,color:"var(--t3)"}}>Reading error patterns Â· Building fix plan</div>
              </div>
            )}

            {(status === "done" || status === "error") && result && (
              <div style={{display:"flex",flexDirection:"column",flex:1}}>
                {/* Metrics */}
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

                {/* ââ Format picker â always visible, above tabs ââ */}
                <div style={{padding:"10px 0 12px",borderBottom:"1px solid var(--border)"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>
                    Resolution style
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {[
                      { value:"commands", label:"CLI Commands",       hint:"Terminal commands" },
                      { value:"portal",   label:"Console / UI Steps", hint:"Click-by-click" },
                      { value:"both",     label:"Both",               hint:"Commands + UI" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setReportFormat(opt.value)}
                        title={opt.hint}
                        style={{
                          padding:"5px 12px", borderRadius:99, fontSize:12, fontWeight:500, cursor:"pointer",
                          border: reportFormat === opt.value ? "2px solid #6c5ce7" : "1px solid var(--border2)",
                          background: reportFormat === opt.value ? "rgba(108,92,231,0.12)" : "transparent",
                          color: reportFormat === opt.value ? "#a29bfe" : "var(--t2)",
                          transition:"all .12s",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div style={{fontSize:11,color:"var(--t3)",marginTop:6,lineHeight:1.4}}>
                    {reportFormat === "commands" && "Shows exact terminal commands â no UI instructions."}
                    {reportFormat === "portal"   && "Shows click-by-click console/UI guidance â no CLI."}
                    {reportFormat === "both"     && "Shows both UI steps and CLI commands together."}
                  </div>
                </div>

                {/* Tabs */}
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
                        {(result.resolution_steps||[]).map(s => {
                          const showAction = reportFormat === "portal" || reportFormat === "both";
                          const showCmd    = (reportFormat === "commands" || reportFormat === "both") && s.command;
                          return (
                            <li key={s.step} className={styles.step}>
                              <div className={styles.stepNum}>{s.step}</div>
                              <div>
                                {showAction && <div className={styles.stepAction}>{s.action}</div>}
                                {showCmd    && <code className={styles.cmd}>$ {s.command}</code>}
                                {!showAction && !showCmd && <div className={styles.stepAction}>{s.action}</div>}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}
                  {activeTab === 2 && (
                    <div>
                      <p style={{fontSize:14,color:"var(--t2)",lineHeight:1.7,marginBottom:16}}>{result.technical_context}</p>
                      {result.verification_commands?.length > 0 && (
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Verification</div>
                          {result.verification_commands.map((c,i) => (
                            <code key={i} className={styles.cmd} style={{display:"block",marginBottom:6}}>$ {c}</code>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === 3 && (
                    <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>
                      {(result.prevention||[]).map((p,i) => (
                        <li key={i} style={{display:"flex",gap:10,fontSize:14,color:"var(--t2)",lineHeight:1.6}}>
                          <span style={{color:"var(--accent)",flexShrink:0}}>Â·</span>{p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ââ Download button ââ */}
                <div style={{borderTop:"1px solid var(--border)",marginTop:"auto",paddingTop:12}}>
                  {isPro ? (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{width:"100%",justifyContent:"center",gap:8}}
                      onClick={generateReport}
                    >
                      â Download PDF Report
                    </button>
                  ) : (
                                       <Link to="/pricing" className="btn btn-outline btn-sm" style={{width:"100%",justifyContent:"center",display:"flex"}}>
                      â Download Report Â· Developer plan
                    </Link>
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
