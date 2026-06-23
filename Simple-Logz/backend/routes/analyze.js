import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { analyzeLimiter } from "../middleware/rateLimit.js";
import { supabase } from "../lib/supabase.js";
import dotenv from "dotenv";
dotenv.config();

const router  = Router();
const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ââ Daily usage check for free plan ââââââââââââââââââââââââââ
async function getDailyUsage(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const { count } = await supabase
    .from("analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${today}T00:00:00`)
    .lte("created_at", `${today}T23:59:59`);
  return count || 0;
}

async function getUserPlan(userId) {
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();
  return data?.plan || "free";
}

// POST /api/analyze
router.post("/", analyzeLimiter, optionalAuth, async (req, res) => {
  const { log, source } = req.body;

  if (!log || typeof log !== "string" || log.trim().length < 5) {
    return res.status(400).json({ error: "Log content is required (min 5 characters)." });
  }
  if (log.length > 30000) {
    return res.status(400).json({ error: "Log exceeds 30,000 character limit." });
  }

  // ââ Plan enforcement ââââââââââââââââââââââââââââââââââââââââ
  if (req.user) {
    const plan = await getUserPlan(req.user.id);
    if (plan === "free") {
      const used = await getDailyUsage(req.user.id);
      if (used >= 2) {
        return res.status(429).json({
          error: "Daily limit reached (2/day on Free plan).",
          upgrade: true,
        });
      }
    }
  } else {
    // Anonymous users: 2 per day by IP tracked client-side only
    // For production, track by IP using Redis
  }

  const systemPrompt = `You are a senior DevOps/SRE engineer and log analysis expert. Analyze error logs and return precise, structured JSON. Be direct and actionable. Return ONLY valid JSON â no markdown fences, no preamble.`;

  const userPrompt = `Analyze this ${source !== "auto" ? source : "auto-detected"} log and return a JSON object with exactly these fields:
{
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "title": "short descriptive title (max 8 words)",
  "plain_english": "2-3 sentence plain English explanation of what went wrong and why",
  "root_cause_category": "one of: Network | Database | Memory | Configuration | Authentication | Dependency | Code Error | Infrastructure | Timeout | Permissions",
  "estimated_fix_time": "e.g. 5-10 minutes",
  "source_detected": "detected platform e.g. Kubernetes, Docker, Node.js, AWS Lambda, Nginx, Postgres",
  "resolution_steps": [
    { "step": 1, "action": "clear action description", "command": "exact CLI command or null" }
  ],
  "verification_commands": ["command to confirm fix worked"],
  "technical_context": "2-3 sentences of technical background for engineers",
  "related_errors": ["other errors commonly associated with this one"],
  "prevention": ["2-3 concrete prevention measures"],
  "confidence": "HIGH" | "MEDIUM" | "LOW"
}

Log:
\`\`\`
${log.trim()}
\`\`\``;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = message.content[0].text.trim()
      .replace(/^```json\n?/, "").replace(/\n?```$/, "");

    let analysis;
    try {
      analysis = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "AI returned unparseable response. Please retry." });
    }

    // ââ Save to DB if user is logged in ââââââââââââââââââââââââ
    if (req.user) {
      await supabase.from("analyses").insert({
        user_id:    req.user.id,
        log_snippet: log.slice(0, 500),
        severity:   analysis.severity,
        title:      analysis.title,
        source:     analysis.source_detected,
        result:     analysis,
      });
    }

    res.json({ success: true, analysis });

  } catch (err) {
    console.error("Anthropic error:", err.message);
    res.status(500).json({ error: "AI analysis failed. Check your API key." });
  }
});

export default router;
