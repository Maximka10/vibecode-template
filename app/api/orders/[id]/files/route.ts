import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";

const BUCKET = "order-files";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const admin = createAdminClient();
  const folders = ["logo", "photos", "documents"] as const;
  const results: Record<string, Array<{ name: string; url: string; size?: number; created_at?: string; path: string; metadata: Record<string, unknown> }>> = {};

  // Fetch file metadata stored in project_data
  const { data: pd } = await admin.from("project_data").select("content_edits").eq("order_id", id).maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileMetadata: Record<string, any> = (pd?.content_edits as Record<string, any>)?.file_metadata ?? {};

  for (const folder of folders) {
    const { data, error } = await admin.storage
      .from(BUCKET)
      .list(`${id}/${folder}`, { limit: 100 });

    if (error || !data) { results[folder] = []; continue; }

    results[folder] = data.map((f) => {
      const path = `${id}/${folder}/${f.name}`;
      const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(path);
      return {
        name: f.name,
        url: urlData.publicUrl,
        size: f.metadata?.size as number | undefined,
        created_at: f.created_at ?? undefined,
        path,
        metadata: fileMetadata[path] ?? {},
      };
    });
  }

  return NextResponse.json({ ok: true, files: results });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const { path } = await req.json();
  if (!path || !path.startsWith(`${id}/`)) {
    return NextResponse.json({ ok: false, error: "Invalid path" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.storage.from(BUCKET).remove([path]);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
