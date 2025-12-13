import fs from "fs";
import path from "path";

const SESSIONS_DIR = path.resolve("src/sessions");

if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

export function generateSessionId() {
  return (
    process.env.SESSION_PREFIX +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

export function getSessionPath(sessionId) {
  return path.join(SESSIONS_DIR, `${sessionId}.json`);
}

export function sessionExists(sessionId) {
  return fs.existsSync(getSessionPath(sessionId));
}
