// src/routes/session.js
import express from "express";
const router = express.Router();

import saveSession from "../session/save.js";
import { loadLatestSession, loadSession } from "../session/load.js";
import deleteSession from "../session/delete.js";
import validateSession from "../session/validate.js";

import response from "../utils/response.js";
import logger from "../utils/logger.js";

router.get("/load", async (req, res) => {
  try {
    logger.info("Request received: /session/load");
    const result = await loadLatestSession();
    if (!result.status) return response.error(res, result.message, 404);
    return response.success(res, "Session loaded", result.session);
  } catch (err) {
    logger.error(err.message || err);
    return response.error(res, "Failed to load session");
  }
});

router.post("/save", async (req, res) => {
  try {
    logger.info("Request received: /session/save");
    const { sessionId, sessionData } = req.body;
    const result = await saveSession(sessionId, sessionData);
    if (!result.status) return response.error(res, result.message);
    return response.success(res, result.message);
  } catch (err) {
    logger.error(err.message || err);
    return response.error(res, "Failed to save session");
  }
});

router.delete("/delete", async (req, res) => {
  try {
    logger.info("Request received: /session/delete");
    const { sessionId } = req.body || {};
    const result = await deleteSession(sessionId);
    if (!result.status) return response.error(res, result.message);
    return response.success(res, result.message);
  } catch (err) {
    logger.error(err.message || err);
    return response.error(res, "Failed to delete session");
  }
});

router.get("/validate", async (req, res) => {
  try {
    logger.info("Request received: /session/validate");
    const ok = await validateSession();
    return response.success(res, "Validation result", { valid: ok });
  } catch (err) {
    logger.error(err.message || err);
    return response.error(res, "Validation failed");
  }
});

export default router;
