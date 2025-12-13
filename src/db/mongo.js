import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
export const client = new MongoClient(uri);

export async function connectMongo() {
  if (!client.topology?.isConnected()) {
    await client.connect();
  }
  return client.db("dead_xmile");
}
