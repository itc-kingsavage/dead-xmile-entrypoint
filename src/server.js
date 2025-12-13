import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import qrRoutes from "./routes/qr.js";
import sessionRoutes from "./routes/session.js";
import logger from "./utils/logger.js";
import showBanner from "./utils/banners.js";

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/qr", qrRoutes);          // QR + Pairing
app.use("/session", sessionRoutes);

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  try {
    showBanner();
  } catch (e) {}

  logger.info(`Scanner server running on port ${PORT}`);
});

export default app;
