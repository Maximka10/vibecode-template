/**
 * lib/telegram/bot.ts
 *
 * Low-level Telegram Bot API helpers.
 * All functions are fire-and-forget safe (never throw, log on failure).
 */

const getToken = (): string | null => process.env.TELEGRAM_BOT_TOKEN ?? null;

type TelegramResponse = { ok: boolean; result?: unknown; description?: string; error_code?: number };

async function callBot(method: string, body: Record<string, unknown>): Promise<TelegramResponse> {
  const token = getToken();
  if (!token) {
    console.error("[telegram/bot] TELEGRAM_BOT_TOKEN is not set");
    return { ok: false, description: "TELEGRAM_BOT_TOKEN not set" };
  }
  const url = `https://api.telegram.org/bot${token}/${method}`;
  console.log(`[telegram/bot] callBot ${method} chat_id=${String(body.chat_id ?? "")}`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json() as TelegramResponse;
  console.log(`[telegram/bot] ${method} response ok=${json.ok} error_code=${json.error_code ?? "-"} description=${json.description ?? "-"}`);
  return json;
}

/** Send a plain-text or Markdown message to a chat. Returns Telegram message_id or null. */
export async function sendMessage(
  chatId: number | bigint,
  text: string,
  options?: { parse_mode?: "Markdown" | "HTML"; disable_web_page_preview?: boolean }
): Promise<number | null> {
  try {
    const r = await callBot("sendMessage", {
      chat_id: Number(chatId),
      text,
      parse_mode: options?.parse_mode ?? "Markdown",
      disable_web_page_preview: options?.disable_web_page_preview ?? true,
    });
    if (r.ok && r.result && typeof r.result === "object") {
      return (r.result as { message_id: number }).message_id ?? null;
    }
    console.error("[telegram/bot] sendMessage failed — ok:", r.ok, "error_code:", r.error_code, "description:", r.description);
    return null;
  } catch (err) {
    console.error("[telegram/bot] sendMessage threw:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

/** Resolve a Telegram file_id to a download URL. Returns null if unavailable or >20MB. */
export async function getFileUrl(fileId: string): Promise<string | null> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return null;
    const r = await callBot("getFile", { file_id: fileId });
    if (!r.ok || !r.result) return null;
    const filePath = (r.result as { file_path?: string }).file_path;
    if (!filePath) return null;
    return `https://api.telegram.org/file/bot${token}/${filePath}`;
  } catch {
    return null;
  }
}

// ── Status notification messages sent to clients ──────────────────────────────

const CLIENT_STATUS_MESSAGES: Record<string, string | null> = {
  contacted:
    "👋 *Менеджер на связи!*\n\nМы получили вашу заявку и приступаем к подготовке. Здесь будут приходить обновления по заказу.",
  in_progress:
    "✅ *Работа над вашим сайтом началась!*\n\nСрок — 3 рабочих дня. Напишите сюда, если возникнут вопросы.",
  waiting_client:
    "👀 *Нам нужна ваша обратная связь.*\n\nОтветьте на это сообщение — это самый быстрый способ связаться с нами.",
  completed:
    "🎉 *Ваш сайт готов!*\n\nСпасибо, что выбрали нас. Напишите, если нужны правки.",
  cancelled:
    "❌ *Заявка отменена.*\n\nЕсли это ошибка или вы хотите продолжить — напишите нам.",
};

/**
 * Send an automatic status notification to a linked client.
 * Non-blocking: never throws, failure is logged only.
 */
export async function sendClientStatusNotification(
  chatId: number | bigint,
  newStatus: string,
  projectUrl?: string | null
): Promise<void> {
  const text = CLIENT_STATUS_MESSAGES[newStatus];
  if (!text) return;

  const full = projectUrl && newStatus === "completed"
    ? `${text}\n\n🌐 ${projectUrl}`
    : text;

  await sendMessage(Number(chatId), full).catch(() => null);
}
