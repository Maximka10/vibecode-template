/**
 * PATCH /api/orders/[id]/portfolio — update portfolio + lead status fields
 */
import { NextRequest, NextResponse } from "next/server";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const { id: orderId } = await params;
  const body = (await req.json()) as {
    is_portfolio?: boolean;
    portfolio_industry?: string;
    portfolio_description?: string;
    lead_status?: string;
  };

  const allowed = ["is_portfolio", "portfolio_industry", "portfolio_description", "lead_status"];
  const patch = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  const admin = createAdminClient();
  const { error } = await admin.from("orders").update(patch).eq("id", orderId);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
