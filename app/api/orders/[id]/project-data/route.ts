import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("project_data")
    .select("*")
    .eq("order_id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: "Failed to fetch project data" }, { status: 500 });
  return NextResponse.json({ ok: true, data: data ?? null });
}

const ALLOWED_KEYS = [
  "company_name", "company_description", "phone", "email", "telegram",
  "address", "working_hours", "domain_name", "services",
  "seo_title", "seo_description", "branding", "content_edits",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const patch: Record<string, unknown> = { order_id: id };
  for (const key of ALLOWED_KEYS) {
    if (key in body) patch[key] = body[key];
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("project_data")
    .upsert(patch, { onConflict: "order_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: "Failed to update project data" }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
