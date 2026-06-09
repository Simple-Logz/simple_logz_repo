import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { api } from "../lib/api.js";
import styles from "./Forum.module.css";

const CATEGORIES = [
  { id:"all",     label:"🏠 All Posts" },
  { id:"errors",  label:"🔴 Error Reports" },
  { id:"howto",   label:"📖 How-To Guides" },
  { id:"tips",    label:"💡 Tips & Tricks" },
  { id:"general", label:"💬 General Discussion" },
];

// Fallback threads for when backend is not yet connected
const SEED_THREADS = [
  { id:1, category:"errors",  title:"CrashLoopBackOff after upgrading Kubernetes 1.28", profiles:{name:"Sarah M."}, created_at:new Date(Date.now()-7200000).toISOString(), views:203, forum_comments:[{},{},{},{},...Array(10)], body:"I upgraded our cluster to K8s 1.28 last night and now 3 of our pods are stuck in CrashLoopBackOff. The error says OCI runtime create failed. Has anyone seen this?" },
  { id:2, category:"howto",   title:"How I fixed Nginx 502 Bad Gateway in 5 minutes using SimpleLogz", profiles:{name:"Marcus T."}, created_at:new Date(Date.now()-18000000).toISOString(), views:156, forum_comments:[{},{},{},...Array(5)], body:"Had a nasty 502 that stumped me for an hour. Pasted the Nginx error log into SimpleLogz and got the exact upstream connection issue in seconds." },
  { id:3, category:"tips",    title:"Pro tip: prefix your logs with severity levels for better AI analysis", profiles:{name:"Priya K."}, created_at:new Date(Date.now()-86400000).toISOString(), views:489, forum_comments:[...Array(22)], body:"One thing I noticed is that adding structured severity prefixes to your logs massively improves the AI analysis quality." },
  { id:4, category:"errors",  title:"Postgres max_connections error under load — solved", profiles:{name:"Alex R."}, created_at:new Date(Date.now()-172800000).toISOString(), views:712, forum_comments:[...Array(31)], body:"We kept hitting max_connections on our Postgres RDS instance during peak hours. After running the log through SimpleLogz, the fix was clear: PgBouncer." },
  { id:5, category:"general", title:"What log formats do you wish SimpleLogz supported?", profiles:{name:"Community Team"}, created_at:new Date(Date.now()-259200000).toISOString(), views:890, forum_comments:[...Array(45)], body:"We are expanding our log format support. What systems are you dealing with that we don't yet cover? Drop them below." },
];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
  if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`; return `${d}d ago`;
}
function avatarColor(name="?") {
  const c=["#4f8ef7","#a78bfa","#34d399","#f87171","#fbbf24","#fb923c"];
  let h=0; for(let i=0;i<name.length;i++)h=name.charCodeAt(i)+((h<<5)-h);
  return c[Math.abs(h)%c.length];
}

export default function Forum() {
  const { isLoggedIn, getToken } = useAuth();
  const { showToast } = useToast();
  const [threads,    setThreads]    = useState(SEED_THREADS);
  const [category,   setCategory]   = useState("all");
  const [search,     setSearch]     = useState("");
  const [view,       setView]       = useState("list"); // list | thread | new
  const [activeThread, setActiveThread] = useState(null);
  const [comment,    setComment]    = useState("");
  const [newTitle,   setNewTitle]   = useState("");
  const [newBody,    setNewBody]    = useState("");
  const [newCat,     setNewCat]     = useState("general");
  const [posting,    setPosting]    = useState(false);

  // Try to load from API, silently fall back to seed data
  useEffect(() => {
    api.getThreads({ category: category === "all" ? "" : category, search })
      .then(({ threads }) => { if (threads?.length) setThreads(threads); })
      .catch(() => {});
  }, [category, search]);

  const filtered = threads.filter(t => {
    if (category !== "all" && t.category !== category) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function openThread(t) {
    try {
      const { thread } = await api.getThread(t.id);
      setActiveThread(thread);
    } catch {
      setActiveThread({ ...t, forum_comments: [] });
    }
    setView("thread");
  }

  async function submitComment() {
    if (!comment.trim()) return;
    if (!isLoggedIn) { showToast("Sign in to comment", "error"); return; }
    setPosting(true);
    try {
      const token = await getToken();
      await api.createComment(activeThread.id, { body: comment }, token);
      showToast("Reply posted ✓", "success");
      setComment("");
    } catch {
      showToast("Could not post reply — backend not connected yet", "error");
    } finally { setPosting(false); }
  }

  async function submitThread() {
    if (!newTitle.trim() || !newBody.trim()) { showToast("Fill in title and content", "error"); return; }
    if (!isLoggedIn) { showToast("Sign in to post", "error"); return; }
    setPosting(true);
    try {
      const token = await getToken();
      await api.createThread({ title: newTitle, body: newBody, category: newCat }, token);
      setThreads(prev => [{ id: Date.now(), title: newTitle, body: newBody, category: newCat, profiles: { name: "You" }, created_at: new Date().toISOString(), views: 1, forum_comments: [] }, ...prev]);
      showToast("Post published ✓", "success");
      setView("list"); setNewTitle(""); setNewBody("");
    } catch {
      showToast("Could not post — backend not connected yet", "error");
    } finally { setPosting(false); }
  }

  if (view === "thread" && activeThread) {
    return (
      <div className={styles.page}>
        <div className="container" style={{paddingTop:24,paddingBottom:48}}>
          <button className={styles.back} onClick={()=>setView("list")}>← Back to forum</button>
          <div className="card" style={{marginBottom:16}}>
            <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
              <div className={styles.avatar} style={{background:avatarColor(activeThread.profiles?.name)}}>
                {(activeThread.profiles?.name||"?")[0]}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:22,fontWeight:700,marginBottom:8}}>{activeThread.title}</div>
                <div style={{fontSize:13,color:"var(--t3)",marginBottom:14}}>{activeThread.profiles?.name} · {timeAgo(activeThread.created_at)} · <span className="badge badge-gray">{activeThread.category}</span></div>
                <div style={{fontSize:15,lineHeight:1.8}}>{activeThread.body}</div>
              </div>
            </div>
          </div>

          <div style={{fontSize:16,fontWeight:600,marginBottom:12}}>Replies ({(activeThread.forum_comments||[]).length})</div>
          {(activeThread.forum_comments||[]).map((c, i) => (
            <div key={c.id||i} className="card" style={{marginBottom:10}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                <div className={styles.avatarSm} style={{background:avatarColor(c.profiles?.name||"User")}}>{(c.profiles?.name||"U")[0]}</div>
                <span style={{fontWeight:600,fontSize:14}}>{c.profiles?.name||"Community Member"}</span>
                <span style={{fontSize:12,color:"var(--t3)"}}>{c.created_at ? timeAgo(c.created_at) : ""}</span>
              </div>
              <div style={{fontSize:14,lineHeight:1.7}}>{c.body||"…"}</div>
            </div>
          ))}

          <div style={{marginTop:20}}>
            <div style={{fontWeight:600,marginBottom:10}}>Add a reply</div>
            {!isLoggedIn ? (
              <div className={styles.gateBox}>Sign in to join the conversation. <a href="/login">Sign in →</a></div>
            ) : (
              <>
                <textarea className="form-input" rows={4} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your experience or solution…"/>
                <button className="btn btn-primary" style={{marginTop:10}} onClick={submitComment} disabled={posting}>
                  {posting ? <><span className="spinner"/>Posting…</> : "Post reply"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === "new") {
    return (
      <div className={styles.page}>
        <div className="container" style={{paddingTop:24,paddingBottom:48,maxWidth:720}}>
          <button className={styles.back} onClick={()=>setView("list")}>← Back</button>
          <h1 style={{fontSize:24,fontWeight:700,marginBottom:6}}>New Post</h1>
          <p style={{color:"var(--t2)",fontSize:14,marginBottom:24}}>Share an error, tip, or question with the community.</p>
          <div className="card" style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. How I fixed Kubernetes OOMKilled errors"/></div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={newCat} onChange={e=>setNewCat(e.target.value)}>
                <option value="errors">Error Reports</option>
                <option value="howto">How-To Guide</option>
                <option value="tips">Tips & Tricks</option>
                <option value="general">General Discussion</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Content</label><textarea className="form-input" rows={8} value={newBody} onChange={e=>setNewBody(e.target.value)} placeholder="Describe your error, solution, or question in detail…"/></div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-primary" onClick={submitThread} disabled={posting}>
                {posting ? <><span className="spinner"/>Publishing…</> : "Publish post"}
              </button>
              <button className="btn btn-outline" onClick={()=>setView("list")}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sideLabel}>Categories</div>
            {CATEGORIES.map(c => (
              <button key={c.id} className={`${styles.catBtn} ${category===c.id?styles.catActive:""}`} onClick={()=>setCategory(c.id)}>{c.label}</button>
            ))}
            <div style={{borderTop:"1px solid var(--border)",margin:"10px 0"}}/>
            <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",fontSize:13}} onClick={()=>isLoggedIn?setView("new"):showToast("Sign in to post","error")}>+ New Post</button>
          </aside>

          <div>
            <div className={styles.forumHeader}>
              <div>
                <h1 style={{fontSize:22,fontWeight:700}}>Community Forum</h1>
                <p style={{fontSize:14,color:"var(--t2)",marginTop:4}}>Share errors, get help, help others.</p>
              </div>
              <input className="form-input" style={{width:220,padding:"7px 12px",fontSize:13}} placeholder="Search posts…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>

            <div className={styles.threadList}>
              {filtered.length === 0 && <div className={styles.empty}>No posts found.</div>}
              {filtered.map(t => (
                <div key={t.id} className={styles.thread} onClick={()=>openThread(t)}>
                  <div className={styles.avatar} style={{background:avatarColor(t.profiles?.name)}}>{(t.profiles?.name||"?")[0]}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className={styles.threadTitle}>{t.title}</div>
                    <div className={styles.threadMeta}>
                      <span>{t.profiles?.name}</span>
                      <span>·</span>
                      <span>{timeAgo(t.created_at)}</span>
                      <span className="badge badge-gray">{t.category}</span>
                    </div>
                  </div>
                  <div className={styles.threadStats}>
                    <span>💬 {(t.forum_comments||[]).length}</span>
                    <span>👁 {t.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
