import makeWASocket, {
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import { randomUUID } from "crypto";

/*
  POST /qr?mode=pair
  body: { phone: "2557XXXXXXXX" }
*/

export async function generatePairingCode(req, res) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required"
      });
    }

    // WhatsApp requires international format, numbers only
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number"
      });
    }

    const sessionId = `dead-xmile-${randomUUID().slice(0, 8)}`;
    const sessionPath = `./auth/${sessionId}`;

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ["Ubuntu", "Chrome", "22.04"]
    });

    let responded = false;

    // Generate pairing code (WhatsApp = 8 digits)
    const pairingCode = await sock.requestPairingCode(cleanPhone);

    responded = true;

    res.json({
      success: true,
      mode: "pairing",
      pairingCode,          // 8-digit code
      sessionId,
      phone: cleanPhone,
      instructions:
        "Open WhatsApp → Linked Devices → Link a device → Link with phone number"
    });

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

    sock.ev.on("creds.update", saveCreds);

  } catch (err) {
    console.error("Pairing error:", err);

    res.status(500).json({
      success: false,
      error: "Failed to generate pairing code"
    });
  }
}
