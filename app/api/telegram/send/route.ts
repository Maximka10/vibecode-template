/**
 * POST /api/telegram/send
 *
 * Admin-only. Sends a message to a client via Telegram bot.
 * Stores the outbound message in telegram_messages.
 *
 * Body: { order_id: string; text: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { sendMessage } from "@/lib/telegram/bot";

export async function POST(req: NextRequest) {
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  let body: { order_id?: string; text?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { order_id, text } = body;
  if (!order_id || typeof order_id !== "string") return NextResponse.json({ ok: false, error: "order_id required" }, { status: 400 });
  if (!text || typeof text !== "string" || !text.trim()) return NextResponse.json({ ok: false, error: "text required" }, { status: 400 });

  const admin = createAdminClient();

  // Fetch order + linked client (join telegram_clients for chat_id)
  const { data: order } = await admin
    .from("orders")
    .select("id, telegram_client_id")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  if (!order.telegram_client_id) return NextResponse.json({ ok: false, error: "Order has no linked Telegram account" }, { status: 400 });

  const clientId = order.telegram_client_id as string;

  const { data: tgClient } = await admin
    .from("telegram_clients")
    .select("id, chat_id")
    .eq("id", clientId)
    .single();

  if (!tgClient?.chat_id) return NextResponse.json({ ok: false, error: "Telegram client record not found" }, { status: 500 });

  // Send via Bot API
  const tgMsgId = await sendMessage(tgClient.chat_id as number, text);

  if (!tgMsgId) {
    return NextResponse.json({ ok: false, error: "Failed to send via Telegram" }, { status: 502 });
  }

  // Store outbound message
  const { data: msg, error } = await admin
    .from("telegram_messages")
    .insert({
      order_id,
      client_id: clientId,
      telegram_msg_id: tgMsgId,
      direction: "outbound",
      message_type: "text",
      message_status: "delivered",
      content_text: text.trim(),
      sent_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    console.error("[telegram/send] DB insert error:", error.message);
    return NextResponse.json({ ok: false, error: "Message sent but DB insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: msg });
}
