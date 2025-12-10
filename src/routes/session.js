// src/routes/session.js

const express = require("express");
const router = express.Router();

const saveSession = require("../session/save");
const loadSession = require("../session/load");
const deleteSession = require("../session/delete");
const validateSession = require("../session/validate");

const response = require("../utils/response");
const logger = require("../utils/logger");

// 🟢 Load Session
router.get("/load", async (req, res) => {
    try {
        logger.info("Request received: /session/load");

        const session = await loadSession();
        return response.success(res, "Session loaded", session);

    } catch (err) {
        return response.error(res, "Failed to load session", err);
    }
});

// 🔵 Save Session
router.post("/save", async (req, res) => {
    try {
        logger.info("Request received: /session/save");

        const data = req.body || {};
        const result = await saveSession(data);

        return response.success(res, "Session saved successfully", result);

    } catch (err) {
        return response.error(res, "Failed to save session", err);
    }
});

// 🔴 Delete Session
router.delete("/delete", async (req, res) => {
    try {
        logger.info("Request received: /session/delete");

        const result = await deleteSession();

        return response.success(res, "Session deleted", result);

    } catch (err) {
        return response.error(res, "Failed to delete session", err);
    }
});

// 🟡 Validate Session
router.get("/validate", async (req, res) => {
    try {
        logger.info("Request received: /session/validate");

        const valid = await validateSession();

        return response.success(res, "Validation result", { valid });

    } catch (err) {
        return response.error(res, "Validation failed", err);
    }
});

module.exports = router;
