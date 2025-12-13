import express from "express";
import { generateQR } from "../qr/generate.js";
import { generatePairingCode } from "../qr/pairing.js";

const router = express.Router();

/*
  GET /qr?mode=qr
*/
router.get("/", async (req, res) => {
  const mode = req.query.mode || "qr";

  try {
    if (mode === "pair") {
      await generatePairingCode(req, res);
    } else {
      await generateQR(req, res);
    }
  } catch (err) {
    console.error("QR route error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to start WhatsApp linking"
    });
  }
});

export default router;
