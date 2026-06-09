import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { api } from "../lib/api.js";
import styles from "./Pricing.module.css";

const PLANS = [
  {
    id: "free", name: "Free", price: "$0", period: "", badge: null,
    desc: "For developers who need occasional log help.",
    features: [
      { ok: true,  text: "2 analyses per day" },
      { ok: true,  text: "All log types supported" },
      { ok: true,  text: "Community forum access" },
      { ok: true,  text: "Browser terminal" },
      { ok: false, text: "Downloadable reports" },
      { ok: false, text: "Full resolution steps + CLI commands" },
      { ok: false, text: "Analysis history" },
    ],
    cta: "Get started free", ctaStyle: "outline",
  },
  {
    id: "developer", name: "Developer", price: "$12", period: "/month", badge: "MOST POPULAR",
    desc: "For engineers who debug daily. Everything you need.",
    features: [
      { ok: true,  text: "Unlimited analyses" },
      { ok: true,  text: "Downloadable reports (PDF + TXT)" },
      { ok: true,  text: "Full resolution steps + CLI commands" },
      { ok: true,  text: "90-day analysis history" },
      { ok: true,  text: "Priority AI processing" },
      { ok: true,  text: "File upload up to 10 MB" },
    ],
    cta: "Upgrade to Developer", ctaStyle: "primary",
  },
  {
    id: "enterprise", name: "Enterprise", price: "Custom", period: "", badge: null,
    desc: "For teams that need reliability, SLAs, and dedicated support.",
    features: [
      { ok: true, text: "Everything in Developer" },
      { ok: true, text: "Unlimited team seats" },
      { ok: true, text: "Dedicated support SLA" },
      { ok: true, text: "SSO / SAML / Azure AD" },
      { ok: true, text: "Private deployment option" },
      { ok: true, text: "Custom integrations + REST API" },
    ],
    cta: "Contact sales", ctaStyle: "outline",
  },
];

export default function Pricing() {
  const { isLoggedIn, isPro, getToken } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [showEnterprise, setShowEnterprise] = useState(false);

  async function handleCta(plan) {
    if (plan === "free") { navigate(isLoggedIn ? "/dashboard" : "/signup"); return; }
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
        <div className={styles.header}>
          <h1 className={styles.title}>Simple, honest pricing</h1>
          <p className={styles.sub}>Start free. Upgrade when you need more power.</p>
        </div>

        <div className={styles.grid}>
          {PLANS.map(plan => (
            <div key={plan.id} className={`${styles.card} ${plan.badge ? styles.featured : ""}`}>
              {plan.badge && <div className={styles.badge}>{plan.badge}</div>}
              <div className={styles.planName}>{plan.name}</div>
              <div className={styles.planPrice}>
                {plan.price}<span className={styles.period}>{plan.period}</span>
              </div>
              <div className={styles.planDesc}>{plan.desc}</div>
              <ul className={styles.features}>
                {plan.features.map((f, i) => (
                  <li key={i} className={styles.feature}>
                    <span className={f.ok ? styles.check : styles.cross}>{f.ok ? "✓" : "✗"}</span>
                    <span style={{color: f.ok ? "var(--t1)" : "var(--t3)"}}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`btn btn-${plan.ctaStyle} ${styles.cta}`}
                onClick={() => handleCta(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? <><span className="spinner"/> Processing…</> : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className={styles.faq}>
          <h2 className={styles.faqTitle}>Common questions</h2>
          <div className={styles.faqGrid}>
            {[
              ["What counts as an analysis?", "Each time you click Analyze on a log. Loading examples does not count."],
              ["Can I cancel anytime?", "Yes — cancel from Settings at any time. You keep Developer access until the end of your billing period."],
              ["Is my log data stored?", "Free: logs are not stored. Developer: last 90 days saved to your dashboard. Enterprise: configurable retention."],
              ["Do you offer a free trial for Developer?", "The Free plan is effectively your trial — 2 analyses a day, forever. Upgrade when you are ready."],
            ].map(([q, a]) => (
              <div key={q} className={styles.faqItem}>
                <div className={styles.faqQ}>{q}</div>
                <div className={styles.faqA}>{a}</div>
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
            <h2 style={{fontSize:22,fontWeight:700,marginBottom:6}}>Contact Sales</h2>
            <p style={{fontSize:14,color:"var(--t2)",marginBottom:20}}>Tell us about your team.</p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" placeholder="Your name"/></div>
              <div className="form-group"><label className="form-label">Work email</label><input className="form-input" type="email" placeholder="you@company.com"/></div>
              <div className="form-group"><label className="form-label">Company</label><input className="form-input" placeholder="Company name"/></div>
              <div className="form-group"><label className="form-label">Team size</label>
                <select className="form-input"><option>1–10</option><option>11–50</option><option>51–200</option><option>200+</option></select>
              </div>
              <div className="form-group"><label className="form-label">What do you need?</label><textarea className="form-input" rows="3" placeholder="Describe your use case…"/></div>
              <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:11}} onClick={()=>{setShowEnterprise(false);showToast("Enquiry sent! We will be in touch within 24 hours.","success");}}>Send enquiry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
