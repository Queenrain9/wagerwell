import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import { evolutionStatus, launchEvolutionGame } from "./providers/evolution.js";

const app = express();
const port = Number(process.env.PORT || 8787);
const allowedOrigin = process.env.CORS_ORIGIN || "https://queenrain9.github.io";

app.use(cors({ origin: allowedOrigin, credentials: false }));
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "wagerwell-provider-server" });
});

app.get("/api/provider/status", (_req, res) => {
  res.json({ evolution: evolutionStatus() });
});

app.post("/api/game/launch", async (req, res) => {
  try {
    const { gameId, currency = "KRW", language = "ko", country = "KR", returnUrl } = req.body || {};
    if (!gameId) return res.status(400).json({ error: "gameId is required" });

    const playerId = String(req.body?.playerId || "wagerwell-demo-player");
    const sessionId = String(req.body?.sessionId || crypto.randomUUID());

    const launch = await launchEvolutionGame({
      playerId,
      sessionId,
      gameId: String(gameId),
      currency: String(currency),
      language: String(language),
      country: String(country),
      returnUrl: String(returnUrl || "")
    });

    res.json(launch);
  } catch (error) {
    const status = Number(error.status || 503);
    res.status(status).json({
      error: error.message,
      code: process.env.EVOLUTION_LAUNCH_URL ? "EVOLUTION_LAUNCH_FAILED" : "EVOLUTION_NOT_CONFIGURED"
    });
  }
});

app.listen(port, () => {
  console.log(`WAGERWELL provider server listening on :${port}`);
});
