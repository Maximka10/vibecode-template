"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  contacted: { label: "Связались", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  in_progress: { label: "В работе", color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
  waiting_client: { label: "Ожидает клиента", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  completed: { label: "Готово", color: "bg-green-500/15 text-green-300 border-green-500/30" },
  cancelled: { label: "Отменена", color: "bg-red-500/15 text-red-300 border-red-500/30" },
};

const STATUS_TO_ACTION: Record<string, string> = {
  in_progress: "START_WORK",
  waiting_client: "REQUEST_CLIENT_INPUT",
  completed: "COMPLETE_ORDER",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function OverviewTab({ order: initialOrder }: { order: Record<string, any> }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<Record<string, any>>(initialOrder);
  const [statusSaving, setStatusSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "bg-white/10 text-white/60 border-white/10" };

  async function applyTransition(action: string) {
    setStatusSaving(true);
    try {
      const res = await fetch("/api/orders/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action }),
      });
      const result = await res.json();
      if (result.ok) setOrder((prev) => ({ ...prev, status: result.status }));
      else alert(`Ошибка: ${result.error}`);
    } catch { alert("Ошибка соединения"); }
    finally { setStatusSaving(false); }
  }

  async function handleCancel() {
    setCancelLoading(true);
    try {
      const res = await fetch("/api/orders/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action: "CANCEL_ORDER" }),
      });
      const result = await res.json();
      if (result.ok) {
        setOrder((prev) => ({ ...prev, status: "cancelled" }));
        setCancelOpen(false);
      } else alert(`Ошибка отмены: ${result.error}`);
    } catch { alert("Ошибка соединения"); }
    finally { setCancelLoading(false); }
  }

  async function handleDelete() {
    if (!window.confirm("Удалить заказ безвозвратно?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/delete`, { method: "DELETE" });
      const result = await res.json();
      if (result.ok) router.push("/admin/orders");
      else { alert(`Ошибка: ${result.error}`); setDeleting(false); }
    } catch { alert("Ошибка соединения"); setDeleting(false); }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/export`, { method: "POST" });
      const result = await res.json();
      if (result.ok) {
        if (result.url) { window.open(result.url, "_blank"); }
        else {
          const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = `order-${order.id.slice(0, 8)}-export.json`; a.click();
          URL.revokeObjectURL(url);
        }
      } else alert(`Ошибка: ${result.error}`);
    } catch { alert("Ошибка соединения"); }
    finally { setExporting(false); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* LEFT */}
      <div className="space-y-5">
        {/* Order info */}
        <Card variant="solid" padding="md">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Информация о заказе</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {order.total_price && (
              <div>
                <p className="text-xs text-white/40">Стоимость</p>
                <p className="mt-0.5 text-sm">{Number(order.total_price).toLocaleString("ru-RU")} ₽</p>
              </div>
            )}
            {order.notes && (
              <div className="col-span-full">
                <p className="text-xs text-white/40">Комментарий</p>
                <p className="mt-0.5 text-sm text-white/85">{order.notes}</p>
              </div>
            )}
            {order.project_snapshot && (
              <div className="col-span-full">
                <p className="text-xs text-white/40">Снепшот проекта</p>
                <p className="mt-0.5 font-mono text-xs text-white/40">{order.project_snapshot.template_id}</p>
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
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Превью шаблона</h2>
              <Btn href={`/preview/${order.template_id}`} variant="ghost" size="sm" external>Открыть ↗</Btn>
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

        {/* Export placeholder */}
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Экспорт проекта</h2>
          <p className="mb-4 text-sm text-white/40">Сгенерируйте готовый проект или скачайте ZIP-архив.</p>
          <div className="flex flex-wrap gap-2">
            <Btn variant="outline" size="sm" onClick={() => alert("Будет реализовано на следующем этапе")}>
              Сгенерировать проект
            </Btn>
            <Btn variant="ghost" size="sm" onClick={() => alert("Будет реализовано на следующем этапе")}>
              ↓ Скачать ZIP
            </Btn>
            <Btn variant="ghost" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? "Экспорт…" : "↓ Экспорт конфига"}
            </Btn>
          </div>
        </Card>
      </div>

      {/* RIGHT */}
      <div className="space-y-5">
        {/* Status */}
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Статус</h2>
          <div className={`mb-4 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold ${statusCfg.color}`}>
            {statusCfg.label}
          </div>
          <div className="space-y-2">
            {Object.entries(STATUS_TO_ACTION).map(([targetStatus, action]) => {
              const cfg = STATUS_CONFIG[targetStatus];
              const active = order.status === targetStatus;
              return (
                <button
                  key={targetStatus}
                  disabled={statusSaving || active}
                  onClick={() => applyTransition(action)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    active ? cfg.color : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Quick actions */}
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Действия</h2>
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
              disabled={statusSaving || order.status === "cancelled"}
              onClick={() => setCancelOpen(true)}
              className="w-full rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
            >
              ✕ Отменить заказ
            </button>
            <button
              disabled={deleting}
              onClick={handleDelete}
              className="w-full rounded-full border border-red-900/40 bg-red-900/10 px-4 py-2 text-xs font-semibold text-red-500/70 transition hover:text-red-400 disabled:opacity-40"
            >
              {deleting ? "Удаление…" : "🗑 Удалить заказ"}
            </button>
          </div>
        </Card>

        {/* Meta */}
        <Card variant="subtle" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Системная информация</h2>
          <div className="space-y-1.5 text-xs text-white/35">
            <p>ID: <span className="font-mono text-white/50">{order.id}</span></p>
            <p>Шаблон: <span className="text-white/50">{order.template_id}</span></p>
            {order.domain && <p>Домен: <span className="text-white/50">{order.domain}</span></p>}
          </div>
        </Card>
      </div>

      {/* Cancel dialog */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="mb-1 text-base font-bold">Отменить заказ</h3>
            <p className="mb-6 text-sm text-white/50">Это действие изменит статус заказа на «Отменена». Подтвердите отмену.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCancelOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white">
                Назад
              </button>
              <button
                disabled={cancelLoading}
                onClick={handleCancel}
                className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-40"
              >
                {cancelLoading ? "Отмена…" : "Подтвердить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
