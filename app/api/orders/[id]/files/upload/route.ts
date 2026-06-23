import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";

const BUCKET = "order-files";
const VALID_FOLDERS = ["logo", "photos", "documents"] as const;
type Folder = (typeof VALID_FOLDERS)[number];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = formData.get("folder") as string | null;
  const materialType = (formData.get("material_type") as string | null) || folder || "other";
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;
  const placementNotes = formData.get("placement_notes") as string | null;

  if (!file) return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  if (!folder || !VALID_FOLDERS.includes(folder as Folder)) {
    return NextResponse.json({ ok: false, error: "Invalid folder" }, { status: 400 });
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${id}/${folder}/${Date.now()}_${sanitizedName}`;

  const admin = createAdminClient();
  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to read file data" }, { status: 400 });
  }
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // Store file metadata in project_data.content_edits.file_metadata
  const { data: pd } = await admin.from("project_data").select("content_edits").eq("order_id", id).maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentEdits: Record<string, any> = (pd?.content_edits as Record<string, any>) ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileMetadata: Record<string, any> = contentEdits.file_metadata ?? {};
  fileMetadata[path] = { type: materialType, title: title || "", description: description || "", placement_notes: placementNotes || "", uploaded_at: new Date().toISOString() };
  contentEdits.file_metadata = fileMetadata;
  await admin.from("project_data").upsert({ order_id: id, content_edits: contentEdits }, { onConflict: "order_id" });

  // Long-lived (1 year): this URL may be persisted into section data, so a
  // short TTL would make the saved image 404 once the hour elapsed.
  const { data: signedData } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365);
  const url = signedData?.signedUrl ?? admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ ok: true, path, url, metadata: fileMetadata[path] });
}
