import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/code-inspect
router.post("/", optionalAuth, async (req, res) => {
  const { code, language = "auto" } = req.body;

  if (!code || code.trim().length < 10)
    return res.status(400).json({ error: "Code content required (min 10 chars)." });
  if (code.length > 40000)
    return res.status(400).json({ error: "Code exceeds 40,000 character limit." });

  const lines    = code.split("\n");
  const total    = lines.length;
  const numbered = lines.map((l, i) => `${String(i + 1).padStart(5, " ")}: ${l}`).join("\n");

  const prompt = `You are a principal engineer performing a comprehensive pre-commit code review and security audit.

Language hint: ${language === "auto" ? "auto-detect" : language}

Return ONLY valid JSON â no markdown fences, no extra text:
{
  "language": "<detected programming language>",
  "total_lines": ${total},
  "score": <integer 0-100 code quality score>,
  "verdict": "<Excellent|Good|Needs Work|Poor>",
  "issues_found": <integer>,
  "issues": [
    {
      "line": <exact integer line number>,
      "type": "<Bug|Security|Performance|Style|Deprecated|Logic>",
      "severity": "<CRITICAL|HIGH|MEDIUM|LOW>",
      "description": "<clear 1-sentence explanation of the problem>",
      "suggestion": "<specific fix â include a short code snippet if the fix is not obvious>"
    }
  ],
  "summary": "<2-3 sentence overall code review summary>",
  "strengths": ["<up to 3 things the code does well>"],
  "improvements": ["<top 3-4 highest-impact improvements>"]
}

Scoring guide:
- 90-100: Production-ready, no significant issues
- 70-89: Good code with minor improvements needed
- 50-69: Functional but has bugs or security concerns
- 30-49: Multiple issues, needs significant rework
- 0-29: Serious problems, not suitable for production

Rules:
- Report every issue you find â do not skip anything
- Line numbers must be exact integers from the numbered input
- Security issues should always be CRITICAL or HIGH
- Do not report stylistic preferences as bugs

Numbered code (${total} lines):
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
    console.error("Code inspect error:", err.message);
    res.status(500).json({ error: "Inspection failed. Please retry." });
  }
});

export default router;
