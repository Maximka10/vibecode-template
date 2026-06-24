"use client";
import React, { useState, useMemo } from "react";
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

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const SELECT_CLS =
  "rounded-xl border border-white/12 bg-white/8 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Profile = Record<string, any>;

async function patchOrder(id: string, update: Record<string, unknown>) {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  return res.json();
}

const STATUS_TO_ACTION: Record<string, string> = {
  in_progress: "START_WORK",
  waiting_client: "REQUEST_CLIENT_INPUT",
  completed: "COMPLETE_ORDER",
  cancelled: "CANCEL_ORDER",
};

async function applyStatusTransition(orderId: string, targetStatus: string): Promise<{ ok: boolean; status?: string; error?: string }> {
  const action = STATUS_TO_ACTION[targetStatus];
  if (!action) return { ok: false, error: `No workflow action for status "${targetStatus}"` };
  const res = await fetch("/api/orders/transition", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, action }),
  });
  return res.json();
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "cyan",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  accent?: "cyan" | "blue" | "yellow" | "green" | "purple" | "orange";
}) {
  const borderColor: Record<string, string> = {
    cyan: "border-l-cyan-500/60",
    blue: "border-l-blue-500/60",
    yellow: "border-l-yellow-500/60",
    green: "border-l-green-500/60",
    purple: "border-l-purple-500/60",
    orange: "border-l-orange-500/60",
  };
  const iconBg: Record<string, string> = {
    cyan: "bg-cyan-500/10 text-cyan-400",
    blue: "bg-blue-500/10 text-blue-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    green: "bg-green-500/10 text-green-400",
    purple: "bg-purple-500/10 text-purple-400",
    orange: "bg-orange-500/10 text-orange-400",
  };
  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/8 border-l-2 ${borderColor[accent]} bg-gradient-to-br from-white/6 to-white/2 px-4 py-3.5`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-2xl font-black tracking-tight">{value}</p>
          <p className="mt-0.5 text-xs text-white/45">{label}</p>
          {sub && <p className="mt-0.5 text-xs text-white/25">{sub}</p>}
        </div>
        {icon && (
          <div className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-lg ${iconBg[accent]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline SVG icons for stat cards
const IconOrders = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconNew = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconInProgress = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
    <path d="M8 4.5v3.5l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCompleted = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconClients = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M1.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="11.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path d="M13.5 13c.5-.8.5-2-1-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const IconRevenue = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 11l3.5-3.5 3 2.5L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 5h2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-white/10 text-white/60 border-white/10" };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function OrderCard({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);

  async function handleStatus(targetStatus: string) {
    if (saving) return;
    setSaving(true);
    setTransitionError(null);
    const result = await applyStatusTransition(order.id, targetStatus);
    if (result.ok && result.status) {
      onStatusChange(order.id, result.status);
    } else {
      setTransitionError("Не удалось изменить статус заказа");
    }
    setSaving(false);
  }

  return (
    <Card variant="solid" padding="none" hover>
      {/* Header */}
      <div
        className="flex cursor-pointer flex-wrap items-start justify-between gap-3 p-5"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold">{order.template_name ?? order.template_id ?? "—"}</p>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-white/50">
            {order.template_name ?? order.template_id ?? "—"}
          </p>
          <p className="mt-0.5 text-xs text-white/30">
            #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleString("ru-RU")}
            {order.total_price && ` · ${order.total_price.toLocaleString("ru-RU")} ₽`}
          </p>
        </div>
        <span className="text-white/30">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-white/8 p-5 space-y-5">
          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {order.total_price && (
              <div>
                <p className="text-white/40">Стоимость</p>
                <p>{Number(order.total_price).toLocaleString("ru-RU")} ₽</p>
              </div>
            )}
{order.notes && (
              <div className="col-span-full">
                <p className="text-white/40">Комментарий</p>
                <p className="text-white/80">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Project links */}
          <div className="flex flex-wrap gap-2">
            <Btn href={`/admin/orders/${order.id}`} variant="primary" size="sm">
              Открыть заказ →
            </Btn>
            <Btn href={`/customize/${order.template_id}`} variant="outline" size="sm">
              Конструктор →
            </Btn>
            {order.project_url && (
              <Btn href={order.project_url} variant="secondary" size="sm" external>
                Сайт клиента ↗
              </Btn>
            )}
          </div>

          {/* Status change */}
          <div>
            <p className="mb-2 text-xs text-white/40">Изменить статус:</p>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.filter((s) => s in STATUS_TO_ACTION || s === order.status).map((s) => (
                <button
                  key={s}
                  disabled={saving || order.status === s}
                  onClick={() => handleStatus(s)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:opacity-40 ${
                    order.status === s
                      ? (STATUS_CONFIG[s]?.color ?? "border-white/20 bg-white/8 text-white/60")
                      : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {STATUS_CONFIG[s]?.label ?? s}
                </button>
              ))}
            </div>
            {transitionError && (
              <p className="mt-2 text-xs text-red-400">{transitionError}</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AdminOrders({
  orders: initialOrders,
  profiles,
  stats,
  activeTab,
}: {
  orders: Order[];
  profiles: Profile[];
  stats: {
    total: number;
    new: number;
    inProgress: number;
    waitingClient: number;
    completed: number;
    clients: number;
    tgLinked: number;
    revenue: number;
    leadNew?: number;
    leadContacted?: number;
    leadQualified?: number;
    leadProposalSent?: number;
    leadWon?: number;
    leadLost?: number;
  };
  activeTab: string;
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tab, setTab] = useState(activeTab);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "status" | "price">("date");

  function handleStatusChange(id: string, status: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  const filtered = useMemo(() => {
    let result = [...orders];
    if (filterStatus !== "all") result = result.filter((o) => o.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.template_name?.toLowerCase().includes(q) ||
          o.id.includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === "status") return a.status.localeCompare(b.status);
      if (sortBy === "price") return (b.total_price ?? 0) - (a.total_price ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return result;
  }, [orders, filterStatus, search, sortBy]);

  const clientProfiles = profiles.filter((p) => p.role === "client");
  const tabs = [
    { id: "orders", label: `Заказы (${orders.length})` },
    { id: "clients", label: `Клиенты (${clientProfiles.length})` },
  ];

  const tgLinked = orders.filter((o) => o.telegram_client_id).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Top nav */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-white">Панель администратора</h1>
          <div className="flex flex-wrap gap-2">
            <a
              href="/admin/crm"
              className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
            >
              💬 Telegram CRM
              {tgLinked > 0 && (
                <span className="rounded-full bg-cyan-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {tgLinked}
                </span>
              )}
            </a>
            <a href="/admin/diagnostics" className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/50 transition hover:text-white/80">
              Диагностика
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <StatCard label="Всего заказов" value={stats.total} accent="cyan" icon={<IconOrders />} />
          <StatCard label="Новых" value={stats.new} accent="blue" icon={<IconNew />} />
          <StatCard label="В работе" value={stats.inProgress} accent="yellow" icon={<IconInProgress />} />
          <StatCard label="Ожидает клиента" value={stats.waitingClient} accent="orange" />
          <StatCard label="Готово" value={stats.completed} accent="green" icon={<IconCompleted />} />
          <StatCard label="Клиентов" value={stats.clients} accent="purple" icon={<IconClients />} />
          <StatCard label="Telegram CRM" value={stats.tgLinked} sub="привязано заказов" accent="cyan" />
          <StatCard
            label="Выручка"
            value={stats.revenue ? `${stats.revenue.toLocaleString("ru-RU")} ₽` : "—"}
            accent="orange"
            icon={<IconRevenue />}
          />
        </div>

        {/* Sales Funnel */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
            Воронка продаж
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Новые лиды" value={stats.leadNew ?? 0} accent="blue" />
            <StatCard label="Связались" value={stats.leadContacted ?? 0} accent="purple" />
            <StatCard label="Квалифицированы" value={stats.leadQualified ?? 0} accent="cyan" />
            <StatCard label="КП отправлено" value={stats.leadProposalSent ?? 0} accent="yellow" />
            <StatCard label="Выиграно" value={stats.leadWon ?? 0} accent="green" />
            <StatCard label="Потеряно" value={stats.leadLost ?? 0} accent="orange" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl border border-white/8 bg-white/4 p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === t.id ? "bg-white text-black" : "text-white/55 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-48">
                <Input
                  type="text"
                  placeholder="Поиск по имени, телефону, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={SELECT_CLS}
              >
                <option value="all">Все статусы</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className={SELECT_CLS}
              >
                <option value="date">По дате</option>
                <option value="status">По статусу</option>
                <option value="price">По цене</option>
              </select>
            </div>

            {/* Orders list */}
            {filtered.length === 0 ? (
              <Card variant="subtle" padding="none" radius="3xl">
                <div className="py-16 text-center">
                  <p className="text-white/40">Заказов не найдено</p>
                  {search && (
                    <Btn variant="ghost" size="sm" onClick={() => setSearch("")} className="mt-3">
                      Сбросить поиск
                    </Btn>
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "clients" && (
          <>
            {clientProfiles.length === 0 ? (
              <Card variant="subtle" padding="none" radius="3xl">
                <div className="py-16 text-center">
                  <p className="text-white/40">Клиентов пока нет</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {clientProfiles.map((p) => {
                  const clientOrders = orders.filter((o) => o.user_id === p.id);
                  return (
                    <Card key={p.id} variant="solid" hover>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold">{p.name ?? p.email}</p>
                          <p className="mt-1 text-sm text-white/50">
                            {p.email}
                            {p.phone && ` · ${p.phone}`}
                            {p.telegram && ` · @${p.telegram}`}
                          </p>
                          <p className="mt-0.5 text-xs text-white/30">
                            Зарегистрирован: {new Date(p.created_at).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                        <span className="text-sm text-white/40">{clientOrders.length} заказ(а)</span>
                      </div>
                      {clientOrders.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {clientOrders.map((o) => (
                            <span key={o.id} className="text-xs text-white/40">
                              #{o.id.slice(0, 8)} <StatusBadge status={o.status} />
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
