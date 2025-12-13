import express from "express";
import { generateQR } from "../qr/generate.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await generateQR(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to generate QR"
    });
  }
});

export default router;
