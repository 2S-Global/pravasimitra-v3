import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const url = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isUserPage = url.pathname.startsWith("/user");
  const isLoginPage = url.pathname === "/login";

  // 🟧 If visiting /user/* and not logged in → redirect to /login
  if (isUserPage) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 🟩 If visiting /login and already logged in → redirect to /user/dashboard
if (isLoginPage && token) {
  try {
    await jwtVerify(token, SECRET);
    // console.log("middleware-",token);
    return NextResponse.redirect(new URL("/user/my-account", req.url));
  } catch {
    // Invalid token → clear cookie and allow login
    const res = NextResponse.next();
    res.cookies.set("token", "", { path: "/" });
    return res;
  }
}

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/login"], // 👈 match both login and user pages
};
