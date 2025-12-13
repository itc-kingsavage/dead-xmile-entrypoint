import { BufferJSON } from "@whiskeysockets/baileys";

/*
  Proper MongoDB auth state for Baileys
  Compatible with QR + Pairing Code
*/

export async function useMongoAuthState(collection, sessionId) {
  const readData = async (key) => {
    const doc = await collection.findOne({ sessionId, key });
    if (!doc) return null;
    return JSON.parse(doc.value, BufferJSON.reviver);
  };

  const writeData = async (key, value) => {
    await collection.updateOne(
      { sessionId, key },
      {
        $set: {
          sessionId,
          key,
          value: JSON.stringify(value, BufferJSON.replacer),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
  };

  const deleteData = async (key) => {
    await collection.deleteOne({ sessionId, key });
  };

  return {
    state: {
      creds: (await readData("creds")) || null,
      keys: {
        get: async (type, ids) => {
          const data = {};
          for (const id of ids) {
            const value = await readData(`${type}-${id}`);
            if (value) data[id] = value;
          }
          return data;
        },
        set: async (data) => {
          for (const type in data) {
            for (const id in data[type]) {
              await writeData(`${type}-${id}`, data[type][id]);
            }
          }
        }
      }
    },

    saveCreds: async () => {
      const creds = await readData("creds");
      if (creds) {
        await writeData("creds", creds);
      }
    }
  };
}
