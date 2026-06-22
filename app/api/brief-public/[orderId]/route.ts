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
    console.log("[brief-public] incoming payload:", JSON.stringify(body));

    const patch: Record<string, unknown> = { order_id: orderId };

    for (const field of ALLOWED_FIELDS) {
      if (field in body) patch[field] = body[field];
    }

    console.log("[brief-public] before project_data upsert, patch:", JSON.stringify(patch));

    const { error: upsertErr } = await admin
      .from("project_data")
      .upsert(patch, { onConflict: "order_id" });

    console.log("[brief-public] after project_data upsert — error:", JSON.stringify(upsertErr));

    if (upsertErr) {
      console.error("[brief-public] upsert error:", upsertErr.message, "code:", upsertErr.code, "details:", upsertErr.details, "hint:", upsertErr.hint);
      return NextResponse.json(
        { ok: false, error: upsertErr.message, code: upsertErr.code, details: upsertErr.details },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[brief-public]", error);
    return NextResponse.json(
      { ok: false, error: String(error), stack: error instanceof Error ? error.stack : null },
      { status: 500 }
    );
  }
}
