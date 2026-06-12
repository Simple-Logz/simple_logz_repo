import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { api } from "../lib/api.js";
import styles from "./Pricing.module.css";

const FREE_FEATURES = [
  { ok: true,  text: "2 analyses per day" },
  { ok: true,  text: "All log types supported" },
  { ok: true,  text: "Plain English diagnosis" },
  { ok: true,  text: "Community forum access" },
  { ok: true,  text: "Browser terminal" },
  { ok: false, text: "Projects & incident history" },
  { ok: false, text: "AI incident timeline" },
  { ok: false, text: "Project health score" },
  { ok: false, text: "AI runbooks" },
  { ok: false, text: "Downloadable reports" },
  { ok: false, text: "Per-step AI chat" },
];

const DEV_FEATURES = [
  { ok: true, text: "Unlimited analyses", highlight: false },
  { ok: true, text: "Unlimited projects", highlight: false },
  { ok: true, text: "Incident history & knowledge base", highlight: false },
  { ok: true, text: "AI incident timeline — spot patterns", highlight: true },
  { ok: true, text: "Project health score", highlight: true },
  { ok: true, text: "Known issues library", highlight: true },
  { ok: true, text: "Root cause database", highlight: false },
  { ok: true, text: "AI runbooks — auto-generated playbooks", highlight: true },
  { ok: true, text: "Per-step AI chat assistant", highlight: false },
  { ok: true, text: "Downloadable incident reports", highlight: false },
  { ok: true, text: "Environment tracking (Dev / QA / Prod)", highlight: false },
  { ok: true, text: "Team collaboration — up to 5 users", highlight: false },
  { ok: true, text: "File upload up to 10 MB", highlight: false },
  { ok: true, text: "90-day analysis history", highlight: false },
];

const ENT_FEATURES = [
  { ok: true, text: "Everything in Developer" },
  { ok: true, text: "Unlimited team seats" },
  { ok: true, text: "SSO / SAML / Azure AD" },
  { ok: true, text: "GitHub, GitLab, Jenkins, Azure DevOps integrations" },
  { ok: true, text: "AWS CloudWatch & Azure Monitor connectors" },
  { ok: true, text: "Plugin marketplace access" },
  { ok: true, text: "Custom AI models" },
  { ok: true, text: "REST API access" },
  { ok: true, text: "Compliance reporting" },
  { ok: true, text: "Private deployment option" },
  { ok: true, text: "Dedicated support SLA" },
];

const COMPARISON = [
  { feature: "Analyses per day",         free: "2",         dev: "Unlimited",  ent: "Unlimited" },
  { feature: "Projects",                 free: "—",         dev: "Unlimited",  ent: "Unlimited" },
  { feature: "Incident history",         free: "—",         dev: "90 days",    ent: "Custom" },
  { feature: "AI incident timeline",     free: "—",         dev: "✓",          ent: "✓" },
  { feature: "Project health score",     free: "—",         dev: "✓",          ent: "✓" },
  { feature: "AI runbooks",             free: "—",         dev: "✓",          ent: "✓" },
  { feature: "Known issues library",     free: "—",         dev: "✓",          ent: "✓" },
  { feature: "Per-step AI chat",        free: "—",         dev: "✓",          ent: "✓" },
  { feature: "Downloadable reports",     free: "—",         dev: "✓",          ent: "✓" },
  { feature: "Environment tracking",     free: "—",         dev: "✓",          ent: "✓" },
  { feature: "Team members",            free: "1",         dev: "5",           ent: "Unlimited" },
  { feature: "Integrations",            free: "—",         dev: "—",           ent: "✓" },
  { feature: "Plugin marketplace",       free: "—",         dev: "—",           ent: "✓" },
  { feature: "SSO / SAML",             free: "—",         dev: "—",           ent: "✓" },
  { feature: "REST API",               free: "—",         dev: "—",           ent: "✓" },
  { feature: "Support",                 free: "Community", dev: "Email",       ent: "Dedicated SLA" },
];

