import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Function to hash password (same as in register.ts)
function hashPassword(password: string) {
  return crypto.createHash("sha512").update(password).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true, password: true }, // No `id`, use `email`
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Hash the entered password and compare with stored hash
    const hashedInputPassword = hashPassword(password);

    if (hashedInputPassword !== user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Set a session cookie using `email` instead of `id`
    const response = NextResponse.json({ message: "Login successful", user }, { status: 200 });
    response.headers.append("Set-Cookie", `session_id=${user.email}; Path=/; HttpOnly; Secure; SameSite=Strict`);

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}