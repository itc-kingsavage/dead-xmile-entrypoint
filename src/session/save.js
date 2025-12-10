// src/session/save.js

import mongoose from "mongoose";
import logger from "../utils/logger.js";

// Session Schema
const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    data: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Session = mongoose.model("Session", sessionSchema);

export default async function saveSession(sessionId, sessionData) {
    try {
        logger.info("Saving session to MongoDB...");

        if (!sessionId) {
            logger.error("Missing sessionId. Cannot save session.");
            return { status: false, message: "Missing sessionId" };
        }

        if (!sessionData) {
            logger.error("Missing sessionData. Cannot save.");
            return { status: false, message: "Missing sessionData" };
        }

        let session = await Session.findOne({ sessionId });

        if (!session) {
            session = new Session({
                sessionId,
                data: sessionData
            });
        } else {
            session.data = sessionData; // Update existing session
        }

        await session.save();

        logger.success("Session saved successfully.");
        return { status: true, message: "Session saved." };

    } catch (err) {
        logger.error("Error saving session: " + err.message);
        return { status: false, message: "Database error" };
    }
}
