export async function useMongoAuthState(collection, sessionId) {
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
