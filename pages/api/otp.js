import nodemailer from 'nodemailer'; // If using nodemailer for sending emails

let otpStore = {}; // This would store OTPs temporarily for each user. In production, use a database.

const transporter = nodemailer.createTransport({
  service: 'gmail', // For example, using Gmail
  auth: {
    user:process.env.EMAIL, // your email
    pass: process.env.EMAIL_PASSWORD, // your email password
  },
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    // Validate email (make sure it's in proper format)
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with an expiry time (e.g., 5 minutes)
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
      });

      return res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }
  } else if (req.method === 'PUT') {
    const { email, otp } = req.body;

    // Validate OTP and expiration
    if (!otpStore[email]) {
      return res.status(400).json({ error: 'OTP not found for this email' });
    }

    const storedOtp = otpStore[email];

    if (Date.now() > storedOtp.expires) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP is correct and not expired, proceed to next step (e.g., registration)
    delete otpStore[email]; // Clear OTP after successful verification

    return res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
