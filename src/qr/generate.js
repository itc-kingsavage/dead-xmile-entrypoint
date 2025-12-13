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
  let sock;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    sock.ev.on("connection.update", async (update) => {
      const { qr, connection, lastDisconnect } = update;

      // ---------- QR GENERATED ----------
      if (qr && !responded) {
        responded = true;
        logger.info(`QR generated for ${sessionId}`);

        qrTimeout = setTimeout(() => {
          logger.warn("QR expired, closing socket...");
          sock?.ws?.close();
        }, QR_TIMEOUT);

        const qrImage = await qrcode.toDataURL(qr);

        return res.json({
          success: true,
          sessionId,
          qr: qrImage,
          expiresIn: QR_TIMEOUT
        });
      }

      // ---------- CONNECTED ----------
      if (connection === "open") {
        logger.success(`WhatsApp logged in: ${sessionId}`);
        clearTimeout(qrTimeout);
      }

      // ---------- DISCONNECTED ----------
      if (connection === "close") {
        const reason =
          lastDisconnect?.error?.output?.statusCode ||
          DisconnectReason.connectionClosed;

        logger.warn(`Connection closed (${reason}) for ${sessionId}`);

        clearTimeout(qrTimeout);

        // Auto-regenerate ONLY if QR was not scanned yet
        if (
          !responded &&
          reason !== DisconnectReason.loggedOut
        ) {
          logger.info("Auto-regenerating QR...");
          return generateQR(res);
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);

  } catch (err) {
    logger.error("QR generation failed");

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Failed to generate QR"
      });
    }
  }
}
