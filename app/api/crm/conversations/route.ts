/**
 * GET /api/crm/conversations
 * Admin-only. Returns all telegram-linked orders with last message and unread count.
 * Sorted by last message time DESC.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";

export type Conversation = {
  order_id: string;
  order_status: string;
  template_name: string | null;
  client_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  chat_id: number;
  company_name: string | null;
  last_message_text: string | null;
  last_message_type: string | null;
  last_message_at: string | null;
  last_message_direction: string | null;
  unread_count: number;
};

export async function GET(_req: NextRequest) {
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const admin = createAdminClient();

  const { data: orders, error: ordersErr } = await admin
    .from("orders")
    .select("id, status, template_name, telegram_client_id, updated_at")
    .not("telegram_client_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (ordersErr || !orders?.length) {
    return NextResponse.json({ ok: true, conversations: [] });
  }

  const orderIds = orders.map((o) => o.id);
  const clientIds = [...new Set(orders.map((o) => o.telegram_client_id as string))];

  const [clientsRes, pdRes, msgsRes] = await Promise.all([
    admin
      .from("telegram_clients")
      .select("id, first_name, last_name, username, chat_id")
      .in("id", clientIds),
    admin
      .from("project_data")
      .select("order_id, company_name")
      .in("order_id", orderIds),
    admin
      .from("telegram_messages")
      .select("order_id, direction, message_status, content_text, message_type, sent_at")
      .in("order_id", orderIds)
      .order("sent_at", { ascending: false })
      .limit(2000),
  ]);

  const clientMap = Object.fromEntries((clientsRes.data ?? []).map((c) => [c.id, c]));
  const pdMap = Object.fromEntries((pdRes.data ?? []).map((p) => [p.order_id, p]));

  type MsgRow = { order_id: string; direction: string; message_status: string; content_text: string | null; message_type: string; sent_at: string };
  const lastMsgByOrder: Record<string, MsgRow> = {};
  const unreadByOrder: Record<string, number> = {};
  for (const msg of msgsRes.data ?? []) {
    if (!lastMsgByOrder[msg.order_id]) lastMsgByOrder[msg.order_id] = msg;
    if (msg.direction === "inbound" && msg.message_status === "received") {
      unreadByOrder[msg.order_id] = (unreadByOrder[msg.order_id] ?? 0) + 1;
    }
  }

  const conversations: Conversation[] = orders.map((order) => {
    const client = clientMap[order.telegram_client_id as string];
    const pd = pdMap[order.id];
    const lastMsg = lastMsgByOrder[order.id];

    return {
      order_id: order.id,
      order_status: order.status,
      template_name: order.template_name,
      client_id: client?.id ?? "",
      first_name: client?.first_name ?? null,
      last_name: client?.last_name ?? null,
      username: client?.username ?? null,
      chat_id: client?.chat_id ?? 0,
      company_name: pd?.company_name ?? null,
      last_message_text: lastMsg?.content_text ?? null,
      last_message_type: lastMsg?.message_type ?? null,
      last_message_at: lastMsg?.sent_at ?? null,
      last_message_direction: lastMsg?.direction ?? null,
      unread_count: unreadByOrder[order.id] ?? 0,
    };
  });

  conversations.sort((a, b) => {
    if (!a.last_message_at && !b.last_message_at) return 0;
    if (!a.last_message_at) return 1;
    if (!b.last_message_at) return -1;
    return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
  });

  return NextResponse.json({ ok: true, conversations });
}
