"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";

type Message = {
  id: string;
  text: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminChat({ orderId, unread }: { orderId: string; unread: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(unread);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    supabase
      .from("messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at")
      .then(({ data }) => {
        setMessages(data ?? []);
        // Mark all as read
        supabase
          .from("messages")
          .update({ is_read: true })
          .eq("order_id", orderId)
          .eq("is_read", false)
          .then(() => setUnreadCount(0));
      });

    const channel = supabase
      .channel(`admin-chat-${orderId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `order_id=eq.${orderId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => [...prev, msg]);
          if (msg.sender_id !== userId) {
            supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, open, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !userId) return;
    const supabase = createClient();
    await supabase.from("messages").insert({
      order_id: orderId,
      sender_id: userId,
      text: text.trim(),
    });
    setText("");
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-cyan-400 hover:underline"
      >
        {open ? "Скрыть чат" : "Открыть чат"}
        {unreadCount > 0 && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-white/10 bg-slate-900">
          <div className="max-h-72 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-center text-xs text-white/40">Сообщений пока нет</p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}
              >
                <span
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    m.sender_id === userId
                      ? "bg-purple-500/20 text-purple-100"
                      : "bg-white/10 text-white/80"
                  }`}
                >
                  {m.text}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-2">
            <Input
              variant="inline"
              className="flex-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ответить клиенту..."
            />
            <button
              type="submit"
              className="rounded-xl bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-300 hover:bg-purple-500/30 transition"
            >
              →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
