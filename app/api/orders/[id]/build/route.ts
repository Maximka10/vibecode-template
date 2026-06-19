import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { buildOrderSite } from "@/lib/build/buildOrderSite";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("site_builds")
    .select("*")
    .eq("order_id", id)
    .order("build_version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, build: data ?? null });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const admin = createAdminClient();

  // Fetch order + project_data in parallel
  const [orderRes, projectDataRes, latestBuildRes] = await Promise.all([
    admin.from("orders").select("*").eq("id", id).single(),
    admin.from("project_data").select("*").eq("order_id", id).maybeSingle(),
    admin
      .from("site_builds")
      .select("build_version")
      .eq("order_id", id)
      .order("build_version", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (orderRes.error || !orderRes.data) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

  const nextVersion = (latestBuildRes.data?.build_version ?? 0) + 1;
  const buildData = buildOrderSite(orderRes.data, projectDataRes.data, nextVersion);

  const { data: saved, error: saveError } = await admin
    .from("site_builds")
    .insert({ order_id: id, build_data: buildData, build_version: nextVersion })
    .select()
    .single();

  if (saveError) {
    return NextResponse.json({ ok: false, error: saveError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, build: saved, build_data: buildData });
}
