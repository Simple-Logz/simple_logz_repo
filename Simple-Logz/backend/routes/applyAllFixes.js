import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/apply-all-fixes
// Body: { code: string, issues: [{ line, description, suggestion }] }
router.post("/", optionalAuth, async (req, res) => {
  const { code, issues } = req.body;

  if (!code || !issues?.length)
    return res.status(400).json({ error: "Code and issues required." });

  const fixList = issues
    .map((iss, i) =>
      `Fix ${i + 1}: Line ${iss.line} â ${iss.description}. Correction: ${iss.suggestion || iss.description}`
    )
    .join("\n");

  const prompt = `You are a code editor. Apply ALL of the following fixes to the code below in one pass and return the complete corrected file.

Fixes to apply:
${fixList}

Rules:
- Apply EVERY fix listed above
- Return the COMPLETE file with all fixes applied
- Return ONLY the code â no explanations, no markdown fences, no extra text

Code:
${code}`;

  try {
    const msg = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      messages:   [{ role: "user", content: prompt }],
    });

    let patched = msg.content[0].text.trim();
    // Strip any accidental markdown fences
    patched = patched.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "");

    res.json({ success: true, patched_code: patched });
  } catch (err) {
    console.error("Apply-all-fixes error:", err.message);
    res.status(500).json({ error: "Failed to apply fixes. Please retry." });
  }
});

export default router;
