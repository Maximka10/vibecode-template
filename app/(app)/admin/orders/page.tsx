import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  contacted: { label: "Связались", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  in_progress: { label: "В работе", color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
  waiting_client: { label: "Ожидает", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  completed: { label: "Готово", color: "bg-green-500/15 text-green-300 border-green-500/30" },
  cancelled: { label: "Отменена", color: "bg-red-500/15 text-red-300 border-red-500/30" },
};

export default async function AdminOrdersListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const auth = await getUserWithRole();
  if (!auth) redirect("/auth/login");
  if (auth.role !== "admin") redirect("/dashboard");

  const { status = "all", q = "" } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("orders")
    .select("id, status, template_name, template_id, total_price, created_at, notes")
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);

  const { data: ordersRaw } = await query;
  const orders = ordersRaw ?? [];

  const filtered = q
    ? orders.filter(
        (o) =>
          o.template_name?.toLowerCase().includes(q.toLowerCase()) ||
          o.id.includes(q)
      )
    : orders;

  const counts = Object.keys(STATUS_CONFIG).reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/8 px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-white/40 hover:text-white transition">
              ← Панель
            </Link>
            <span className="text-white/20">/</span>
            <h1 className="text-sm font-bold">Заказы</h1>
          </div>
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/50">
            {filtered.length} заказ(ов)
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              status === "all"
                ? "border-white/30 bg-white/10 text-white"
                : "border-white/10 text-white/45 hover:text-white"
            }`}
          >
            Все ({orders.length})
          </Link>
          {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}${q ? `&q=${q}` : ""}`}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                status === s ? cfg.color : "border-white/10 text-white/45 hover:text-white"
              }`}
            >
              {cfg.label} ({counts[s] ?? 0})
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="GET" action="/admin/orders">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Поиск по шаблону или ID..."
            className="w-full rounded-xl border border-white/12 bg-white/8 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
          />
        </form>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/8 py-16 text-center">
            <p className="text-white/40">Заказов не найдено</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "bg-white/10 text-white/60 border-white/10" };
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/4 px-5 py-4 transition hover:bg-white/6 hover:border-white/15"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm truncate">
                        {order.template_name ?? order.template_id ?? "—"}
                      </p>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/35">
                      #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString("ru-RU")}
                      {order.total_price && ` · ${Number(order.total_price).toLocaleString("ru-RU")} ₽`}
                    </p>
                  </div>
                  <span className="shrink-0 text-white/30 text-sm">→</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
