import { connectDB } from "../../../../../lib/db";
import User from "../../../../../models/User";
import { signToken } from "../../../../../lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req) {
  await connectDB();

  const { identifier, password } = await req.json();

  const user = await User.findOne({
    $or: [{ email: identifier }, { mobile: identifier }],
    isDel: false
  }).select('+password').lean();

  if (!user) {
    const res = NextResponse.json({ msg: "Invalid Email" }, { status: 200 });
    return addCorsHeaders(res);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const res = NextResponse.json({ msg: "Incorrect Password" }, { status: 200 });
    return addCorsHeaders(res);
  }

  const token = signToken({
    id: user._id,
    name: user.name,  
    email: user.email
  });

  delete user.password;

  const res = NextResponse.json({
    msg: `Welcome ${user.name}`,
    user,
    token 
  });

res.cookies.set("token", token, {
  httpOnly: true,
  sameSite: "none",
  secure: true,    // ✅ must be true with SameSite=None
  path: "/",
  maxAge: 7 * 24 * 60 * 60
});
  return addCorsHeaders(res);
}
