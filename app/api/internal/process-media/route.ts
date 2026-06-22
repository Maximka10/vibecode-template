/**
 * POST /api/internal/process-media
 *
 * Internal-only route called by the webhook after storing a media message.
 * Runs as a separate serverless invocation so it has its own execution lifetime,
 * replacing the unreliable after() pattern on Vercel.
 *
 * Protected by TELEGRAM_WEBHOOK_SECRET — not callable from outside.
 */

import { NextRequest, NextResponse } from "next/server";
import { processMedia, type MediaProcessInput } from "@/lib/telegram/media";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Verify internal secret — same token used for Telegram webhook
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers.get("x-internal-secret");
    if (header !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let input: MediaProcessInput;
  try {
    input = (await req.json()) as MediaProcessInput;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  if (!input.messageId || !input.fileId || !input.fileUniqueId) {
    return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
  }

  await processMedia(input);
  return NextResponse.json({ ok: true });
}
