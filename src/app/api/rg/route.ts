import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"], // Enable logging
});

function hashPassword(password: string) {
  return crypto.createHash("sha512").update(password).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }, // Use the correct field
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    return NextResponse.json({ message: "User registered successfully", user }, { status: 201 });
  } catch (error) {
    console.error("Registration Error Details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : null,
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}