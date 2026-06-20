"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Conversation } from "@/app/api/crm/conversations/route";

// ── Types ─────────────────────────────────────────────────────────────────────

type TgMessage = {
  id: string;
  direction: "inbound" | "outbound";
  message_type: string;
  message_status: string;
  media_status: string;
  content_text: string | null;
  file_id: string | null;
  file_unique_id: string | null;
  storage_path: string | null;
  storage_bucket: string | null;
  metadata: Record<string, unknown>;
  sent_at: string;
};

type ProjectData = {
  company_name?: string;
  phone?: string;
  email?: string;
  telegram?: string;
  address?: string;
  working_hours?: string;
  domain_name?: string;
  developer_note?: string;
  project_url?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function publicStorageUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function clientName(conv: Conversation): string {
  const name = [conv.first_name, conv.last_name].filter(Boolean).join(" ");
  return name || (conv.username ? `@${conv.username}` : `ID ${conv.chat_id}`);
}

function lastMsgPreview(conv: Conversation): string {
  if (!conv.last_message_type) return "Нет сообщений";
  const typeLabel: Record<string, string> = {
    photo: "📷 Фото",
    document: "📄 Документ",
    voice: "🎤 Голосовое",
    video: "🎥 Видео",
    video_note: "📹 Видеосообщение",
    sticker: "🎭 Стикер",
    system: "⚙️ Системное",
  };
  if (conv.last_message_type !== "text" && !conv.last_message_text) {
    return typeLabel[conv.last_message_type] ?? "Файл";
  }
  return conv.last_message_text ?? "";
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  contacted: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  in_progress: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  waiting_client: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  completed: "bg-green-500/15 text-green-300 border-green-500/30",
  cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
};
const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  contacted: "Связались",
  in_progress: "В работе",
  waiting_client: "Ожидает",
  completed: "Готово",
  cancelled: "Отменена",
};

const TYPE_ICONS: Record<string, string> = {
  photo: "📷",
  document: "📄",
  voice: "🎤",
  video: "🎥",
  video_note: "📹",
  sticker: "🎭",
  system: "⚙️",
};

// ── Conversation List Item ────────────────────────────────────────────────────

