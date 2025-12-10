// ─────────────────────────────────────────────
//  DEAD-XMILE ENTRYPOINT — QR ROUTE
//  Returns QR, Pairing Code, and Scanner Status
// ─────────────────────────────────────────────

import express from "express";
import { getScannerState } from "../index.js";
import response from "../utils/response.js";
import logger from "../utils/logger.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const { qr, pairingCode, status } = getScannerState();

    logger("cyan", "📡 QR Route Requested");

    return res.json(
      response(true, "Scanner state fetched", {
        status,
        qr,           // base64 QR
        pairingCode,  // numeric code
      })
    );

  } catch (err) {
    logger("red", `QR API Error: ${err}`);

    return res.json(
      response(false, "Failed to fetch QR state", {
        error: err.toString(),
      })
    );
  }
});

export default router;
