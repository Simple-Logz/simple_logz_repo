import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// GET /api/testimonials — public, returns approved only
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, role, company, quote, tags, icon, icon_bg, avatar_color, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ testimonials: data });
});

// POST /api/testimonials — authenticated users submit
router.post("/", requireAuth, async (req, res) => {
  const { name, role, company, quote, tags } = req.body;

  if (!quote || quote.trim().length < 20)
    return res.status(400).json({ error: "Quote must be at least 20 characters." });
  if (!name || !name.trim())
    return res.status(400).json({ error: "Name is required." });

  // Check if user already submitted one (pending or approved)
  const { data: existing } = await supabase
    .from("testimonials")
    .select("id")
    .eq("user_id", req.user.id)
    .limit(1);

  if (existing && existing.length > 0)
    return res.status(400).json({ error: "You have already submitted a testimonial. We'll review it shortly." });

  const COLORS = ["#6c5ce7","#00b894","#e17055","#0984e3","#fd79a8","#fdcb6e","#a29bfe","#55efc4"];
  const ICONS  = ["⚡","🔍","🛡️","📋","🚀","💡","🔧","🌙"];
  const BGSB   = [
    "linear-gradient(135deg,#6c5ce7,#a29bfe)",
    "linear-gradient(135deg,#00b894,#55efc4)",
    "linear-gradient(135deg,#e17055,#fab1a0)",
    "linear-gradient(135deg,#0984e3,#74b9ff)",
  ];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const { data, error } = await supabase
    .from("testimonials")
    .insert({
      user_id:      req.user.id,
      name:         name.trim(),
      role:         (role || "").trim(),
      company:      (company || "").trim(),
      quote:        quote.trim(),
      tags:         Array.isArray(tags) ? tags.slice(0, 3) : [],
      icon:         pick(ICONS),
      icon_bg:      pick(BGSB),
      avatar_color: pick(COLORS),
      approved:     false,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, testimonial: data });
});

export default router;
