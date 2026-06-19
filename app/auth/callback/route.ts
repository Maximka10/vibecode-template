import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Build redirect target exclusively from NEXT_PUBLIC_SITE_URL — never from req.url
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  // Validate `next` is a safe relative path to prevent open redirects
  const safePath = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const redirectUrl = new URL(safePath, siteUrl);

  if (!code) {
    console.error("[auth/callback] No code param — redirecting to login");
    return NextResponse.redirect(new URL("/auth/login?error=missing_code", siteUrl));
  }

  // Create redirect response BEFORE supabase client so cookies land on this response
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            })
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(new URL("/auth/login?error=auth_failed", siteUrl));
  }

  // Log cookie count for debug — remove after stability confirmed
  if (process.env.NODE_ENV !== "production") {
    const cookieCount = [...response.cookies.getAll()].length;
    console.log(`[auth/callback] success — ${cookieCount} cookies written → ${redirectUrl.toString()}`);
  }

  return response;
}
