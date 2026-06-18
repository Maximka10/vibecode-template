"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import AdminChat from "@/components/chat/AdminChat";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  contacted: { label: "Связались", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  in_progress: { label: "В работе", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  waiting_client: { label: "Ожидает клиента", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  completed: { label: "Готово", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  cancelled: { label: "Отменена", color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

type Order = Record<string, any>;
type Profile = Record<string, any>;

async function patchOrder(id: string, update: Record<string, unknown>) {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  return res.json();
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs text-white/50">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-white/30">{sub}</p>}
    </div>
  );
}

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
  unread,
  onStatusChange,
}: {
  order: Order;
  unread: number;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleStatus(status: string) {
    setSaving(true);
    await patchOrder(order.id, { status });
    onStatusChange(order.id, status);
    setSaving(false);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      {/* Header */}
      <div
        className="flex cursor-pointer flex-wrap items-start justify-between gap-3 p-5"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold">{order.template_name ?? order.template_id ?? "—"}</p>
            <StatusBadge status={order.status} />
            {unread > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {unread} новых
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-white/50">
            {order.client_name ?? order.client_email ?? "Аноним"}
            {order.client_phone && ` · ${order.client_phone}`}
            {order.client_telegram && ` · @${order.client_telegram}`}
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
        <div className="border-t border-white/10 p-5 space-y-4">
          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {order.business_type && (
              <div>
                <p className="text-white/40">Бизнес</p>
                <p>{order.business_type}</p>
              </div>
            )}
            {order.budget && (
              <div>
                <p className="text-white/40">Бюджет</p>
                <p>{Number(order.budget).toLocaleString("ru-RU")} ₽</p>
              </div>
            )}
            {order.selected_services && (
              <div className="col-span-full">
                <p className="text-white/40">Услуги</p>
                <p>{Array.isArray(order.selected_services) ? order.selected_services.join(", ") : JSON.stringify(order.selected_services)}</p>
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
            <Link
              href={`/customize/${order.template_id}`}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:border-white/40"
            >
              Открыть шаблон →
            </Link>
            {order.project_url && (
              <a
                href={order.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs text-green-300"
              >
                Сайт клиента ↗
              </a>
            )}
          </div>

          {/* Status change */}
          <div>
            <p className="mb-2 text-xs text-white/40">Изменить статус:</p>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={saving || order.status === s}
                  onClick={() => handleStatus(s)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    order.status === s
                      ? (STATUS_CONFIG[s]?.color ?? "")
                      : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                  } disabled:opacity-40`}
                >
                  {STATUS_CONFIG[s]?.label ?? s}
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <AdminChat orderId={order.id} unread={unread} />
        </div>
      )}
    </div>
  );
}

export default function AdminOrders({
  orders: initialOrders,
  profiles,
  unreadByOrder,
  stats,
  activeTab,
}: {
  orders: Order[];
  profiles: Profile[];
  unreadByOrder: Record<string, number>;
  stats: {
    total: number;
    new: number;
    inProgress: number;
    completed: number;
    clients: number;
    revenue: number;
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
          o.client_name?.toLowerCase().includes(q) ||
          o.client_phone?.includes(q) ||
          o.client_telegram?.toLowerCase().includes(q) ||
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

  const tabs = [
    { id: "orders", label: `Заказы (${orders.length})` },
    { id: "clients", label: `Клиенты (${profiles.filter((p) => p.role === "client").length})` },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Админ-панель</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/studio"
              className="rounded-full border border-white/20 px-3 py-1.5 text-sm hover:border-white/40"
            >
              Studio →
            </a>
            <form action="/api/auth/logout" method="POST">
              <button className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/50 hover:text-white">
                Выйти
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Всего" value={stats.total} />
          <StatCard label="Новых" value={stats.new} />
          <StatCard label="В работе" value={stats.inProgress} />
          <StatCard label="Готово" value={stats.completed} />
          <StatCard label="Клиентов" value={stats.clients} />
          <StatCard
            label="Выручка"
            value={stats.revenue ? `${stats.revenue.toLocaleString("ru-RU")} ₽` : "—"}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === t.id ? "bg-white text-black" : "text-white/60 hover:text-white"
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
              <input
                type="text"
                placeholder="Поиск по имени, телефону, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-48 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-white/30"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
              >
                <option value="all">Все статусы</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
              >
                <option value="date">По дате</option>
                <option value="status">По статусу</option>
                <option value="price">По цене</option>
              </select>
            </div>

            {/* Orders list */}
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-white/40">Заказов не найдено</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    unread={unreadByOrder[order.id] ?? 0}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "clients" && (
          <div className="space-y-3">
            {profiles
              .filter((p) => p.role === "client")
              .map((p) => {
                const clientOrders = orders.filter((o) => o.user_id === p.id);
                return (
                  <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
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
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </main>
  );
}
