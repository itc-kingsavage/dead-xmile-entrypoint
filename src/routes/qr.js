import express from "express";
import { generateQR } from "../qr/generate.js";

const router = express.Router();

router.get("/", (req, res) => {
  generateQR(req, res);
});

export default router;
