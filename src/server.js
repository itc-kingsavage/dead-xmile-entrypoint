// src/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import qrRoutes from "./routes/qr.js";
import sessionRoutes from "./routes/session.js";
import logger from "./utils/logger.js";
import showBanner from "./utils/banners.js";

const app = express();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/qr", qrRoutes);
app.use("/session", sessionRoutes);

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server function
export const startServer = () => {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    try {
      showBanner();
    } catch (err) {
      // banner is optional
    }

    logger.info(`Scanner server running on port ${PORT}`);
  });
};

// 🚀 IMPORTANT: auto-start server when file is run
startServer();

export default app;
