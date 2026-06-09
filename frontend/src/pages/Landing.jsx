import React from "react";
import { Link } from "react-router-dom";
import styles from "./Landing.module.css";

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
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}
function IconLock() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function IconHistory() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg>;
}
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IconX() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

const FEATURES = [
  { icon: <IconAnalyze/>, title: "AI-Powered Analysis", desc: "Paste any error log and receive an instant plain English diagnosis — root cause, severity score, and step-by-step resolution." },
  { icon: <IconTerminal/>, title: "Browser Terminal", desc: "Run diagnostic commands directly in your browser — ping, curl, kubectl, docker ps, netstat and more without leaving the platform." },
  { icon: <IconForum/>, title: "Community Forum", desc: "Share error patterns with thousands of engineers worldwide. Upload log files, comment on threads, and solve problems faster together." },
  { icon: <IconReport/>, title: "Downloadable Reports", desc: "Export a full formatted analysis report — severity, resolution steps, technical context, and prevention tips. Developer plan and above." },
  { icon: <IconLock/>, title: "Federated Identity", desc: "Sign in with Google, GitHub, Microsoft, or Apple. Real OAuth authentication via Supabase. No new passwords to manage." },
  { icon: <IconHistory/>, title: "Analysis History", desc: "Every log analysis is saved to your personal dashboard. Search, revisit, and track recurring issues across your infrastructure." },
];

export default function Landing() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>AI Log Intelligence Platform</div>
            <h1 className={styles.title}>
              Understand any error.<br/>
              <span className={styles.gradient}>Fix it in seconds.</span>
            </h1>
            <p className={styles.sub}>
              Paste any error log — Kubernetes, Docker, AWS, Nginx, Postgres, Node.js.
              Get a plain English diagnosis and a step-by-step resolution instantly.
            </p>
            <div className={styles.heroActions}>
              <Link to="/signup" className="btn btn-primary btn-lg">Start for free</Link>
              <Link to="/pricing" className="btn btn-outline btn-lg">View pricing</Link>
            </div>
            <div className={styles.heroMeta}>
              <span>No credit card required</span>
              <span className={styles.dot}/>
              <span>2 free analyses daily</span>
              <span className={styles.dot}/>
              <span>Live in 30 seconds</span>
            </div>
          </div>

          <div className={styles.demoWrap}>
            <div className={styles.demoBar}>
              <div className={styles.demoDots}>
                <span/><span/><span/>
              </div>
              <div className={styles.demoLabel}>SimpleLogz — Analyzer</div>
              <div className={styles.demoStatus}>
                <span className={styles.statusDot}/>
                <span>API Online</span>
              </div>
            </div>
            <div className={styles.demoBody}>
              <div className={styles.demoLog}>
                <div className={styles.demoLogLabel}>INPUT LOG</div>
                <div className={styles.demoLogText}>
                  FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed<br/>
                  — JavaScript heap out of memory<br/>
                  Process exited with code 137 (SIGKILL - Out of Memory)
                </div>
              </div>
              <div className={styles.demoArrow}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                <span>AI Analysis</span>
              </div>
              <div className={styles.demoResult}>
                <div className={styles.demoMetric}>
                  <div className={styles.demoMetricLabel}>Severity</div>
                  <div className={styles.demoMetricVal} style={{color:"var(--red)"}}>CRITICAL</div>
                </div>
                <div className={styles.demoMetric}>
                  <div className={styles.demoMetricLabel}>Root Cause</div>
                  <div className={styles.demoMetricVal}>Memory Overflow</div>
                </div>
                <div className={styles.demoMetric}>
                  <div className={styles.demoMetricLabel}>Fix Time</div>
                  <div className={styles.demoMetricVal}>~10 min</div>
                </div>
                <div className={styles.demoMetric}>
                  <div className={styles.demoMetricLabel}>Resolution</div>
                  <div className={styles.demoMetricVal} style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--green)"}}>--max-old-space-size=4096</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.stats}>
          <div className={styles.stat}><div className={styles.statNum}>50,000+</div><div className={styles.statLabel}>Logs analyzed</div></div>
          <div className={styles.statDivider}/>
          <div className={styles.stat}><div className={styles.statNum}>8</div><div className={styles.statLabel}>Platforms supported</div></div>
          <div className={styles.statDivider}/>
          <div className={styles.stat}><div className={styles.statNum}>&lt; 3s</div><div className={styles.statLabel}>Average analysis time</div></div>
          <div className={styles.statDivider}/>
          <div className={styles.stat}><div className={styles.statNum}>98%</div><div className={styles.statLabel}>Accuracy rate</div></div>
        </div>

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
                <Link to="/analyzer">Analyzer</Link>
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
