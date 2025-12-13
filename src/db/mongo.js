import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

let client;
let db;

export async function connectMongo() {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();

  db = client.db("dead_xmile");

  console.log("✅ MongoDB connected (dead_xmile)");

  return db;
}
