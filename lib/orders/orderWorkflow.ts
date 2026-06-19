import { createAdminClient } from "@/lib/supabase/admin";

// ── Types ────────────────────────────────────────────────────────────────────

export type OrderAction =
  | "CONFIRM_PAYMENT"
  | "START_WORK"
  | "REQUEST_CLIENT_INPUT"
  | "COMPLETE_ORDER"
  | "CANCEL_ORDER";

export type OrderStatus =
  | "new"
  | "contacted"
  | "in_progress"
  | "waiting_client"
  | "completed"
  | "cancelled";

export type ActorRole = "admin" | "client";

export type TransitionInput = {
  orderId: string;
  action: OrderAction;
  actorId: string;
  actorRole: ActorRole;
};

export type TransitionResult =
  | { ok: true; orderId: string; status: OrderStatus; previousStatus: OrderStatus }
  | { ok: false; error: string; code: "NOT_FOUND" | "FORBIDDEN" | "INVALID_TRANSITION" | "DB_ERROR" | "UNKNOWN" };

// ── State machine ─────────────────────────────────────────────────────────────

// Maps action → { requiredRole, allowedFromStatuses, targetStatus }
const TRANSITIONS: Record<
  OrderAction,
  { role: ActorRole; from: OrderStatus[]; to: OrderStatus }
> = {
  CONFIRM_PAYMENT: {
    role: "client",
    from: ["new"],
    to: "contacted",
  },
  START_WORK: {
    role: "admin",
    from: ["new", "contacted"],
    to: "in_progress",
  },
  REQUEST_CLIENT_INPUT: {
    role: "admin",
    from: ["in_progress", "contacted"],
    to: "waiting_client",
  },
  COMPLETE_ORDER: {
    role: "admin",
    from: ["in_progress", "waiting_client"],
    to: "completed",
  },
  CANCEL_ORDER: {
    role: "admin",
    from: ["new", "contacted", "in_progress", "waiting_client"],
    to: "cancelled",
  },
};

// ── Telegram helper ───────────────────────────────────────────────────────────

async function sendTelegramNotification(
  order: Record<string, unknown>,
  action: OrderAction,
  newStatus: OrderStatus
): Promise<void> {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, NEXT_PUBLIC_SITE_URL } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[orderWorkflow] Telegram not configured — skipping notification");
    return;
  }

  const siteUrl = NEXT_PUBLIC_SITE_URL ?? "https://vibecode-studio-pink.vercel.app";
  const orderId = order.id as string;
  const link = `${siteUrl}/admin/orders/${orderId}`;

  const ACTION_LABELS: Record<OrderAction, string> = {
    CONFIRM_PAYMENT: "✅ Клиент подтвердил заказ",
    START_WORK: "🔨 Работа начата",
    REQUEST_CLIENT_INPUT: "⏳ Ожидаем ответа клиента",
    COMPLETE_ORDER: "🎉 Заказ завершён",
    CANCEL_ORDER: "❌ Заказ отменён",
  };

  const lines = [
    `${ACTION_LABELS[action]} #${orderId.slice(0, 8)}`,
    ``,
    `👤 ${order.client_name ?? "—"}`,
    order.client_phone ? `📞 ${order.client_phone}` : null,
    `📐 Шаблон: *${order.template_name ?? order.template_id ?? "—"}*`,
    `📊 Статус: *${newStatus}*`,
    order.total_price
      ? `💰 ${Number(order.total_price).toLocaleString("ru-RU")} ₽`
      : null,
    ``,
    `🔗 [Открыть заказ](${link})`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: lines,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      }
    );

    if (tgRes.ok) {
      console.log(`[orderWorkflow] Telegram sent for action=${action} order=${orderId}`);
    } else {
      const errText = await tgRes.text();
      console.error(`[orderWorkflow] Telegram API error for order=${orderId}:`, errText);
    }
  } catch (err) {
    console.error(
      `[orderWorkflow] Telegram network error for order=${orderId}:`,
      err instanceof Error ? err.message : err
    );
  }
}

// ── Core engine ───────────────────────────────────────────────────────────────

export async function transitionOrder(input: TransitionInput): Promise<TransitionResult> {
  const { orderId, action, actorId, actorRole } = input;
  console.log(`[orderWorkflow] transition received: action=${action} orderId=${orderId} actorId=${actorId} actorRole=${actorRole}`);

  // 1. Validate action is known
  const transition = TRANSITIONS[action];
  if (!transition) {
    console.error(`[orderWorkflow] Unknown action: ${action}`);
    return { ok: false, error: `Unknown action: ${action}`, code: "INVALID_TRANSITION" };
  }

  // 2. Permission check
  if (transition.role !== actorRole) {
    console.warn(`[orderWorkflow] Permission denied: action=${action} requires role=${transition.role} but actor has role=${actorRole}`);
    return {
      ok: false,
      error: `Action ${action} requires role "${transition.role}"`,
      code: "FORBIDDEN",
    };
  }
  console.log(`[orderWorkflow] permission check passed: actorRole=${actorRole}`);

  // 3. Fetch current order
  const admin = createAdminClient();
  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("id, status, user_id, client_name, client_phone, template_id, template_name, total_price")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    console.error(`[orderWorkflow] Order not found: orderId=${orderId}`, fetchError?.message);
    return { ok: false, error: "Order not found", code: "NOT_FOUND" };
  }

  const previousStatus = order.status as OrderStatus;
  console.log(`[orderWorkflow] current status: ${previousStatus} → target: ${transition.to}`);

  // 4. Validate transition is allowed from current status
  if (!transition.from.includes(previousStatus)) {
    console.warn(
      `[orderWorkflow] Invalid transition: action=${action} not allowed from status=${previousStatus}. Allowed from: [${transition.from.join(", ")}]`
    );
    return {
      ok: false,
      error: `Cannot perform ${action} when order is "${previousStatus}". Allowed from: ${transition.from.join(", ")}`,
      code: "INVALID_TRANSITION",
    };
  }

  // 5. For client actions: verify actor owns the order
  if (actorRole === "client" && order.user_id !== actorId) {
    console.warn(`[orderWorkflow] Ownership check failed: actorId=${actorId} order.user_id=${order.user_id}`);
    return { ok: false, error: "Order does not belong to this user", code: "FORBIDDEN" };
  }

  // 6. Apply status update
  const { error: updateError } = await admin
    .from("orders")
    .update({ status: transition.to, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateError) {
    console.error(`[orderWorkflow] DB update failed for orderId=${orderId}:`, updateError.message);
    return { ok: false, error: updateError.message, code: "DB_ERROR" };
  }

  console.log(`[orderWorkflow] status updated: ${previousStatus} → ${transition.to} for orderId=${orderId}`);

  // 7. Fire Telegram notification (non-blocking — never throws)
  sendTelegramNotification(order, action, transition.to).catch((err) => {
    console.error("[orderWorkflow] Unexpected Telegram error (should not happen):", err);
  });

  return {
    ok: true,
    orderId,
    status: transition.to,
    previousStatus,
  };
}
