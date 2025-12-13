import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import { randomUUID } from "crypto";

export async function generatePairing(req, res) {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      error: "Phone number is required"
    });
  }

  const sessionId = `dead-xmile-${randomUUID().slice(0, 8)}`;

  const { state, saveCreds } = await useMultiFileAuthState(
    `./auth/${sessionId}`
  );

  const sock = makeWASocket({
    auth: state,
    browser: ["Ubuntu", "Chrome", "22.04"]
  });

  sock.ev.on("creds.update", saveCreds);

  try {
    const code = await sock.requestPairingCode(phone);

    res.json({
      success: true,
      pairingCode: code,
      sessionId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to generate pairing code"
    });
  }
}
