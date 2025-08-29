import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import User from "../../../../../models/User";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";


export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req) {
  await connectDB();

  try {
    const { email } = await req.json();

    if (!email) {
      return addCorsHeaders(
        NextResponse.json({ success: false, msg: "Email is required" }, { status: 400 })
      );
    }

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser && existingUser.isDel === false) {
      return addCorsHeaders(
        NextResponse.json({ success: false, msg: "Email is already registered" }, { status: 200 })
      );
    }

    return addCorsHeaders(
      NextResponse.json({ success: true, msg: "Email is available for signup" }, { status: 200 })
    );
  } catch (error) {
    console.error("Email check error:", error);
    return addCorsHeaders(
      NextResponse.json({ success: false, msg: "Server Error" }, { status: 500 })
    );
  }
}
