import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const client = new MongoClient(MONGODB_URI);
const dbName = "Cluster0";
const collectionName = "uploads";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const history = await collection
      .find({ username })
      .sort({ uploadedAt: -1 }) // Latest first
      .toArray();

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
