/**
 * PATCH /api/orders/[id]
 *
 * Admin-only. Updates ORDER METADATA only.
 *
 * EXPLICITLY FORBIDDEN: status
 * Status changes MUST go through POST /api/orders/transition → transitionOrder()
 *
 * Allowed fields: project_url, domain, notes, launch_date, admin_url
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/lib/supabase/role";

const METADATA_FIELDS = ["project_url", "domain", "notes", "launch_date", "admin_url"] as const;
type MetadataField = (typeof METADATA_FIELDS)[number];

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

  // ── Hard block on status field ────────────────────────────────────────────
  if ("status" in body) {
    console.warn(
      `[PATCH /api/orders/${id}] Blocked attempt to set status directly. Use POST /api/orders/transition.`
    );
    return NextResponse.json(
      {
        ok: false,
        error:
          'Direct status updates are not allowed. Use POST /api/orders/transition with the appropriate action.',
      },
      { status: 422 }
    );
  }

  // ── Build safe update payload ─────────────────────────────────────────────
  const update: Partial<Record<MetadataField, unknown>> & { updated_at: string } = {
    updated_at: new Date().toISOString(),
  };

  let hasFields = false;
  for (const key of METADATA_FIELDS) {
    if (key in body) {
      update[key] = body[key];
      hasFields = true;
    }
  }

  if (!hasFields) {
    return NextResponse.json(
      { ok: false, error: `No updatable fields provided. Allowed: ${METADATA_FIELDS.join(", ")}` },
      { status: 400 }
    );
  }

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

  console.log(`[PATCH /api/orders/${id}] metadata updated by admin=${user.id} fields=${Object.keys(update).filter(k => k !== "updated_at").join(",")}`);
  return NextResponse.json({ ok: true, order: data });
}
