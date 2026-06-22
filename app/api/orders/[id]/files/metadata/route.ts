import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const { path, metadata } = await req.json() as {
    path: string;
    metadata: { type?: string; title?: string; description?: string; placement_notes?: string };
  };

  if (!path || !path.startsWith(`${id}/`)) {
    return NextResponse.json({ ok: false, error: "Invalid path" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: pd } = await admin
    .from("project_data")
    .select("content_edits")
    .eq("order_id", id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentEdits: Record<string, any> = (pd?.content_edits as Record<string, any>) ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileMetadata: Record<string, any> = contentEdits.file_metadata ?? {};
  fileMetadata[path] = { ...(fileMetadata[path] ?? {}), ...metadata, updated_at: new Date().toISOString() };
  contentEdits.file_metadata = fileMetadata;

  const { error } = await admin
    .from("project_data")
    .upsert({ order_id: id, content_edits: contentEdits }, { onConflict: "order_id" });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
