import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI as string;
const client = new MongoClient(MONGODB_URI);
const db = client.db("Cluster0"); // Change this to your actual DB name
const usersCollection = db.collection("users");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await client.connect(); // Ensure the client is connected

    // Check if the username already exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    // Hash the password before storing it
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    // Store user in MongoDB
    const newUser = await usersCollection.insertOne({ username, password: hashedPassword });

    console.log("New user created:", newUser);

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });

  } catch (error: any) {
    console.error("Registration error:", error);

    return NextResponse.json({ error: "Registration failed", details: error.message || "Unknown error" }, { status: 500 });

  } finally {
    await client.close(); // Close the client after each request to prevent memory leaks
  }
}
