import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import qrcode from "qrcode";
import fs from "fs";
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

  let qrTimeout;

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr) {
      logger.info("QR generated");

      clearTimeout(qrTimeout);

      qrTimeout = setTimeout(() => {
        logger.warn("QR expired, regenerating...");
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

    if (connection === "open") {
      logger.success(`Logged in: ${sessionId}`);
      clearTimeout(qrTimeout);
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      logger.warn(`Connection closed: ${reason}`);

      if (reason !== DisconnectReason.loggedOut) {
        logger.info("Attempting reconnect...");
        generateQR(res);
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
                   }
