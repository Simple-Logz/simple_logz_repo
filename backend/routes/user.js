import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// GET /api/user/history
router.get("/history", requireAuth, async (req, res) => {
  const { page = 1 } = req.query;
  const limit  = 20;
  const offset = (parseInt(page) - 1) * limit;

  const { data, error, count } = await supabase
    .from("analyses")
    .select("id, title, severity, source, created_at, log_snippet", { count: "exact" })
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ history: data, total: count });
});

// GET /api/user/usage
router.get("/usage", requireAuth, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const { count: dailyCount } = await supabase
    .from("analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", req.user.id)
    .gte("created_at", `${today}T00:00:00`);

  const { count: totalCount } = await supabase
    .from("analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", req.user.id);

  res.json({ daily: dailyCount || 0, total: totalCount || 0 });
});

// PATCH /api/user/profile
router.patch("/profile", requireAuth, async (req, res) => {
  const { name, avatar } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name is required." });

  const updateData = { name: name.trim(), updated_at: new Date().toISOString() };
  if (avatar !== undefined) updateData.avatar = avatar;

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ profile: data });
});

// POST /api/user/feedback  (no auth required — guests can send too)
router.post("/feedback", async (req, res) => {
  const { rating, label, note, url } = req.body;
  if (!label) return res.status(400).json({ error: "Rating label required." });
  const { error } = await supabase.from("feedback").insert({
    rating: rating || null,
    label,
    note: note || 