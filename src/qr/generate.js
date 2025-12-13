import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import path from "path";
import logger from "../utils/logger.js";
import { generateSessionId } from "../session/store.js";

const QR_TIMEOUT = Number(process.env.QR_TIMEOUT_MS || 60000);

export async function generateQR(res) {
  const sessionId = generateSessionId();
  const sessionDir = path.join("src/sessions", sessionId);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  let responded = false;

  sock.ev.on("connection.update", async ({ qr }) => {
    if (qr && !responded) {
      responded = true;

      const qrImage = await qrcode.toDataURL(qr);

      res.json({
        success: true,
        sessionId,
        qr: qrImage,
        expiresIn: QR_TIMEOUT
      });
    }
  });

  sock.ev.on("creds.update", saveCreds);
}
