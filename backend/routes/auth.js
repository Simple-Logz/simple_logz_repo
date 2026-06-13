import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// POST /api/auth/sync
// Called by frontend after OAuth login to ensure profile exists in DB
router.post("/sync", requireAuth, async (req, res) => {
  const { id, email, user_metadata } = req.user;
  const oauthName   = user_metadata?.full_name || user_metadata?.name || email.split("@")[0];
  const oauthAvatar = user_metadata?.avatar_url || null;

  // Check if profile already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  let data, error;

  if (existing) {
    // Profile exists — only refresh email/timestamp.
    // NEVER overwrite avatar or name the user has customised.
    ({ data, error } = await supabase
      .from("profiles")
      .update({ email, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single());
  } else {
    // First login — create profile with OAuth defaults.
    ({ data, error } = await supabase
      .from("profiles")
      .insert({
        id,
        email,
        name:   oauthName,
        avatar: oauthAvatar,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single());
  }

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
