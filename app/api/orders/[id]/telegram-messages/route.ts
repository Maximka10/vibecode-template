/**
 * GET  /api/orders/[id]/telegram-messages  — fetch message history (admin)
 * POST /api/orders/[id]/telegram-messages/read — mark all inbound as read (admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const admin = createAdminClient();

  // Fetch messages + client info in parallel
  const [msgRes, orderRes] = await Promise.all([
    admin
      .from("telegram_messages")
      .select("*")
      .eq("order_id", id)
      .order("sent_at", { ascending: true })
      .limit(200),
    admin
      .from("orders")
      .select("id, status, template_name, telegram_chat_id, telegram_client_id, telegram_linked_at")
      .eq("id", id)
      .single(),
  ]);

  if (orderRes.error) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });

  // Fetch client info if linked
  let client = null;
  if (orderRes.data.telegram_client_id) {
    const { data } = await admin
      .from("telegram_clients")
      .select("*")
      .eq("id", orderRes.data.telegram_client_id)
      .single();
    client = data;
  }

  const unreadCount = (msgRes.data ?? []).filter(
    (m) => m.direction === "inbound" && m.message_status === "received"
  ).length;

  return NextResponse.json({
    ok: true,
    messages: msgRes.data ?? [],
    order: orderRes.data,
    client,
    unreadCount,
  });
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const admin = createAdminClient();
  await admin
    .from("telegram_messages")
    .update({ message_status: "read" })
    .eq("order_id", id)
    .eq("direction", "inbound")
    .eq("message_status", "received");

  return NextResponse.json({ ok: true });
}
