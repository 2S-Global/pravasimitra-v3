// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Convert secret to Uint8Array
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const { nextUrl, cookies } = req;
  const token = cookies.get("token")?.value;

  console.log("✅ Middleware running for:", nextUrl.pathname);

  // If token is missing, redirect to login
  if (!token) {
    console.log("No token, redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verify JWT token
  try {
    await jwtVerify(token, SECRET);
    console.log("Token valid, access granted");
    return NextResponse.next();
  } catch (err) {
    console.log("Invalid token, redirecting to /login", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Only run middleware on these paths
export const config = {
  matcher: [
    "/user/:path*",
    "/buy-sell/:path*",
    "/rent-lease/:path*",
    "/marketplace/:path*",
  ],
};
