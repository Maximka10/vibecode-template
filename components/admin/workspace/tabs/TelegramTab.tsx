"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

type TgMessage = {
  id: string;
  order_id: string;
  client_id: string;
  telegram_msg_id: number | null;
  direction: "inbound" | "outbound";
  message_type: string;
  message_status: string;
  content_text: string | null;
  file_id: string | null;
  file_unique_id: string | null;
  storage_path: string | null;
  storage_bucket: string | null;
  metadata: Record<string, unknown>;
  sent_at: string;
};

type TgClient = {
  id: string;
  chat_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  linked_at: string;
};

type OrderInfo = {
  id: string;
  status: string;
  template_name: string | null;
  telegram_chat_id: number | null;
  telegram_client_id: string | null;
  telegram_linked_at: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function clientDisplayName(c: TgClient | null): string {
  if (!c) return "Клиент";
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ");
  return name || (c.username ? `@${c.username}` : `ID ${c.chat_id}`);
}

const TYPE_ICONS: Record<string, string> = {
  photo: "📷",
  document: "📄",
  voice: "🎤",
  video: "🎥",
  video_note: "📹",
  sticker: "🎭",
  system: "⚙️",
};

const MATERIAL_TYPES = ["logo", "hero", "gallery", "background", "team", "document"] as const;
type MaterialType = (typeof MATERIAL_TYPES)[number];
const MATERIAL_LABELS: Record<MaterialType, string> = {
  logo: "Логотип",
  hero: "Hero фото",
  gallery: "Галерея",
  background: "Фон",
  team: "Команда",
  document: "Документ",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function MaterialPromoter({ orderId, msg }: { orderId: string; msg: TgMessage }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function promote(type: MaterialType) {
    setSaving(true);
    try {
      // Fetch current project_data to merge file_metadata
      const pdRes = await fetch(`/api/orders/${orderId}/project-data`);
      const pd = await pdRes.json();
      const existing = pd.data?.content_edits ?? {};
      const fileMeta = existing.file_metadata ?? {};

      const key = msg.file_unique_id ?? msg.id;
      fileMeta[key] = {
        type,
        name: (msg.metadata?.file_name as string) ?? `telegram_${key}`,
        url: msg.storage_path
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${msg.storage_bucket}/${msg.storage_path}`
          : null,
        file_id: msg.file_id,
        source: "telegram",
        telegram_msg_id: msg.telegram_msg_id,
        added_at: new Date().toISOString(),
      };

      await fetch(`/api/orders/${orderId}/project-data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_edits: { ...existing, file_metadata: fileMeta } }),
      });
      setDone(true);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (done) return <span className="text-[10px] text-green-400/70">✓ В материалах</span>;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-md border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
      >
        → В материалы
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 z-10 min-w-36 rounded-xl border border-white/10 bg-slate-900 p-1.5 shadow-xl">
          {MATERIAL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              disabled={saving}
              onClick={() => promote(t)}
              className="block w-full rounded-lg px-3 py-1.5 text-left text-xs text-white/70 transition hover:bg-white/8 hover:text-white"
            >
              {MATERIAL_LABELS[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg, orderId }: { msg: TgMessage; orderId: string }) {
  const isOut = msg.direction === "outbound";
  const isSys = msg.direction === "inbound" && msg.message_type === "system";

  if (isSys) {
    return (
      <div className="flex justify-center my-2">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/35">
          ⚙️ {msg.content_text}
        </span>
      </div>
    );
  }

  const hasMedia = ["photo", "document", "voice", "video", "video_note", "sticker"].includes(msg.message_type);
  const canPromote = (msg.message_type === "photo" || msg.message_type === "document") && !isOut;

  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[75%] ${isOut ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-3 py-2 text-sm ${
            isOut
              ? "rounded-br-sm bg-cyan-600/80 text-white"
              : "rounded-bl-sm bg-white/10 text-white/90"
          }`}
        >
          {hasMedia && (
            <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
              <span>{TYPE_ICONS[msg.message_type] ?? "📎"}</span>
              <span className="capitalize">{msg.message_type}</span>
              {!!msg.metadata?.file_name && (
                <span className="truncate max-w-32 text-[10px]">{String(msg.metadata.file_name)}</span>
              )}
            </div>
          )}
          {msg.content_text && <p className="leading-relaxed whitespace-pre-wrap">{msg.content_text}</p>}
          {hasMedia && !msg.content_text && !msg.storage_path && (
            <p className="text-[11px] opacity-50">Файл получен · скачивание ожидается</p>
          )}
        </div>
        <div className={`mt-0.5 flex items-center gap-1.5 ${isOut ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-white/25">{fmtTime(msg.sent_at)}</span>
          {isOut && msg.message_status === "delivered" && (
            <span className="text-[10px] text-cyan-400/60">✓✓</span>
          )}
          {canPromote && <MaterialPromoter orderId={orderId} msg={msg} />}
        </div>
      </div>
    </div>
  );
}

// ── Deep-link panel (order not linked) ───────────────────────────────────────

function NotLinkedPanel({ orderId }: { orderId: string }) {
  const [copied, setCopied] = useState(false);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "vibecode_bot";
  const link = `https://t.me/${botUsername}?start=${orderId}`;

  function copy() {
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl">
        💬
      </div>
      <h3 className="text-lg font-bold">Telegram не привязан</h3>
      <p className="mt-2 max-w-xs text-sm text-white/40">
        Отправьте клиенту ссылку. После нажатия Start аккаунт автоматически привяжется к заказу.
      </p>
      <div className="mt-6 flex w-full max-w-md flex-col gap-2">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left font-mono text-xs text-white/60 break-all">
          {link}
        </div>
        <button
          onClick={copy}
          className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
        >
          {copied ? "✓ Скопировано" : "📋 Скопировать ссылку"}
        </button>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm font-semibold text-white/50 transition hover:text-white/80"
        >
          Открыть в Telegram ↗
        </a>
      </div>
    </div>
  );
}

// ── Order context sidebar ─────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  new: "🆕 Новая",
  contacted: "💬 Связались",
  in_progress: "🔨 В работе",
  waiting_client: "⏳ Ожидает клиента",
  completed: "✅ Готово",
  cancelled: "❌ Отменена",
};

function OrderContextPanel({ order, client, projectData }: {
  order: OrderInfo;
  client: TgClient | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projectData?: Record<string, any> | null;
}) {
  return (
    <div className="w-64 shrink-0 space-y-4">
      <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Клиент</p>
        {client ? (
          <div className="space-y-1.5 text-sm">
            <p className="font-bold">{clientDisplayName(client)}</p>
            {client.username && <p className="text-white/40">@{client.username}</p>}
            <p className="text-white/30 text-xs">
              Привязан {new Date(client.linked_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        ) : (
          <p className="text-sm text-white/30">Не привязан</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Заказ</p>
        <div className="space-y-2 text-xs text-white/60">
          <p className="font-semibold text-white/80 text-sm">{order.template_name ?? order.id.slice(0, 8)}</p>
          <p>{STATUS_LABELS[order.status] ?? order.status}</p>
        </div>
      </div>

      {projectData && (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Контакты</p>
          <div className="space-y-1.5 text-xs text-white/60">
            {projectData.company_name && <p className="font-semibold text-white/80">{projectData.company_name}</p>}
            {projectData.phone && <p>📞 {projectData.phone}</p>}
            {projectData.email && <p>✉️ {projectData.email}</p>}
            {projectData.domain_name && <p>🌐 {projectData.domain_name}</p>}
            {projectData.developer_note && (
              <div className="mt-2 rounded-lg border border-cyan-500/20 bg-cyan-500/8 px-2 py-1.5 text-[11px] text-cyan-300/80">
                {projectData.developer_note}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main TelegramTab ──────────────────────────────────────────────────────────

export default function TelegramTab({
  orderId,
  projectData,
}: {
  orderId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projectData?: Record<string, any> | null;
}) {
  const [messages, setMessages] = useState<TgMessage[]>([]);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [client, setClient] = useState<TgClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Load initial data ────────────────────────────────────────────────────
  const load = useCallback(async () => {
    const res = await fetch(`/api/orders/${orderId}/telegram-messages`);
    const d = await res.json();
    if (d.ok) {
      setMessages(d.messages);
      setOrder(d.order);
      setClient(d.client);
      // Mark as read
      await fetch(`/api/orders/${orderId}/telegram-messages`, { method: "PATCH" });
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  // ── Scroll to bottom on new messages ────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Supabase Realtime subscription ───────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`tg_messages_${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "telegram_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newMsg = payload.new as TgMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Auto-mark as read when tab is open
          if (newMsg.direction === "inbound") {
            fetch(`/api/orders/${orderId}/telegram-messages`, { method: "PATCH" });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  // ── Send ──────────────────────────────────────────────────────────────────
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, text: text.trim() }),
      });
      const d = await res.json();
      if (d.ok) {
        setText("");
        // Message will arrive via Realtime; add optimistically too
        if (d.message) setMessages((prev) => [...prev, d.message]);
      } else {
        setSendError(d.error ?? "Ошибка отправки");
      }
    } catch {
      setSendError("Сетевая ошибка");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <p className="py-16 text-center text-sm text-white/30">Загрузка…</p>;
  }

  const isLinked = !!order?.telegram_chat_id;

  return (
    <div className="flex gap-5">
      {/* ── Conversation ── */}
      <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-white/8 bg-white/3" style={{ height: "calc(100vh - 240px)" }}>
        {isLinked && client ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-base font-bold text-cyan-400">
                {(client.first_name?.[0] ?? client.username?.[0] ?? "?").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{clientDisplayName(client)}</p>
                {client.username && (
                  <a
                    href={`https://t.me/${client.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/35 hover:text-cyan-400"
                  >
                    @{client.username}
                  </a>
                )}
              </div>
              <span className="ml-auto shrink-0 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                Привязан
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <p className="py-12 text-center text-sm text-white/25">Сообщений пока нет</p>
              ) : (
                messages.map((m) => <MessageBubble key={m.id} msg={m} orderId={orderId} />)
              )}
              <div ref={bottomRef} />
            </div>

            {/* Send box */}
            <div className="border-t border-white/8 p-3">
              {sendError && (
                <p className="mb-2 text-xs text-red-400">{sendError}</p>
              )}
              <form onSubmit={handleSend} className="flex gap-2">
                <textarea
                  className="flex-1 resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10"
                  rows={2}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Написать сообщение…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                  }}
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="flex h-full items-center rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-4 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/25 disabled:opacity-40"
                >
                  {sending ? "…" : "→"}
                </button>
              </form>
              <p className="mt-1 text-[10px] text-white/20">Enter — отправить · Shift+Enter — перенос строки</p>
            </div>
          </>
        ) : (
          <NotLinkedPanel orderId={orderId} />
        )}
      </div>

      {/* ── Context sidebar ── */}
      {order && (
        <OrderContextPanel order={order} client={client} projectData={projectData} />
      )}
    </div>
  );
}
