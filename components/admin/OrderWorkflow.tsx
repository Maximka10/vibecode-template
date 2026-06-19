"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  contacted: { label: "Связались", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  in_progress: { label: "В работе", color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
  waiting_client: { label: "Ожидает клиента", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  completed: { label: "Готово", color: "bg-green-500/15 text-green-300 border-green-500/30" },
  cancelled: { label: "Отменена", color: "bg-red-500/15 text-red-300 border-red-500/30" },
};

const STATUS_ORDER = ["new", "contacted", "in_progress", "waiting_client", "completed", "cancelled"];

type Message = {
  id: string;
  text: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = Record<string, any>;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-white/10 text-white/60 border-white/10" };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-0.5 text-sm text-white/85">{value}</p>
    </div>
  );
}

export default function OrderWorkflow({
  order: initialOrder,
  initialMessages,
  adminId,
}: {
  order: Order;
  initialMessages: Message[];
  adminId: string;
}) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mark unread messages as read on mount
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("messages")
      .update({ is_read: true })
      .eq("order_id", order.id)
      .eq("is_read", false)
      .then(() => null);
  }, [order.id]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-workflow-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${order.id}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates from optimistic update
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Auto-mark incoming client messages as read
          if (msg.sender_id !== adminId) {
            supabase.from("messages").update({ is_read: true }).eq("id", msg.id).then(() => null);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [order.id, adminId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const supabase = createClient();
    const optimistic: Message = {
      id: crypto.randomUUID(),
      text: text.trim(),
      sender_id: adminId,
      is_read: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    await supabase.from("messages").insert({
      order_id: order.id,
      sender_id: adminId,
      text: optimistic.text,
    });
  }

  async function updateStatus(status: string) {
    setStatusSaving(true);
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setOrder((prev) => ({ ...prev, status }));
    setStatusSaving(false);
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "bg-white/10 text-white/60 border-white/10" };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Contextual topbar */}
      <div className="border-b border-white/8 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h1 className="truncate text-sm font-bold text-white/85">
              #{order.id.slice(0, 8)} · {order.template_name ?? order.template_id ?? "Заказ"}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex shrink-0 gap-2">
            <Btn
              href={`/preview/${order.template_id}`}
              variant="ghost"
              size="sm"
              external
            >
              Превью ↗
            </Btn>
            <Btn href={`/customize/${order.template_id}`} variant="outline" size="sm">
              Редактор →
            </Btn>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* LEFT COLUMN */}
          <div className="space-y-5">

            {/* Order info */}
            <Card variant="solid" padding="md">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
                Информация о заказе
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <InfoRow label="Клиент" value={order.client_name} />
                <InfoRow label="Email" value={order.client_email} />
                <InfoRow label="Телефон" value={order.client_phone} />
                <InfoRow label="Telegram" value={order.client_telegram ? `@${order.client_telegram.replace("@", "")}` : null} />
                <InfoRow label="Бизнес" value={order.business_type} />
                <InfoRow
                  label="Бюджет"
                  value={
                    order.total_price
                      ? `${Number(order.total_price).toLocaleString("ru-RU")} ₽`
                      : order.budget
                      ? `${Number(order.budget).toLocaleString("ru-RU")} ₽`
                      : null
                  }
                />
                {order.notes && (
                  <div className="col-span-full">
                    <p className="text-xs text-white/40">Комментарий</p>
                    <p className="mt-0.5 text-sm text-white/85">{order.notes}</p>
                  </div>
                )}
                {order.selected_services && (
                  <div className="col-span-full">
                    <p className="text-xs text-white/40">Услуги</p>
                    <p className="mt-0.5 text-sm text-white/85">
                      {Array.isArray(order.selected_services)
                        ? order.selected_services.join(", ")
                        : String(order.selected_services)}
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-4 text-xs text-white/25">
                Создан: {new Date(order.created_at).toLocaleString("ru-RU")}
                {order.updated_at && ` · Обновлён: ${new Date(order.updated_at).toLocaleString("ru-RU")}`}
              </p>
            </Card>

            {/* Template preview */}
            {order.template_id && (
              <Card variant="solid" padding="none" radius="2xl">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
                    Превью шаблона
                  </h2>
                  <Btn href={`/preview/${order.template_id}`} variant="ghost" size="sm" external>
                    Открыть ↗
                  </Btn>
                </div>
                <div className="relative h-64 overflow-hidden rounded-b-2xl bg-black">
                  <iframe
                    src={`/preview/${order.template_id}`}
                    className="absolute inset-0 h-full w-full origin-top-left scale-50 border-none"
                    style={{ width: "200%", height: "200%" }}
                    title="Template preview"
                  />
                </div>
              </Card>
            )}

            {/* Chat */}
            <Card variant="solid" padding="none" radius="2xl">
              <div className="px-5 py-3 border-b border-white/8">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
                  Чат с клиентом
                </h2>
              </div>

              <div className="h-80 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 && (
                  <p className="py-8 text-center text-xs text-white/30">Сообщений пока нет</p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_id === adminId ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[75%]">
                      <span
                        className={`block rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                          m.sender_id === adminId
                            ? "bg-purple-500/20 text-purple-100"
                            : "bg-white/8 text-white/85"
                        }`}
                      >
                        {m.text}
                      </span>
                      <p className="mt-0.5 px-1 text-xs text-white/25">
                        {new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={sendMessage}
                className="flex gap-2 border-t border-white/8 p-3"
              >
                <Input
                  variant="inline"
                  className="flex-1"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Написать клиенту..."
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="rounded-xl bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/30 disabled:opacity-40"
                >
                  →
                </button>
              </form>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">

            {/* Status control */}
            <Card variant="solid" padding="md">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                Статус
              </h2>
              <div
                className={`mb-4 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold ${statusCfg.color}`}
              >
                {statusCfg.label}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_ORDER.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const active = order.status === s;
                  return (
                    <button
                      key={s}
                      disabled={statusSaving || active}
                      onClick={() => updateStatus(s)}
                      className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        active
                          ? cfg.color
                          : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Actions */}
            <Card variant="solid" padding="md">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                Действия
              </h2>
              <div className="space-y-2">
                <Btn
                  href={`/customize/${order.template_id}`}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Открыть в редакторе →
                </Btn>
                {order.project_url && (
                  <Btn
                    href={order.project_url}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    external
                  >
                    Сайт клиента ↗
                  </Btn>
                )}
                <button
                  disabled={statusSaving || order.status === "waiting_client"}
                  onClick={() => updateStatus("waiting_client")}
                  className="w-full rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-300 transition hover:bg-orange-500/20 disabled:opacity-40"
                >
                  Запросить правки
                </button>
                <button
                  disabled={statusSaving || order.status === "completed"}
                  onClick={() => updateStatus("completed")}
                  className="w-full rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300 transition hover:bg-green-500/20 disabled:opacity-40"
                >
                  ✓ Завершить заказ
                </button>
              </div>
            </Card>

            {/* Meta */}
            <Card variant="subtle" padding="md">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                Системная информация
              </h2>
              <div className="space-y-2 text-xs text-white/35">
                <p>ID: <span className="font-mono text-white/50">{order.id}</span></p>
                <p>Шаблон: <span className="text-white/50">{order.template_id}</span></p>
                {order.domain && <p>Домен: <span className="text-white/50">{order.domain}</span></p>}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
