import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { api } from "../lib/api.js";
import { uploadToStorage } from "../lib/supabase.js";
import styles from "./Forum.module.css";

const CATEGORIES = [
  { id:"all",     label:"All Posts" },
  { id:"errors",  label:"Error Reports" },
  { id:"howto",   label:"How-To Guides" },
  { id:"tips",    label:"Tips & Tricks" },
  { id:"general", label:"General Discussion" },
];

const CAT_COLORS = {
  errors:  { bg:"rgba(248,113,113,.12)", color:"#f87171" },
  howto:   { bg:"rgba(52,211,153,.12)",  color:"#34d399" },
  tips:    { bg:"rgba(251,191,36,.12)",  color:"#fbbf24" },
  general: { bg:"rgba(79,142,247,.12)",  color:"#4f8ef7" },
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function avatarColor(name = "?") {
  const c = ["#4f8ef7","#a78bfa","#34d399","#f87171","#fbbf24","#fb923c"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return c[Math.abs(h) % c.length];
}

function AvatarCircle({ name, src, size = 38 }) {
  const bg = avatarColor(name || "?");
  const initial = (name || "?")[0].toUpperCase();
  const fontSize = size < 32 ? 12 : 14;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: src ? "transparent" : bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize, color: "#fff", overflow: "hidden",
    }}>
      {src
        ? <img src={src} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        : initial
      }
    </div>
  );
}

function CategoryBadge({ cat }) {
  const s = CAT_COLORS[cat] || { bg:"var(--bg3)", color:"var(--t2)" };
  return (
    <span style={{
      display:"inline-block", padding:"2px 8px", borderRadius:6, fontSize:11,
      fontWeight:600, letterSpacing:.3, background:s.bg, color:s.color,
    }}>
      {cat}
    </span>
  );
}

// Render text with clickable URLs
function BodyText({ text }) {
  if (!text) return null;
  const urlRe = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRe);
  return (
    <div style={{fontSize:15,lineHeight:1.85,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
      {parts.map((part, i) =>
        urlRe.test(part)
          ? <a key={i} href={part} target="_blank" rel="noopener noreferrer"
              style={{color:"var(--accent)",wordBreak:"break-all"}}>{part}</a>
          : part
      )}
    </div>
  );
}

// Render image or generic file attachment
function FileAttachment({ url }) {
  if (!url) return null;
  let fileName = url.split("/").pop().split("?")[0];
  try { fileName = decodeURIComponent(fileName); } catch {}

  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName);

  if (isImage) {
    return (
      <div style={{marginTop:12}}>
        <img
          src={url}
          alt="attachment"
          style={{
            maxWidth:"100%", maxHeight:400, borderRadius:10,
            border:"1px solid var(--border)", display:"block",
          }}
        />
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download
      style={{
        display:"inline-flex", alignItems:"center", gap:8,
        padding:"8px 14px", borderRadius:8,
        background:"var(--bg3)", border:"1px solid var(--border)",
        fontSize:13, color:"var(--t1)", textDecoration:"none",
        marginTop:14, transition:"border-color .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor="var(--accent)"}
      onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}
    >
      <IconFile/>
      <span style={{maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fileName}</span>
      <span style={{color:"var(--t3)",fontSize:12,marginLeft:"auto"}}>Download</span>
    </a>
  );
}

// Icons
function IconFile()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function IconMsg()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function IconEye()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function IconX()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function IconTrash() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>; }
function IconPaperclip() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>; }
function IconImage() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }

