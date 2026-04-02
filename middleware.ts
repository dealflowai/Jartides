import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.ca";

export async function middleware(request: NextRequest) {
  // Handle CORS preflight for API routes
  if (
    request.nextUrl.pathname.startsWith("/api/") &&
    request.method === "OPTIONS"
  ) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect account routes
  if (pathname.startsWith("/account") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // Role check happens in admin layout (can't query DB in middleware efficiently)
  }

  // Redirect logged-in users from auth pages
  if ((pathname === "/login" || pathname === "/register") && user) {
    const raw = request.nextUrl.searchParams.get("redirect") || "/account";
    const redirect = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
    const url = request.nextUrl.clone();
    url.pathname = redirect;
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  // Attach CORS headers to API responses
  if (request.nextUrl.pathname.startsWith("/api/")) {
    supabaseResponse.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/login", "/register", "/api/:path*"],
};
