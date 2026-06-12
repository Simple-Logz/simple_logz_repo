import React, { useState } from "react";
import styles from "./Support.module.css";

function IconMail() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function IconCheck() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}

export default function Support() {
  const [form, setForm]     = useState({ name: "", email: "", company: "", message: "" });
  const [sent, setSent]     = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const subject = encodeURIComponent(`[SimpleLogz Support] Message from ${form.name}`);
    const body    = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company || "N/A"}\n\n${form.message}`
    );
    window.location.href = `mailto:support@simplelogs.ai?subject=${subject}&body=${body}`;
    setSent(true);
  }

  function field(key, label, type = "text", placeholder = "") {
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <input
          className={`form-input ${errors[key] ? styles.inputError : ""}`}
          type={type}
          value={form[key]}
          placeholder={placeholder}
          onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: "" })); }}
        />
        {errors[key] && <span className={styles.errorText}>{errors[key]}</span>}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrap}><IconMail/></div>
          <h1 className={styles.title}>Contact Support</h1>
          <p className={styles.sub}>
            Have a question, bug report, or feedback? Fill in the form below and our team will get back to you promptly.
          </p>
        </div>

        {sent ? (
          <div className={styles.successCard}>
            <div className={styles.successIcon}><IconCheck/></div>
            <h2 className={styles.successTitle}>Message ready to send!</h2>
            <p className={styles.successSub}>
              Your email client has opened with the message pre-filled. Just hit send — we'll get back to you within 24 hours.
            </p>
            <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ name:"", email:"", company:"", message:"" }); }}>
              Send another message
            </button>
          </div>
        ) : (
          <form className={styles.card} onSubmit={handleSubmit} noValidate>
            <div className={styles.grid}>
              {field("name",    "Your name *",    "text",  "Jane Smith")}
              {field("email",   "Your email *",   "email", "jane@company.com")}
            </div>
            {field("company", "Company / Organisation", "text", "Acme Corp (optional)")}

            <div className="form-group" style={{ marginTop: 4 }}>
              <label className="form-label">Message *</label>
              <textarea
                className={`form-input ${errors.message ? styles.inputError : ""}`}
                rows={6}
                placeholder="Describe your issue or question in as much detail as possible..."
                value={form.message}
                onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setErrors(er => ({ ...er, message: "" })); }}
              />
              {errors.message && <span className={styles.errorText}>{errors.message}</span>}
            </div>

            <div className={styles.footer}>
              <p className={styles.note}>
                Sends to <strong>support@simplelogs.ai</strong> — we aim to respond within 24 hours.
              </p>
              <button className="btn btn-primary btn-lg" type="submit">
                <IconMail/> Send message
              </button>
            </div>
          </form>
        )}

        {/* Contact alternatives */}
        <div className={styles.altRow}>
          <div className={styles.altCard}>
            <div className={styles.altLabel}>Email directly</div>
            <a href="mailto:support@simplelogs.ai" className={styles.altValue}>support@simplelogs.ai</a>
          </div>
          <div className={styles.altCard}>
            <div className={styles.altLabel}>Response time</div>
            <div className={styles.altValue}>Within 24 hours</div>
          </div>
          <div className={styles.altCard}>
            <div className={styles.altLabel}>Community</div>
            <a href="/forum" className={styles.altValue}>Join the forum →</a>
          </div>
        </div>

      </div>
    </div>
  );
}
