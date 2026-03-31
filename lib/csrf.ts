import { NextRequest, NextResponse } from "next/server";

/**
 * Validates that a state-changing request originates from the same site
 * by checking the Origin (or Referer) header against the configured site URL.
 * Returns null if valid, or a 403 response if the origin doesn't match.
 */
export function verifyCsrf(request: NextRequest): NextResponse | null {
  const origin =
    request.headers.get("origin") ||
    request.headers.get("referer");

  // Allow server-to-server calls (e.g. webhooks) that have no Origin/Referer
  if (!origin) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const allowed = new URL(siteUrl).origin;
    const incoming = new URL(origin).origin;

    if (incoming === allowed) return null;
  } catch {
    // Malformed URL — reject
  }

  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}
