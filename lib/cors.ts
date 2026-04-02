import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.ca";

/**
 * Add CORS headers to an existing response.
 * Only allows requests from the configured site URL.
 */
export function withCors(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

/**
 * Handle CORS preflight (OPTIONS) requests.
 * Call this at the top of any API route that needs CORS.
 */
export function handlePreflight(request: NextRequest): NextResponse | null {
  if (request.method !== "OPTIONS") return null;

  return withCors(
    new NextResponse(null, { status: 204 })
  );
}
