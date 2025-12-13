import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import { randomUUID } from "crypto";

export async function generateQR(req, res) {
  const sessionId = `dead-xmile-${randomUUID().slice(0, 8)}`;

  let responded = false;

  const { state, saveCreds } = await useMultiFileAuthState(
    `./auth/${sessionId}`
  );

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "22.04"]
  });

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection } = update;

    if (qr && !responded) {
      responded = true;

      const qrBase64 = await QRCode.toDataURL(qr);

      res.json({
        success: true,
        qr: qrBase64,
        sessionId,
        expiresIn: 60000
      });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp linked:", sessionId);
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ⏱ safety timeout
  setTimeout(() => {
    if (!responded) {
      responded = true;
      res.json({
        success: false,
        error: "QR not received, try again"
      });
    }
  }, 65000);
}
