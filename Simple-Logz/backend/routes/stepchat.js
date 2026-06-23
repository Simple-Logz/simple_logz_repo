import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { optionalAuth } from "../middleware/auth.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/stepchat
router.post("/", optionalAuth, async (req, res) => {
  const { step, log, analysis, messages } = req.body;

  if (!step || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "step and messages are required." });
  }

  const systemPrompt = `You are a senior DevOps/SRE engineer helping a developer fix an error. 
You are currently focused on ONE specific resolution step from a log analysis.

The original error log was:
\`\`\`
${(log || "").slice(0, 1000)}
\`\`\`

The full analysis determined:
- Severity: ${analysis?.severity || "unknown"}
- Root cause: ${analysis?.root_cause_category || "unknown"}  
- Source: ${analysis?.source_detected || "unknown"}
- Summary: ${analysis?.plain_english || ""}

The specific step being discussed is:
Step ${step.step}: ${step.action}
${step.command ? `Command: ${step.command}` : "No command for this step."}

Answer the user's question about this step clearly and concisely. 
- Be practical and direct â no fluff
- If they got a different error, diagnose it
- If they ask what a command does, explain it in plain English
- If they ask if something is safe, give a straight answer
- Keep responses under 150 words unless a longer explanation is truly needed
- Never repeat the step back to them, they can see it`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    const reply = response.content[0].text.trim();
    res.json({ reply });

  } catch (err) {
    console.error("Stepchat error:", err.message);
    res.status(500).json({ error: "Chat failed. Please try again." });
  }
});

export default router;