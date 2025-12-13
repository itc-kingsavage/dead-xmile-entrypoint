import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import qrRoutes from "./routes/qr.js";
import sessionRoutes from "./routes/session.js";
import logger from "./utils/logger.js";
import showBanner from "./utils/banners.js";

const app = express();

// ES module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/qr", qrRoutes);
app.use("/session", sessionRoutes);

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  try {
    showBanner();
  } catch {}

  logger.info(`Scanner server running on port ${PORT}`);
});

export default app;
