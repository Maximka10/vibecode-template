import { createClient } from "@/lib/supabase/client";

const BUCKET = "media";

export async function uploadImage(
  file: File,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) return { url: null, error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return { url: publicUrl, error: null };
}

export async function deleteImage(path: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return { error: error?.message ?? null };
}

export function getPublicUrl(path: string): string {
  const supabase = createClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}

/** Extract storage path from a full Supabase public URL */
export function pathFromUrl(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function isImageUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");
}
