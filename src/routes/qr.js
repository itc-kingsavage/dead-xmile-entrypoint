// src/routes/qr.js
import express from "express";
const router = express.Router();

import generateQR from "../qr/generate.js";
import displayQR from "../qr/display.js";
import response from "../utils/response.js";
import logger from "../utils/logger.js";

router.get("/", async (req, res) => {
  try {
    logger.info("Request received: /qr");

    // generateQR should return base64 data URL or null
    const qr = await generateQR();

    if (!qr) {
      return response.error(res, "Failed to generate QR");
    }

    // displayQR expects (qrImage, res) in your earlier version — but our displayQR returns formatted JSON:
    // If your displayQR sends response itself, call it; otherwise return response here.
    return response.success(res, "QR generated successfully!", { qr });
  } catch (error) {
    logger.error("QR generation failed: " + (error?.message || error));
    return response.error(res, "Failed to generate QR", 500);
  }
});

export default router;
