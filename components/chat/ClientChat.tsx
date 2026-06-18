"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  text: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
};

export default function ClientChat({ orderId }: { orderId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
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
      .then(({ data }) => setMessages(data ?? []));

    const channel = supabase
      .channel(`chat-${orderId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `order_id=eq.${orderId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, open]);

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
        className="text-sm text-cyan-400 hover:underline"
      >
        {open ? "Скрыть чат" : "Открыть чат"}
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-white/10 bg-slate-900">
          <div className="max-h-60 overflow-y-auto p-3 space-y-2">
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
                      ? "bg-cyan-500/20 text-cyan-100"
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
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Написать менеджеру..."
              className="flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/30"
            >
              →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
