import React from "react";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly when you create an account, such as your name and email address. We also collect usage data automatically — including log entries you submit for analysis, error patterns, and how you interact with the platform. We do not sell your data to third parties.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to provide and improve SimpleLogz, process your analyses, send account-related emails (such as password resets and billing receipts), and monitor platform health. We may use aggregated, anonymised data to improve our AI models. We will never use your log content for advertising purposes.`,
  },
  {
    title: "3. Data Storage & Security",
    body: `Your data is stored securely using Supabase infrastructure, which is hosted on AWS. All data is encrypted in transit (TLS) and at rest (AES-256). We follow industry-standard security practices including access controls, regular audits, and vulnerability scanning. Profile avatars and forum attachments are stored in isolated Supabase Storage buckets.`,
  },
  {
    title: "4. Data Retention",
    body: `Free plan users: analysis history is retained for 30 days. Developer plan users: history is retained for 90 days. You may delete your account and all associated data at any time from Settings → Danger Zone. Upon deletion, your data is purged within 30 days.`,
  },
  {
    title: "5. Cookies & Tracking",
    body: `We use essential cookies to maintain your session and authentication state. We do not use third-party advertising cookies. We may use lightweight analytics (e.g. page views) to understand how the platform is used, but this data is never tied to personally identifiable information.`,
  },
  {
    title: "6. Third-Party Services",
    body: `SimpleLogz integrates with Supabase (authentication and storage), Stripe (billing and payments), and OpenAI (AI-powered analysis). Each of these providers has their own privacy policy. We only share the minimum necessary data with each service to perform its function.`,
  },
  {
    title: "7. Your Rights",
    body: `Depending on your location, you may have rights under GDPR, CCPA, or other applicable laws — including the right to access, correct, or delete your personal data. To exercise any of these rights, contact us at privacy@simplelogz.ai. We will respond within 30 days.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice. Your continued use of SimpleLogz after changes take effect constitutes acceptance of the updated policy.`,
  },
  {
    title: "9. Contact",
    body: `For any privacy-related questions or requests, please reach out to: privacy@simplelogz.ai`,
  },
];

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:"var(--t3)", background:"none", border:"none", cursor:"pointer", padding:"0 0 28px", transition:"color .15s" }}
        onMouseEnter={e => e.currentTarget.style.color="var(--t1)"}
        onMouseLeave={e => e.currentTarget.style.color="var(--t3)"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back
      </button>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px", color: "var(--t1)", marginBottom: 6 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 12, color: "var(--t3)" }}>Last updated: June 2026 · SimpleLogz, Inc.</p>
        <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 10, lineHeight: 1.65 }}>
          At SimpleLogz, your privacy is a core principle — not an afterthought. This policy explains what data we collect, why we collect it, and how we protect it.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {SECTIONS.map(s => (
          <div key={s.title} style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 6 }}>{s.title}</h2>
            <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.7 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
