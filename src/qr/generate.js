import makeWASocket, {
  DisconnectReason
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import { randomUUID } from "crypto";
import { useMongoAuthState } from "../db/mongoAuth.js";

export async function generateQR(req, res) {
  const sessionId = `dead-xmile-${randomUUID().slice(0, 8)}`;

  let responded = false;
  let sock;

  try {
    // ✅ MongoDB-based auth state
    const { state, saveCreds } = await useMongoAuthState(sessionId);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ["Dead-Xmile", "Chrome", "1.0.0"]
    });

    // ⏱ Safety timeout (90 seconds)
    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        sock.end();
        res.json({
          success: false,
          error: "QR expired. Please generate a new one."
        });
      }
    }, 90000);

    sock.ev.on("connection.update", async (update) => {
      const { qr, connection, lastDisconnect } = update;

      // ✅ QR generated
      if (qr && !responded) {
        responded = true;
        clearTimeout(timeout);

        const qrBase64 = await QRCode.toDataURL(qr);

        res.json({
          success: true,
          mode: "qr",
          qr: qrBase64,
          sessionId,
          expiresIn: 90000
        });
      }

      // ✅ WhatsApp linked
      if (connection === "open") {
        console.log("✅ WhatsApp linked:", sessionId);
      }

      // ❌ Connection closed
      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        console.warn("⚠️ Connection closed:", code);

        if (!responded) {
          responded = true;
          clearTimeout(timeout);
          res.json({
            success: false,
            error: "WhatsApp rejected connection. Try again."
          });
        }
      }
    });

    // ✅ Save creds to MongoDB
    sock.ev.on("creds.update", saveCreds);

  } catch (err) {
    console.error("QR generation error:", err);

    if (!responded) {
      responded = true;
      res.status(500).json({
        success: false,
        error: "Failed to generate QR"
      });
    }

    if (sock) sock.end();
  }
}