export default function Forum() {
  const { isLoggedIn, getToken, user, profile } = useAuth();
  const { showToast } = useToast();

  // List state
  const [threads,   setThreads]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState("all");
  const [search,    setSearch]    = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimer = useRef(null);

  // View state: "list" | "thread" | "new"
  const [view,         setView]         = useState("list");
  const [activeThread, setActiveThread] = useState(null);
  const [threadLoading,setThreadLoading]= useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  // Reactions: { [commentId]: emoji } — tracks what THIS user reacted with
  const [myReactions, setMyReactions] = useState({});

  // Comment state
  const [comment,      setComment]      = useState("");
  const [commenting,   setCommenting]   = useState(false);
  const [commentFile,  setCommentFile]  = useState(null);
  const [commentPreview, setCommentPreview] = useState(null);
  const commentFileRef = useRef(null);

  // New post state
  const [newTitle,    setNewTitle]    = useState("");
  const [newBody,     setNewBody]     = useState("");
  const [newCat,      setNewCat]      = useState("general");
  const [newFile,     setNewFile]     = useState(null);
  const [newFilePreview, setNewFilePreview] = useState(null);
  const [posting,     setPosting]     = useState(false);
  const fileInputRef  = useRef(null);

  // ── Load threads ─────────────────────────────────────────────
  useEffect(() => {
    loadThreads();
  }, [category, search]);

  async function loadThreads() {
    setLoading(true);
    try {
      const params = {};
      if (category !== "all") params.category = category;
      if (search) params.search = search;
      const { threads: data } = await api.getThreads(params);
      setThreads(data || []);
    } catch (err) {
      showToast("Could not load posts", "error");
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchInput(e) {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 400);
  }

  // ── Open thread ───────────────────────────────────────────────
  async function openThread(t) {
    setView("thread");
    setActiveThread(null);
    setThreadLoading(true);
    try {
      const { thread } = await api.getThread(t.id);
      setActiveThread(thread);
    } catch {
      showToast("Could not load thread", "error");
      setView("list");
    } finally {
      setThreadLoading(false);
    }
  }

  // ── Submit comment ────────────────────────────────────────────
  async function submitComment() {
    if (!comment.trim() && !commentFile) return;
    setCommenting(true);
    try {
      const token = await getToken();
      let fileUrl = null;
      if (commentFile && user?.id) {
        const safeName = commentFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const uploadPath = `${user.id}/${Date.now()}-${safeName}`;
        fileUrl = await uploadToStorage("forum-files", uploadPath, commentFile);
      }
      const { comment: newComment } = await api.createComment(
        activeThread.id, { body: comment, file_url: fileUrl }, token
      );
      setActiveThread(prev => ({
        ...prev,
        forum_comments: [...(prev.forum_comments || []), newComment],
      }));
      setComment("");
      setCommentFile(null);
      setCommentPreview(null);
      if (commentFileRef.current) commentFileRef.current.value = "";
      showToast("Reply posted", "success");
    } catch (err) {
      showToast(err.message || "Could not post reply", "error");
    } finally {
      setCommenting(false);
    }
  }

  // ── File pick for new post ────────────────────────────────────
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { showToast("File must be under 20MB", "error"); return; }
    setNewFile(file);
    const isImg = file.type.startsWith("image/");
    setNewFilePreview(isImg ? URL.createObjectURL(file) : file.name);
  }

  function removeFile() {
    setNewFile(null);
    setNewFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── File pick for comment image ───────────────────────────────
  function handleCommentFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Only images are supported in replies", "error"); return; }
    if (file.size > 10 * 1024 * 1024) { showToast("Image must be under 10MB", "error"); return; }
    setCommentFile(file);
    setCommentPreview(URL.createObjectURL(file));
  }

  function removeCommentFile() {
    setCommentFile(null);
    setCommentPreview(null);
    if (commentFileRef.current) commentFileRef.current.value = "";
  }

  // ── Submit new thread ─────────────────────────────────────────
  async function submitThread() {
    if (!newTitle.trim()) { showToast("Title is required", "error"); return; }
    if (!newBody.trim())  { showToast("Content is required", "error"); return; }
    setPosting(true);
    try {
      const token = await getToken();
      let fileUrl = null;

      if (newFile && user?.id) {
        const ext = newFile.name.split(".").pop() || "bin";
        const safeName = newFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const uploadPath = `${user.id}/${Date.now()}-${safeName}`;
        fileUrl = await uploadToStorage("forum-files", uploadPath, newFile);
      }

      const { thread } = await api.createThread(
        { title: newTitle.trim(), body: newBody.trim(), category: newCat, file_url: fileUrl },
        token
      );

      setThreads(prev => [thread, ...prev]);
      showToast("Post published", "success");
      setView("list");
      setNewTitle(""); setNewBody(""); setNewCat("general");
      setNewFile(null); setNewFilePreview(null);
    } catch (err) {
      showToast(err.message || "Could not publish post", "error");
    } finally {
      setPosting(false);
    }
  }

  // ── React to comment ─────────────────────────────────────────
  async function reactToComment(commentId, emoji) {
    if (!isLoggedIn) { showToast("Sign in to react", "error"); return; }
    const prev = myReactions[commentId];
    const isSame = prev === emoji;

    // Optimistic local update
    setMyReactions(r => {
      const next = { ...r };
      if (isSame) delete next[commentId];
      else next[commentId] = emoji;
      return next;
    });
    setActiveThread(t => ({
      ...t,
      forum_comments: t.forum_comments.map(c =>
        c.id === commentId
          ? { ...c, likes: Math.max(0, (c.likes || 0) + (isSame ? -1 : prev ? 0 : 1)) }
          : c
      ),
    }));

    if (!isSame) {
      try {
        const token = await getToken();
        await api.likeComment(commentId, token);
      } catch {}
    }
  }

  // ── Delete thread ─────────────────────────────────────────────
  async function deleteThread(threadId, e) {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setDeletingId(threadId);
    try {
      const token = await getToken();
      await api.deleteThread(threadId, token);
      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (view === "thread") goList();
      showToast("Post deleted", "success");
    } catch (err) {
      showToast(err.message || "Could not delete post", "error");
    } finally {
      setDeletingId(null);
    }
  }

  function goList() {
    setView("list");
    setActiveThread(null);
    setComment("");
    setCommentFile(null);
    setCommentPreview(null);
  }

  // ── THREAD DETAIL VIEW ────────────────────────────────────────
  if (view === "thread") {
    return (
      <div className={styles.page}>
        <div className="container" style={{paddingTop:24,paddingBottom:60,maxWidth:780}}>
          <button className={styles.back} onClick={goList}>← Back to forum</button>

          {threadLoading ? (
            <div style={{display:"flex",justifyContent:"center",padding:"60px 0"}}>
              <span className="spinner" style={{width:28,height:28,borderWidth:3}}/>
            </div>
          ) : activeThread ? (
            <>
              {/* Thread body */}
              <div className="card" style={{marginBottom:16}}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <AvatarCircle name={activeThread.profiles?.name} src={activeThread.profiles?.avatar} size={42}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                      <div style={{fontSize:22,fontWeight:700,lineHeight:1.3,flex:1}}>{activeThread.title}</div>
                      {isLoggedIn && user?.id === activeThread.profiles?.id && (
                        <button
                          onClick={(e) => deleteThread(activeThread.id, e)}
                          disabled={deletingId === activeThread.id}
                          title="Delete post"
                          style={{
                            display:"flex",alignItems:"center",gap:5,padding:"6px 10px",
                            borderRadius:7,border:"1px solid rgba(248,113,113,.25)",
                            background:"rgba(248,113,113,.08)",color:"var(--red)",
                            cursor:"pointer",fontSize:12,fontWeight:500,flexShrink:0,marginTop:2,
                          }}
                        >
                          <IconTrash/> {deletingId === activeThread.id ? "Deleting…" : "Delete"}
                        </button>
                      )}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",fontSize:13,color:"var(--t3)",marginBottom:16}}>
                      <span style={{fontWeight:600,color:"var(--t2)"}}>{activeThread.profiles?.name}</span>
                      <span>·</span>
                      <span>{timeAgo(activeThread.created_at)}</span>
                      <span>·</span>
                      <CategoryBadge cat={activeThread.category}/>
                      <span style={{marginLeft:"auto"}}>{activeThread.views} views</span>
                    </div>
                    <BodyText text={activeThread.body}/>
                    {activeThread.file_url && (
                      <FileAttachment url={activeThread.file_url}/>
                    )}
                  </div>
                </div>
              </div>

              {/* Replies */}
              <div style={{fontSize:15,fontWeight:600,marginBottom:14,color:"var(--t2)"}}>
                {(activeThread.forum_comments || []).length} {(activeThread.forum_comments || []).length === 1 ? "reply" : "replies"}
              </div>

              {(activeThread.forum_comments || []).length === 0 && (
                <div style={{textAlign:"center",padding:"32px 0",color:"var(--t3)",fontSize:14}}>
                  No replies yet — be the first to respond.
                </div>
              )}

              {(activeThread.forum_comments || []).map((c, i) => (
                <div key={c.id || i} className="card" style={{marginBottom:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
                    <AvatarCircle name={c.profiles?.name} src={c.profiles?.avatar} size={30}/>
                    <span style={{fontWeight:600,fontSize:14}}>{c.profiles?.name || "Member"}</span>
                    <span style={{fontSize:12,color:"var(--t3)"}}>{timeAgo(c.created_at)}</span>
                  </div>
                  <BodyText text={c.body}/>
                  {c.file_url && <FileAttachment url={c.file_url}/>}
                  {/* Reactions row */}
                  <div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap",alignItems:"center"}}>
                    {[
                      { emoji:"👍", label:"Like"    },
                      { emoji:"❤️",  label:"Love"    },
                      { emoji:"😂", label:"Haha"    },
                      { emoji:"😮", label:"Wow"     },
                      { emoji:"😢", label:"Sad"     },
                      { emoji:"👎", label:"Dislike" },
                    ].map(({ emoji, label }) => {
                      const active = myReactions[c.id] === emoji;
                      return (
                        <button
                          key={emoji}
                          onClick={() => reactToComment(c.id, emoji)}
                          title={label}
                          style={{
                            display:"flex", alignItems:"center", gap:4,
                            padding:"4px 9px", borderRadius:20, fontSize:15,
                            background: active ? "rgba(79,142,247,.15)" : "var(--bg3)",
                            border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                            cursor:"pointer", transition:"all .15s",
                            color: active ? "var(--accent)" : "var(--t1)",
                          }}
                        >
                          <span>{emoji}</span>
                          {emoji === "👍" && (c.likes || 0) > 0 && (
                            <span style={{fontSize:11,color:active?"var(--accent)":"var(--t3)",fontWeight:600}}>
                              {c.likes}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Reply box */}
              <div style={{marginTop:24}}>
                <div style={{fontWeight:600,marginBottom:12}}>Leave a reply</div>
                {!isLoggedIn ? (
                  <div className={styles.gateBox}>
                    <a href="/login" style={{color:"var(--accent)"}}>Sign in</a> to join the conversation.
                  </div>
                ) : (
                  <>
                    <textarea
                      className="form-input"
                      rows={4}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your experience, solution, or question…"
                      style={{resize:"vertical"}}
                    />
                    {/* Image preview */}
                    {commentPreview && (
                      <div style={{marginTop:8,position:"relative",display:"inline-block"}}>
                        <img
                          src={commentPreview}
                          alt="preview"
                          style={{maxHeight:140,maxWidth:"100%",borderRadius:8,border:"1px solid var(--border)",display:"block"}}
                        />
                        <button
                          onClick={removeCommentFile}
                          style={{
                            position:"absolute",top:4,right:4,
                            background:"rgba(0,0,0,.6)",border:"none",borderRadius:"50%",
                            width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",
                            cursor:"pointer",color:"#fff",padding:0,
                          }}
                        >
                          <IconX/>
                        </button>
                      </div>
                    )}
                    <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => commentFileRef.current?.click()}
                        style={{display:"flex",alignItems:"center",gap:6}}
                        title="Attach image (PNG, JPEG, GIF, WebP)"
                      >
                        <IconImage/> Image
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={submitComment}
                        disabled={commenting || (!comment.trim() && !commentFile)}
                      >
                        {commenting ? <><span className="spinner"/>Posting…</> : "Post reply"}
                      </button>
                    </div>
                    <input
                      ref={commentFileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      style={{display:"none"}}
                      onChange={handleCommentFileSelect}
                    />
                  </>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  // ── NEW POST VIEW ─────────────────────────────────────────────
  if (view === "new") {
    const newIsImage = newFile && newFile.type.startsWith("image/");
    return (
      <div className={styles.page}>
        <div className="container" style={{paddingTop:24,paddingBottom:60,maxWidth:740}}>
          <button className={styles.back} onClick={() => setView("list")}>← Back</button>
          <h1 style={{fontSize:24,fontWeight:700,marginBottom:6}}>New Post</h1>
          <p style={{color:"var(--t2)",fontSize:14,marginBottom:24}}>Share an error, tip, question, or solution with the community.</p>

          <div className="card" style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Give your post a clear, descriptive title"
                maxLength={150}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={newCat} onChange={e => setNewCat(e.target.value)}>
                <option value="errors">Error Reports</option>
                <option value="howto">How-To Guide</option>
                <option value="tips">Tips &amp; Tricks</option>
                <option value="general">General Discussion</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                className="form-input"
                rows={9}
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                placeholder="Describe your error, solution, or question. URLs will automatically become clickable links."
                style={{resize:"vertical"}}
              />
            </div>

            {/* File / image attachment */}
            <div className="form-group">
              <label className="form-label">Attachment <span style={{color:"var(--t3)",fontWeight:400}}>(optional, up to 20MB)</span></label>
              {newFilePreview ? (
                newIsImage ? (
                  <div style={{position:"relative",display:"inline-block"}}>
                    <img
                      src={newFilePreview}
                      alt="preview"
                      style={{maxHeight:200,maxWidth:"100%",borderRadius:10,border:"1px solid var(--border)",display:"block"}}
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      style={{
                        position:"absolute",top:6,right:6,
                        background:"rgba(0,0,0,.6)",border:"none",borderRadius:"50%",
                        width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",
                        cursor:"pointer",color:"#fff",padding:0,
                      }}
                    >
                      <IconX/>
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                    borderRadius:8,background:"var(--bg3)",border:"1px solid var(--border)",fontSize:13,
                  }}>
                    <IconFile/>
                    <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{newFilePreview}</span>
                    <button
                      type="button"
                      onClick={removeFile}
                      style={{background:"none",border:"none",cursor:"pointer",color:"var(--t3)",padding:2,display:"flex"}}
                    >
                      <IconX/>
                    </button>
                  </div>
                )
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  style={{alignSelf:"flex-start",display:"flex",alignItems:"center",gap:6}}
                >
                  <IconPaperclip/> Attach file or image
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,.pdf,.txt,.log,.csv,.zip"
                style={{display:"none"}}
                onChange={handleFileSelect}
              />
            </div>

            <div style={{display:"flex",gap:10,paddingTop:4}}>
              <button
                className="btn btn-primary"
                onClick={submitThread}
                disabled={posting || !newTitle.trim() || !newBody.trim()}
              >
                {posting ? <><span className="spinner"/>Publishing…</> : "Publish post"}
              </button>
              <button className="btn btn-outline" onClick={() => setView("list")}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sideLabel}>Categories</div>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                className={`${styles.catBtn} ${category === c.id ? styles.catActive : ""}`}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
            <div style={{borderTop:"1px solid var(--border)",margin:"12px 0"}}/>
            <button
              className="btn btn-primary"
              style={{width:"100%",justifyContent:"center",fontSize:13}}
              onClick={() => isLoggedIn ? setView("new") : showToast("Sign in to post", "error")}
            >
              + New Post
            </button>
          </aside>

          {/* Main */}
          <div>
            <div className={styles.forumHeader}>
              <div>
                <h1 style={{fontSize:22,fontWeight:700}}>Community Forum</h1>
                <p style={{fontSize:14,color:"var(--t2)",marginTop:4}}>Share errors, tips, and solutions with other developers.</p>
              </div>
              <input
                className="form-input"
                style={{width:220,padding:"7px 12px",fontSize:13}}
                placeholder="Search posts…"
                value={searchInput}
                onChange={handleSearchInput}
              />
            </div>

            {loading ? (
              <div style={{display:"flex",justifyContent:"center",padding:"60px 0"}}>
                <span className="spinner" style={{width:28,height:28,borderWidth:3}}/>
              </div>
            ) : threads.length === 0 ? (
              <div className={styles.empty}>
                {search
                  ? `No posts matching "${search}".`
                  : category !== "all"
                    ? "No posts in this category yet. Be the first to post!"
                    : "No posts yet. Start the conversation!"
                }
                {isLoggedIn && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{marginTop:14,display:"block",margin:"14px auto 0"}}
                    onClick={() => setView("new")}
                  >
                    + New Post
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.threadList}>
                {threads.map(t => (
                  <div key={t.id} className={styles.thread} onClick={() => openThread(t)}>
                    <AvatarCircle name={t.profiles?.name} src={t.profiles?.avatar} size={40}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div className={styles.threadTitle}>
                        {t.title}
                        {t.file_url && (
                          <span style={{marginLeft:8,color:"var(--t3)",verticalAlign:"middle",display:"inline-flex"}}>
                            <IconPaperclip/>
                          </span>
                        )}
                      </div>
                      <div className={styles.threadMeta}>
                        <span style={{fontWeight:500,color:"var(--t2)"}}>{t.profiles?.name}</span>
                        <span>·</span>
                        <span>{timeAgo(t.created_at)}</span>
                        <CategoryBadge cat={t.category}/>
                      </div>
                    </div>
                    <div className={styles.threadStats}>
                      <span style={{display:"flex",alignItems:"center",gap:4}}>
                        <IconMsg/>
                        {Array.isArray(t.forum_comments)
                          ? t.forum_comments[0]?.count ?? t.forum_comments.length
                          : 0}
                      </span>
                      <span style={{display:"flex",alignItems:"center",gap:4}}>
                        <IconEye/>{t.views || 0}
                      </span>
                      {isLoggedIn && user?.id === t.profiles?.id && (
                        <button
                          onClick={(e) => deleteThread(t.id, e)}
                          disabled={deletingId === t.id}
                          title="Delete post"
                          style={{
                            display:"flex",alignItems:"center",padding:"4px 6px",
                            borderRadius:6,border:"none",background:"transparent",
                            color:"var(--t3)",cursor:"pointer",
                          }}
                          onMouseEnter={e => e.currentTarget.style.color="var(--red)"}
                          onMouseLeave={e => e.currentTarget.style.color="var(--t3)"}
                        >
                          <IconTrash/>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
