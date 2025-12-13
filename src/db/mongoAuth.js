import { connectMongo } from "./mongo.js";

export async function useMongoAuthState(sessionId) {
  const db = await connectMongo();
  const collection = db.collection("sessions");

  const doc = await collection.findOne({ sessionId });

  let creds = doc?.creds || null;
  let keys = doc?.keys || {};

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
            keys,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }
  };
}
