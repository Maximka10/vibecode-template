"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChatWindow, Message } from "@/components/chat/ChatWindow";

export default function ClientChat({ orderId }: { orderId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!open || !userId) return;
    const supabase = createClient();
    supabase
      .from("messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at")
      .then(({ data }) => setInitialMessages(data ?? []));
  }, [open, orderId, userId]);

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-cyan-400 hover:underline"
      >
        {open ? "Скрыть чат" : "Написать менеджеру"}
      </button>

      {open && userId && (
        <div className="mt-3 rounded-xl border border-white/10 bg-slate-900 overflow-hidden">
          <ChatWindow
            orderId={orderId}
            currentUserId={userId}
            currentUserRole="client"
            initialMessages={initialMessages}
            height="h-60"
          />
        </div>
      )}
    </div>
  );
}
