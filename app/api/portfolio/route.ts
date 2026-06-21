import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .select(
        "id, template_name, portfolio_industry, portfolio_description, portfolio_screenshot_url, project_url"
      )
      .eq("is_portfolio", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[portfolio] fetch error:", error.message);
      return NextResponse.json({ ok: false, error: "Failed to fetch portfolio" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data ?? [] });
  } catch (e) {
    console.error("[portfolio] unhandled:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
