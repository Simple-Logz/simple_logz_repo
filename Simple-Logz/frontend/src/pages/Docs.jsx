import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// ââ SVG Icon System âââââââââââââââââââââââââââââââââââââââââââ
const Icon = ({ d, size = 20, viewBox = "0 0 24 24", fill = false }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path}/>) : <path d={d}/>}
  </svg>
);

const Icons = {
  Zap:       () => <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
  Search:    () => <Icon d={["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z","M21 21l-4.35-4.35"]}/>,
  Code:      () => <Icon d={["M16 18l6-6-6-6","M8 6l-6 6 6 6"]}/>,
  Book:      () => <Icon d={["M4 19.5A2.5 2.5 0 0 1 6.5 17H20","M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"]}/>,
  Layers:    () => <Icon d={["M12 2L2 7l10 5 10-5-10-5z","M2 17l10 5 10-5","M2 12l10 5 10-5"]}/>,
  Shield:    () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  Users:     () => <Icon d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75","M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]}/>,
  Dollar:    () => <Icon d={["M12 1v22","M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]}/>,
  HelpCircle:() => <Icon d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3","M12 17h.01"]}/>,
  Terminal:  () => <Icon d={["M4 17l6-6-6-6","M12 19h8"]}/>,
  CheckCircle:()=> <Icon d={["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4L12 14.01l-3-3"]}/>,
  ArrowRight:() => <Icon d={["M5 12h14","M12 5l7 7-7 7"]}/>,
  Globe:     () => <Icon d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M2 12h20","M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"]}/>,
  Activity:  () => <Icon d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
  Folder:    () => <Icon d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>,
  GitBranch: () => <Icon d={["M6 3v12","M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M18 9a9 9 0 0 1-9 9"]}/>,
  Cpu:       () => <Icon d={["M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z","M9 9h6v6H9z","M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"]}/>,
  Lock:      () => <Icon d={["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"]}/>,
  Trending:  () => <Icon d={["M23 6l-9.5 9.5-5-5L1 18","M17 6h6v6"]}/>,
  MessageSq: () => <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
  ThumbsUp:  () => <Icon d={["M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z","M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"]}/>,
  Eye:       () => <Icon d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]}/>,
  ChevronDown:()=><Icon d="M6 9l6 6 6-6"/>,
};

// ââ Nav sections âââââââââââââââââââââââââââââââââââââââââââââ
const SECTIONS = [
  { id:"intro",       label:"Introduction",         icon: Icons.Book       },
  { id:"quickstart",  label:"Quick Start",           icon: Icons.Zap        },
  { id:"analyzer",    label:"Log Analyzer",          icon: Icons.Terminal   },
  { id:"code",        label:"Code Inspector",        icon: Icons.Code       },
  { id:"runbook",     label:"Runbook Studio",        icon: Icons.Book       },
  { id:"patterns",    label:"Pattern Intelligence",  icon: Icons.Activity   },
  { id:"groups",      label:"Groups",                icon: Icons.Folder     },
  { id:"community",   label:"Community Forum",       icon: Icons.MessageSq  },
  { id:"pricing",     label:"Plans & Pricing",       icon: Icons.Dollar     },
  { id:"faq",         label:"FAQ",                   icon: Icons.HelpCircle },
];

// ââ Reusable components âââââââââââââââââââââââââââââââââââââââ
function Chip({ children, color = "#6c5ce7" }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"3px 10px", borderRadius:99,
      fontSize:11, fontWeight:700, letterSpacing:"0.04em",
      background:`${color}15`, color, border:`1px solid ${color}25`,
    }}>{children}</span>
  );
}

