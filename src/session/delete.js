// src/session/delete.js
// Deletes WhatsApp session from MongoDB + local auth files

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import logger from "../utils/logger.js";

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    data: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Reuse model to avoid OverwriteModelError
const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);

/**
 * Ensure DB connection is alive
 */
async function connectDB() {
    try {
        if (mongoose.connection.readyState === 1) return;

        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI not found in environment variables!");

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        logger.success("Connected to MongoDB.");
    } catch (err) {
        logger.error("Database connection error: " + err.message);
        throw err;
    }
}

/**
 * Delete session from DB and local auth files
 */
export default async function deleteSession(sessionId) {
    try {
        if (!sessionId) {
            return { status: false, message: "sessionId is required." };
        }

        await connectDB();

        // Delete from MongoDB
        const deleted = await Session.findOneAndDelete({ sessionId });

        if (!deleted) {
            logger.warn("No session found to delete: " + sessionId);
            return { status: false, message: "Session not found." };
        }

        logger.success(`Session removed from database: ${sessionId}`);

        // Delete Baileys local auth folder
        const authFolder = path.join(process.cwd(), "temp/auth_info");

        if (fs.existsSync(authFolder)) {
            fs.rmSync(authFolder, { recursive: true, force: true });
            logger.success("Local auth_info folder deleted.");
        } else {
            logger.warn("auth_info folder not found — nothing to delete.");
        }

        return { status: true, message: "Session deleted successfully." };

    } catch (err) {
        logger.error("Error deleting session: " + err.message);
        return {
            status: false,
            message: "Error deleting session.",
            error: err.message
        };
    }
}
