import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_FIELDS = [
  "company_name",
  "company_description",
  "phone",
  "email",
  "telegram",
  "whatsapp",
  "address",
  "working_hours",
  "domain_name",
  "contact_link",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const admin = createAdminClient();

    // Validate order exists
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ ok: false, error: "Заявка не найдена" }, { status: 404 });
    }

    const body = await req.json() as Record<string, unknown>;
    const patch: Record<string, unknown> = { order_id: orderId };

    for (const field of ALLOWED_FIELDS) {
      if (field in body) patch[field] = body[field];
    }

    const { error: upsertErr } = await admin
      .from("project_data")
      .upsert(patch, { onConflict: "order_id" });

    if (upsertErr) {
      console.error("[brief-public] upsert error:", upsertErr.message);
      return NextResponse.json({ ok: false, error: "Не удалось сохранить данные" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[brief-public] unhandled:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