function SectionHeading({ id, title, chip, icon: IconComp }) {
  return (
    <div id={id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, scrollMarginTop:40 }}>
      {IconComp && (
        <div style={{
          width:38, height:38, borderRadius:10, flexShrink:0,
          background:"linear-gradient(135deg, rgba(108,92,231,0.15), rgba(162,155,254,0.08))",
          border:"1px solid rgba(108,92,231,0.2)",
          display:"flex", alignItems:"center", justifyContent:"center", color:"#6c5ce7",
        }}>
          <IconComp/>
        </div>
      )}
      <div>
        <h2 style={{ fontSize:20, fontWeight:800, color:"var(--t1)", letterSpacing:"-0.4px", lineHeight:1 }}>{title}</h2>
        {chip && <div style={{marginTop:5}}><Chip>{chip}</Chip></div>}
      </div>
    </div>
  );
}

function FeatureCard({ icon: IconComp, title, desc, accent = "#6c5ce7" }) {
  return (
    <div style={{
      background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12,
      padding:"18px 20px", display:"flex", flexDirection:"column", gap:10,
      transition:"border-color 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}50`; e.currentTarget.style.boxShadow = `0 4px 24px ${accent}10`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{
        width:36, height:36, borderRadius:9,
        background:`${accent}12`, border:`1px solid ${accent}20`,
        display:"flex", alignItems:"center", justifyContent:"center", color:accent,
      }}>
        {IconComp && <IconComp/>}
      </div>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:"var(--t1)", marginBottom:4 }}>{title}</div>
        <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.65 }}>{desc}</div>
      </div>
    </div>
  );
}

function StepItem({ n, title, children }) {
  return (
    <div style={{ display:"flex", gap:16, marginBottom:24 }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
        <div style={{
          width:32, height:32, borderRadius:"50%",
          background:"linear-gradient(135deg, #6c5ce7, #a29bfe)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:800, color:"#fff", flexShrink:0,
        }}>{n}</div>
        <div style={{ width:1, flex:1, background:"var(--border)", marginTop:6 }}/>
      </div>
      <div style={{ paddingBottom:8 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"var(--t1)", marginBottom:5, marginTop:4 }}>{title}</div>
        <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.75 }}>{children}</div>
      </div>
    </div>
  );
}

function Callout({ type = "info", children }) {
  const styles = {
    info:    { bg:"rgba(108,92,231,0.06)", border:"rgba(108,92,231,0.2)", color:"#6c5ce7", label:"Note" },
    tip:     { bg:"rgba(52,211,153,0.06)", border:"rgba(52,211,153,0.2)", color:"#34d399", label:"Pro tip" },
    warning: { bg:"rgba(251,191,36,0.06)", border:"rgba(251,191,36,0.2)", color:"#fbbf24", label:"Important" },
  };
  const s = styles[type];
  return (
    <div style={{
      background:s.bg, border:`1px solid ${s.border}`,
      borderLeft:`3px solid ${s.color}`, borderRadius:8,
      padding:"12px 16px", marginBottom:16,
    }}>
      <span style={{ fontSize:11, fontWeight:800, color:s.color, letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:4 }}>{s.label}</span>
      <div style={{ fontSize:13, color:"var(--t2)", lineHeight:1.7 }}>{children}</div>
    </div>
  );
}

function CodeBlock({ label, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && (
        <div style={{
          background:"var(--bg3)", border:"1px solid var(--border)", borderBottom:"none",
          borderRadius:"8px 8px 0 0", padding:"6px 14px",
          fontSize:11, fontWeight:600, color:"var(--t3)", display:"flex", alignItems:"center", gap:6,
        }}>
          <div style={{ display:"flex", gap:5 }}>
            {["#f87171","#fbbf24","#34d399"].map(c => <div key={c} style={{ width:8, height:8, borderRadius:"50%", background:c }}/>)}
          </div>
          {label}
        </div>
      )}
      <pre style={{
        background:"var(--bg3)", border:"1px solid var(--border)",
        borderRadius: label ? "0 0 8px 8px" : 8,
        padding:"16px", fontSize:12, fontFamily:"var(--mono)", color:"var(--t2)",
        lineHeight:1.75, overflowX:"auto", margin:0,
      }}>{children}</pre>
    </div>
  );
}

