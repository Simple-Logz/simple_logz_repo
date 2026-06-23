import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/pattern-intel
router.post("/", optionalAuth, async (req, res) => {
  const { analyses, projectName, stack } = req.body;

  if (!analyses || analyses.length < 2)
    return res.status(400).json({ error: "At least 2 analyses needed for pattern detection." });

  const incidentLog = analyses.slice(0, 40).map((a, i) =>
    `${i + 1}. [${a.severity}] "${a.title}" â platform: ${a.source || "unknown"} â date: ${a.created_at?.slice(0, 10) || "unknown"}`
  ).join("\n");

  const prompt = `You are an SRE intelligence engine. Perform a deep pattern analysis for the project "${projectName}" (stack: ${(stack || []).join(", ") || "unknown"}).

Incident history (${analyses.length} incidents):
${incidentLog}

Return ONLY valid JSON â no markdown fences:
{
  "trend": "<improving|worsening|stable>",
  "trend_explanation": "<one-sentence explanation of the trend>",
  "hotspot": "<the specific component, service, or layer causing the most incidents>",
  "mttr_estimate": "<estimated mean time to resolution based on patterns, e.g. 15-30 min>",
  "patterns": [
    {
      "name": "<pattern name, e.g. 'Database Connectivity Failures'>",
      "count": <number of incidents matching this pattern>,
      "description": "<what this pattern means and why it keeps happening>",
      "risk": "<HIGH|MEDIUM|LOW>"
    }
  ],
  "predictions": [
    "<proactive warning based on current patterns â max 2, phrased as 'If X continues, expect Y'>
  ],
  "recommendations": ["<top 3 specific, actionable recommendations to improve project health>"],
  "summary": "<2-3 sentence executive summary of this project's incident health and trajectory>"
}

Rules:
- patterns array: identify 2-4 distinct recurring patterns
- predictions: be specific and data-driven, not generic
- recommendations: be concrete â name specific actions, not vague advice`;

  try {
    const msg = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages:   [{ role: "user", content: prompt }],
    });

    const raw = msg.content[0].text.trim()
      .replace(/^```json\n?/, "").replace(/\n?```$/, "");

    let result;
    try { result = JSON.parse(raw); }
    catch { return res.status(500).json({ error: "AI returned invalid JSON. Please retry." }); }

    res.json({ success: true, result });
  } catch (err) {
    console.error("Pattern intel error:", err.message);
    res.status(500).json({ error: "Analysis failed. Please retry." });
  }
});

export default router;
