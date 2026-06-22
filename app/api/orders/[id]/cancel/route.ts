import { NextRequest, NextResponse } from "next/server";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { transitionOrder } from "@/lib/orders/orderWorkflow";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const result = await transitionOrder({
    orderId: id,
    action: "CANCEL_ORDER",
    actorId: auth.user.id,
    actorRole: "admin",
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true, status: result.status });
}
