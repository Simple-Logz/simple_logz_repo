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

function FileAttachment({ url }) {
  if (!url) return null;
  let fileName = url.split("/").pop().split("?")[0];
  // Decode %20 etc.
  try { fileName = decodeURIComponent(fileName); } catch {}

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
  const [comment,  setComment]  = useState("");
  const [commenting, setCommenting] = useState(false);

  // New post state
  const [newTitle,    setNewTitle]    = useState("");
  const [newBody,     setNewBody]     = useState("");
  const [newCat,      setNewCat]      = useState("general");
  const [newFile,     setNewFile]     = useState(null);
  const [newFilePreview, setNewFilePreview] = useState(null);
  const [posting,     setPosting]     = useState(false);
  const fileInputRef  = useRef(null);
  const commentFileRef = useRef(null);

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
    if (!comment.trim()) return;
    setCommenting(true);
    try {
      const token = await getToken();
      const { comment: newComment } = await api.createComment(activeThread.id, { body: comment }, token);
      setActiveThread(prev => ({
        ...prev,
        forum_comments: [...(prev.forum_comments || []), newComment],
      }));
      setComment("");
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
    setNewFilePreview(file.name);
  }

  function removeFile() {
    setNewFile(null);
    setNewFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
  }

  // ── THREAD