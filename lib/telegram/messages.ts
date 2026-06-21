/**
 * lib/telegram/messages.ts
 *
 * Handles incoming Telegram updates:
 *   - /start ORDER_UUID  → link client to order
 *   - All message types  → store in telegram_messages
 *
 * Called exclusively from the webhook route handler.
 * Never throws — all errors are caught and logged.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { sendMessage } from "./bot";
import { processMedia } from "./media";

// Kick off media processing as a separate serverless invocation.
// after() is unreliable on Vercel — the execution context is torn down
// before outbound HTTP calls (getFile + download + upload) complete.
function dispatchMediaProcessing(input: Parameters<typeof processMedia>[0]): void {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseUrl) {
    // Fallback: best-effort in-process (works locally, may be killed on Vercel)
    void processMedia(input);
    return;
  }
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  fetch(`${baseUrl}/api/internal/process-media`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { "x-internal-secret": secret } : {}),
    },
    body: JSON.stringify(input),
  }).catch((err: unknown) => {
    console.error("[tg/messages] dispatchMediaProcessing fetch failed:", err);
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

type TgUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
};

type TgFile = {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
};

type TgPhoto = TgFile & { width: number; height: number };
type TgDocument = TgFile & { mime_type?: string; file_name?: string };
type TgVoice = TgFile & { duration: number; mime_type?: string };
type TgVideo = TgFile & { duration: number; width: number; height: number; mime_type?: string };
type TgVideoNote = TgFile & { duration: number };
type TgSticker = TgFile & { emoji?: string; set_name?: string };

export type TgMessage = {
  message_id: number;
  from?: TgUser;
  chat: { id: number };
  date: number;
  text?: string;
  caption?: string;
  photo?: TgPhoto[];
  document?: TgDocument;
  voice?: TgVoice;
  video?: TgVideo;
  video_note?: TgVideoNote;
  sticker?: TgSticker;
};

export type TgUpdate = {
  update_id: number;
  message?: TgMessage;
};

// ── Upsert telegram_clients ───────────────────────────────────────────────────

async function upsertClient(from: TgUser): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("telegram_clients")
    .upsert(
      {
        chat_id: from.id,
        username: from.username ?? null,
        first_name: from.first_name ?? null,
        last_name: from.last_name ?? null,
        language_code: from.language_code ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "chat_id" }
    )
    .select("id")
    .single();

  if (error || !data) {
    console.error("[tg/messages] upsertClient error:", error?.message);
    return null;
  }
  return data.id;
}

// ── /start ORDER_UUID handler ─────────────────────────────────────────────────

async function handleStart(chatId: number, from: TgUser, payload: string): Promise<void> {
  // payload is everything after "/start ", should be a UUID
  const orderId = payload.trim();
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(orderId)) {
    await sendMessage(chatId, "❌ Неверная ссылка. Используйте ссылку из письма.");
    return;
  }

  const admin = createAdminClient();

  // Fetch order
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("id, status, template_name, telegram_client_id")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    await sendMessage(chatId, "❌ Заказ не найден. Проверьте ссылку.");
    return;
  }

  // Upsert telegram_clients record
  const clientId = await upsertClient(from);
  if (!clientId) {
    await sendMessage(chatId, "⚠️ Ошибка сервера. Попробуйте позже.");
    return;
  }

  // Check if already linked to a DIFFERENT client
  if (order.telegram_client_id && order.telegram_client_id !== clientId) {
    await sendMessage(chatId, "⚠️ Этот заказ уже привязан к другому аккаунту Telegram.");
    return;
  }

  // Link order → telegram_client
  const { error: linkErr } = await admin
    .from("orders")
    .update({
      telegram_client_id: clientId,
    })
    .eq("id", orderId);

  if (linkErr) {
    console.error("[tg/messages] handleStart link error:", linkErr.message);
    await sendMessage(chatId, "⚠️ Ошибка привязки. Попробуйте позже.");
    return;
  }

  // Store system message
  await storeMessage({
    orderId,
    clientId,
    chatId,
    direction: "inbound",
    type: "system",
    text: `Telegram аккаунт привязан к заказу ${orderId.slice(0, 8)}`,
  });

  const statusLabels: Record<string, string> = {
    new:            "🆕 Новая заявка — менеджер свяжется с вами в течение часа",
    contacted:      "💬 Менеджер уже работает с вашим заказом",
    in_progress:    "🔨 Сайт в разработке — срок 3 рабочих дня",
    waiting_client: "👀 Мы ожидаем вашей обратной связи — напишите нам здесь",
    completed:      "✅ Ваш сайт готов!",
    cancelled:      "❌ Заявка отменена",
  };

  const name = from.first_name ? `, ${from.first_name}` : "";
  await sendMessage(
    chatId,
    `👋 Привет${name}!\n\n` +
    `✅ Заказ *${order.template_name ?? orderId.slice(0, 8)}* успешно привязан.\n\n` +
    `📊 Статус: ${statusLabels[order.status] ?? order.status}\n\n` +
    `Пишите сюда — мы ответим в рабочее время.`
  );
}

// ── Message storage ───────────────────────────────────────────────────────────

type StoreInput = {
  orderId: string;
  clientId: string;
  chatId: number;
  direction: "inbound" | "outbound";
  type: string;
  text?: string | null;
  telegramMsgId?: number;
  fileId?: string | null;
  fileUniqueId?: string | null;
  metadata?: Record<string, unknown>;
};

async function storeMessage(input: StoreInput): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("telegram_messages")
    .insert({
      order_id: input.orderId,
      client_id: input.clientId,
      telegram_msg_id: input.telegramMsgId ?? null,
      direction: input.direction,
      message_type: input.type,
      content_text: input.text ?? null,
      file_id: input.fileId ?? null,
      file_unique_id: input.fileUniqueId ?? null,
      metadata: input.metadata ?? {},
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[tg/messages] storeMessage error:", error.message);
    return null;
  }
  return data?.id ?? null;
}

// ── Order lookup by chat_id ───────────────────────────────────────────────────

async function findOrderByChatId(
  chatId: number,
  disambiguationChoice?: number
): Promise<{ orderId: string; clientId: string } | null> {
  const admin = createAdminClient();

  // Find active client record (with active_order_id for multi-order disambiguation)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: client } = await (admin.from("telegram_clients") as any)
    .select("id, active_order_id")
    .eq("chat_id", chatId)
    .single();

  if (!client) return null;

  const clientRecord = client as { id: string; active_order_id: string | null };

  // Find all non-cancelled orders for this client
  const { data: orders } = await admin
    .from("orders")
    .select("id, template_name")
    .eq("telegram_client_id", clientRecord.id)
    .not("status", "eq", "cancelled")
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) return null;

  // If user sent a disambiguation choice, update and return
  if (disambiguationChoice !== undefined) {
    const chosen = orders[disambiguationChoice - 1];
    if (chosen) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin.from("telegram_clients") as any)
        .update({ active_order_id: chosen.id })
        .eq("id", clientRecord.id);
      await sendMessage(chatId, `✅ Выбрана заявка: *${chosen.template_name ?? chosen.id.slice(0, 8)}*`);
      return { orderId: chosen.id, clientId: clientRecord.id };
    }
  }

  // Single order — update active_order_id and return
  if (orders.length === 1) {
    if (clientRecord.active_order_id !== orders[0].id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin.from("telegram_clients") as any)
        .update({ active_order_id: orders[0].id })
        .eq("id", clientRecord.id);
    }
    return { orderId: orders[0].id, clientId: clientRecord.id };
  }

  // Multiple orders — check if there's a valid active selection
  const activeOrder = clientRecord.active_order_id
    ? orders.find((o) => o.id === clientRecord.active_order_id)
    : null;

  if (activeOrder) {
    return { orderId: activeOrder.id, clientId: clientRecord.id };
  }

  // No valid selection — send disambiguation message
  const list = orders
    .map((o, i) => `${i + 1}. ${o.template_name ?? o.id.slice(0, 8)}`)
    .join("\n");

  await sendMessage(
    chatId,
    `У вас несколько активных заявок. Напишите номер нужной:\n\n${list}`
  );

  return null;
}

// ── Main update handler ───────────────────────────────────────────────────────

export async function handleUpdate(update: TgUpdate): Promise<void> {
  const msg = update.message;
  if (!msg || !msg.from) return;

  const chatId = msg.chat.id;
  const from = msg.from;
  const msgId = msg.message_id;

  // ── /start flow ─────────────────────────────────────────────────────────────
  if (msg.text?.startsWith("/start")) {
    const parts = msg.text.split(" ");
    if (parts.length > 1) {
      await handleStart(chatId, from, parts.slice(1).join(" "));
    } else {
      await sendMessage(
        chatId,
        "👋 Добро пожаловать в Vibecode Studio!\n\nДля привязки заказа перейдите по ссылке из письма."
      );
    }
    return;
  }

  // ── Check if this is a disambiguation choice (digit 1-9) ────────────────────
  const trimmedText = msg.text?.trim() ?? "";
  const digitChoice = /^[1-9]$/.test(trimmedText) ? parseInt(trimmedText, 10) : undefined;

  // ── Find linked order ────────────────────────────────────────────────────────
  const linked = await findOrderByChatId(chatId, digitChoice);
  if (!linked) {
    // Could be: disambiguation sent, unknown client, or no orders
    // If it was a digit for disambiguation, findOrderByChatId already replied.
    // Otherwise, prompt to link.
    if (digitChoice === undefined) {
      await sendMessage(
        chatId,
        "👋 Привяжите заказ через ссылку из письма, чтобы начать общение с командой."
      );
    }
    return;
  }

  // If user sent a digit and we resolved it, don't store it as a content message
  if (digitChoice !== undefined) return;

  const { orderId, clientId } = linked;

  // ── Text ────────────────────────────────────────────────────────────────────
  if (msg.text) {
    await storeMessage({ orderId, clientId, chatId, direction: "inbound", type: "text", text: msg.text, telegramMsgId: msgId });
    return;
  }

  // ── Photo (use largest size) ─────────────────────────────────────────────────
  if (msg.photo?.length) {
    const largest = msg.photo[msg.photo.length - 1];
    const meta = { width: largest.width, height: largest.height, file_size: largest.file_size };
    const photoId = await storeMessage({
      orderId, clientId, chatId, direction: "inbound", type: "photo",
      text: msg.caption ?? null, telegramMsgId: msgId,
      fileId: largest.file_id, fileUniqueId: largest.file_unique_id,
      metadata: meta,
    });
    if (photoId) {
      dispatchMediaProcessing({
        messageId: photoId, orderId,
        fileId: largest.file_id, fileUniqueId: largest.file_unique_id,
        messageType: "photo", metadata: meta,
      });
    }
    return;
  }

  // ── Document ─────────────────────────────────────────────────────────────────
  if (msg.document) {
    const d = msg.document;
    const meta = { mime_type: d.mime_type, file_name: d.file_name, file_size: d.file_size };
    const docId = await storeMessage({
      orderId, clientId, chatId, direction: "inbound", type: "document",
      text: msg.caption ?? d.file_name ?? null, telegramMsgId: msgId,
      fileId: d.file_id, fileUniqueId: d.file_unique_id,
      metadata: meta,
    });
    if (docId) {
      dispatchMediaProcessing({
        messageId: docId, orderId,
        fileId: d.file_id, fileUniqueId: d.file_unique_id,
        messageType: "document", metadata: meta,
      });
    }
    return;
  }

  // ── Voice ────────────────────────────────────────────────────────────────────
  if (msg.voice) {
    const v = msg.voice;
    const meta = { duration: v.duration, mime_type: v.mime_type, file_size: v.file_size };
    const voiceId = await storeMessage({
      orderId, clientId, chatId, direction: "inbound", type: "voice",
      telegramMsgId: msgId, fileId: v.file_id, fileUniqueId: v.file_unique_id,
      metadata: meta,
    });
    if (voiceId) {
      dispatchMediaProcessing({
        messageId: voiceId, orderId,
        fileId: v.file_id, fileUniqueId: v.file_unique_id,
        messageType: "voice", metadata: meta,
      });
    }
    return;
  }

  // ── Video ────────────────────────────────────────────────────────────────────
  if (msg.video) {
    const v = msg.video;
    const meta = { duration: v.duration, width: v.width, height: v.height, mime_type: v.mime_type, file_size: v.file_size };
    const videoId = await storeMessage({
      orderId, clientId, chatId, direction: "inbound", type: "video",
      text: msg.caption ?? null, telegramMsgId: msgId,
      fileId: v.file_id, fileUniqueId: v.file_unique_id,
      metadata: meta,
    });
    if (videoId) {
      dispatchMediaProcessing({
        messageId: videoId, orderId,
        fileId: v.file_id, fileUniqueId: v.file_unique_id,
        messageType: "video", metadata: meta,
      });
    }
    return;
  }

  // ── VideoNote ────────────────────────────────────────────────────────────────
  if (msg.video_note) {
    const vn = msg.video_note;
    const meta = { duration: vn.duration, file_size: vn.file_size };
    const vnId = await storeMessage({
      orderId, clientId, chatId, direction: "inbound", type: "video_note",
      telegramMsgId: msgId, fileId: vn.file_id, fileUniqueId: vn.file_unique_id,
      metadata: meta,
    });
    if (vnId) {
      dispatchMediaProcessing({
        messageId: vnId, orderId,
        fileId: vn.file_id, fileUniqueId: vn.file_unique_id,
        messageType: "video_note", metadata: meta,
      });
    }
    return;
  }

  // ── Sticker (store file_id only, no download) ────────────────────────────────
  if (msg.sticker) {
    const st = msg.sticker;
    await storeMessage({
      orderId, clientId, chatId, direction: "inbound", type: "sticker",
      telegramMsgId: msgId, fileId: st.file_id, fileUniqueId: st.file_unique_id,
      metadata: { emoji: st.emoji, set_name: st.set_name },
    });
    return;
  }

  // Unsupported type — log and ignore
  console.warn("[tg/messages] Unsupported message type:", JSON.stringify(Object.keys(msg)));
}
