"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type Message = {
  id: string;
  text: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
};

type Props = {
  orderId: string;
  currentUserId: string;
  currentUserRole: "admin" | "client";
  initialMessages?: Message[];
  height?: string;
};

function dateSeparator(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Сегодня";
  if (d.toDateString() === yesterday.toDateString()) return "Вчера";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function ChatWindow({
  orderId,
  currentUserId,
  currentUserRole,
  initialMessages = [],
  height = "h-80",
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof createClient>["channel"] extends (...args: infer A) => infer R ? R : never | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  // Realtime subscription + mark read
  useEffect(() => {
    const supabase = createClient();

    // Mark existing unread as read
    supabase
      .from("messages")
      .update({ is_read: true })
      .eq("order_id", orderId)
      .eq("is_read", false)
      .neq("sender_id", currentUserId)
      .then(() => null);

    const channel = supabase
      .channel(`chat-${orderId}`, { config: { presence: { key: currentUserId } } })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `order_id=eq.${orderId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
          if (msg.sender_id !== currentUserId) {
            supabase.from("messages").update({ is_read: true }).eq("id", msg.id).then(() => null);
          }
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ typing?: boolean }>();
        const others = Object.entries(state)
          .filter(([key]) => key !== currentUserId)
          .some(([, presences]) => (presences as Array<{ typing?: boolean }>).some((p) => p.typing));
        setOtherTyping(others);
      })
      .subscribe();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channelRef.current = channel as any;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, currentUserId]);

  const broadcastTyping = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (channelRef.current as any)?.track({ typing: true });
    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (channelRef.current as any)?.track({ typing: false });
    }, 2000);
    setTypingTimeout(t);
  }, [typingTimeout]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const supabase = createClient();
    const optimistic: Message = {
      id: crypto.randomUUID(),
      text: trimmed,
      sender_id: currentUserId,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    await supabase.from("messages").insert({ order_id: orderId, sender_id: currentUserId, text: trimmed });
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // Group messages by date for separators
  const grouped: Array<{ date: string; messages: Message[] }> = [];
  for (const msg of messages) {
    const last = grouped[grouped.length - 1];
    if (!last || !isSameDay(last.date, msg.created_at)) {
      grouped.push({ date: msg.created_at, messages: [msg] });
    } else {
      last.messages.push(msg);
    }
  }

  const senderLabel = (senderId: string) => {
    const isSelf = senderId === currentUserId;
    if (currentUserRole === "admin") return isSelf ? "Менеджер" : "Клиент";
    return isSelf ? "Вы" : "Менеджер";
  };

  return (
    <div className="flex flex-col">
      {/* Message list */}
      <div className={`${height} overflow-y-auto px-4 py-3`}>
        {messages.length === 0 && (
          <p className="py-10 text-center text-xs text-white/30">Сообщений пока нет</p>
        )}

        {grouped.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="my-3 flex items-center gap-3">
              <div className="flex-1 border-t border-white/8" />
              <span className="text-xs text-white/25">{dateSeparator(group.date)}</span>
              <div className="flex-1 border-t border-white/8" />
            </div>

            {group.messages.map((m, idx) => {
              const isSelf = m.sender_id === currentUserId;
              const prevMsg = group.messages[idx - 1];
              const showLabel = !prevMsg || prevMsg.sender_id !== m.sender_id;

              return (
                <div key={m.id} className={`mb-1 flex ${isSelf ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] ${isSelf ? "items-end" : "items-start"} flex flex-col`}>
                    {/* Sender badge — only shown on first message in a run */}
                    {showLabel && (
                      <span className={`mb-0.5 px-1 text-[10px] font-medium ${isSelf ? "text-right text-purple-300/60" : "text-left text-cyan-300/60"}`}>
                        {senderLabel(m.sender_id)}
                      </span>
                    )}
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        isSelf
                          ? "rounded-tr-sm bg-purple-500/20 text-purple-100"
                          : "rounded-tl-sm bg-white/8 text-white/85"
                      }`}
                    >
                      {m.text}
                    </div>
                    <p className={`mt-0.5 px-1 text-[10px] text-white/20 ${isSelf ? "text-right" : "text-left"}`}>
                      {new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      {isSelf && m.is_read && <span className="ml-1 text-cyan-400/50">✓✓</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {otherTyping && (
          <div className="flex justify-start mt-1">
            <div className="rounded-2xl rounded-tl-sm bg-white/8 px-3 py-2">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/8 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); broadcastTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder={currentUserRole === "admin" ? "Написать клиенту… Enter — отправить, Shift+Enter — новая строка" : "Написать менеджеру…"}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/15 max-h-32 overflow-y-auto"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="shrink-0 rounded-xl bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/30 disabled:opacity-40"
          >
            →
          </button>
        </div>
        <p className="mt-1 text-[10px] text-white/20">Enter — отправить · Shift+Enter — новая строка</p>
      </div>
    </div>
  );
}
