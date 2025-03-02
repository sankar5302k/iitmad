import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { Buffer } from "buffer";

const MONGODB_URI = process.env.MONGODB_URI!;
const client = new MongoClient(MONGODB_URI);
const dbName = "Cluster0";
const collectionName = "uploads";

const dogBreeds = [
  "Labrador Retriever",
  "German Shepherd",
  "Golden Retriever",
  "Bulldog",
  "Poodle",
  "Beagle",
  "Dachshund",
  "Siberian Husky",
  "Doberman Pinscher",
  "Shih Tzu",
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const username = formData.get("username") as string;

    if (!file || !username) {
      return NextResponse.json({ error: "Missing image or username" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    const result = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.insertOne({
      username,
      image: base64Image,
      result,
      uploadedAt: new Date(),
    });

    return NextResponse.json({ message: "Image uploaded successfully", result }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
