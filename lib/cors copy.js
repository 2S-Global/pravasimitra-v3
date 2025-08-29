const ALLOWED_ORIGIN = '*'; // 👈 replace with your actual frontend origin

// const ALLOWED_ORIGINS = [
//   'http://localhost:3000',
//   'https://pravasimitra.vercel.app' // 👈 add your deployed frontend here
// ];

export function addCorsHeaders(response, origin = ALLOWED_ORIGIN) {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS,PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export function optionsResponse(origin = ALLOWED_ORIGIN) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS,PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    },
  });
}
