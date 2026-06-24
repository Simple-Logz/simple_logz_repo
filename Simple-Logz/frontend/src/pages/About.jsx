import React from "react";
import { Link } from "react-router-dom";
import styles from "./About.module.css";

const PILLARS = [
  {
    number: "01",
    title: "Plain English, always",
    body: "Error messages were written by machines, for machines. We translate them into language engineers actually understand â what broke, why it broke, and what to do about it.",
  },
  {
    number: "02",
    title: "Steps, not guesses",
    body: "Every analysis produces an ordered resolution plan with exact CLI commands, copy buttons, and a per-step AI assistant you can interrogate in real time.",
  },
  {
    number: "03",
    title: "Reports you can share",
    body: "Incidents don't happen in isolation. Download a formatted incident report in seconds â severity, root cause, resolution steps, and prevention measures â ready to share with your team or your manager.",
  },
  {
    number: "04",
    title: "Speed as a feature",
    body: "The average developer spends 30% of their day debugging. We think that number should be closer to zero. Fast analysis, fast answers, fast fixes.",
  },
];

const TIMELINE = [
  { year: "The problem", text: "Every developer has spent hours â sometimes days â staring at cryptic error output. Stack traces, kernel panics, connection timeouts. The information is there. It just isn't human." },
  { year: "The insight", text: "Modern AI can read error logs the way a senior engineer reads them â pattern matching against thousands of known failure modes, reasoning about context, and producing a fix plan in seconds." },
  { year: "The build", text: "SimpleLogz was built to be the tool we always wished existed: paste the error, get the fix. No Stack Overflow rabbit holes. No paging the on-call engineer at 2am for something that has a known solution." },
  { year: "The mission", text: "Give every developer â junior or senior, at a startup or an enterprise â access to the kind of instant, expert-level debugging assistance that used to only exist inside the heads of the most experienced people on the team." },
];

const STATS = [
  { num: "8+", label: "Platforms supported" },
  { num: "<3s", label: "Average analysis time" },
  { num: "98%", label: "Diagnosis accuracy" },
  { num: "Free", label: "To get started" },
];

export default function About() {
  return (
    <div className={styles.page}>

      {/* ââ Hero ââââââââââââââââââââââââââââââââââââââââââââ */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>Our mission</div>
            <div className={styles.heroTitle}>
              Debugging should take minutes,<br/>
              <span className={styles.accent}>not hours.</span>
            </div>
            <p className={styles.heroSub}>
              SimpleLogz is an AI-powered incident response workspace that reads your error logs, explains what went wrong in plain English, and walks you through fixing it â step by step.
            </p>
          </div>
        </div>
        <div className={styles.heroDivider}/>
      </section>

      {/* ââ Story âââââââââââââââââââââââââââââââââââââââââââ */}
      <section className={styles.storySection}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyLeft}>
              <div className={styles.sectionEyebrow}>Why we built this</div>
              <h2 className={styles.sectionTitle}>The story behind SimpleLogz</h2>
            </div>
            <div className={styles.storyRight}>
              {TIMELINE.map((item, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineMarker}/>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineYear}>{item.year}</div>
                    <p className={styles.timelineText}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ââ Stats âââââââââââââââââââââââââââââââââââââââââââ */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map(s => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statNum}>{s.num}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ââ Pillars âââââââââââââââââââââââââââââââââââââââââ */}
      <section className={styles.pillarsSection}>
        <div className="container">
          <div className={styles.pillarsHead}>
            <div className={styles.sectionEyebrow}>What we stand for</div>
            <h2 className={styles.sectionTitle}>Four principles that drive everything we build</h2>
          </div>
          <div className={styles.pillarsGrid}>
            {PILLARS.map(p => (
              <div key={p.number} className={styles.pillarCard}>
                <div className={styles.pillarNumber}>{p.number}</div>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarBody}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ââ What you get ââââââââââââââââââââââââââââââââââââ */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.featuresInner}>
            <div className={styles.featuresLeft}>
              <div className={styles.sectionEyebrow}>The platform</div>
              <h2 className={styles.sectionTitle}>One workspace.<br/>Every incident.</h2>
              <p className={styles.featuresIntro}>
                SimpleLogz is not a log aggregator. It is not a monitoring dashboard. It is the tool you reach for the moment something breaks â and it gets you to the fix faster than anything else.
              </p>
              <Link to="/" className="btn btn-primary" style={{marginTop:24,display:"inline-block"}} onClick={() => window.scrollTo({top:0,behavior:"instant"})}>Try it now â it's free</Link>'
            </div>
            <div className={styles.featuresRight}>
              {[
                { label: "AI Log Analysis", desc: "Paste any error from Kubernetes, Docker, AWS, Nginx, Postgres, Node.js, Python, or Linux. Get a severity rating, root cause, and plain English explanation instantly." },
                { label: "Step-by-Step Resolution", desc: "Every fix comes as an ordered plan with exact CLI commands you can copy. Ask the AI assistant questions about any individual step without leaving the page." },
                { label: "Downloadable Incident Reports", desc: "Export a complete, formatted incident report â severity, root cause, resolution steps, technical context, and prevention measures â in one click." },
                { label: "Browser Terminal", desc: "Run diagnostic commands directly in your browser. No SSH session required to check if your fix worked." },
                { label: "Community Forum", desc: "Share error patterns with engineers worldwide. Search known issues, contribute solutions, and learn from real incidents." },
                { label: "Analysis History", desc: "Every analysis is saved to your dashboard. Track recurring issues, build a personal knowledge base, and never diagnose the same error twice." },
              ].map((f, i) => (
                <div key={i} className={styles.featureRow}>
                  <div className={styles.featureRowDot}/>
                  <div>
                    <div className={styles.featureRowLabel}>{f.label}</div>
                    <div className={styles.featureRowDesc}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ââ CTA âââââââââââââââââââââââââââââââââââââââââââââ */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div className={styles.ctaEyebrow}>Ready to debug faster?</div>
            <h2 className={styles.ctaTitle}>Stop wasting time on errors<br/>you don't need to understand.</h2>'
            <p className={styles.ctaSub}>Paste your first log in under 30 seconds. No setup required.</p>
            <div className={styles.ctaActions}>
              <Link to="/" className="btn btn-primary btn-lg" onClick={() => window.scrollTo({top:0,behavior:"instant"})}>Start analyzing â free</Link>
              <Link to="/pricing" className="btn btn-outline btn-lg" onClick={() => window.scrollTo({top:0,behavior:"instant"})}>See pricing</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