function ConvItem({
  conv,
  selected,
  onClick,
}: {
  conv: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  const name = clientName(conv);
  const preview = lastMsgPreview(conv);
  const hasUnread = conv.unread_count > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-3 text-left transition ${
        selected
          ? "bg-cyan-500/15 border-r-2 border-cyan-400"
          : "hover:bg-white/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-base font-bold text-cyan-400">
          {name[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-1">
            <p className={`truncate text-sm font-semibold ${selected ? "text-white" : "text-white/80"}`}>
              {name}
            </p>
            {conv.last_message_at && (
              <span className="shrink-0 text-[10px] text-white/30">{fmtTime(conv.last_message_at)}</span>
            )}
          </div>
          <p className="truncate text-xs text-white/40">{conv.company_name ?? conv.template_name ?? ""}</p>
          <div className="mt-0.5 flex items-center justify-between gap-1">
            <p className={`truncate text-xs ${hasUnread && !selected ? "text-white/70 font-medium" : "text-white/30"}`}>
              {conv.last_message_direction === "outbound" && <span className="mr-0.5 text-cyan-400/60">↑ </span>}
              {preview.slice(0, 50)}{preview.length > 50 ? "…" : ""}
            </p>
            {hasUnread && (
              <span className="shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] font-bold text-white">
                {conv.unread_count > 99 ? "99+" : conv.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: TgMessage }) {
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

  const mediaUrl =
    msg.storage_path && msg.storage_bucket
      ? publicStorageUrl(msg.storage_bucket, msg.storage_path)
      : null;

  const isMedia = ["photo", "document", "voice", "video", "video_note"].includes(msg.message_type);

  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"} mb-2`}>
      <div className="max-w-[70%]">
        <div
          className={`rounded-2xl px-3 py-2 text-sm ${
            isOut
              ? "rounded-br-sm bg-cyan-600/80 text-white"
              : "rounded-bl-sm bg-white/10 text-white/90"
          }`}
        >
          {/* Photo */}
          {msg.message_type === "photo" && mediaUrl && (
            <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl}
                alt="photo"
                className="mb-1 max-h-48 w-full rounded-lg object-cover"
              />
            </a>
          )}

          {/* Voice */}
          {msg.message_type === "voice" && mediaUrl && (
            <div className="mb-1 flex flex-col gap-1">
              <span className="text-xs opacity-60">🎤 {msg.metadata?.duration ? `${msg.metadata.duration}с` : "Голосовое"}</span>
              <audio controls src={mediaUrl} className="h-8 w-full" />
            </div>
          )}

          {/* Video / VideoNote */}
          {(msg.message_type === "video" || msg.message_type === "video_note") && mediaUrl && (
            <video controls src={mediaUrl} className="mb-1 max-h-48 w-full rounded-lg" />
          )}

          {/* Document */}
          {msg.message_type === "document" && (
            <div className="mb-1 flex items-center gap-2">
              <span className="text-lg">📄</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{String(msg.metadata?.file_name ?? "Документ")}</p>
                {mediaUrl && (
                  <a href={mediaUrl} download className="text-[10px] text-cyan-300 hover:underline">
                    Скачать ↓
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Media without download yet */}
          {isMedia && !mediaUrl && !msg.content_text && (
            <div className="flex items-center gap-1.5 text-xs opacity-50">
              <span>{TYPE_ICONS[msg.message_type] ?? "📎"}</span>
              <span>
                {msg.media_status === "failed" ? "⚠ Ошибка загрузки" : "Загружается…"}
              </span>
            </div>
          )}

          {msg.content_text && (
            <p className="leading-relaxed whitespace-pre-wrap">{msg.content_text}</p>
          )}
        </div>
        <div className={`mt-0.5 flex items-center gap-1 ${isOut ? "justify-end" : ""}`}>
          <span className="text-[10px] text-white/25">{fmtTime(msg.sent_at)}</span>
          {isOut && <span className="text-[10px] text-cyan-400/50">✓✓</span>}
        </div>
      </div>
    </div>
  );
}

// ── CRM Chat Panel ────────────────────────────────────────────────────────────

function CRMChatPanel({
  orderId,
  convName,
}: {
  orderId: string;
  convName: string;
}) {
  const [messages, setMessages] = useState<TgMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}/telegram-messages`);
    const d = await res.json();
    if (d.ok) {
      setMessages(d.messages);
      await fetch(`/api/orders/${orderId}/telegram-messages`, { method: "PATCH" });
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime: INSERT + UPDATE
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`crm_chat_${orderId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telegram_messages", filter: `order_id=eq.${orderId}` },
        (payload) => {
          const m = payload.new as TgMessage;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          if (m.direction === "inbound") {
            fetch(`/api/orders/${orderId}/telegram-messages`, { method: "PATCH" });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "telegram_messages", filter: `order_id=eq.${orderId}` },
        (payload) => {
          const updated = payload.new as TgMessage;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
          {convName[0]?.toUpperCase() ?? "?"}
        </div>
        <p className="text-sm font-bold">{convName}</p>
        <a
          href={`/admin/orders/${orderId}?tab=telegram`}
          className="ml-auto text-xs text-white/30 hover:text-white/60 transition"
          title="Открыть в workspace"
        >
          ↗ Workspace
        </a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <p className="py-12 text-center text-sm text-white/25">Загрузка…</p>
        ) : messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/25">Сообщений пока нет</p>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} msg={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send box */}
      <div className="border-t border-white/8 p-3">
        {sendError && <p className="mb-2 text-xs text-red-400">{sendError}</p>}
        <form onSubmit={handleSend} className="flex gap-2">
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            placeholder="Написать сообщение…"
            className="flex-1 resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-cyan-500/40"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="flex items-center rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-4 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/25 disabled:opacity-40"
          >
            {sending ? "…" : "→"}
          </button>
        </form>
        <p className="mt-1 text-[10px] text-white/20">Enter — отправить · Shift+Enter — перенос</p>
      </div>
    </div>
  );
}

// ── Context Panel ─────────────────────────────────────────────────────────────

function CRMContextPanel({ conv }: { conv: Conversation }) {
  const [pd, setPd] = useState<ProjectData | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${conv.order_id}/project-data`)
      .then((r) => r.json())
      .then((d) => { if (d.ok && d.data) setPd(d.data); });
  }, [conv.order_id]);

  const name = clientName(conv);
  const statusColor = STATUS_COLORS[conv.order_status] ?? "bg-white/10 text-white/60 border-white/10";

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Client */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Клиент</p>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-base font-bold text-cyan-400">
            {name[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-bold text-sm">{name}</p>
            {conv.username && <p className="text-xs text-white/40">@{conv.username}</p>}
          </div>
        </div>
        <div className="space-y-1 text-xs text-white/50">
          {conv.company_name && <p className="font-semibold text-white/70">{conv.company_name}</p>}
          {pd?.phone && <p>📞 {pd.phone}</p>}
          {pd?.email && <p>✉️ {pd.email}</p>}
          {conv.username && (
            <a
              href={`https://t.me/${conv.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-cyan-400/70 hover:text-cyan-400"
            >
              💬 @{conv.username}
            </a>
          )}
          {pd?.address && <p>📍 {pd.address}</p>}
          {pd?.working_hours && <p>🕐 {pd.working_hours}</p>}
        </div>
      </div>

      {/* Order */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Заказ</p>
        <p className="text-sm font-bold mb-2">{conv.template_name ?? conv.order_id.slice(0, 8)}</p>
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
          {STATUS_LABELS[conv.order_status] ?? conv.order_status}
        </span>
        {pd?.domain_name && (
          <p className="mt-2 text-xs text-white/50">🌐 {pd.domain_name}</p>
        )}
        {pd?.developer_note && (
          <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/8 px-2 py-1.5 text-[11px] text-cyan-300/80">
            {pd.developer_note}
          </div>
        )}
      </div>

      {/* Links */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Действия</p>
        <div className="flex flex-col gap-2">
          <a
            href={`/admin/orders/${conv.order_id}`}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Открыть Workspace →
          </a>
          <a
            href={`/admin/orders/${conv.order_id}?tab=telegram`}
            className="rounded-xl border border-cyan-500/20 bg-cyan-500/8 px-3 py-2 text-center text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/15"
          >
            Telegram вкладка ↗
          </a>
          {pd?.domain_name && (
            <a
              href={`https://${pd.domain_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              Сайт клиента ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl">
        💬
      </div>
      <h3 className="text-base font-bold text-white/60">Выберите диалог</h3>
      <p className="mt-2 text-sm text-white/25">Нажмите на клиента слева, чтобы открыть переписку</p>
    </div>
  );
}

// ── Main CRMPage ──────────────────────────────────────────────────────────────

export default function CRMPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/crm/conversations");
    const d = await res.json();
    if (d.ok) setConversations(d.conversations);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime: refresh conversation list when new messages arrive
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("crm_conversations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telegram_messages" },
        () => { load(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      clientName(c).toLowerCase().includes(q) ||
      (c.company_name ?? "").toLowerCase().includes(q) ||
      (c.template_name ?? "").toLowerCase().includes(q)
    );
  });

  const selectedConv = conversations.find((c) => c.order_id === selected) ?? null;

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/8 bg-slate-950/95 px-4 py-3 backdrop-blur">
        <a href="/admin" className="text-sm text-white/40 transition hover:text-white/70">← Заказы</a>
        <span className="text-white/20">/</span>
        <h1 className="text-sm font-bold">Telegram CRM</h1>
        {totalUnread > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] font-bold text-white">
            {totalUnread}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <a href="/admin/diagnostics" className="text-xs text-white/30 hover:text-white/60 transition">
            Диагностика
          </a>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Left: conversation list */}
        <div className="flex w-72 shrink-0 flex-col border-r border-white/8">
          {/* Search */}
          <div className="p-3">
            <input
              type="text"
              placeholder="Поиск клиентов…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-cyan-500/40"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="py-12 text-center text-sm text-white/25">Загрузка…</p>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-white/25">
                  {conversations.length === 0 ? "Нет активных диалогов" : "Ничего не найдено"}
                </p>
                {conversations.length === 0 && (
                  <p className="mt-2 text-xs text-white/15 px-4">
                    Клиенты появятся здесь после привязки Telegram к заказу
                  </p>
                )}
              </div>
            ) : (
              filtered.map((conv) => (
                <ConvItem
                  key={conv.order_id}
                  conv={conv}
                  selected={selected === conv.order_id}
                  onClick={() => setSelected(conv.order_id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Center: chat */}
        <div className="min-w-0 flex-1 border-r border-white/8">
          {selectedConv ? (
            <CRMChatPanel
              orderId={selectedConv.order_id}
              convName={clientName(selectedConv)}
            />
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Right: context */}
        <div className="w-64 shrink-0">
          {selectedConv ? (
            <CRMContextPanel conv={selectedConv} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-xs text-white/20">Контекст заказа</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
