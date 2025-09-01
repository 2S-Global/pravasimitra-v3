import { NextResponse } from "next/server";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import User from "../../../../../models/User";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

const connectDB = async () => {
  if (mongoose.connections[0].readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
};

// 🔐 Generate a random, secure password
const generatePassword = () => {
  return (
    Math.random().toString(36).slice(-5) +
    "@" +
    Math.floor(10 + Math.random() * 90)
  );
};

// 📧 Send new password email
const sendNewPasswordEmail = async (userEmail, userName, newPassword) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Pravasi Mitra" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Password Reset Request",
    html: `
      <p><img src="https://res.cloudinary.com/dwy9i2fqt/image/upload/v1755090539/Pravasi_Mitra_Logo_vwfvsb.png" alt="Pravasi Mitra" style="width:150px;"></p>
      <p>Hello ${userName},</p>
      <p>You requested a password reset on Pravasi Mitra.</p>
      <p>Your new auto-generated password is:</p>
      <h3>${newPassword}</h3>
      <p>Please use this password to log in. You may change it after logging in for better security.</p>
    `,
  });
};

export async function POST(req) {
  await connectDB();

  try {
    const { email } = await req.json();

    if (!email) {
      return addCorsHeaders(
        NextResponse.json({ error: "Email is required" }, { status: 400 })
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return addCorsHeaders(
        NextResponse.json({ error: "No user found with this email" }, { status: 401 })
      );
    }

    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await sendNewPasswordEmail(user.email, user.name || "User", newPassword);

    return addCorsHeaders(
      NextResponse.json({ msg: "New password sent to your email." }, { status: 200 })
    );
  } catch (error) {
    console.error("Forgot-password error:", error);
    return addCorsHeaders(
      NextResponse.json({ error: "Server error" }, { status: 500 })
    );
  }
}
