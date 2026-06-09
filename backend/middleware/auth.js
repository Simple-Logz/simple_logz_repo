import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

import { createClient } from "@supabase/supabase-js";

const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
  req.user = user;
  next();
}

export async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await supabaseAnon.auth.getUser(token);
    req.user = user || null;
  } else {
    req.user = null;
  }
  next();
}