import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
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

    const { data: pd, error: pdErr } = await admin
      .from("project_data")
      .select("content_edits")
      .eq("order_id", orderId)
      .maybeSingle();

    if (pdErr) {
      return NextResponse.json({ ok: false, error: pdErr.message }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentEdits = (pd?.content_edits as Record<string, any>) ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileMetadata: Record<string, any> = contentEdits.file_metadata ?? {};

    // Return only client_brief files
    const files = Object.entries(fileMetadata)
      .filter(([, meta]) => meta?.source === "client_brief")
      .map(([, meta]) => ({ name: meta.name ?? meta.path, path: meta.path, uploaded_at: meta.uploaded_at }));

    return NextResponse.json({ ok: true, files });
  } catch (e) {
    console.error("[brief-public/files]", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
