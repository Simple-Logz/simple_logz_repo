import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/generate-runbook
router.post("/", optionalAuth, async (req, res) => {
  const { projectName, stack, incidents } = req.body;

  if (!incidents || incidents.length === 0)
    return res.status(400).json({ error: "At least one incident required to generate a runbook." });

  const incidentSummary = incidents.slice(0, 6).map((a, i) =>
    `${i + 1}. [${a.severity}] ${a.title} â ${a.source || "unknown platform"}`
  ).join("\n");

  const prompt = `You are a senior SRE writing an operational runbook for the project "${projectName}" (stack: ${(stack || []).join(", ") || "unknown"}).

Based on these incidents, generate a comprehensive, production-ready runbook:
${incidentSummary}

Return ONLY valid JSON â no markdown fences:
{
  "title": "<descriptive runbook title>",
  "description": "<2-sentence description of what this runbook covers and when to use it>",
  "severity": "<CRITICAL|HIGH|MEDIUM|LOW>",
  "estimated_resolution_time": "<e.g. 10-20 minutes>",
  "triggers": ["<condition that triggers this runbook, max 3 â be specific>"],
  "steps": [
    {
      "step": <integer>,
      "title": "<short action title>",
      "action": "<clear description of exactly what to do>",
      "command": "<exact CLI command or null if not applicable>",
      "verification": "<how to confirm this step completed successfully>"
    }
  ],
  "escalation": "<specific condition for escalation and who to contact>",
  "prevention": ["<up to 3 concrete prevention measures with implementation details>"],
  "tags": ["<2-4 relevant tags e.g. database, networking, deployment>"]
}

Rules:
- Steps should be exhaustive â include every action needed to resolve the incident
- Commands must be exact and copy-paste ready
- Do not include placeholder text â be specific`;

  try {
    const msg = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages:   [{ role: "user", content: prompt }],
    });

    const raw = msg.content[0].text.trim()
      .replace(/^```json\n?/, "").replace(/\n?```$/, "");

    let runbook;
    try { runbook = JSON.parse(raw); }
    catch { return res.status(500).json({ error: "AI returned invalid JSON. Please retry." }); }

    res.json({ success: true, runbook });
  } catch (err) {
    console.error("Runbook gen error:", err.message);
    res.status(500).json({ error: "Generation failed. Please retry." });
  }
});

export default router;
