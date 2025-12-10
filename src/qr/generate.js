// src/qr/generate.js

import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";
import banners from "../utils/banners.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function generateQR(callback) {
    try {
        logger.info("Preparing authentication state...");

        const authDir = path.join(__dirname, "../../temp/auth_info");

        const { state, saveCreds } = await useMultiFileAuthState(authDir);

        const sock = makeWASocket({
            printQRInTerminal: false,
            auth: state,
        });

        sock.ev.on("connection.update", async (update) => {
            const { qr, connection, lastDisconnect } = update;

            if (qr) {
                logger.info("QR Code generated. Preparing display...");
                logger.success("QR Code ready. Sending to frontend...");
                console.log(banners.qrReady);

                // Convert QR to Data URL (base64 image)
                const qrImage = await qrcode.toDataURL(qr);
                callback(qrImage);
            }

            if (connection === "open") {
                logger.success("Client connected successfully!");
                await saveCreds();
            }

            if (connection === "close") {
                logger.warn(
                    "Connection closed. Reason: " +
                        (lastDisconnect?.error?.message || "Unknown")
                );
            }
        });

        sock.ev.on("creds.update", saveCreds);
    } catch (err) {
        logger.error("QR Generation failed: " + err.message);
        callback(null, err);
    }
}
