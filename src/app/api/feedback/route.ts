import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const dbName = "your_database_name"; // Change this to your actual DB name
const collectionName = "feedback"; // Collection name

export async function POST(req: Request) {
  try {
    const { username, feedback } = await req.json();

    if (!username || !feedback.trim()) {
      return NextResponse.json({ error: "Username and feedback are required." }, { status: 400 });
    }

    await client.connect();
    const db = client.db(dbName);
    const feedbackCollection = db.collection(collectionName);

    await feedbackCollection.insertOne({
      username,
      feedback,
      timestamp: new Date(),
    });

    return NextResponse.json({ message: "Feedback submitted successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Feedback submission failed:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  } finally {
    await client.close();
  }
}
