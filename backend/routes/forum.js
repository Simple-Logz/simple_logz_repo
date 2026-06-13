import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { forumLimiter } from "../middleware/rateLimit.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// GET /api/forum/threads?category=&search=&page=
router.get("/threads", optionalAuth, async (req, res) => {
  const { category, search, page = 1 } = req.query;
  const limit  = 20;
  const offset = (parseInt(page) - 1) * limit;

  let query = supabase
    .from("forum_threads")
    .select(`
      id, title, category, created_at, views, is_pinned,
      profiles:user_id (id, name, avatar),
      forum_comments(count)
    `, { count: "exact" })
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== "all") query = query.eq("category", category);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });

  res.json({ threads: data, total: count, page: parseInt(page), limit });
});

// GET /api/forum/threads/:id
router.get("/threads/:id", optionalAuth, async (req, res) => {
  const { id } = req.params;

  // Increment view count
  await supabase.rpc("increment_thread_views", { thread_id: id });

  const { data: thread, error } = await supabase
    .from("forum_threads")
    .select(`
      id, title, body, category, created_at, views, file_url,
      profiles:user_id (id, name, avatar),
      forum_comments (
        id, body, created_at, likes,
        profiles:user_id (id, name, avatar)
      )
    `)
    .eq("id", id)
    .order("created_at", { foreignTable: "forum_comments", ascending: true })
    .single();

  if (error) return res.status(404).json({ error: "Thread not found" });
  res.json({ thread });
});

// POST /api/forum/threads
router.post("/threads", forumLimiter, requireAuth, async (req, res) => {
  const { title, body, category, file_url } = req.body;
  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ error: "Title and body are required." });
  }

  const { data, error } = await supabase
    .from("forum_threads")
    .insert({ user_id: req.user.id, title: title.trim(), body: body.trim(), category: category || "general", file_url: file_url || null })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ thread: data });
});

// POST /api/forum/threads/:id/comments
router.post("/threads/:id/comments", forumLimiter, requireAuth, async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: "Comment body is required." });

  const { data, error } = await supabase
    .from("forum_comments")
    .insert({ thread_id: req.params.id, user_id: req.user.id, body: body.trim() })
    .select(`id, body, created_at, profiles:user_id (id, name, avatar)`)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ comment: data });
});

// DELETE /api/forum/threads/:id  (author only)
router.delete("/threads/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  // Verify ownership before deleting
  const { data: thread, error: fetchErr } = await supabase
    .from("forum_threads")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchErr || !thread) return res.status(404).json({ error: "Thread not found" });
  if (thread.user_id !== req.user.id) return res.status(403).json({ error: "Not your post" });

  // Delete comments first, then thread
  await supabase.from("forum_comments").delete().eq("thread_id", id);
  const { error } = await supabase.from("forum_threads").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
});

// POST /api/forum/comments/:id/like
router.post("/comments/:id/like", requireAuth, async (req, res) => {
  await supabase.rpc("increment_comment_likes", { comment_id: req.params.id });
  res.json({ success: true });
});

export default router;
