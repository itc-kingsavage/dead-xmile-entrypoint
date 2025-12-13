import makeWASocket, {
  DisconnectReason
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import { randomUUID } from "crypto";
import { MongoClient } from "mongodb";

/* =========================
   MongoDB Setup
========================= */
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "dead_xmile";
const COLLECTION = "sessions";

let mongoClient;
async function getCollection() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
  }
  return mongoClient.db(DB_NAME).collection(COLLECTION);
}

/* =========================
   Auth State (MongoDB)
========================= */
async function useMongoAuthState(sessionId) {
  const col = await getCollection();

  const session = await col.findOne({ sessionId });
  let creds = session?.creds || {};
  let keys = session?.keys || {};

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const data = {};
          for (const id of ids) {
            if (keys[type]?.[id]) {
              data[id] = keys[type][id];
            }
          }
          return data;
        },
        set: async (data) => {
          for (const type in data) {
            keys[type] = keys[type] || {};
            Object.assign(keys[type], data[type]);
          }
          await col.updateOne(
            { sessionId },
            { $set: { creds, keys } },
            { upsert: true }
          );
        }
      }
    },
    saveCreds: async () => {
      await col.updateOne(
        { sessionId },
        { $set: { creds, keys } },
        { upsert: true }
      );
    }
  };
}

/* =========================
   QR Generator
========================= */
export async function generateQR(req, res) {
  const sessionId = `dead-xmile-${randomUUID().slice(0, 8)}`;
  let responded = false;

  const { state, saveCreds } = await useMongoAuthState(sessionId);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ["Dead-Xmile", "Chrome", "1.0.0"]
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
  }, 90000); // 90 seconds

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr && !responded) {
      responded = true;
      clearTimeout(timeout);

      const qrBase64 = await QRCode.toDataURL(qr);

      res.json({
        success: true,
        mode: "qr",
        qr: qrBase64,
        sessionId,
        expiresIn: 90000
      });
    }

    if (connection === "open") {
      console.log(`✅ WhatsApp linked | session: ${sessionId}`);
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;

      if (!responded) {
        responded = true;
        clearTimeout(timeout);
        res.json({
          success: false,
          error: "Connection closed before linking."
        });
      }

      if (code === DisconnectReason.loggedOut) {
        console.warn(`⚠️ Logged out | session: ${sessionId}`);
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
}
