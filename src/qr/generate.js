// src/qr/generate.js

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import qrcode from "qrcode";
import path from "path";
import logger from "../utils/logger.js";
import { generateSessionId } from "../session/store.js";

const QR_TIMEOUT = Number(process.env.QR_TIMEOUT_MS || 60000);

export async function generateQR(res) {
  const sessionId = generateSessionId();
  const sessionDir = path.join("src/sessions", sessionId);

  let responded = false;
  let qrTimeout;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    sock.ev.on("connection.update", async (update) => {
      const { qr, connection, lastDisconnect } = update;

      // ✅ SEND QR ONCE
      if (qr && !responded) {
        responded = true;

        logger.info(`QR generated for ${sessionId}`);

        qrTimeout = setTimeout(() => {
          logger.warn("QR expired");
          sock.ws.close();
        }, QR_TIMEOUT);

        const qrImage = await qrcode.toDataURL(qr);

        return res.json({
          success: true,
          sessionId,
          qr: qrImage,
          expiresIn: QR_TIMEOUT
        });
      }

      // ✅ LOGIN SUCCESS
      if (connection === "open") {
        logger.success(`Logged in: ${sessionId}`);
        clearTimeout(qrTimeout);
      }

      // ❌ FAILED BEFORE QR
      if (connection === "close" && !responded) {
        const reason = lastDisconnect?.error?.output?.statusCode;
        logger.warn(`Connection closed (${reason}) before QR`);

        clearTimeout(qrTimeout);

        if (!res.headersSent) {
          res.status(503).json({
            success: false,
            error: "QR generation failed, please retry"
          });
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);

  } catch (err) {
    logger.error(err);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Internal error"
      });
    }
  }
}
