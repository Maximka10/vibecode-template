import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";

export async function GET() {
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin.from("workspace_settings").select("*").maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data: data ?? {} });
}

export async function PATCH(req: NextRequest) {
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const allowed = [
    "company_name", "company_desc", "contact_email", "contact_phone",
    "contact_tg", "services", "branding_color", "branding_logo",
    "domain", "content_about",
  ] as const;

  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workspace_settings")
    .upsert({ id: "00000000-0000-0000-0000-000000000001", ...patch }, { onConflict: "id" })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data });
}
