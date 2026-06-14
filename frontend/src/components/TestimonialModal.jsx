import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { api } from "../lib/api.js";
import { useToast } from "./ui/Toast.jsx";

const FEATURE_TAGS = [
  "Log Analyzer", "Code Inspector", "Runbook Studio",
  "AI Diagnosis", "Incident Response", "On-Call", "Team Productivity", "Security",
];

export default function TestimonialModal({ onClose, anchorRect }) {
  const { getToken, profile } = useAuth();
  const { showToast } = useToast();

  // Restore scroll when modal closes
  React.useEffect(() => {
    return () => { document.documentElement.style.overflow = ""; };
  }, []);

  // Vertical offset: push dialog up so it sits above the button
  const paddingBottom = anchorRect
    ? Math.max(12, window.innerHeight - anchorRect.top + 12)
    : "10vh";

  const [quote,   setQuote]   = useState("");
  const [role,    setRole]    = useState(profile?.name ? "" : "");
  const [company, setCompany] = useState("");
  const [tags,    setTags]    = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [done,    setDone]    = useState(false);

  function toggleTag(tag) {
    setTags(t => t.includes(tag) ? t.filter(x => x !== tag) : t.length < 3 ? [...t, tag] : t);
  }

  async function submit(e) {
    e.preventDefault();
    if (quote.trim().length < 20) { showToast("Please write at least 20 characters.", "error"); return; }
    setSaving(true);
    try {
      const token = await getToken();
      await api.submitTestimonial({ name: profile?.name || "Anonymous", role, company, quote, tags }, token);
      setDone(true);
    } catch (err) {
      showToast(err.message, "error");
    } finally { setSaving(false); }
  }

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9000,
      background:"rgba(0,0,0,0.45)", backdropFilter:"blur(3px)",
      display:"flex", alignItems:"flex-end", justifyContent:"center",
      paddingBottom,
      animation:"fadeInBg .2s ease",
    }} onClick={e => e.target === e.currentTarget && onClose()}>

      {/* Dialog centered horizontally, above the button */}
      <div style={{
        width:460, maxWidth:"calc(100vw - 32px)",
        background:"var(--bg2)", borderRadius:16,
        border:"1px solid var(--border)",
        boxShadow:"0 16px 60px rgba(0,0,0,0.45)",
        overflow:"hidden",
        animation:"pageEnter .3s cubic-bezier(.22,1,.36,1) both",
      }}>
        {/* Header */}
        <div style={{ padding:"16px 20px 0", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--t1)" }}>Share your experience</div>
            <p style={{ fontSize:12, color:"var(--t3)", marginTop:2 }}>
              Your review helps other engineers discover SimpleLogz.
            </p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)", padding:4, marginTop:-2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {done ? (
          <div style={{ padding:"28px 20px 24px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
            <div style={{ width:46, height:46, borderRadius:"50%", background:"rgba(0,184,148,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🎉</div>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--t1)" }}>Thank you, {profile?.name?.split(" ")[0] || "friend"}!</div>
            <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.6, maxWidth:320 }}>
              Submitted for review. Once approved it'll appear on the homepage.
            </p>
            <button className="btn btn-primary btn-sm" onClick={onClose} style={{ marginTop:4 }}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ padding:"14px 20px 20px", display:"flex", flexDirection:"column", gap:14 }}>

            {/* Quote */}
            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">Your review <span style={{ color:"var(--red)" }}>*</span></label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Tell us how SimpleLogz helped you…"
                value={quote}
                onChange={e => setQuote(e.target.value)}
                style={{ resize:"none", fontFamily:"inherit", fontSize:13 }}
                required
              />
              <div style={{ fontSize:11, color: quote.length < 20 && quote.length > 0 ? "var(--red)" : "var(--t3)", marginTop:3 }}>
                {quote.length}/300 · min 20 chars
              </div>
            </div>

            {/* Role + Company */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">Role</label>
                <input className="form-input" placeholder="e.g. DevOps Engineer" value={role} onChange={e => setRole(e.target.value)} style={{ fontSize:13 }}/>
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">Company</label>
                <input className="form-input" placeholder="e.g. Startup, London" value={company} onChange={e => setCompany(e.target.value)} style={{ fontSize:13 }}/>
              </div>
            </div>

            {/* Feature tags */}
            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">Features used <span style={{ color:"var(--t3)", fontWeight:400 }}>(up to 3)</span></label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:6 }}>
                {FEATURE_TAGS.map(tag => {
                  const active = tags.includes(tag);
                  return (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{
                      fontSize:11, padding:"4px 10px", borderRadius:99,
                      border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                      background: active ? "rgba(108,92,231,.15)" : "var(--bg3)",
                      color: active ? "var(--accent)" : "var(--t2)",
                      cursor:"pointer", transition:"all .15s",
                    }}>{tag}</button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? <><span className="spinner" style={{ width:11, height:11, borderWidth:2 }}/> Submitting…</> : "Submit review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
