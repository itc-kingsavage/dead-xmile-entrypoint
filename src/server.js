// ───────────────────────────────────────────
//  DEAD-XMILE ENTRYPOINT — SERVER.JS
//  Express Server + Static UI + API Loader
// ───────────────────────────────────────────

import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import qrRoute from "./routes/qr.js";
import sessionRoute from "./routes/session.js";
import banner from "./utils/banners.js";
import logger from "./utils/logger.js";

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ───────────────────────────────────────────
//  Middleware
// ───────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve UI from /public
app.use(express.static(path.join(__dirname, "../public")));

// ───────────────────────────────────────────
//  API Routes
// ───────────────────────────────────────────

app.use("/api/qr", qrRoute);           // QR + Pairing Code Endpoint
app.use("/api/session", sessionRoute); // Session Export / Delete / Status

// ───────────────────────────────────────────
//  Default Route — UI Landing Page
// ───────────────────────────────────────────

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ───────────────────────────────────────────
//  Start Server
// ───────────────────────────────────────────

app.listen(PORT, () => {
  console.clear();
  console.log(banner());
  logger("green", `🚀 DEAD-XMILE ENTRYPOINT RUNNING`);
  logger("cyan",  `🌐 Scanner UI: http://localhost:${PORT}`);
  logger("yellow",`⚙️  API Active: /api/qr | /api/session`);
});
