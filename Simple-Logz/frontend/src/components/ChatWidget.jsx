import React, { useState, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

// ââ Local FAQ fallback (works without backend) âââââââââââââââââ
const FAQ = [
  {
    keys: ["what is simplelogz", "about simplelogz", "tell me about", "what does"],
    answer: "SimpleLogz is an AI-powered log analysis tool. Paste any error log â from Node.js, Docker, Kubernetes, Nginx, AWS, and more â and get an instant plain-English diagnosis with step-by-step fix instructions.",
  },
  {
    keys: ["how do i analyze", "how to analyze", "how does it work", "how to use", "get started", "paste"],
    answer: "Go to the Analyzer (home page), paste your error log into the text box, choose a source type (or leave it on Auto-detect), then click Analyze. Results appear below in seconds.",
  },
  {
    keys: ["free plan", "free tier", "how many", "limit", "2 analyses", "per day"],
    answer: "The Free plan gives you 2 analyses per day, access to the community forum, and 1 project. No credit card required.",
  },
  {
    keys: ["developer plan", "paid plan", "upgrade", "pricing", "cost", "how much", "$12", "12"],
    answer: "The Developer plan is $12/month. It includes unlimited analyses, unlimited projects, incident history, AI runbooks, timelines, and team collaboration for up to 5 users. Visit /pricing to compare plans.",
  },
  {
    keys: ["project", "projects", "workspace", "create project"],
    answer: "Projects give you a dedicated workspace per application. Go to /projects (login required), click 'New project', name it, and pick your tech stack. Projects persist all your analyses and notes for that service.",
  },
  {
    keys: ["login", "sign in", "sign up", "account", "register"],
    answer: "Click 'Sign in' at the bottom of the sidebar. You can sign up with Google, GitHub, Microsoft, Apple, or email + password. It's free to create an account.",
  },
  {
    keys: ["support", "contact", "help", "email", "reach"],
    answer: "You can reach our support team at support@simplelogs.ai or through the Support page in the sidebar. We aim to respond within 24 hours.",
  },
  {
    keys: ["community", "forum", "discuss"],
    answer: "The Community forum (/forum) is where users share incidents, discuss fixes, and ask questions. It's open to all users including the free plan.",
  },
  {
    keys: ["log type", "what logs", "supported", "kubernetes", "docker", "nginx", "aws", "node", "python"],
    answer: "SimpleLogz supports virtually any log format: Node.js, Python, Docker, Kubernetes, Nginx, AWS Lambda, Postgres, Redis, GitHub Actions, and more. Use Auto-detect and it figures out the source automatically.",
  },
  {
    keys: ["enterprise", "team", "sso", "saml", "api"],
    answer: "The Enterprise plan includes unlimited seats, SSO/SAML/Azure AD, CI/CD integrations (GitHub, GitLab, Jenkins), REST API access, and a dedicated support SLA. Contact support@simplelogs.ai for pricing.",
  },
];

function localFallback(question) {
  const q = question.toLowerCase();
  for (const entry of FAQ) {
    if (entry.keys.some(k => q.includes(k))) return entry.answer;
  }
  return "I'm not sure about that one. You can reach our team at support@simplelogs.ai or check the Support page in the sidebar for more help.";
}

// ââ Icons ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function IconChat() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IconClose() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IconSend() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}

const SUGGESTIONS = [
  "How do I analyze a log?",
  "What's on the free plan?",
  "How do I create a project?",
  "How do I contact support?",
];

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the SimpleLogz assistant. Ask me anything about the app, pricing, or how to get started." }
  ]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const updated = [...messages, { role: "user", content }];
    setMessages(updated);
    setLoading(true);

    // Try backend first; fall back to local FAQ if it fails or returns no reply
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: updated }),
        signal:  AbortSignal.timeout(8000), // 8 s timeout
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages(m => [...m, { role: "assistant", content: data.reply }]);
          setLoading(false);
          return;
        }
      }
    } catch {
      // network error or timeout â fall through to FAQ
    }

    // Local FAQ fallback
    const fallback = localFallback(content);
    setMessages(m => [...m, { role: "assistant", content: fallback }]);
    setLoading(false);
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <>
      {/* Bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:"fixed", bottom:24, right:24, zIndex:900,
          width:52, height:52, borderRadius:"50%",
          background:"#6c5ce7", color:"#fff",
          border:"none", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 20px rgba(108,92,231,0.45)",
          transition:"transform .15s, box-shadow .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform="scale(1.08)"; e.currentTarget.style.boxShadow="0 6px 28px rgba(108,92,231,0.55)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform="scale(1)";    e.currentTarget.style.boxShadow="0 4px 20px rgba(108,92,231,0.45)"; }}
        aria-label="Open chat"
      >
        {open ? <IconClose/> : <IconChat/>}
      </button>

      {/* Backdrop â click anywhere to close */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position:"fixed", inset:0, zIndex:898 }}
        />
      )}

      {/* Panel */}
      {open && (
        <div style={{
          position:"fixed", bottom:86, right:24, zIndex:899,
          width:340, maxHeight:520,
          background:"var(--bg2)", border:"1px solid var(--border)",
          borderRadius:16, display:"flex", flexDirection:"column",
          boxShadow:"0 8px 40px rgba(0,0,0,0.35)",
          animation:"fadeInChat .18s ease",
          overflow:"hidden",
        }}>

          {/* Header */}
          <div style={{
            padding:"14px 18px", borderBottom:"1px solid var(--border)",
            display:"flex", alignItems:"center", gap:10,
            background:"var(--bg3)",
          }}>
            <div style={{
              width:32, height:32, borderRadius:"50%",
              background:"#6c5ce7", display:"flex",
              alignItems:"center", justifyContent:"center", flexShrink:0,
            }}>
              <IconChat/>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--t1)" }}>SimpleLogz Assistant</div>
              <div style={{ fontSize:11, color:"var(--t3)", display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", display:"inline-block" }}/>
                Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"14px 14px 8px", display:"flex", flexDirection:"column", gap:10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth:"82%", padding:"9px 13px",
                  borderRadius: m.role==="user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: m.role==="user" ? "#6c5ce7" : "var(--bg3)",
                  color: m.role==="user" ? "#fff" : "var(--t1)",
                  fontSize:13, lineHeight:1.55,
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display:"flex", justifyContent:"flex-start" }}>
                <div style={{ padding:"9px 14px", borderRadius:"14px 14px 14px 4px", background:"var(--bg3)", display:"flex", gap:4, alignItems:"center" }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width:6, height:6, borderRadius:"50%", background:"var(--t3)",
                      display:"inline-block",
                      animation:`dotBounce 1.2s ${i*0.2}s ease-in-out infinite`,
                    }}/>
                  ))}
                </div>
              </div>
            )}

            {/* Quick suggestions (first message only) */}
            {messages.length === 1 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    background:"var(--bg3)", border:"1px solid var(--border)",
                    borderRadius:99, padding:"5px 11px", fontSize:12,
                    color:"var(--t2)", cursor:"pointer",
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{
            padding:"10px 12px", borderTop:"1px solid var(--border)",
            display:"flex", gap:8, background:"var(--bg2)",
          }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask anythingâ¦"
              style={{
                flex:1, background:"var(--bg3)", border:"1px solid var(--border)",
                borderRadius:10, padding:"8px 12px", color:"var(--t1)",
                fontSize:13, resize:"none", outline:"none",
                lineHeight:1.5, maxHeight:80, overflow:"auto",
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background: input.trim() && !loading ? "#6c5ce7" : "var(--bg3)",
                border:"none", cursor: input.trim() && !loading ? "pointer" : "default",
                color: input.trim() && !loading ? "#fff" : "var(--t3)",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"background .15s", alignSelf:"flex-end",
              }}
            >
              <IconSend/>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInChat { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dotBounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-5px); } }
      `}</style>
    </>
  );
}
