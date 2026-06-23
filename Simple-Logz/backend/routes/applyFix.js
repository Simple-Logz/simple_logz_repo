import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/apply-fix
router.post("/", optionalAuth, async (req, res) => {
  const { code, line, description, suggestion } = req.body;

  if (!code || !suggestion)
    return res.status(400).json({ error: "Code and suggestion required." });

  const prompt = `You are a code editor. Apply EXACTLY this one fix to the code below and return the complete corrected code.

Fix to apply:
- Line: ${line}
- Issue: ${description}
- Fix: ${suggestion}

Rules:
- Apply ONLY this specific fix â do not change anything else
- Return the COMPLETE file with the fix applied
- Return ONLY the code â no explanations, no markdown fences, no extra text

Code to fix:
${code}`;

  try {
    const msg = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages:   [{ role: "user", content: prompt }],
    });

    let patched = msg.content[0].text.trim();
    // Strip any accidental markdown fences
    patched = patched.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "");

    res.json({ success: true, patched_code: patched });
  } catch (err) {
    console.error("Apply fix error:", err.message);
    res.status(500).json({ error: "Failed to apply fix. Please retry." });
  }
});

export default router;
