"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { classifyFile, type MaterialTarget } from "@/lib/telegram/media";

// ── Types ─────────────────────────────────────────────────────────────────────

type TgMessage = {
  id: string;
  order_id: string;
  client_id: string;
  telegram_msg_id: number | null;
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function publicStorageUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

function mediaUrl(msg: TgMessage): string | null {
  if (!msg.storage_path || !msg.storage_bucket) return null;
  return publicStorageUrl(msg.storage_bucket, msg.storage_path);
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
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

const DOC_ICONS: Record<string, string> = {
  pdf: "📕",
  docx: "📝",
  doc: "📝",
  xlsx: "📊",
  xls: "📊",
  zip: "🗜️",
  txt: "📃",
};

function docIcon(fileName: string | null | undefined): string {
  const ext = (fileName ?? "").split(".").pop()?.toLowerCase() ?? "";
  return DOC_ICONS[ext] ?? "📄";
}

// ── MATERIAL_TYPES ────────────────────────────────────────────────────────────

const MATERIAL_TYPES: MaterialTarget[] = ["logo", "hero", "gallery", "background", "team", "document"];
const MATERIAL_LABELS: Record<MaterialTarget, string> = {
  logo: "Логотип",
  hero: "Hero фото",
  gallery: "Галерея",
  background: "Фон",
  team: "Команда",
  document: "Документ",
};

// ── Material Promoter ─────────────────────────────────────────────────────────

function MaterialPromoter({ orderId, msg }: { orderId: string; msg: TgMessage }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const suggested = classifyFile(msg.metadata?.file_name as string | null, msg.message_type);
  const url = mediaUrl(msg);

  async function promote(type: MaterialTarget) {
    setSaving(true);
    try {
      const pdRes = await fetch(`/api/orders/${orderId}/project-data`);
      const pd = await pdRes.json();
      const existing = pd.data?.content_edits ?? {};
      const fileMeta = existing.file_metadata ?? {};

      const key = msg.file_unique_id ?? msg.id;
      fileMeta[key] = {
        type,
        name: (msg.metadata?.file_name as string) ?? `telegram_${key}`,
        url,
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
        <div className="absolute bottom-full left-0 mb-1 z-10 min-w-40 rounded-xl border border-white/10 bg-slate-900 p-1.5 shadow-xl">
          {MATERIAL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              disabled={saving}
              onClick={() => promote(t)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs transition hover:bg-white/8 ${
                t === suggested ? "font-semibold text-cyan-300" : "text-white/70 hover:text-white"
              }`}
            >
              <span>{MATERIAL_LABELS[t]}</span>
              {t === suggested && <span className="text-[9px] text-cyan-500/60">авто</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Media status indicator ────────────────────────────────────────────────────

function MediaStatus({ status }: { status: string }) {
  if (status === "pending" || status === "downloading") {
    return (
      <span className="flex items-center gap-1 text-[10px] text-white/35">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white/30" />
        Загрузка…
      </span>
    );
  }
  if (status === "failed") {
    return <span className="text-[10px] text-red-400/60">⚠ Ошибка загрузки</span>;
  }
  return null;
}

// ── Photo Modal ───────────────────────────────────────────────────────────────

function PhotoModal({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl" />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <a
            href={url}
            download
            className="rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs text-white/80 hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            ↓ Скачать
          </a>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-black/60 px-3 py-1.5 text-xs text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Media renderers ───────────────────────────────────────────────────────────

function PhotoContent({ msg, onExpand }: { msg: TgMessage; onExpand: () => void }) {
  const url = mediaUrl(msg);
  if (!url) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[11px] opacity-50">📷 Фото получено</span>
        <MediaStatus status={msg.media_status} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onExpand}
        className="group relative overflow-hidden rounded-lg"
        style={{ maxWidth: 220 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="photo"
          className="w-full rounded-lg object-cover transition group-hover:opacity-90"
          style={{ maxHeight: 180 }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-white">⛶ Открыть</span>
        </div>
      </button>
      {msg.content_text && (
        <p className="mt-1 text-sm leading-relaxed">{msg.content_text}</p>
      )}
    </div>
  );
}

function DocumentContent({ msg }: { msg: TgMessage }) {
  const url = mediaUrl(msg);
  const fileName = msg.metadata?.file_name as string | null;
  const fileSize = msg.metadata?.file_size as number | null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5" style={{ minWidth: 180, maxWidth: 260 }}>
      <span className="text-2xl">{docIcon(fileName)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{fileName ?? "Документ"}</p>
        {fileSize && <p className="text-[10px] text-white/40">{fmtSize(fileSize)}</p>}
        <MediaStatus status={msg.media_status} />
      </div>
      {url && (
        <a
          href={url}
          download={fileName ?? true}
          className="shrink-0 rounded-lg border border-white/10 bg-white/8 px-2 py-1 text-[11px] text-white/60 hover:text-white"
        >
          ↓
        </a>
      )}
    </div>
  );
}

function VoiceContent({ msg }: { msg: TgMessage }) {
  const url = mediaUrl(msg);
  const duration = msg.metadata?.duration as number | null;

  if (!url) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">🎤</span>
        <div>
          {duration && <p className="text-xs text-white/50">{fmtDuration(duration)}</p>}
          <MediaStatus status={msg.media_status} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5" style={{ minWidth: 200 }}>
      <div className="flex items-center gap-1.5 text-xs text-white/50">
        <span>🎤</span>
        {duration && <span>{fmtDuration(duration)}</span>}
      </div>
      <audio controls src={url} className="h-8 w-full" style={{ colorScheme: "dark" }} />
    </div>
  );
}

function VideoContent({ msg, isNote = false }: { msg: TgMessage; isNote?: boolean }) {
  const url = mediaUrl(msg);
  const duration = msg.metadata?.duration as number | null;
  const fileSize = msg.metadata?.file_size as number | null;

  if (!url) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{isNote ? "📹" : "🎥"}</span>
        <div>
          <span className="text-[11px] opacity-50">{isNote ? "Видеосообщение" : "Видео"}</span>
          {duration && <p className="text-[10px] text-white/40">{fmtDuration(duration)}</p>}
          <MediaStatus status={msg.media_status} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1" style={{ maxWidth: 260 }}>
      <video
        controls
        src={url}
        className={`rounded-lg ${isNote ? "h-40 w-40 object-cover" : "w-full rounded-lg"}`}
        style={{ maxHeight: 180 }}
      />
      {(duration || fileSize) && (
        <p className="text-[10px] text-white/40">
          {duration && fmtDuration(duration)}{fileSize && ` · ${fmtSize(fileSize)}`}
        </p>
      )}
      {msg.content_text && <p className="text-sm leading-relaxed">{msg.content_text}</p>}
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  orderId,
  onPhotoExpand,
}: {
  msg: TgMessage;
  orderId: string;
  onPhotoExpand: (url: string) => void;
}) {
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

  const url = mediaUrl(msg);
  const canPromote = ["photo", "document"].includes(msg.message_type) && !isOut;

  const renderMediaContent = () => {
    switch (msg.message_type) {
      case "photo":
        return (
          <PhotoContent
            msg={msg}
            onExpand={() => { if (url) onPhotoExpand(url); }}
          />
        );
      case "document":
        return <DocumentContent msg={msg} />;
      case "voice":
        return <VoiceContent msg={msg} />;
      case "video":
        return <VideoContent msg={msg} />;
      case "video_note":
        return <VideoContent msg={msg} isNote />;
      default:
        return null;
    }
  };

  const mediaContent = renderMediaContent();

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
          {/* Non-renderable types: sticker, or fallback */}
          {!mediaContent && msg.message_type !== "text" && (
            <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
              <span>{TYPE_ICONS[msg.message_type] ?? "📎"}</span>
              <span className="capitalize">{msg.message_type}</span>
              {!!msg.metadata?.file_name && (
                <span className="truncate max-w-32 text-[10px]">{String(msg.metadata.file_name)}</span>
              )}
            </div>
          )}
          {mediaContent}
          {msg.message_type === "text" && msg.content_text && (
            <p className="leading-relaxed whitespace-pre-wrap">{msg.content_text}</p>
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
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const link = botUsername ? `https://t.me/${botUsername}?start=${orderId}` : null;

  function copy() {
    if (!link) return;
    navigator.clipboard
      .writeText(link)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  if (!botUsername) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500/20 bg-yellow-500/10 text-3xl">
          ⚠️
        </div>
        <h3 className="text-lg font-bold">Бот не настроен</h3>
        <p className="mt-2 max-w-xs text-sm text-white/40">
          Установите переменную окружения <code className="bg-white/10 px-1 rounded text-yellow-300">NEXT_PUBLIC_TELEGRAM_BOT_USERNAME</code> (username бота без @) и задеплойте заново.
        </p>
      </div>
    );
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

function OrderContextPanel({
  order,
  client,
  projectData,
}: {
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
              Привязан{" "}
              {new Date(client.linked_at).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        ) : (
          <p className="text-sm text-white/30">Не привязан</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Заказ</p>
        <div className="space-y-2 text-xs text-white/60">
          <p className="font-semibold text-white/80 text-sm">
            {order.template_name ?? order.id.slice(0, 8)}
          </p>
          <p>{STATUS_LABELS[order.status] ?? order.status}</p>
        </div>
      </div>

      {projectData && (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Контакты</p>
          <div className="space-y-1.5 text-xs text-white/60">
            {projectData.company_name && (
              <p className="font-semibold text-white/80">{projectData.company_name}</p>
            )}
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
  const [photoModal, setPhotoModal] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Load initial data ──────────────────────────────────────────────────────
  const load = useCallback(async () => {
    const res = await fetch(`/api/orders/${orderId}/telegram-messages`);
    const d = await res.json();
    if (d.ok) {
      setMessages(d.messages);
      setOrder(d.order);
      setClient(d.client);
      await fetch(`/api/orders/${orderId}/telegram-messages`, { method: "PATCH" });
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  // ── Scroll to bottom on new messages ──────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Supabase Realtime: INSERT + UPDATE ────────────────────────────────────
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
          if (newMsg.direction === "inbound") {
            fetch(`/api/orders/${orderId}/telegram-messages`, { method: "PATCH" });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "telegram_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as TgMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          );
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

  const isLinked = !!order?.telegram_client_id;

  return (
    <>
      {photoModal && (
        <PhotoModal url={photoModal} onClose={() => setPhotoModal(null)} />
      )}

      <div className="flex gap-5">
        {/* ── Conversation ── */}
        <div
          className="flex min-w-0 flex-1 flex-col rounded-2xl border border-white/8 bg-white/3"
          style={{ height: "calc(100vh - 240px)" }}
        >
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
                  messages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      msg={m}
                      orderId={orderId}
                      onPhotoExpand={setPhotoModal}
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Send box */}
              <div className="border-t border-white/8 p-3">
                {sendError && <p className="mb-2 text-xs text-red-400">{sendError}</p>}
                <form onSubmit={handleSend} className="flex gap-2">
                  <textarea
                    className="flex-1 resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10"
                    rows={2}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Написать сообщение…"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
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
                <p className="mt-1 text-[10px] text-white/20">
                  Enter — отправить · Shift+Enter — перенос строки
                </p>
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
    </>
  );
}
