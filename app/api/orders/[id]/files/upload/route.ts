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

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, path, url: urlData.publicUrl });
}
