import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware = AUTHENTICATION GATE ONLY.
 *
 * It checks whether a session cookie exists. It does NOT look up roles and
 * does NOT make role-based routing decisions — those belong in Server
 * Components where a proper DB call can be made.
 *
 * Protected route  + no session  → redirect to /auth/login
 * Everything else                → pass through
 *
 * Deliberately excluded from matcher: /auth/callback (must not run before
 * exchangeCodeForSession writes cookies into its own response).
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, {
              ...options,
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const protectedPaths = ["/admin", "/studio", "/dashboard"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  if (process.env.NODE_ENV !== "production") {
    console.log(`[middleware] ${path} | user=${user?.id ?? "none"}`);
  }

  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL!);
    return NextResponse.redirect(loginUrl);
  }

  // Do NOT redirect from /auth/login based on role — middleware cannot query
  // the profiles table reliably in the edge runtime. The login page's own
  // server component handles post-auth routing.

  return res;
}

export const config = {
  matcher: ["/studio/:path*", "/admin/:path*", "/dashboard/:path*", "/auth/login"],
};
