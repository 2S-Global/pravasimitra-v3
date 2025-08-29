import { NextResponse } from 'next/server';

export function middleware(request) {
  let response;

  if (request.method === 'OPTIONS') {
    response = new NextResponse(null, { status: 204 });
  } else {
    response = NextResponse.next();
  }

  // ⬇️ REPLACE with your actual frontend domain
  const allowedOrigin = 'http://localhost:3000';

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}
