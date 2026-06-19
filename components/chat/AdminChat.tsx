"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChatWindow, Message } from "@/components/chat/ChatWindow";

export default function AdminChat({ orderId, unread }: { orderId: string; unread: number }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(unread);

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
      .then(({ data }) => {
        setInitialMessages(data ?? []);
        setUnreadCount(0);
      });
  }, [open, orderId, userId]);

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

      {open && userId && (
        <div className="mt-3 rounded-xl border border-white/10 bg-slate-900 overflow-hidden">
          <ChatWindow
            orderId={orderId}
            currentUserId={userId}
            currentUserRole="admin"
            initialMessages={initialMessages}
            height="h-64"
          />
        </div>
      )}
    </div>
  );
}
