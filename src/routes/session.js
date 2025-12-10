// ─────────────────────────────────────────────
//  DEAD-XMILE ENTRYPOINT — SESSION ROUTE
//  Check Status • Delete Session • Export Soon
// ─────────────────────────────────────────────

import express from "express";
import fs from "fs";
import path from "path";
import response from "../utils/response.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Path where Baileys stores auth files
const SESSION_PATH = path.join(process.cwd(), "auth_info_baileys");

// ─────────────────────────────────────────────
//  CHECK SESSION STATUS
// ─────────────────────────────────────────────

router.get("/status", (req, res) => {
  try {
    const exists = fs.existsSync(SESSION_PATH);
    logger("cyan", "📎 Session status requested");

    return res.json(
      response(true, "Session status loaded", {
        sessionExists: exists,
      })
    );
  } catch (err) {
    logger("red", `Session Status Error: ${err}`);

    return res.json(
      response(false, "Failed to check session", {
        error: err.toString(),
      })
    );
  }
});

// ─────────────────────────────────────────────
//  DELETE SESSION
// ─────────────────────────────────────────────

router.delete("/delete", (req, res) => {
  try {
    if (fs.existsSync(SESSION_PATH)) {
      fs.rmSync(SESSION_PATH, { recursive: true, force: true });
    }

    logger("yellow", "🗑 Session deleted");

    return res.json(
      response(true, "Session removed successfully", {
        sessionExists: false,
      })
    );
  } catch (err) {
    logger("red", `Session Delete Error: ${err}`);

    return res.json(
      response(false, "Failed to delete session", {
        error: err.toString(),
      })
    );
  }
});

// ─────────────────────────────────────────────
//  EXPORT SESSION (COMING LATER — MONGODB)
// ─────────────────────────────────────────────

router.get("/export", (req, res) => {
  logger("yellow", "⚠️ Export session not implemented yet");

  return res.json(
    response(false, "Export feature will be added after MongoDB setup")
  );
});

export default router;
