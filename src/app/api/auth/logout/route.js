import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addCorsHeaders, optionsResponse } from "../../../../../lib/cors";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST() {
  // Get cookies from the headers
  const res = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

  res.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  return addCorsHeaders(res);
}
