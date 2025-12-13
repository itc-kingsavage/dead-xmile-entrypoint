import { connectMongo } from "./mongo.js";
import { makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";

export async function useMongoAuthState(sessionId) {
  const db = await connectMongo();
  const collection = db.collection("sessions");

  const doc = await collection.findOne({ sessionId });

  const creds = doc?.creds || null;
  const storedKeys = doc?.keys || {};

  const keys = makeCacheableSignalKeyStore(
    {
      get: (type, ids) => {
        const data = {};
        for (const id of ids) {
          data[id] = storedKeys[type]?.[id];
        }
        return data;
      },
      set: (data) => {
        for (const type in data) {
          storedKeys[type] = storedKeys[type] || {};
          Object.assign(storedKeys[type], data[type]);
        }
      }
    },
    console
  );

  return {
    state: {
      creds,
      keys
    },
    saveCreds: async (newCreds) => {
      await collection.updateOne(
        { sessionId },
        {
          $set: {
            sessionId,
            creds: newCreds,
            keys: storedKeys,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }
  };
}
