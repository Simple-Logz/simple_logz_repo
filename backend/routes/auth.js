import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// POST /api/auth/sync
// Called by frontend after OAuth login to ensure profile exists in DB
router.post("/sync", requireAuth, async (req, res) => {
  const { id, email, user_metadata } = req.user;
  const name = user_metadata?.full_name || user_metadata?.name || email.split("@")[0];
  const avatar = user_metadata?.avatar_url || null;

  // Upsert profile
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id,
      email,
      name,
      avatar,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Profile sync error:", error);
    return res.status(500).json({ error: "Failed to sync profile" });
  }

  res.json({ success: true, profile: data });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, avatar, plan, created_at")
    .eq("id", req.user.id)
    .single();

  if (error) return res.status(404).json({ error: "Profile not found" });
  res.json({ profile: data });
});

export default router;
