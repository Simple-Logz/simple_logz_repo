import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/log-analyze
router.post("/", optionalAuth, async (req, res) => {
  const { log } = req.body;

  if (!log || log.trim().length < 5)
    return res.status(400).json({ error: "Log content required (min 5 chars)." });
  if (log.length > 60000)
    return res.status(400).json({ error: "Log exceeds 60,000 character limit." });

  const lines   = log.split("\n");
  const total   = lines.length;
  const numbered = lines.map((l, i) => `${String(i + 1).padStart(5, " ")}: ${l}`).join("\n");

  const prompt = `You are a world-class log analysis expert. Analyze these numbered log lines and identify every error, warning, deprecation, performance issue, and security problem.

Return ONLY valid JSON â no markdown fences, no extra text:
{
  "platform": "<detected platform: Node.js | Python | Docker | Kubernetes | Nginx | Postgres | AWS | Linux | Java | Go | etc.>",
  "total_lines": ${total},
  "issues_found": <integer count of flagged lines>,
  "overall_severity": "<CRITICAL|HIGH|MEDIUM|LOW|CLEAN>",
  "summary": "<2-3 sentence plain-English summary of what you found>",
  "root_cause": "<primary root cause or null if clean>",
  "flagged_lines": [
    {
      "line_number": <exact integer line number>,
      "content": "<the exact log line text, truncated to 120 chars>",
      "severity": "<CRITICAL|HIGH|MEDIUM|LOW|INFO>",
      "issue_type": "<Error|Warning|Deprecation|Performance|Security|Config|Crash>",
      "description": "<plain English explanation of what this line means>",
      "fix": "<specific, actionable fix â exact command or code snippet where possible â or null if informational>"
    }
  ],
  "recommendations": ["<top 3 concrete actionable recommendations>"]
}

Rules:
- Only include lines with actual issues in flagged_lines
- If the log is completely clean, return flagged_lines: [] and overall_severity: "CLEAN"
- Line numbers must be exact integers matching the numbered input
- Severity must reflect actual impact, not just log level

Numbered log (${total} lines):
${numbered}`;

  try {
    const msg = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 2500,
      messages:   [{ role: "user", content: prompt }],
    });

    const raw = msg.content[0].text.trim()
      .replace(/^```json\n?/, "").replace(/\n?```$/, "");

    let result;
    try { result = JSON.parse(raw); }
    catch { return res.status(500).json({ error: "AI returned invalid JSON. Please retry." }); }

    res.json({ success: true, result });
  } catch (err) {
    console.error("Log analyze error:", err.message);
    res.status(500).json({ error: "Analysis failed. Please retry." });
  }
});

export default router;
