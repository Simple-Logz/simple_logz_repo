import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, ".env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import analyzeRouter from "./routes/analyze.js";
import authRouter    from "./routes/auth.js";
import stripeRouter  from "./routes/stripe.js";
import forumRouter   from "./routes/forum.js";
import userRouter    from "./routes/user.js";

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Security & logging ───────────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────────
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

// ── Routes ───────────────────────────────────────────────────
app.use("/api/analyze", analyzeRouter);
app.use("/api/auth",    authRouter);
app.use("/api/stripe",  stripeRouter);
app.use("/api/forum",   forumRouter);
app.use("/api/user",    userRouter);

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// ── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 SimpleLogz API running on port ${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV || "development"}\n`);
});