import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("❌ MONGO_URI is not defined in environment variables");
}

const client = new MongoClient(uri);

let db;
let sessionsCollection;

export async function connectMongo() {
  // Reuse existing connection
  if (sessionsCollection) {
    return sessionsCollection;
  }

  await client.connect();

  db = client.db("dead_xmile");
  sessionsCollection = db.collection("sessions");

  console.log("✅ MongoDB connected (sessions collection ready)");

  return sessionsCollection;
}
