import makeWASocket from "@whiskeysockets/baileys";
import { randomUUID } from "crypto";
import { useMongoAuthState } from "../db/mongoAuth.js";

/*
  POST /qr?mode=pair
  body: { phone: "2557XXXXXXXX" }
*/

export async function generatePairingCode(req, res) {
  let sock;
  let responded = false;

  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required"
      });
    }

    // ✅ WhatsApp requires international format (numbers only)
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number"
      });
    }

    const sessionId = `dead-xmile-${randomUUID().slice(0, 8)}`;

    // ✅ MongoDB auth state
    const { state, saveCreds } = await useMongoAuthState(sessionId);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ["Dead-Xmile", "Chrome", "1.0.0"]
    });

    // ⏱ Fail-safe timeout
    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        sock.end();
        res.json({
          success: false,
          error: "Pairing code expired. Try again."
        });
      }
    }, 90000);

    // ✅ Generate WhatsApp 8-digit pairing code
    const pairingCode = await sock.requestPairingCode(cleanPhone);

    if (!responded) {
      responded = true;
      clearTimeout(timeout);

      res.json({
        success: true,
        mode: "pairing",
        pairingCode,          // ✅ 8-digit code
        sessionId,
        phone: cleanPhone,
        instructions:
          "Open WhatsApp → Linked Devices → Link a device → Link with phone number"
      });
    }

    // 🔄 Connection events
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        console.log("✅ WhatsApp paired:", sessionId);
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        console.warn("⚠️ Pairing connection closed:", code);
      }
    });

    // ✅ Save creds to MongoDB
    sock.ev.on("creds.update", saveCreds);

  } catch (err) {
    console.error("Pairing error:", err);

    if (!responded) {
      responded = true;
      res.status(500).json({
        success: false,
        error: "Failed to generate pairing code"
      });
    }

    if (sock) sock.end();
  }
}
