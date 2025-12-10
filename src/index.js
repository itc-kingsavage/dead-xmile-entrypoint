// ─────────────────────────────────────────────
//  DEAD-XMILE ENTRYPOINT — INDEX.JS
//  WhatsApp Scanner (Baileys MD)
// ─────────────────────────────────────────────

import makeWASocket, { useMultiFileAuthState, disconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import generateQR from "./qr/generate.js";
import saveSession from "./session/save.js";
import logger from "./utils/logger.js";

let globalSocket = null; // Global socket instance
let connectionStatus = "IDLE"; // Track connection state
let lastQR = null; // Store latest QR
let lastPairing = null; // Store latest pairing code

// Export for API routes
export const getScannerState = () => ({
  qr: lastQR,
  pairingCode: lastPairing,
  status: connectionStatus
});

// ─────────────────────────────────────────────
//  Initialize WhatsApp Scanner
// ─────────────────────────────────────────────

export async function startScanner() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info_baileys");
    
    const sock = makeWASocket({
      printQRInTerminal: false,
      auth: state,
      syncFullHistory: false,
    });

    globalSocket = sock;
    connectionStatus = "CONNECTING";

    // ──────────────────────────────────────
    //  QR Code Event
    // ──────────────────────────────────────
    sock.ev.on("connection.update", async (update) => {
      const { qr, connection, lastDisconnect, pairingCode } = update;

      // Handle QR generation
      if (qr) {
        lastQR = await generateQR(qr);
        lastPairing = null;
        connectionStatus = "QR_READY";
        logger("yellow", "📌 New QR Generated");
      }

      // Pairing code support for mobile number linking
      if (pairingCode) {
        lastQR = null;
        lastPairing = pairingCode;
        connectionStatus = "PAIRING_READY";
        logger("cyan", `🔗 Pairing Code: ${pairingCode}`);
      }

      // Connection updates
      if (connection === "connecting") {
        logger("cyan", "🔄 Connecting…");
      }

      if (connection === "open") {
        connectionStatus = "CONNECTED";
        logger("green", "🎉 Connected to WhatsApp!");

        // Save session to local or db
        await saveSession();
      }

      // Disconnect handling
      if (connection === "close") {
        const reason = new Boom(lastDisconnect?.error)?.output.statusCode;

        if (reason === disconnectReason.loggedOut) {
          logger("red", "❌ Logged out — clearing old session");
        } else {
          logger("yellow", "♻️ Reconnecting…");
          startScanner();
        }
      }
    });

    // Save creds when updated
    sock.ev.on("creds.update", saveCreds);

  } catch (err) {
    logger("red", `ERROR in scanner: ${err}`);
  }
}
