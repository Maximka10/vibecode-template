/**
 * POST /api/telegram/webhook
 *
 * Receives all updates from Telegram. MUST return 200 within 5s.
 * Heavy work (media download) is NOT done here — stored for async processing.
 *
 * Security:
 *  1. X-Telegram-Bot-Api-Secret-Token header verification
 *  2. update_id deduplication via telegram_webhook_log
 *
 * Never throws to Telegram — all errors are caught internally.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleUpdate, type TgUpdate } from "@/lib/telegram/messages";

const OK = () => NextResponse.json({ ok: true }, { status: 200 });

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Verify secret token ──────────────────────────────────────────────────
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      // Return 200 anyway — Telegram will stop retrying on non-200, but we
      // don't want to reveal whether the endpoint exists.
      console.warn("[webhook] Invalid secret token — ignoring");
      return OK();
    }
  }

  // ── 2. Parse body ───────────────────────────────────────────────────────────
  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    console.error("[webhook] Failed to parse JSON body");
    return OK(); // Always 200 to Telegram
  }

  if (!update?.update_id) {
    return OK();
  }

  // ── 3. Dedup: insert update_id, skip if already seen ───────────────────────
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("telegram_webhook_log")
      .insert({ update_id: update.update_id })
      // ON CONFLICT DO NOTHING equivalent — if PK exists, no rows inserted
      .select("update_id");

    if (error) {
      if (error.code === "23505") {
        // Duplicate update_id — Telegram retry, silently ignore
        return OK();
      }
      console.error("[webhook] webhook_log insert error:", error.message);
      // Continue processing even if log insert failed (better than dropping message)
    }
  } catch (err) {
    console.error("[webhook] webhook_log error:", err);
  }

  // ── 4. Process update ───────────────────────────────────────────────────────
  try {
    await handleUpdate(update);
  } catch (err) {
    // Catch-all: log but always return 200 so Telegram doesn't retry
    console.error("[webhook] handleUpdate threw:", err instanceof Error ? err.message : err);
  }

  return OK();
}

// Telegram only sends POST — block other methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
