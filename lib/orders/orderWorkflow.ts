/**
 * orderWorkflow — the ONLY place where orders.status is mutated.
 *
 * Architecture:
 *   transitionOrder()
 *     → acquireLock()            (race condition guard)
 *     → fetch order from DB
 *     → guardTransition()        (state machine + permission + idempotency)
 *     → UPDATE orders.status
 *     → releaseLock()
 *     → sendTelegramNotification() (non-blocking, never throws)
 *
 * No other module in this codebase may call:
 *   admin.from("orders").update({ status: ... })
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { acquireLock, releaseLock, guardTransition } from "./orderGuard";
import { sendClientStatusNotification } from "@/lib/telegram/bot";

// ── Re-export types so consumers import from one place ───────────────────────

export type OrderAction =
  | "CONFIRM_PAYMENT"
  | "MARK_CONTACTED"
  | "START_WORK"
  | "REQUEST_CLIENT_INPUT"
  | "RESUME_WORK"
  | "COMPLETE_ORDER"
  | "REOPEN_ORDER"
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
  | {
      ok: false;
      error: string;
      code: "NOT_FOUND" | "FORBIDDEN" | "INVALID_TRANSITION" | "DB_ERROR" | "LOCKED" | "UNKNOWN";
    };

// ── Telegram ─────────────────────────────────────────────────────────────────

async function sendTelegramNotification(
  order: Record<string, unknown>,
  action: OrderAction,
  newStatus: OrderStatus
): Promise<void> {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, NEXT_PUBLIC_SITE_URL } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[orderWorkflow] Telegram not configured — skipping");
    return;
  }

  const orderId = order.id as string;
  const siteUrl = NEXT_PUBLIC_SITE_URL ?? "https://vibecode-studio-pink.vercel.app";
  const link = `${siteUrl}/admin/orders/${orderId}`;

  const ACTION_LABELS: Record<OrderAction, string> = {
    CONFIRM_PAYMENT: "✅ Клиент подтвердил заказ",
    MARK_CONTACTED: "📞 Связались с клиентом",
    START_WORK: "🔨 Работа начата",
    REQUEST_CLIENT_INPUT: "⏳ Ожидаем ответа клиента",
    RESUME_WORK: "🔄 Работа возобновлена",
    COMPLETE_ORDER: "🎉 Заказ завершён",
    REOPEN_ORDER: "🔁 Заказ возвращён в работу",
    CANCEL_ORDER: "❌ Заказ отменён",
  };

  const lines = [
    `${ACTION_LABELS[action]} #${orderId.slice(0, 8)}`,
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
    const res = await fetch(
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
    if (res.ok) {
      console.log(`[orderWorkflow] Telegram OK action=${action} order=${orderId}`);
    } else {
      console.error(`[orderWorkflow] Telegram API error order=${orderId}:`, await res.text());
    }
  } catch (err) {
    console.error(
      `[orderWorkflow] Telegram network error order=${orderId}:`,
      err instanceof Error ? err.message : err
    );
  }
}

// ── Core engine ───────────────────────────────────────────────────────────────

export async function transitionOrder(input: TransitionInput): Promise<TransitionResult> {
  const { orderId, action, actorId, actorRole } = input;
  console.log(
    `[orderWorkflow] → action=${action} orderId=${orderId} actorId=${actorId} actorRole=${actorRole}`
  );

  // ── 1. In-process lock (double-click / race condition protection) ──────────
  const locked = acquireLock(orderId);
  if (!locked) {
    console.warn(`[orderWorkflow] LOCKED: orderId=${orderId} already processing`);
    return { ok: false, error: "Order is already being processed. Please wait.", code: "LOCKED" };
  }

  try {
    // ── 2. Fetch current order ───────────────────────────────────────────────
    const admin = createAdminClient();
    const { data: order, error: fetchError } = await admin
      .from("orders")
      .select(
        "id, status, user_id, template_id, template_name, total_price, project_url"
      )
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error(`[orderWorkflow] Order not found: orderId=${orderId}`, fetchError?.message);
      return { ok: false, error: "Order not found", code: "NOT_FOUND" };
    }

    // Telegram link is best-effort — it must NEVER block a status change.
    // Looked up separately so a missing column/relationship can't fail the transition.
    let telegramChatId: number | null = null;
    try {
      const { data: link } = await admin
        .from("orders")
        .select("telegram_client_id, telegram_clients(chat_id)")
        .eq("id", orderId)
        .single();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      telegramChatId = (link as any)?.telegram_clients?.chat_id ?? null;
    } catch (err) {
      console.warn(
        "[orderWorkflow] Telegram link lookup skipped:",
        err instanceof Error ? err.message : err
      );
    }

    const previousStatus = order.status as OrderStatus;
    console.log(`[orderWorkflow] current status=${previousStatus} target=${action}`);

    // ── 3. Guard: permissions + state machine + idempotency ─────────────────
    const guard = guardTransition({
      action,
      actorId,
      actorRole,
      currentStatus: previousStatus,
      orderUserId: order.user_id,
    });

    if (!guard.ok) {
      const rejected = guard.result;
      console.warn(
        `[orderWorkflow] guard rejected: action=${action} status=${previousStatus} → ${!rejected.ok ? rejected.error : ""}`
      );
      return rejected;
    }

    const { rule } = guard;
    console.log(`[orderWorkflow] guard passed: ${previousStatus} → ${rule.to}`);

    // ── 4. Apply status update (THE ONLY PLACE this ever happens) ───────────
    const { error: updateError } = await admin
      .from("orders")
      .update({ status: rule.to, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      // Extra safety: only update if status hasn't changed since we read it.
      // This is the serialisation point for multi-instance deployments.
      .eq("status", previousStatus);

    if (updateError) {
      console.error(
        `[orderWorkflow] DB update failed orderId=${orderId}:`,
        updateError.message
      );
      return { ok: false, error: updateError.message, code: "DB_ERROR" };
    }

    console.log(
      `[orderWorkflow] ✓ status updated ${previousStatus} → ${rule.to} for orderId=${orderId}`
    );

    // ── 5. Telegram (non-blocking, failure never aborts the response) ────────
    sendTelegramNotification(order, action, rule.to).catch((err) => {
      console.error("[orderWorkflow] Telegram threw unexpectedly:", err);
    });

    // Send client notification if their Telegram is linked
    if (telegramChatId) {
      sendClientStatusNotification(
        telegramChatId,
        rule.to,
        order.project_url as string | null
      ).catch((err) => {
        console.error("[orderWorkflow] Client Telegram notification failed:", err);
      });
    }

    return { ok: true, orderId, status: rule.to, previousStatus };
  } finally {
    // Lock MUST always be released, even on thrown exceptions
    releaseLock(orderId);
  }
}