function SeverityRow({ sev, col, examples }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
      <span style={{
        fontSize:10, fontWeight:800, color:col, background:`${col}15`,
        padding:"3px 9px", borderRadius:99, flexShrink:0, marginTop:1,
        border:`1px solid ${col}30`, letterSpacing:"0.05em",
      }}>{sev}</span>
      <span style={{ fontSize:12, color:"var(--t2)", lineHeight:1.6 }}>{examples}</span>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:"1px solid var(--border)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 0", background:"none", border:"none", cursor:"pointer",
          textAlign:"left",
        }}
      >
        <span style={{ fontSize:14, fontWeight:600, color:"var(--t1)" }}>{q}</span>
        <span style={{
          color:"#6c5ce7", flexShrink:0, marginLeft:16,
          transform: open ? "rotate(180deg)" : "none", transition:"transform 0.2s",
        }}>
          <Icons.ChevronDown/>
        </span>
      </button>
      {open && (
        <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.8, marginBottom:16, paddingRight:24 }}>{a}</p>
      )}
    </div>
  );
}

// ââ Main page âââââââââââââââââââââââââââââââââââââââââââââââââ
export default function Docs() {
  const [active, setActive] = useState("intro");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin:"-10% 0px -75% 0px" }
    );
    SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ display:"flex", maxWidth:1120, margin:"0 auto", padding:"0 24px" }}>

      {/* ââ Sidebar nav ââ */}
      <aside style={{
        width:220, flexShrink:0, position:"sticky", top:0,
        height:"100vh", overflowY:"auto", paddingTop:52, paddingRight:20,
      }}>
        <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--t3)", marginBottom:16, paddingLeft:10 }}>
          On this page
        </div>
        <nav style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {SECTIONS.map(({ id, label, icon: Ic }) => {
            const isActive = active === id;
            return (
              <a key={id} href={`#${id}`}
                onClick={e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); }}
                style={{
                  display:"flex", alignItems:"center", gap:9, padding:"7px 10px",
                  borderRadius:8, textDecoration:"none", fontSize:12,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "#6c5ce7" : "var(--t2)",
                  background: isActive ? "rgba(108,92,231,0.08)" : "transparent",
                  borderLeft: isActive ? "2px solid #6c5ce7" : "2px solid transparent",
                  transition:"all 0.15s",
                }}
              >
                <span style={{ color: isActive ? "#6c5ce7" : "var(--t3)", flexShrink:0 }}><Ic/></span>
                {label}
              </a>
            );
          })}
        </nav>

        <div style={{ margin:"28px 0 0", padding:"16px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <span style={{color:"#6c5ce7"}}><Icons.MessageSq/></span>
            <span style={{ fontSize:12, fontWeight:700, color:"var(--t1)" }}>Need help?</span>
          </div>
          <p style={{ fontSize:11, color:"var(--t2)", lineHeight:1.6, marginBottom:10 }}>
            Can't find what you're looking for? Our team is ready to help.
          </p>
          <Link to="/support" style={{
            display:"inline-flex", alignItems:"center", gap:5,
            fontSize:11, color:"#6c5ce7", fontWeight:700, textDecoration:"none",
          }} onClick={() => window.scrollTo(0, 0)}>
            Contact support <Icons.ArrowRight/>
          </Link>
        </div>
      </aside>

      {/* ââ Main content ââ */}
      <main style={{ flex:1, paddingTop:52, paddingBottom:120, paddingLeft:52, minWidth:0 }}>

        {/* Hero banner */}
        <div style={{
          background:"linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(162,155,254,0.04) 100%)",
          border:"1px solid rgba(108,92,231,0.15)", borderRadius:16,
          padding:"36px 40px", marginBottom:56, position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", top:-40, right:-40, width:200, height:200,
            background:"radial-gradient(circle, rgba(108,92,231,0.12) 0%, transparent 70%)",
            pointerEvents:"none",
          }}/>
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            <Chip>v1.0</Chip>
            <Chip color="#34d399">Live</Chip>
          </div>
          <h1 style={{
            fontSize:"clamp(26px,4vw,40px)", fontWeight:900, letterSpacing:"-1.5px",
            color:"var(--t1)", marginBottom:10, lineHeight:1.1,
          }}>
            SimpleLogz Documentation
          </h1>
          <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.75, maxWidth:540, marginBottom:20 }}>
            Everything you need to debug faster â from pasting your first log to running full incident runbooks across your engineering groups.
          </p>
          <div style={{ display:"flex", gap:10 }}>
            <a href="#quickstart"
              onClick={e => { e.preventDefault(); document.getElementById("quickstart")?.scrollIntoView({ behavior:"smooth" }); }}
              style={{
                display:"inline-flex", alignItems:"center", gap:7,
                background:"#6c5ce7", color:"#fff", padding:"9px 20px",
                borderRadius:8, fontSize:13, fontWeight:700, textDecoration:"none",
                boxShadow:"0 4px 16px rgba(108,92,231,0.35)",
              }}>
              <Icons.Zap/> Get started
            </a>
            <Link to="/" style={{
              display:"inline-flex", alignItems:"center", gap:7,
              background:"var(--bg2)", color:"var(--t1)", padding:"9px 20px",
              borderRadius:8, fontSize:13, fontWeight:600, textDecoration:"none",
              border:"1px solid var(--border)",
            }} onClick={() => window.scrollTo(0, 0)}>
              Try the analyzer
            </Link>
          </div>
        </div>

        {/* ââ INTRODUCTION ââ */}
        <section style={{ marginBottom:60 }}>
          <SectionHeading id="intro" title="Introduction" icon={Icons.Book}/>
          <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.8, marginBottom:20 }}>
            SimpleLogz is an AI-powered developer platform that transforms raw error logs, stack traces, and application errors into instant root-cause diagnoses and actionable fixes. Whether you're debugging a production outage or reviewing code for security vulnerabilities, SimpleLogz returns answers in seconds â not hours.'
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:12 }}>
            <FeatureCard icon={Icons.Zap}      title="Instant diagnosis"      desc="Paste any error log and receive a root cause + fix in under 10 seconds." accent="#6c5ce7"/>
            <FeatureCard icon={Icons.Code}     title="Code inspection"        desc="Upload code snippets and detect bugs, anti-patterns, and vulnerabilities." accent="#a29bfe"/>
            <FeatureCard icon={Icons.Book}     title="Auto runbooks"          desc="AI generates structured step-by-step incident runbooks automatically." accent="#6c5ce7"/>
            <FeatureCard icon={Icons.Folder}   title="Group workspaces"       desc="Organize services into shared groups with full tool access per service." accent="#a29bfe"/>
          </div>
        </section>

        {/* ââ QUICK START ââ */}
        <section style={{ marginBottom:60 }}>
          <SectionHeading id="quickstart" title="Quick Start" chip="5 minutes" icon={Icons.Zap}/>
          <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.8, marginBottom:16 }}>
            You can start using SimpleLogz without an account. Free accounts are limited to <strong style={{color:"var(--t1)"}}>2 error log analyses per day</strong> and do not include Groups, Code Inspector, Runbook Studio, or Pattern Intelligence.
          </p>
          <Callout type="warning">
            To create Groups, inspect code, generate runbooks, and run unlimited analyses, you need a <strong>Developer plan</strong> ($5/month or $49/year). <Link to="/pricing" style={{color:"#6c5ce7", fontWeight:700}}>See pricing â</Link>
          </Callout>
          <StepItem n={1} title="Paste your error log">
            Navigate to the <Link to="/" style={{color:"#6c5ce7", fontWeight:600}}>Analyzer</Link> on the homepage. Paste any error log â Lambda timeouts, database errors, stack traces, HTTP failures, anything.
          </StepItem>
          <StepItem n={2} title="Click Analyze">
            Hit <strong style={{color:"var(--t1)"}}>â Analyze</strong> or press <kbd style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:5, padding:"2px 7px", fontSize:11, fontFamily:"var(--mono)" }}>Ctrl+Enter</kbd>. The AI reads your log and returns a structured diagnosis.
          </StepItem>
          <StepItem n={3} title="Read the diagnosis">
            You'll receive a severity rating, a plain-English root cause, numbered fix steps, verification commands, and prevention tips.'
          </StepItem>
          <StepItem n={4} title="Create a free account to unlock everything">
            Sign up to access saved history, Groups, Code Inspector, Runbook Studio, Pattern Intelligence, and the Community Forum.
          </StepItem>
          <Callout type="tip">
            Try this example log â paste it into the analyzer to see a full diagnosis instantly.
          </Callout>
          <CodeBlock label="Example â AWS Lambda DB timeout">
{`Error: connect ETIMEDOUT 10.0.2.50:3306
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:148:16)
FATAL: Task timed out after 30.02 seconds
RequestId: 8f3d2c1a-e4b9-11ed-a05b Version: $LATEST`}
          </CodeBlock>
        </section>

        {/* ââ LOG ANALYZER ââ */}
        <section style={{ marginBottom:60 }}>
          <SectionHeading id="analyzer" title="Log Analyzer" icon={Icons.Terminal}/>
          <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.8, marginBottom:20 }}>
            The Log Analyzer is the core feature of SimpleLogz. It accepts any plain-text error log and returns a fully structured AI diagnosis.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {[
              { icon:Icons.Activity,  title:"Severity rating",     desc:"CRITICAL, HIGH, MEDIUM, or LOW â so you know what to fix first." },
              { icon:Icons.Search,    title:"Root cause",          desc:"Plain-English explanation of what went wrong and exactly why." },
              { icon:Icons.CheckCircle,title:"Step-by-step fix",   desc:"Numbered steps you can act on immediately." },
              { icon:Icons.Terminal,  title:"Verification commands",desc:"Shell commands to confirm the fix worked before closing the incident." },
              { icon:Icons.Shield,    title:"Prevention tips",     desc:"Architectural changes to prevent the issue recurring." },
              { icon:Icons.Globe,     title:"Source detection",    desc:"Auto-detects the platform â AWS, Node.js, Postgres, Docker, and more." },
            ].map(f => <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc}/>)}
          </div>
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12, padding:"18px 20px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--t1)", marginBottom:12 }}>Supported platforms</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {["AWS Lambda","Node.js","Python","PostgreSQL","MySQL","Redis","Nginx","Docker","Kubernetes","React","Next.js","Java Spring","Ruby on Rails","Go","PHP"].map(t => (
                <span key={t} style={{
                  padding:"4px 10px", borderRadius:6, fontSize:11, fontWeight:600,
                  background:"rgba(108,92,231,0.08)", color:"#a29bfe",
                  border:"1px solid rgba(108,92,231,0.15)",
                }}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ââ CODE INSPECTOR ââ */}
        <section style={{ marginBottom:60 }}>
          <SectionHeading id="code" title="Code Inspector" icon={Icons.Code}/>
          <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.8, marginBottom:20 }}>
            Paste any code snippet and the Code Inspector scans it for bugs, security vulnerabilities, anti-patterns, and performance issues â then suggests a fix for each one.
          </p>
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12, padding:"18px 20px", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--t1)", marginBottom:12 }}>Issue severity levels</div>
            <SeverityRow sev="CRITICAL" col="#f87171" examples="SQL injection, hardcoded secrets, unguarded authentication endpoints, remote code execution risks."/>
            <SeverityRow sev="HIGH"     col="#fbbf24" examples="Missing error handling, race conditions, memory leaks, insecure deserialization."/>
            <SeverityRow sev="MEDIUM"   col="#fb923c" examples="Inefficient database queries, deprecated API usage, missing connection timeouts."/>
            <SeverityRow sev="LOW"      col="#34d399" examples="Code style issues, unused variables, naming conventions, minor refactoring suggestions."/>
          </div>
          <Callout type="info">
            Each detected issue includes a <strong>Fix Now</strong> button. Clicking it sends the issue to Claude AI and applies the corrected code directly â no copy-pasting needed.
          </Callout>
          <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.7 }}>
            Supported languages: JavaScript, TypeScript, Python, Go, Java, Ruby, PHP, Rust, C#, SQL, Bash, and more.
          </p>
        </section>

        {/* ââ RUNBOOK STUDIO ââ */}
        <section style={{ marginBottom:60 }}>
          <SectionHeading id="runbook" title="Runbook Studio" icon={Icons.Layers}/>
          <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.8, marginBottom:20 }}>
            Runbook Studio auto-generates structured incident runbooks from your log analysis. Instead of scrambling to remember steps during an outage, your runbook is ready the moment you paste a log.
          </p>
          <StepItem n={1} title="Analyze a log inside a Group">Open a group workspace and paste your error log in the Log Analyzer tab.</StepItem>
          <StepItem n={2} title="Switch to Runbook Studio">The runbook tab pre-populates with steps derived directly from your analysis.</StepItem>
          <StepItem n={3} title="Work through the steps">Check off each step as you resolve the incident in real time.</StepItem>
          <StepItem n={4} title="Save for future reference">Completed runbooks are saved to the group â your team can reference past responses to avoid repeating the same debugging process.</StepItem>
          <Callout type="tip">
            Create one group per service. That way, each service accumulates its own library of incident runbooks over time â a living knowledge base for your engineering team.
          </Callout>
        </section>

        {/* ââ PATTERN INTELLIGENCE ââ */}
        <section style={{ marginBottom:60 }}>
          <SectionHeading id="patterns" title="Pattern Intelligence" icon={Icons.Activity}/>
          <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.8, marginBottom:20 }}>
            Pattern Intelligence scans your logs over time to identify recurring issues, error trends, and systemic problems â before they become outages.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <FeatureCard icon={Icons.Trending}   title="Trend detection"     desc="Identifies when a particular error is occurring more frequently than baseline." accent="#6c5ce7"/>
            <FeatureCard icon={Icons.GitBranch}  title="Correlation mapping" desc="Links related errors across different services within the same group." accent="#a29bfe"/>
            <FeatureCard icon={Icons.Activity}   title="Anomaly alerts"      desc="Flags unusual patterns that deviate from your service's normal behaviour." accent="#6c5ce7"/>
            <FeatureCard icon={Icons.Cpu}        title="Health scoring"      desc="Each group receives a health score (0â100) based on recent error patterns and frequency." accent="#a29bfe"/>
          </div>
        </section>

        {/* ââ GROUPS ââ */}
        <section style={{ marginBottom:60 }}>
          <SectionHeading id="groups" title="Groups" icon={Icons.Folder}/>
          <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.8, marginBottom:20 }}>
            Groups are shared engineering workspaces organised by service. Each group gets its own Log Analyzer, Code Inspector, Runbook Studio, and Pattern Intelligence â keeping everything scoped by service.
          </p>
          <StepItem n={1} title='Navigate to Groups'>Click <strong style={{color:"var(--t1)"}}>Groups</strong> in the sidebar.</StepItem>
          <StepItem n={2} title='Create a new group'>Click <strong style={{color:"var(--t1)"}}>+ New Group</strong> and name it after the service â e.g. "Production API", "Auth Service", "Worker Queue".</StepItem>
          <StepItem n={3} title="Start working">Paste logs, inspect code, generate runbooks â all scoped to that group's history and context.</StepItem>'
          <Callout type="warning">
            Recommended: one group per service or microservice. Mixing services in a single group makes it harder to track incident history and patterns over time.
          </Callout>
        </section>

        {/* ââ COMMUNITY ââ */}
        <section style={{ marginBottom:60 }}>
          <SectionHeading id="community" title="Community Forum" icon={Icons.MessageSq}/>
          <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.8, marginBottom:20 }}>
            The Community Forum is where SimpleLogz users share error solutions, ask questions, and help each other debug faster. A free account is required to post.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <FeatureCard icon={Icons.MessageSq} title="Ask questions"    desc="Post an error you're stuck on and get answers from the community of engineers." accent="#6c5ce7"/>
            <FeatureCard icon={Icons.Eye}       title="Share screenshots" desc="Attach images to posts and comments to give better visual context." accent="#a29bfe"/>
            <FeatureCard icon={Icons.ThumbsUp}  title="Like helpful answers" desc="Upvote comments that solved your problem, helping others find answers faster." accent="#6c5ce7"/>
            <FeatureCard icon={Icons.Search}    title="Search threads"   desc="Search by keyword, category, or severity to find existing solutions." accent="#a29bfe"/>
          </div>
        </section>

        {/* ââ PRICING ââ */}
        <section style={{ marginBottom:60 }}>
          <SectionHeading id="pricing" title="Plans & Pricing" icon={Icons.Dollar}/>
          <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.8, marginBottom:12 }}>
            SimpleLogz has a limited free tier for trying out the platform, and a Developer plan that unlocks the full toolkit.
          </p>
          <Callout type="warning">
            Free users can only analyze error logs â limited to <strong>2 analyses per day</strong>. Creating Groups, running Code Inspections, generating Runbooks, and accessing Pattern Intelligence all require a <strong>Developer plan</strong>.
          </Callout>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
            {/* Free */}
            <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:"24px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Free</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:20 }}>
                <span style={{ fontSize:36, fontWeight:900, color:"var(--t1)", letterSpacing:"-2px" }}>$0</span>
                <span style={{ fontSize:13, color:"var(--t3)" }}>/month</span>
              </div>
              {["2 error log analyses per day","Log Analyzer only","Community forum access","No Groups or Projects","No Code Inspector","No Runbook Studio"].map((f, i) => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:9, padding:"6px 0", fontSize:13, color: i > 1 ? "var(--t3)" : "var(--t2)" }}>
                  <span style={{color: i > 1 ? "var(--t3)" : "#34d399", flexShrink:0}}>{i > 1 ? "â" : <Icons.CheckCircle/>}</span> {f}
                </div>
              ))}
            </div>
            {/* Developer */}
            <div style={{
              background:"linear-gradient(135deg, rgba(108,92,231,0.08), rgba(162,155,254,0.04))",
              border:"1px solid rgba(108,92,231,0.3)", borderRadius:14, padding:"24px", position:"relative", overflow:"hidden",
            }}>
              <div style={{
                position:"absolute", top:14, right:14,
                background:"#6c5ce7", color:"#fff", padding:"3px 10px",
                borderRadius:99, fontSize:10, fontWeight:800, letterSpacing:"0.05em",
              }}>MOST POPULAR</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#6c5ce7", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Developer</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:20 }}>
                <span style={{ fontSize:36, fontWeight:900, color:"var(--t1)", letterSpacing:"-2px" }}>$5</span>
                <span style={{ fontSize:13, color:"var(--t3)" }}>/month</span>
              </div>
              {["Unlimited log analyses","All AI-powered tools","Code Inspector","Runbook Studio","Pattern Intelligence","Engineering Groups","Priority support","Annual plan: $49/year (save $11)"].map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:9, padding:"6px 0", fontSize:13, color:"var(--t2)" }}>
                  <span style={{color:"#6c5ce7", flexShrink:0}}><Icons.CheckCircle/></span> {f}
                </div>
              ))}
            </div>
          </div>
          <Link to="/pricing" onClick={() => window.scrollTo(0, 0)} style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"#6c5ce7", color:"#fff", padding:"10px 22px",
            borderRadius:8, fontSize:13, fontWeight:700, textDecoration:"none",
            boxShadow:"0 4px 16px rgba(108,92,231,0.3)",
          }}>
            View full pricing page <Icons.ArrowRight/>
          </Link>
        </section>


        {/* ââ FAQ ââ */}
        <section style={{ marginBottom:60 }}>
          <SectionHeading id="faq" title="Frequently Asked Questions" icon={Icons.HelpCircle}/>
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:"0 24px" }}>
            {[
              { q:"Do I need an account to use SimpleLogz?", a:"You can paste error logs and receive a diagnosis without signing up, but you are limited to 2 analyses per day. A free account gives you access to the community forum and saved history, but Groups, Code Inspector, Runbook Studio, and Pattern Intelligence all require a Developer plan." },
              { q:"What types of logs does SimpleLogz support?", a:"Any plain-text error log â stack traces, Lambda timeouts, database errors, HTTP errors, container logs, CI/CD failures, and more. The AI auto-detects the platform and adjusts its analysis accordingly." },
              { q:"Is my code and log data private?", a:"Yes. Logs and code you submit are used only to generate your diagnosis. Data is not stored permanently beyond your session history, and is never used to train AI models." },
              { q:"Can I cancel my Developer plan anytime?", a:"Yes. Cancel anytime from Settings â Billing. You'll retain full access until the end of your current billing period with no penalties." },
              { q:"What's the benefit of the annual plan?", a:"The Developer annual plan is $49/year â equivalent to $4.08/month â saving you $11 compared to paying monthly. You get the same features with two months effectively free." },
              { q:"How accurate is the AI diagnosis?", a:"Very accurate for common error types (AWS, Node.js, databases, containers, etc.). For highly custom or domain-specific errors, the AI provides the closest root cause match and recommends next investigative steps." },
              { q:"Can I share a group with my team?", a:"Groups are currently scoped to your account. Team collaboration and shared group access is on our roadmap for an upcoming release." },
            ].map(item => <FAQItem key={item.q} q={item.q} a={item.a}/>)}
          </div>
        </section>

        {/* ââ Footer CTA ââ */}
        <div style={{
          background:"linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(162,155,254,0.06) 100%)",
          border:"1px solid rgba(108,92,231,0.2)", borderRadius:16,
          padding:"40px", textAlign:"center", position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", top:-60, left:"50%", transform:"translateX(-50%)",
            width:300, height:120,
            background:"radial-gradient(ellipse, rgba(108,92,231,0.2) 0%, transparent 70%)",
            pointerEvents:"none",
          }}/>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:52, height:52, borderRadius:14, background:"rgba(108,92,231,0.12)", border:"1px solid rgba(108,92,231,0.2)", color:"#6c5ce7", marginBottom:16 }}>
            <Icons.Zap/>
          </div>
          <h3 style={{ fontSize:22, fontWeight:800, color:"var(--t1)", letterSpacing:"-0.5px", marginBottom:8 }}>
            Ready to debug faster?
          </h3>
          <p style={{ fontSize:13, color:"var(--t2)", marginBottom:24, maxWidth:380, margin:"0 auto 24px" }}>
            Paste your first log and get an AI-powered diagnosis in under 10 seconds.
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <Link to="/" onClick={() => window.scrollTo(0, 0)} style={{
              display:"inline-flex", alignItems:"center", gap:8,
              background:"#6c5ce7", color:"#fff", padding:"12px 28px",
              borderRadius:9, fontSize:14, fontWeight:700, textDecoration:"none",
              boxShadow:"0 6px 24px rgba(108,92,231,0.4)",
            }}>
              <Icons.Zap/> Try the analyzer free
            </Link>
            <Link to="/pricing" onClick={() => window.scrollTo(0, 0)} style={{
              display:"inline-flex", alignItems:"center", gap:8,
              background:"var(--bg2)", color:"var(--t1)", padding:"12px 28px",
              borderRadius:9, fontSize:14, fontWeight:600, textDecoration:"none",
              border:"1px solid var(--border)",
            }}>
              View pricing
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