const FAQS = [
  ["What counts as an analysis?", "Each time you click Analyze on a log. Loading example logs does not count towards your limit."],
  ["What is a Project?", "A Project represents a real application, service, or environment — like 'Production Kubernetes Cluster' or 'E-commerce API'. All incidents, timelines, runbooks, and team notes live inside it."],
  ["What is an AI Runbook?", "After analyzing an incident, SimpleLogz can generate a step-by-step operations playbook for that specific error pattern. It gets saved to your project so the next time the same issue happens, your team already has the fix."],
  ["Can I cancel anytime?", "Yes — cancel from Settings at any time. You keep Developer access until the end of your billing period. No questions asked."],
  ["Is my log data stored?", "Free: logs are not stored. Developer: last 90 days saved to your dashboard. Enterprise: configurable retention policy."],
  ["Do you offer a free trial for Developer?", "The Free plan is your trial — 2 analyses a day, forever. Upgrade when you need projects, runbooks, and unlimited analyses."],
  ["How does team collaboration work?", "Developer plan allows up to 5 team members per project. Members can add notes, comment on incidents, mark issues resolved, and assign incidents to each other."],
];

export default function Pricing() {
  const { isLoggedIn, isPro, getToken } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading,         setLoading]         = useState(null);
  const [showEnterprise,  setShowEnterprise]   = useState(false);
  const [showComparison,  setShowComparison]   = useState(false);
  const [openFaq,         setOpenFaq]          = useState(null);

  async function handleCta(plan) {
    if (plan === "free") { navigate(isLoggedIn ? "/" : "/signup"); return; }
    if (plan === "enterprise") { setShowEnterprise(true); return; }
    if (plan === "developer") {
      if (!isLoggedIn) { navigate("/signup"); return; }
      if (isPro) { showToast("You are already on the Developer plan ✓", "info"); return; }
      setLoading("developer");
      try {
        const token = await getToken();
        const { url } = await api.createCheckout(token);
        window.location.href = url;
      } catch (err) {
        showToast(err.message || "Could not open checkout. Try again.", "error");
      } finally { setLoading(null); }
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>Pricing</div>
          <h1 className={styles.title}>Build a real incident response workspace</h1>
          <p className={styles.sub}>Start free. Upgrade to Developer when you're ready to go beyond single log analysis — into projects, timelines, runbooks, and team collaboration.</p>
        </div>

        {/* Plan cards */}
        <div className={styles.grid}>

          {/* Free */}
          <div className={styles.card}>
            <div className={styles.planTop}>
              <div className={styles.planName}>Free</div>
              <div className={styles.planPrice}>$0<span className={styles.period}>/month</span></div>
              <div className={styles.planDesc}>For developers who need occasional log help.</div>
            </div>
            <ul className={styles.features}>
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className={styles.feature}>
                  <span className={f.ok ? styles.check : styles.cross}>{f.ok ? "✓" : "—"}</span>
                  <span className={f.ok ? styles.featureOn : styles.featureOff}>{f.text}</span>
                </li>
              ))}
            </ul>
            <button className={`btn btn-outline ${styles.cta}`} onClick={() => handleCta("free")}>
              Get started free
            </button>
          </div>

          {/* Developer */}
          <div className={`${styles.card} ${styles.featured}`}>
            <div className={styles.featuredBadge}>MOST POPULAR</div>
            <div className={styles.planTop}>
              <div className={styles.planName}>Developer</div>
              <div className={styles.planPrice}>$12<span className={styles.period}>/month</span></div>
              <div className={styles.planDesc}>A full incident response workspace for your applications.</div>
            </div>
            <ul className={styles.features}>
              {DEV_FEATURES.map((f, i) => (
                <li key={i} className={`${styles.feature} ${f.highlight ? styles.featureHighlight : ""}`}>
                  <span className={styles.check}>✓</span>
                  <span className={styles.featureOn}>{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              className={`btn btn-primary ${styles.cta}`}
              onClick={() => handleCta("developer")}
              disabled={loading === "developer"}
            >
              {loading === "developer" ? <><span className="spinner"/> Processing…</> : "Upgrade to Developer"}
            </button>
          </div>

          {/* Enterprise */}
          <div className={styles.card}>
            <div className={styles.planTop}>
              <div className={styles.planName}>Enterprise</div>
              <div className={styles.planPrice}>Custom<span className={styles.period}></span></div>
              <div className={styles.planDesc}>For teams that need integrations, SSO, and dedicated support.</div>
            </div>
            <ul className={styles.features}>
              {ENT_FEATURES.map((f, i) => (
                <li key={i} className={styles.feature}>
                  <span className={styles.check}>✓</span>
                  <span className={styles.featureOn}>{f.text}</span>
                </li>
              ))}
            </ul>
            <button className={`btn btn-outline ${styles.cta}`} onClick={() => handleCta("enterprise")}>
              Contact sales
            </button>
          </div>
        </div>

        {/* Comparison toggle */}
        <div className={styles.comparisonToggle}>
          <button className="btn btn-ghost" onClick={() => setShowComparison(o => !o)}>
            {showComparison ? "Hide" : "See"} full comparison table
          </button>
        </div>

        {showComparison && (
          <div className={styles.comparison}>
            <table className={styles.compTable}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th className={styles.devCol}>Developer</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i}>
                    <td>{row.feature}</td>
                    <td className={styles.center}>{row.free}</td>
                    <td className={`${styles.center} ${styles.devCol}`}>{row.dev}</td>
                    <td className={styles.center}>{row.ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* What Developer really means */}
        <div className={styles.valueSection}>
          <div className={styles.valueHead}>
            <div className={styles.eyebrow}>Developer plan</div>
            <h2 className={styles.valueTitle}>Not just more analyses. A real workspace.</h2>
            <p className={styles.valueSub}>Most log tools give you a search box. SimpleLogz Developer gives your application a home.</p>
          </div>
          <div className={styles.valueGrid}>
            {[
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
                title: "Projects",
                body: "Every application gets its own space. Incidents, timelines, runbooks, and team notes — all organised by the service that generated them."
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                title: "AI Incident Timeline",
                body: "The AI automatically connects related incidents across time. Spot patterns like recurring memory pressure or repeated authentication failures before they become outages."
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
                title: "Project Health Score",
                body: "A live score based on incident frequency, severity, and trend. Know at a glance whether your service is improving or degrading."
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
                title: "Known Issues Library",
                body: "When an error appears again, SimpleLogz surfaces every previous occurrence and what fixed it. Stop solving the same problem twice."
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
                title: "AI Runbooks",
                body: "Click 'Generate Runbook' after any analysis. SimpleLogz produces a step-by-step operations playbook tailored to that exact error. Saved to your project permanently."
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                title: "Team Collaboration",
                body: "Add up to 5 engineers to a project. Comment on incidents, mark them resolved, assign ownership, and build shared knowledge — all inside SimpleLogz."
              },
            ].map(v => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>{v.icon}</div>
                <div className={styles.valueCardTitle}>{v.title}</div>
                <div className={styles.valueCardBody}>{v.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className={styles.faq}>
          <h2 className={styles.faqTitle}>Common questions</h2>
          <div className={styles.faqList}>
            {FAQS.map(([q, a], i) => (
              <div key={i} className={styles.faqItem} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className={styles.faqQ}>
                  <span>{q}</span>
                  <span className={styles.faqChevron}>{openFaq === i ? "↑" : "↓"}</span>
                </div>
                {openFaq === i && <div className={styles.faqA}>{a}</div>}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Enterprise modal */}
      {showEnterprise && (
        <div className={styles.overlay} onClick={() => setShowEnterprise(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowEnterprise(false)}>✕</button>
            <h2 className={styles.modalTitle}>Contact Sales</h2>
            <p className={styles.modalSub}>Tell us about your team and we'll be in touch within 24 hours.</p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" placeholder="Your name"/></div>
              <div className="form-group"><label className="form-label">Work email</label><input className="form-input" type="email" placeholder="you@company.com"/></div>
              <div className="form-group"><label className="form-label">Company</label><input className="form-input" placeholder="Company name"/></div>
              <div className="form-group"><label className="form-label">Team size</label>
                <select className="form-input"><option>1–10</option><option>11–50</option><option>51–200</option><option>200+</option></select>
              </div>
              <div className="form-group"><label className="form-label">What do you need?</label>
                <textarea className="form-input" rows="3" placeholder="Integrations, SSO, private deployment, custom AI models…"/>
              </div>
              <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}}
                onClick={() => { setShowEnterprise(false); showToast("Enquiry sent! We'll be in touch within 24 hours.", "success"); }}>
                Send enquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
