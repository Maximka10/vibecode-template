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

  // Fetch file metadata + the order (for client-uploaded assets) in parallel
  const [{ data: pd }, { data: orderRow }] = await Promise.all([
    admin.from("project_data").select("content_edits").eq("order_id", id).maybeSingle(),
    admin.from("orders").select("selected_options").eq("id", id).maybeSingle(),
  ]);
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

  // Images the client uploaded in the constructor live in selected_options
  // (hero/cover/gallery) as stable public URLs. Surface them so the admin can
  // reuse them in the gallery picker alongside their own uploads.
  results.client = extractClientAssets(orderRow?.selected_options).map((url) => ({
    name: url.split("/").pop() ?? "client-image",
    url,
    path: "",
    metadata: { type: "client" },
  }));

  return NextResponse.json({ ok: true, files: results });
}

// Pull image URLs out of the client's saved customization (selected_options).
function extractClientAssets(opts: unknown): string[] {
  if (!opts || typeof opts !== "object") return [];
  const sections = ((opts as Record<string, unknown>).sections as Array<Record<string, unknown>> | undefined) ?? [];
  const urls: string[] = [];
  for (const sec of sections) {
    const content = (sec?.content as Record<string, unknown> | undefined) ?? {};
    for (const key of ["heroImage", "coverImage", "image"]) {
      const v = content[key];
      if (typeof v === "string" && v) urls.push(v);
    }
    const images = content.images;
    if (Array.isArray(images)) {
      for (const im of images) {
        if (typeof im === "string" && im) urls.push(im);
        else if (im && typeof im === "object" && typeof (im as Record<string, unknown>).url === "string") {
          urls.push((im as Record<string, string>).url);
        }
      }
    }
  }
  return [...new Set(urls)].filter(Boolean);
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
