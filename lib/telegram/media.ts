/**
 * lib/telegram/media.ts
 *
 * CRM-3 media download pipeline.
 *   1. Check file_unique_id for duplicates
 *   2. Get Telegram file URL via getFile API
 *   3. Download binary
 *   4. Upload to Supabase Storage (order-files bucket)
 *   5. Update telegram_attachments + telegram_messages.storage_path
 *
 * Max retries: 3. After 3 failures → download_status = 'failed'.
 * Never throws.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { getFileUrl } from "./bot";

const BUCKET = "order-files";
const MAX_RETRIES = 3;
const MAX_FILE_BYTES = 20 * 1024 * 1024; // Telegram Bot API hard limit

// ── Extension resolution ──────────────────────────────────────────────────────

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "audio/ogg": "oga",
  "audio/mpeg": "mp3",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt",
};

const TYPE_TO_EXT: Record<string, string> = {
  photo: "jpg",
  voice: "oga",
  video: "mp4",
  video_note: "mp4",
  sticker: "webp",
  document: "bin",
};

function resolveExt(type: string, mimeType?: string | null, fileName?: string | null): string {
  if (fileName) {
    const m = fileName.match(/\.([^.]+)$/);
    if (m) return m[1].toLowerCase();
  }
  if (mimeType && MIME_TO_EXT[mimeType]) return MIME_TO_EXT[mimeType];
  return TYPE_TO_EXT[type] ?? "bin";
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type MediaProcessInput = {
  messageId: string;
  orderId: string;
  fileId: string;
  fileUniqueId: string;
  messageType: string;
  metadata: Record<string, unknown>;
};

type AdminClient = ReturnType<typeof createAdminClient>;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function markFailed(admin: AdminClient, attId: string, messageId: string): Promise<void> {
  await Promise.all([
    admin
      .from("telegram_attachments")
      .update({ download_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", attId),
    admin
      .from("telegram_messages")
      .update({ media_status: "failed" })
      .eq("id", messageId),
  ]);
}

async function incrementRetry(
  admin: AdminClient,
  attId: string,
  messageId: string,
  currentRetry: number
): Promise<void> {
  const newCount = currentRetry + 1;
  const status = newCount >= MAX_RETRIES ? "failed" : "pending";
  await admin
    .from("telegram_attachments")
    .update({
      download_status: status,
      retry_count: newCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", attId);
  if (status === "failed") {
    await admin
      .from("telegram_messages")
      .update({ media_status: "failed" })
      .eq("id", messageId);
  }
}

// ── Core pipeline ─────────────────────────────────────────────────────────────

export async function processMedia(input: MediaProcessInput): Promise<void> {
  const { messageId, orderId, fileId, fileUniqueId, messageType, metadata } = input;
  const admin = createAdminClient();

  try {
    // ── 1. Duplicate check ───────────────────────────────────────────────────
    const { data: existing } = await admin
      .from("telegram_attachments")
      .select("id, storage_path, download_status")
      .eq("file_unique_id", fileUniqueId)
      .maybeSingle();

    if (existing?.download_status === "done" && existing.storage_path) {
      // Already downloaded — just link this message to the existing file
      await admin
        .from("telegram_messages")
        .update({
          storage_path: existing.storage_path,
          storage_bucket: BUCKET,
          media_status: "done",
        })
        .eq("id", messageId);
      return;
    }

    // ── 2. Prepare attachment record ─────────────────────────────────────────
    const mimeType = metadata.mime_type as string | undefined;
    const fileName = metadata.file_name as string | undefined;
    const ext = resolveExt(messageType, mimeType, fileName);
    const storagePath = `${orderId}/telegram/${fileUniqueId}.${ext}`;

    const { data: att, error: attErr } = await admin
      .from("telegram_attachments")
      .upsert(
        {
          message_id: messageId,
          type: messageType,
          file_id: fileId,
          file_unique_id: fileUniqueId,
          storage_path: storagePath,
          storage_bucket: BUCKET,
          mime_type: mimeType ?? null,
          file_size: (metadata.file_size as number) ?? null,
          width: (metadata.width as number) ?? null,
          height: (metadata.height as number) ?? null,
          duration: (metadata.duration as number) ?? null,
          file_name: fileName ?? null,
          download_status: "downloading",
          metadata,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "file_unique_id" }
      )
      .select("id, retry_count")
      .single();

    if (attErr || !att) {
      console.error("[media] attachment upsert failed:", attErr?.message);
      return;
    }

    if (att.retry_count >= MAX_RETRIES) {
      await markFailed(admin, att.id, messageId);
      return;
    }

    // ── 3. Guard: file size limit ────────────────────────────────────────────
    const fileSize = metadata.file_size as number | undefined;
    if (fileSize && fileSize > MAX_FILE_BYTES) {
      console.warn(`[media] file too large: ${fileSize} bytes — skipping download`);
      await markFailed(admin, att.id, messageId);
      return;
    }

    // ── 4. Get Telegram download URL ─────────────────────────────────────────
    const fileUrl = await getFileUrl(fileId);
    if (!fileUrl) {
      console.error(`[media] getFileUrl returned null for file_id=${fileId}`);
      await incrementRetry(admin, att.id, messageId, att.retry_count);
      return;
    }

    // ── 5. Download ──────────────────────────────────────────────────────────
    let fileBuffer: ArrayBuffer;
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fileBuffer = await res.arrayBuffer();
    } catch (err) {
      console.error(`[media] download failed:`, err instanceof Error ? err.message : err);
      await incrementRetry(admin, att.id, messageId, att.retry_count);
      return;
    }

    // ── 6. Upload to Storage ─────────────────────────────────────────────────
    const contentType = mimeType ?? "application/octet-stream";
    const { error: uploadErr } = await admin.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, { contentType, upsert: true });

    if (uploadErr) {
      console.error(`[media] storage upload failed:`, uploadErr.message);
      await incrementRetry(admin, att.id, messageId, att.retry_count);
      return;
    }

    // ── 7. Mark done ─────────────────────────────────────────────────────────
    await Promise.all([
      admin
        .from("telegram_attachments")
        .update({ download_status: "done", updated_at: new Date().toISOString() })
        .eq("id", att.id),
      admin
        .from("telegram_messages")
        .update({ storage_path: storagePath, storage_bucket: BUCKET, media_status: "done" })
        .eq("id", messageId),
    ]);

    console.log(`[media] ✓ downloaded ${messageType} → ${storagePath}`);
  } catch (err) {
    console.error("[media] unexpected error:", err instanceof Error ? err.message : err);
  }
}

// ── Auto-classify filename for material promotion ─────────────────────────────

export type MaterialTarget = "logo" | "hero" | "gallery" | "background" | "team" | "document";

export function classifyFile(fileName: string | null | undefined, messageType: string): MaterialTarget {
  const lower = (fileName ?? "").toLowerCase();
  if (lower.startsWith("logo")) return "logo";
  if (lower.startsWith("hero") || lower.startsWith("banner")) return "hero";
  if (lower.startsWith("bg") || lower.startsWith("background")) return "background";
  if (lower.startsWith("team") || lower.startsWith("staff")) return "team";
  if (messageType === "document") return "document";
  return "gallery";
}
