import React, { useState, useEffect } from "react";
import { api } from "../lib/api.js";

const STORAGE_KEY = "slz_feedback_shown";
const MAX_PER_DAY = 2;
const FIRST_DELAY_MS  = 90_000;
const MIN_INTERVAL_MS = 6 * 60 * 60 * 1000;

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function canShow() {
  try {
    const raw  = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const today = getTodayKey();
    const todayCount = data[today] || 0;
    if (todayCount >= MAX_PER_DAY) return false;
    const lastShown = data.lastShown || 0;
    if (Date.now() - lastShown < MIN_INTERVAL_MS && todayCount > 0) return false;
    return true;
  } catch {
    return true;
  }
}

function recordShown() {
  try {
    const raw   = localStorage.getItem(STORAGE_KEY);
    const data  = raw ? JSON.parse(raw) : {};
    const today = getTodayKey();
    data[today]    = (data[today] || 0) + 1;
    data.lastShown = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const RATINGS = [
  { emoji: "😣", label: "Very bad"  },
  { emoji: "😕", label: "Bad"       },
  { emoji: "😐", label: "Okay"      },
  { emoji: "😊", label: "Good"      },
  { emoji: "😄", label: "Excellent" },
];

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export default function FeedbackPopup() {
  const [visible,  setVisible]  = useState(false);
  const [selected, setSelected] = useState(null);
  const [note,     setNote]     = useState("");
  const [sent,     setSent]     = useState(false);

  useEffect(() => {
    if (!canShow()) return;
    const timer = setTimeout(() => {
      setVisible(true);
      recordShown();
    }, FIRST_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() { setVisible(false); }

  async function submit() {
    if (!selected) return;
    setSent(true);
    try {
      await api.submitFeedback({
        rating: selected.emoji,
        label:  selected.label,
        note:   note || null,
        url:    window.location.pathname,
      });
    } catch {
      // fail silently
    }
    setTimeout(() => setVisible(false), 2500);
  }

  if (!visible) return null;

  return (
    <>
      <div onClick={dismiss} style={{ position:"fixed", inset:0, zIndex:848 }}/>
      <div style={{
        position:"fixed", bottom:90, right:24, zIndex:850,
        width:300,
        background:"var(--bg2)", border:"1px solid var(--border)",
        borderRadius:16, boxShadow:"0 8px 40px rgba(0,0,0,0.35)",
        padding:"20px 20px 18px",
        animation:"fadeInChat .2s ease",
      }}>
        <button
          onClick={dismiss}
          style={{
            position:"absolute", top:12, right:12,
            background:"none", border:"none", cursor:"pointer",
            color:"var(--t3)", padding:4, borderRadius:6,
            display:"flex", alignItems:"center",
          }}
        >
          <IconClose/>
        </button>

        {sent ? (
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>{"🙏"}</div>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--t1)" }}>Thanks for your feedback!</div>
            <div style={{ fontSize:13, color:"var(--t3)", marginTop:4 }}>We really appreciate it.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--t1)", marginBottom:4 }}>
              How are you finding SimpleLogz?
            </div>
            <div style={{ fontSize:12, color:"var(--t3)", marginBottom:16 }}>
              Takes 5 seconds — your feedback helps us improve.
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              {RATINGS.map(r => (
                <button
                  key={r.label}
                  onClick={() => setSelected(r)}
                  title={r.label}
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                    background:"none", border:"none", cursor:"pointer",
                    padding:"6px 4px", borderRadius:10,
                    transition:"transform .15s",
                    transform: selected?.label === r.label ? "scale(1.35)" : "scale(1)",
                    opacity: selected && selected.label !== r.label ? 0.45 : 1,
                  }}
                >
                  <span style={{ fontSize:26, lineHeight:1 }}>{r.emoji}</span>
                  <span style={{ fontSize:10, color:"var(--t3)" }}>{r.label}</span>
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Anything else to share? (optional)"
              style={{
                width:"100%", background:"var(--bg3)", border:"1px solid var(--border)",
                borderRadius:8, padding:"8px 10px", color:"var(--t1)",
                fontSize:12, resize:"none", outline:"none",
                lineHeight:1.5, boxSizing:"border-box",
              }}
            />

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
              <button
                onClick={dismiss}
                style={{ fontSize:12, color:"var(--t3)", background:"none", border:"none", cursor:"pointer" }}
              >
                Maybe later
              </button>
              <button
                onClick={submit}
                disabled={!selected}
                style={{
                  background: selected ? "#6c5ce7" : "var(--bg3)",
                  color: selected ? "#fff" : "var(--t3)",
                  border:"none", borderRadius:8, padding:"7px 16px",
                  fontSize:13, fontWeight:500, cursor: selected ? "pointer" : "default",
                  transition:"background .15s",
                }}
              >
                Send feedback
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
