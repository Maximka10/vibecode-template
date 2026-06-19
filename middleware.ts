import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

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
          // Forward any token refreshes onto both request and response
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

  // Hydrate session — never redirects, only reads/refreshes
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const protectedPaths = ["/admin", "/studio", "/dashboard"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  if (process.env.NODE_ENV !== "production") {
    console.log(`[middleware] ${path} | user=${user?.id ?? "none"} | protected=${isProtected}`);
  }

  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", SITE_URL);
    return NextResponse.redirect(loginUrl);
  }

  if (path === "/auth/login" && user) {
    const dashboardUrl = new URL("/dashboard", SITE_URL);
    return NextResponse.redirect(dashboardUrl);
  }

  return res;
}

export const config = {
  // Deliberately excludes /auth/callback — callback must not be intercepted
  // before exchangeCodeForSession runs and writes cookies into its own response
  matcher: ["/studio/:path*", "/admin/:path*", "/dashboard/:path*", "/auth/login"],
};
