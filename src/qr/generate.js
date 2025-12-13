import makeWASocket from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import { randomUUID } from "crypto";
import { connectMongo } from "../db/mongo.js";
import { useMongoAuthState } from "../session/mongoAuth.js";

const QR_TIMEOUT = 60000;

export async function generateQR(res) {
  const sessionId = `dead-xmile-${randomUUID().slice(0, 8)}`;

  const db = await connectMongo();
  const sessions = db.collection("sessions");

  const { state, saveCreds } = await useMongoAuthState(sessions, sessionId);

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
        qr: qrImage,
        sessionId,
        expiresIn: QR_TIMEOUT
      });
    }
  });

  sock.ev.on("creds.update", saveCreds);

  setTimeout(() => {
    if (!responded) {
      responded = true;
      res.json({ success: false, error: "QR timeout" });
    }
  }, QR_TIMEOUT);
}
