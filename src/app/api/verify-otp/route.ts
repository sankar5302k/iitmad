import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, otp, requestTimestamp } = await request.json();

    if (!email || !otp || !requestTimestamp) {
      return NextResponse.json({ error: "Email, OTP, and request timestamp are required" }, { status: 400 });
    }

    // Check if OTP has expired (10 minutes validity)
    const currentTime = Date.now();
    const otpExpirationTime = 10 * 60 * 1000; // 10 minutes in milliseconds
    if (currentTime - requestTimestamp > otpExpirationTime) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // Generate the expected OTP
    const expectedOtp = generateOtp(email, requestTimestamp);

    // Verify the OTP
    if (otp !== expectedOtp) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}

// Function to generate OTP based on email and timestamp
function generateOtp(email: string, timestamp: number): string {
  const baseString = `${email}-${timestamp}-${process.env.OTP_SECRET}`;
  const hash = require("crypto").createHash("sha256").update(baseString).digest("hex");
  return hash.substring(0, 6); // Use the first 6 characters as OTP
}