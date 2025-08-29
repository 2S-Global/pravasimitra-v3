import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://pravasimitra.vercel.app",
];

function getAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.includes(origin) ? origin : "";
}

export async function GET(req) {
  const origin = req.headers.get("origin");
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  let isLoggedIn = false;

  if (token?.value) {
    try {
      await jwtVerify(token.value, SECRET);
      isLoggedIn = true;
    } catch {
      isLoggedIn = false;
    }
  }

  const res = NextResponse.json({ isLoggedIn });

  const allowedOrigin = getAllowedOrigin(origin);
  if (allowedOrigin) {
    res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return res;
}

export async function OPTIONS(req) {
  const origin = req.headers.get("origin");

  const res = new Response(null, { status: 204 });
  const allowedOrigin = getAllowedOrigin(origin);
  if (allowedOrigin) {
    res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST,PATCH,PUT OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
  return res;
}
