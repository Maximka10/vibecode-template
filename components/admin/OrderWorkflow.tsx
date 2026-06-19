"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { ChatWindow, Message } from "@/components/chat/ChatWindow";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  contacted: { label: "Связались", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  in_progress: { label: "В работе", color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
  waiting_client: { label: "Ожидает клиента", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  completed: { label: "Готово", color: "bg-green-500/15 text-green-300 border-green-500/30" },
  cancelled: { label: "Отменена", color: "bg-red-500/15 text-red-300 border-red-500/30" },
};

const STATUS_ORDER = ["new", "contacted", "in_progress", "waiting_client", "completed", "cancelled"];

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
  const router = useRouter();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [statusSaving, setStatusSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function applyTransition(action: string) {
    setStatusSaving(true);
    try {
      const res = await fetch("/api/orders/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action }),
      });
      const result = await res.json();
      if (result.ok) {
        setOrder((prev) => ({ ...prev, status: result.status }));
      } else {
        alert(`Ошибка: ${result.error}`);
      }
    } catch {
      alert("Ошибка соединения при смене статуса");
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleCancel() {
    if (!cancelReason.trim()) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const result = await res.json();
      if (result.ok) {
        setOrder((prev) => ({ ...prev, status: "cancelled", cancel_reason: cancelReason }));
        setCancelOpen(false);
        setCancelReason("");
      } else {
        alert(`Ошибка отмены: ${result.error}`);
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/export`, { method: "POST" });
      const result = await res.json();
      if (result.ok) {
        if (result.url) {
          window.open(result.url, "_blank");
        } else {
          const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `order-${order.id.slice(0, 8)}-export.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        alert(`Ошибка экспорта: ${result.error}`);
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Удалить заказ безвозвратно? Все сообщения будут удалены.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/delete`, { method: "DELETE" });
      const result = await res.json();
      if (result.ok) {
        router.push("/admin/orders");
      } else {
        alert(`Ошибка удаления: ${result.error}`);
        setDeleting(false);
      }
    } catch {
      alert("Ошибка соединения");
      setDeleting(false);
    }
  }

  const STATUS_TO_ACTION: Partial<Record<string, string>> = {
    in_progress: "START_WORK",
    waiting_client: "REQUEST_CLIENT_INPUT",
    completed: "COMPLETE_ORDER",
    contacted: "START_WORK",
  };

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "bg-white/10 text-white/60 border-white/10" };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Topbar */}
      <div className="border-b border-white/8 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h1 className="truncate text-sm font-bold text-white/85">
              #{order.id.slice(0, 8)} · {order.template_name ?? order.template_id ?? "Заказ"}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex shrink-0 gap-2">
            <Btn href={`/preview/${order.template_id}`} variant="ghost" size="sm" external>
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
                <InfoRow
                  label="Стоимость"
                  value={order.total_price ? `${Number(order.total_price).toLocaleString("ru-RU")} ₽` : null}
                />
                {order.notes && (
                  <div className="col-span-full">
                    <p className="text-xs text-white/40">Комментарий</p>
                    <p className="mt-0.5 text-sm text-white/85">{order.notes}</p>
                  </div>
                )}
                {order.cancel_reason && (
                  <div className="col-span-full">
                    <p className="text-xs text-red-400/70">Причина отмены</p>
                    <p className="mt-0.5 text-sm text-red-300/80">{order.cancel_reason}</p>
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
              <ChatWindow
                orderId={order.id}
                currentUserId={adminId}
                currentUserRole="admin"
                initialMessages={initialMessages}
                height="h-80"
              />
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">

            {/* Status control */}
            <Card variant="solid" padding="md">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                Статус
              </h2>
              <div className={`mb-4 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold ${statusCfg.color}`}>
                {statusCfg.label}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_ORDER.filter((s) => s !== "cancelled").map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const active = order.status === s;
                  const action = STATUS_TO_ACTION[s];
                  return (
                    <button
                      key={s}
                      disabled={statusSaving || active || !action}
                      onClick={() => action && applyTransition(action)}
                      title={!action ? "Этот статус устанавливается автоматически" : undefined}
                      className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        active ? cfg.color : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
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
                <Btn href={`/customize/${order.template_id}`} variant="outline" size="sm" className="w-full">
                  Открыть в редакторе →
                </Btn>
                {order.project_url && (
                  <Btn href={order.project_url} variant="secondary" size="sm" className="w-full" external>
                    Сайт клиента ↗
                  </Btn>
                )}
                <button
                  disabled={statusSaving || order.status === "in_progress"}
                  onClick={() => applyTransition("START_WORK")}
                  className="w-full rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-500/20 disabled:opacity-40"
                >
                  🔨 Начать работу
                </button>
                <button
                  disabled={statusSaving || order.status === "waiting_client"}
                  onClick={() => applyTransition("REQUEST_CLIENT_INPUT")}
                  className="w-full rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-300 transition hover:bg-orange-500/20 disabled:opacity-40"
                >
                  ⏳ Запросить правки
                </button>
                <button
                  disabled={statusSaving || order.status === "completed"}
                  onClick={() => applyTransition("COMPLETE_ORDER")}
                  className="w-full rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300 transition hover:bg-green-500/20 disabled:opacity-40"
                >
                  ✓ Завершить заказ
                </button>
                <button
                  disabled={statusSaving || order.status === "cancelled"}
                  onClick={() => setCancelOpen(true)}
                  className="w-full rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
                >
                  ✕ Отменить заказ
                </button>
                <button
                  disabled={exporting}
                  onClick={handleExport}
                  className="w-full rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-40"
                >
                  {exporting ? "Экспорт…" : "↓ Экспорт проекта"}
                </button>
                <button
                  disabled={deleting}
                  onClick={handleDelete}
                  className="w-full rounded-full border border-red-900/40 bg-red-900/10 px-4 py-2 text-xs font-semibold text-red-500/70 transition hover:bg-red-900/20 hover:text-red-400 disabled:opacity-40"
                >
                  {deleting ? "Удаление…" : "🗑 Удалить заказ"}
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

      {/* Cancel dialog */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="mb-1 text-base font-bold">Отменить заказ</h3>
            <p className="mb-4 text-sm text-white/50">Укажите причину отмены — она будет сохранена в карточке заказа.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Причина отмены…"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-red-500/40 focus:ring-1 focus:ring-red-500/15"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => { setCancelOpen(false); setCancelReason(""); }}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
              >
                Назад
              </button>
              <button
                disabled={!cancelReason.trim() || cancelLoading}
                onClick={handleCancel}
                className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30 disabled:opacity-40"
              >
                {cancelLoading ? "Отмена…" : "Подтвердить отмену"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
