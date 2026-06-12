import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

// ── Helpers ──────────────────────────────────────────────────
async function getUserPlan(userId) {
  const { data } = await supabase.from("profiles").select("plan").eq("id", userId).single();
  return data?.plan || "free";
}

// GET /api/projects — list user's projects
router.get("/", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*, analyses(count)")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ projects: data });
});

// POST /api/projects — create project
router.post("/", requireAuth, async (req, res) => {
  const { name, description, stack } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Project name is required." });

  const plan = await getUserPlan(req.user.id);

  // Free plan: no projects allowed
  if (plan !== "developer") {
    return res.status(403).json({
      error: "Projects are a Developer plan feature. Upgrade to create unlimited project workspaces.",
      upgrade: true,
    });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id:     req.user.id,
      name:        name.trim(),
      description: description?.trim() || null,
      stack:       stack || [],
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ project: data });
});

// GET /api/projects/:id — get single project + recent analyses
router.get("/:id", requireAuth, async (req, res) => {
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .single();

  if (error || !project) return res.status(404).json({ error: "Project not found." });

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, title, severity, source, created_at")
    .eq("project_id", req.params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  res.json({ project, analyses: analyses || [] });
});

// PATCH /api/projects/:id — update project
router.patch("/:id", requireAuth, async (req, res) => {
  const { name, description, stack } = req.body;
  const { data, error } = await supabase
    .from("projects")
    .update({ name, description, stack, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ project: data });
});

// DELETE /api/projects/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;