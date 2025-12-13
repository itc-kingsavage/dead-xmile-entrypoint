import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import { randomUUID } from "crypto";

export async function generateQR(req, res) {
  const sessionId = `dead-xmile-${randomUUID().slice(0, 8)}`;
  const sessionPath = `./auth/${sessionId}`;

  let responded = false;

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "22.04"]
  });

  const timeout = setTimeout(() => {
    if (!responded) {
      responded = true;
      sock.end();
      res.json({
        success: false,
        error: "QR expired. Please generate a new one."
      });
    }
  }, 90000); // ⬅️ 90 seconds

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr && !responded) {
      responded = true;
      clearTimeout(timeout);

      const qrBase64 = await QRCode.toDataURL(qr);

      res.json({
        success: true,
        qr: qrBase64,
        sessionId,
        expiresIn: 90000
      });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp linked:", sessionId);
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      console.warn("⚠️ Connection closed:", code);

      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        res.json({
          success: false,
          error: "WhatsApp rejected connection. Try again later."
        });
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
}
