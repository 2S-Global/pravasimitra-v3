import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { NextResponse } from "next/server";

export function withAuth(handler) {
  return async function (req) {
    let token;

    // 1. Check cookie
const cookieStore = await cookies();      
    token = cookieStore.get("token")?.value;

    // 2. If not in cookie, check Authorization header
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    // 3. Validate
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "You are Unauthorized" }, { status: 401 });
    }

    return handler(req, user);
  };
}
