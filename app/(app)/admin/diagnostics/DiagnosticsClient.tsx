"use client";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "text-blue-400" },
  contacted: { label: "Связались", color: "text-purple-400" },
  in_progress: { label: "В работе", color: "text-yellow-400" },
  waiting_client: { label: "Ожидает клиента", color: "text-orange-400" },
  completed: { label: "Готово", color: "text-green-400" },
  cancelled: { label: "Отменена", color: "text-red-400" },
};

type Stats = {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalMessages: number;
  unreadMessages: number;
  storageOk: boolean;
  dbOk: boolean;
  ordersError: string | null;
  messagesError: string | null;
  recentOrders: { id: string; status: string; created_at: string; template_id: string | null; client_name: string | null }[];
  env: {
    nodeEnv: string;
    supabaseUrl: boolean;
    serviceRoleKey: boolean;
    telegramBotToken: boolean;
    telegramChatId: boolean;
  };
};

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`} />
  );
}

export default function DiagnosticsClient({ stats }: { stats: Stats }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/8 px-6 py-4">
        <h1 className="text-sm font-bold text-white/80">Диагностика системы</h1>
        <p className="text-xs text-white/35">Состояние сервисов и базы данных</p>
      </div>

      <div className="p-6 space-y-6 max-w-4xl">

        {/* System health */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Состояние сервисов</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "База данных", ok: stats.dbOk, detail: stats.ordersError },
              { label: "Storage", ok: stats.storageOk, detail: null },
              { label: "Сообщения", ok: !stats.messagesError, detail: stats.messagesError },
              { label: "API", ok: true, detail: null },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-4 ${item.ok ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <StatusDot ok={item.ok} />
                  <p className="text-xs font-semibold text-white/70">{item.label}</p>
                </div>
                <p className={`text-xs ${item.ok ? "text-green-400" : "text-red-400"}`}>
                  {item.ok ? "Работает" : "Ошибка"}
                </p>
                {item.detail && <p className="mt-1 text-xs text-red-400/60 truncate">{item.detail}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Статистика</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Заказов", value: stats.totalOrders, color: "text-cyan-400" },
              { label: "Сообщений", value: stats.totalMessages, color: "text-blue-400" },
              { label: "Непрочитанных", value: stats.unreadMessages, color: "text-orange-400" },
              { label: "Завершённых", value: stats.ordersByStatus["completed"] ?? 0, color: "text-green-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/8 bg-white/3 p-4 text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="mt-1 text-xs text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Orders by status */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Заказы по статусам</h2>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="space-y-2">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const count = stats.ordersByStatus[status] ?? 0;
                return (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-white/60">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recent orders */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Последние заказы</h2>
          <div className="rounded-2xl border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/3">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-white/40">ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-white/40">Клиент</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-white/40">Шаблон</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-white/40">Статус</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-white/40">Дата</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-xs text-white/30">Заказов нет</td></tr>
                ) : (
                  stats.recentOrders.map((o) => {
                    const cfg = STATUS_CONFIG[o.status];
                    return (
                      <tr key={o.id} className="border-b border-white/5 hover:bg-white/3 transition">
                        <td className="px-4 py-2.5">
                          <a href={`/admin/orders/${o.id}`} className="font-mono text-xs text-cyan-400 hover:underline">
                            {o.id.slice(0, 8)}
                          </a>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-white/65">{o.client_name ?? "—"}</td>
                        <td className="px-4 py-2.5 text-xs text-white/50">{o.template_id ?? "—"}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-semibold ${cfg?.color ?? "text-white/50"}`}>
                            {cfg?.label ?? o.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-white/35">
                          {new Date(o.created_at).toLocaleDateString("ru-RU")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Environment */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Окружение</h2>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4 space-y-2 text-xs font-mono">
            {([
              ["NODE_ENV", stats.env.nodeEnv],
              ["NEXT_PUBLIC_SUPABASE_URL", stats.env.supabaseUrl ? "✓ задан" : "✗ не задан"],
              ["SUPABASE_SERVICE_ROLE_KEY", stats.env.serviceRoleKey ? "✓ задан" : "✗ не задан"],
              ["TELEGRAM_BOT_TOKEN", stats.env.telegramBotToken ? "✓ задан" : "✗ не задан"],
              ["TELEGRAM_CHAT_ID", stats.env.telegramChatId ? "✓ задан" : "✗ не задан"],
            ] as [string, string][]).map(([key, val]) => (
              <div key={key} className="flex justify-between gap-4">
                <span className="text-white/40">{key}</span>
                <span className={val.startsWith("✓") ? "text-green-400" : val.startsWith("✗") ? "text-red-400" : "text-white/60"}>{val}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
