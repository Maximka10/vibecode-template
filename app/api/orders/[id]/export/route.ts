import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const admin = createAdminClient();

  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

  // Build export payload
  const exportData = {
    exported_at: new Date().toISOString(),
    order_id: order.id,
    template_id: order.template_id,
    template_name: order.template_name,
    total_price: order.total_price,
    notes: order.notes,
    status: order.status,
    primary_color: order.primary_color,
    bg_color: order.bg_color,
    domain: order.domain,
    project_url: order.project_url,
    selected_options: order.selected_options,
  };

  const fileName = `orders/${id}/export-${Date.now()}.json`;
  const fileContent = JSON.stringify(exportData, null, 2);

  // Upload to Supabase Storage (bucket: exports)
  const { error: uploadError } = await admin.storage
    .from("exports")
    .upload(fileName, fileContent, {
      contentType: "application/json",
      upsert: true,
    });

  if (uploadError) {
    // Return the data directly if storage upload fails (bucket may not exist)
    return NextResponse.json({
      ok: true,
      storage: false,
      data: exportData,
      error: uploadError.message,
    });
  }

  const { data: urlData } = admin.storage.from("exports").getPublicUrl(fileName);

  return NextResponse.json({
    ok: true,
    storage: true,
    url: urlData.publicUrl,
    fileName,
    data: exportData,
  });
}
