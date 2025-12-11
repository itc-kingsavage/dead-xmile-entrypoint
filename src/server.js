// src/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import qrRoutes from "./routes/qr.js";
import sessionRoutes from "./routes/session.js";
import colors from "./utils/colors.js";
import logger from "./utils/logger.js";
import showBanner from "./utils/banners.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

app.use("/qr", qrRoutes);
app.use("/session", sessionRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

export const startServer = (PORT = process.env.PORT || 3000) => {
  app.listen(PORT, () => {
    // show banner if available
    try { showBanner(); } catch (e) {}
    logger.info(`Scanner server running on http://localhost:${PORT}`);
  });
};

export default app;
