import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config();

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the SimpleLogz support assistant — a helpful, concise AI built into the SimpleLogz app.

SimpleLogz is an AI-powered log analysis tool that helps developers and DevOps engineers understand error logs instantly. Key features:
- Paste any error log (Node.js, Python, Docker, Kubernetes, Nginx, AWS, etc.) and get an AI diagnosis
- Severity rating (CRITICAL / HIGH / MEDIUM / LOW), root cause analysis, and step-by-step resolution
- Projects workspace: organise analyses by application or service
- Community forum for sharing incidents and solutions
- Free plan: 2 analyses/day, 1 project. Developer plan: unlimited analyses and projects
- Pricing: Free plan is free, Developer plan is paid (check /pricing for current pricing)

Navigation:
- "/" or "Analyzer" — paste logs and run analysis
- "/projects" — create and manage project workspaces (requires login)
- "/forum" or "Community" — community discussions
- "/pricing" — plan comparison
- "/about" — about SimpleLogz
- "/support" — contact support (this page)
- "/login" and "/signup" — authentication

Your role: Answer questions about SimpleLogz features, help users navigate, explain how to use the tool, and troubleshoot common issues. Keep responses short and helpful — 1–3 sentences unless more detail is genuinely needed. Use plain language, no jargon. If you can't help with something, direct them to support@simplelogs.ai.`;

// POST /api/chat
router.post("/", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // Keep last 10 messages to avoid token bloat
  const trimmed = messages.slice(-10).map(m => ({
    role:    m.role === "assistant" ? "assistant" : "user",
    content: String(m.content).slice(0, 2000),
  }));

  try {
    const response = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system:     SYSTEM_PROMPT,
      messages:   trimmed,
    });

    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Chat unavailable. Please try again." });
  }
});

export default router;
