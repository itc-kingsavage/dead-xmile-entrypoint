import makeWASocket from "@whiskeysockets/baileys";
import { randomUUID } from "crypto";
import { useMongoAuthState } from "../db/mongoAuth.js"; // 👈 custom Mongo auth

/*
  POST /qr?mode=pair
  body: { phone: "2557XXXXXXXX" }
*/

export async function generatePairingCode(req, res) {
  let sock;
  let timeout;

  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required"
      });
    }

    // digits only (international format)
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number"
      });
    }

    // 🔐 session id (ADMIN will use this)
    const sessionId = `dead-xmile-${randomUUID().slice(0, 8)}`;

    // 📦 MongoDB auth state
    const { state, saveCreds } = await useMongoAuthState(sessionId);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ["Ubuntu", "Chrome", "22.04"]
    });

    // ⏱ safety timeout (90s)
    timeout = setTimeout(() => {
      try {
        sock.end();
      } catch {}
    }, 90000);

    // 🔢 request 8-digit pairing code
    const pairingCode = await sock.requestPairingCode(cleanPhone);

    res.json({
      success: true,
      mode: "pairing",
      pairingCode,
      sessionId,
      phone: cleanPhone,
      expiresIn: 90000,
      instructions:
        "Open WhatsApp → Linked Devices → Link a device → Link with phone number"
    });

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        clearTimeout(timeout);
        console.log("✅ WhatsApp paired:", sessionId);
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        console.warn("⚠️ Pairing connection closed:", code);
      }
    });

    sock.ev.on("creds.update", saveCreds);

  } catch (err) {
    console.error("Pairing error:", err);

    try {
      sock?.end();
    } catch {}

    clearTimeout(timeout);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Failed to generate pairing code"
      });
    }
  }
}
