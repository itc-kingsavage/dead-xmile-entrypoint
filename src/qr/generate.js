import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import { randomUUID } from "crypto";

const QR_TIMEOUT = 60_000; // 1 minute

export async function generateQR(req, res) {
  let responded = false;
  let timeout;

  const sessionId = `dead-xmile-session;;;${randomUUID().slice(0, 8)}`;
  const authPath = `./auth/${sessionId}`;

  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "22.04"]
  });

  // 🔐 Save creds
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;

    // 📸 SEND QR ONCE
    if (qr && !responded) {
      responded = true;
      clearTimeout(timeout);

      const qrImage = await QRCode.toDataURL(qr);

      return res.json({
        success: true,
        qr: qrImage,
        sessionId,
        expiresIn: QR_TIMEOUT
      });
    }

    // ✅ LOGIN SUCCESS
    if (connection === "open") {
      console.log("✅ WhatsApp linked:", sessionId);
      clearTimeout(timeout);
    }

    // ❌ CLOSED CONNECTION
    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode || "unknown";

      console.warn("⚠️ Connection closed:", reason);

      if (
        !responded &&
        reason !== DisconnectReason.loggedOut
      ) {
        responded = true;
        clearTimeout(timeout);

        return res.json({
          success: false,
          error: "QR expired. Please generate a new one."
        });
      }
    }
  });

  // ⏱ SAFETY TIMEOUT (prevents Render crash)
  timeout = setTimeout(() => {
    if (!responded) {
      responded = true;

      res.json({
        success: false,
        error: "QR timeout. Please try again."
      });
    }
  }, QR_TIMEOUT);
}
