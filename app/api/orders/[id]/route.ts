/**
 * PATCH /api/orders/[id]
 *
 * Admin-only. Updates ORDER METADATA only.
 *
 * EXPLICITLY FORBIDDEN: status
 * Status changes MUST go through POST /api/orders/transition → transitionOrder()
 *
 * Allowed fields: project_url, domain, notes, launch_date, admin_url
 * Validation enforced by lib/contracts/order.validate.ts
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/lib/supabase/role";
import { validatePatchPayload } from "@/lib/contracts/order.validate";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(user.id);
  if (role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  // ── Validate via contract layer ───────────────────────────────────────────
  const validation = validatePatchPayload(body);
  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, error: validation.error, fields: validation.fields },
      { status: validation.fields?.includes("status") ? 422 : 400 }
    );
  }

  const update = {
    ...validation.payload,
    updated_at: new Date().toISOString(),
  };

  // ── Apply update ──────────────────────────────────────────────────────────
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update(update)
    .eq("id", id)
    .select("id, status, project_url, domain, notes, launch_date, admin_url, updated_at")
    .single();

  if (error) {
    console.error(`[PATCH /api/orders/${id}] DB error:`, error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, order: data });
}
