import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const admin = createAdminClient();

  // Delete associated messages first to avoid FK violations
  await admin.from("messages").delete().eq("order_id", id);

  const { error } = await admin.from("orders").delete().eq("id", id);
  if (error) {
    console.error("[delete order] failed:", error.message);
    return NextResponse.json({ ok: false, error: "Failed to delete order" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
