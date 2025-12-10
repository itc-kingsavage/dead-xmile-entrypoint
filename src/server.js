// src/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import qrRoutes from "./routes/qr.js";
import sessionRoutes from "./routes/session.js";
import colors from "./utils/colors.js";
import { logInfo } from "./utils/logger.js";
import showBanner from "./utils/banners.js";

const app = express();

// Required for ES module dirname usage
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static UI
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/qr", qrRoutes);
app.use("/session", sessionRoutes);

// Fallback → return UI index
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start Server
export const startServer = (PORT = process.env.PORT || 3000) => {
    app.listen(PORT, () => {
        showBanner();
        logInfo(`Scanner server running on ${colors.GREEN}http://localhost:${PORT}${colors.RESET}`);
    });
};

export default app;
