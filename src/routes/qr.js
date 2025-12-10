// src/routes/qr.js

const express = require("express");
const router = express.Router();

const generateQR = require("../qr/generate");
const displayQR = require("../qr/display");
const response = require("../utils/response");
const logger = require("../utils/logger");

router.get("/", async (req, res) => {
    try {
        logger.info("Request received: /qr");

        const qr = await generateQR();

        // Display QR locally on terminal
        await displayQR(qr);

        return response.success(res, "QR generated successfully!", {
            qr
        });

    } catch (error) {
        logger.error("QR generation failed:", error);
        return response.error(res, "Failed to generate QR", error);
    }
});

module.exports = router;
