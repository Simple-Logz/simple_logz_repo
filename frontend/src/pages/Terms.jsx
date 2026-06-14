import React from "react";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By creating an account or using SimpleLogz (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. These Terms apply to all users, including free and paid plan subscribers.`,
  },
  {
    title: "2. Description of Service",
    body: `SimpleLogz is an AI-powered log analysis platform that helps developers and IT teams diagnose errors, inspect code, generate runbooks, and manage incident responses. The Service is provided on an "as-is" and "as-available" basis. Features may change over time as the platform evolves.`,
  },
  {
    title: "3. Account Registration",
    body: `You must provide accurate and complete information when creating your account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately at support@simplelogz.ai if you suspect unauthorised access.`,
  },
  {
    title: "4. Acceptable Use",
    body: `You agree not to use SimpleLogz to upload, transmit, or process any content that is illegal, harmful, or violates the rights of others. You may not attempt to reverse engineer, exploit, or disrupt the platform. Automated scraping, bulk analysis without a commercial licence, or reselling the Service without written permission is prohibited.`,
  },
  {
    title: "5. Subscription & Billing",
    body: `Free plan users receive 2 analyses per day. Developer plan subscribers are billed monthly at $5/month (or annually at a discounted rate) and receive unlimited analyses, downloadable reports, and extended history. All payments are processed securely through Stripe. Subscriptions renew automatically unless cancelled before the renewal date.`,
  },
  {
    title: "6. Refund Policy",
    body: `We offer a 7-day refund on Developer plan subscriptions for new subscribers. To request a refund, contact billing@simplelogz.ai within 7 days of your first charge. We reserve the right to decline refund requests if we detect abuse of this policy.`,
  },
  {
    title: "7. Intellectual Property",
    body: `All content, branding, and software that make up SimpleLogz are the intellectual property of SimpleLogz, Inc. You retain ownership of any log data or content you submit. By using the Service, you grant us a limited, non-exclusive licence to process your submitted content solely for the purpose of delivering analyses to you.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `SimpleLogz is not liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Service. Our total liability for any claim shall not exceed the amount you paid us in the 3 months prior to the claim. The Service is not a substitute for professional engineering review; outputs should be validated before use in production environments.`,
  },
  {
    title: "9. Termination",
    body: `We reserve the right to suspend or terminate accounts that violate these Terms, engage in abusive behaviour, or pose a security risk to the platform. You may delete your account at any time from Settings → Danger Zone. Upon termination, your data will be purged within 30 days.`,
  },
  {
    title: "10. Changes to Terms",
    body: `We may update these Terms from time to time. We will give you at least 14 days' notice of material changes via email or an in-app notification. Continued use of the Service after the effective date constitutes acceptance of the revised Terms.`,
  },
  {
    title: "11. Governing Law",
    body: `These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration, except where prohibited by law.`,
  },
  {
    title: "12. Contact",
    body: `For questions about these Terms, contact us at: legal@simplelogz.ai`,
  },
];

export default function Terms() {
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
          Terms of Service
        </h1>
        <p style={{ fontSize: 12, color: "var(--t3)" }}>Last updated: June 2026 · SimpleLogz, Inc.</p>
        <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 10, lineHeight: 1.65 }}>
          Please read these Terms carefully before using SimpleLogz. By accessing or using our platform, you agree to be bound by the terms below.
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
