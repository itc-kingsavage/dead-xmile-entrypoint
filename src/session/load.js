// src/session/load.js
// Loads saved WhatsApp sessions from MongoDB
// Exports: loadSession(sessionId) and loadLatestSession()

import mongoose from "mongoose";
import logger from "../utils/logger.js";

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Reuse model if it already exists (avoid overwrite errors in dev hot-reload)
const Session =
  mongoose.models?.Session || mongoose.model("Session", sessionSchema);

/**
 * Ensure there is an active DB connection.
 * Uses process.env.MONGODB_URI (set this in Render or your environment).
 */
async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      // already connected
      return;
    }
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        "MONGODB_URI not set. Add it to environment variables (Render/Codespace/.env)."
      );
    }

    await mongoose.connect(uri, {
      // sensible defaults
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.success("Connected to MongoDB.");
  } catch (err) {
    logger.error("MongoDB connection error: " + err.message);
    throw err;
  }
}

/**
 * Load a session by its sessionId
 * @param {String} sessionId
 * @returns {Object} { status: boolean, message: string, session?: Object }
 */
export async function loadSession(sessionId) {
  try {
    if (!sessionId) {
      return { status: false, message: "sessionId is required" };
    }

    await connectDB();

    const doc = await Session.findOne({ sessionId }).lean();
    if (!doc) {
      logger.warn(`Session not found for id: ${sessionId}`);
      return { status: false, message: "Session not found" };
    }

    logger.success(`Session loaded: ${sessionId}`);
    return { status: true, message: "Session loaded", session: doc.data };
  } catch (err) {
    logger.error("Error loading session: " + err.message);
    return { status: false, message: "Error loading session", error: err.message };
  }
}

/**
 * Load the most recently created session
 * @returns {Object} { status: boolean, message: string, session?: Object }
 */
export async function loadLatestSession() {
  try {
    await connectDB();

    const doc = await Session.findOne({}).sort({ createdAt: -1 }).lean();
    if (!doc) {
      logger.warn("No sessions found in DB.");
      return { status: false, message: "No sessions found" };
    }

    logger.success(`Latest session loaded: ${doc.sessionId}`);
    return { status: true, message: "Latest session loaded", session: doc.data };
  } catch (err) {
    logger.error("Error loading latest session: " + err.message);
    return { status: false, message: "Error loading session", error: err.message };
  }
}

export default loadSession;
