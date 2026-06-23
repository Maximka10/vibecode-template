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

    const paths = data.map((f) => `${id}/${folder}/${f.name}`);
    // Long-lived (1 year): these URLs get persisted into gallery/hero section
    // data, so a short TTL would make saved images 404 in the preview and the
    // exported ZIP once the hour elapsed.
    const { data: signed } = await admin.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 24 * 365);
    const urlMap: Record<string, string> = {};
    for (const s of signed ?? []) {
      if (s.signedUrl && s.path) urlMap[s.path] = s.signedUrl;
    }

    results[folder] = data.map((f, idx) => {
      const path = paths[idx];
      // Fall back to public URL if signed URL is unavailable
      const url = urlMap[path] ?? admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      return {
        name: f.name,
        url,
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
