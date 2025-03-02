import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const dbName = "your_database_name"; // Change this to your actual DB name
const collectionName = "purchases"; // Collection name

export async function POST(req: Request) {
  try {
    const { username, items, totalAmount } = await req.json();

    // Validate request
    if (!username || username === "Guest") {
      return NextResponse.json({ error: "User must be logged in to make a purchase" }, { status: 401 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart cannot be empty" }, { status: 400 });
    }

    await client.connect();
    const db = client.db(dbName);
    const purchasesCollection = db.collection(collectionName);

    // Generate order ID
    const orderId = Math.floor(100000 + Math.random() * 900000).toString();

    // Store purchase in MongoDB
    await purchasesCollection.insertOne({
      orderId,
      username,
      items,
      totalAmount,
      timestamp: new Date(),
    });

    return NextResponse.json(
      { success: true, orderId, message: "Purchase successful!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 });
  } finally {
    await client.close();
  }
}
