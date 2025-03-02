import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI as string;
const client = new MongoClient(MONGODB_URI);
const db = client.db("Cluster0"); // Change this to your actual DB name
const usersCollection = db.collection("users");

// Function to hash passwords using SHA-256
const hashPassword = (password: string) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and Password are required" }, { status: 400 });
    }

    await client.connect(); // Ensure connection before querying

    // Find user in the database
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Hash the provided password and compare with stored hashed password
    const hashedPassword = hashPassword(password);
    if (hashedPassword !== user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ message: "Login successful" }, { status: 200 });

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed", details: error.message || "Unknown error" }, { status: 500 });

  } finally {
    await client.close(); // Close connection after request
  }
}
