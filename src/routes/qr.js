import express from "express";
import { generateQR } from "../qr/generate.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await generateQR(req, res);
  } catch (err) {
    console.error(err);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Failed to generate QR"
      });
    }
  }
});

export default router;
