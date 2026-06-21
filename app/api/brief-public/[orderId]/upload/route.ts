import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
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

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Файл не найден" }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `order-files/${orderId}/client/${Date.now()}_${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadErr } = await admin.storage
      .from("order-files")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadErr) {
      console.error("[brief-public/upload] storage error:", uploadErr.message);
      return NextResponse.json({ ok: false, error: "Не удалось загрузить файл" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, path: storagePath });
  } catch (e) {
    console.error("[brief-public/upload] unhandled:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
