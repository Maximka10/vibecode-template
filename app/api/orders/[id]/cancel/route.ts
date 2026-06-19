import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { transitionOrder } from "@/lib/orders/orderWorkflow";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const { reason } = await req.json();
  if (!reason?.trim()) {
    return NextResponse.json({ ok: false, error: "cancel_reason is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Patch cancel metadata first
  const { error: patchError } = await admin
    .from("orders")
    .update({
      cancel_reason: reason.trim(),
      cancelled_by: auth.user.id,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (patchError) {
    console.error("[cancel] patch failed:", patchError.message);
    return NextResponse.json({ ok: false, error: patchError.message }, { status: 500 });
  }

  // Then transition status via workflow engine
  const result = await transitionOrder({
    orderId: id,
    action: "CANCEL_ORDER",
    actorId: auth.user.id,
    actorRole: "admin",
  });

  if (!result.ok) {
    console.warn("[cancel] transition failed:", result.error);
    // Metadata was already patched — still treat as partial success
    return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true, status: result.status });
}
