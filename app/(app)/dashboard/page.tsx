import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";

const STATUS_META: Record<string, { label: string; color: string; hint: string; progress: number }> = {
  new: {
    label: "Новая заявка",
    color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    hint: "Заявка получена. Менеджер свяжется с вами в течение 1 часа.",
    progress: 10,
  },
  contacted: {
    label: "Связались",
    color: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    hint: "Менеджер уточнил детали и готов приступить к работе.",
    progress: 25,
  },
  in_progress: {
    label: "В работе",
    color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    hint: "Разработчик работает над вашим сайтом. Срок — 3 рабочих дня.",
    progress: 60,
  },
  waiting_client: {
    label: "Ожидаем вас",
    color: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    hint: "Нам нужна ваша обратная связь. Проверьте email или Telegram.",
    progress: 75,
  },
  completed: {
    label: "Готово",
    color: "bg-green-500/15 text-green-300 border-green-500/30",
    hint: "Сайт запущен. Поздравляем с запуском!",
    progress: 100,
  },
  cancelled: {
    label: "Отменена",
    color: "bg-red-500/15 text-red-300 border-red-500/30",
    hint: "Заявка отменена.",
    progress: 0,
  },
};

const CHECKLIST: { label: string; statuses: string[] }[] = [
  { label: "Заявка получена", statuses: ["new", "contacted", "in_progress", "waiting_client", "completed"] },
  { label: "Менеджер связался", statuses: ["contacted", "in_progress", "waiting_client", "completed"] },
  { label: "Разработка начата", statuses: ["in_progress", "waiting_client", "completed"] },
  { label: "Правки внесены", statuses: ["waiting_client", "completed"] },
  { label: "Сайт готов", statuses: ["completed"] },
];

const TIMELINE: { label: string; statuses: string[] }[] = [
  { label: "Заявка создана", statuses: ["new", "contacted", "in_progress", "waiting_client", "completed", "cancelled"] },
  { label: "Менеджер связался", statuses: ["contacted", "in_progress", "waiting_client", "completed"] },
  { label: "Разработка начата", statuses: ["in_progress", "waiting_client", "completed"] },
  { label: "Ожидание клиента", statuses: ["waiting_client"] },
  { label: "Проект завершён", statuses: ["completed"] },
];

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch developer notes via admin client (bypasses RLS safely after auth check)
  const orderIds = orders?.map((o) => o.id) ?? [];
  let pdMap: Record<string, { developer_note?: string }> = {};
  if (orderIds.length > 0) {
    const admin = createAdminClient();
    const { data: pds } = await admin
      .from("project_data")
      .select("order_id, developer_note")
      .in("order_id", orderIds);
    pdMap = Object.fromEntries((pds ?? []).map((pd) => [pd.order_id, pd]));
  }

  const activeOrders = orders?.filter((o) => o.status !== "cancelled" && o.status !== "completed") ?? [];
  const doneOrders = orders?.filter((o) => o.status === "completed") ?? [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/6 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-purple-600/4 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Личный кабинет</p>
            <h1 className="mt-1 text-3xl font-black">Мои заказы</h1>
            <p className="mt-1 text-sm text-white/40">{user.email}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 mt-1">
            <Btn href="/templates" variant="outline" size="sm">
              + Новый сайт
            </Btn>
            <a
              href="/"
              className="text-xs text-white/30 transition hover:text-white/60"
            >
              ← Вернуться на сайт
            </a>
          </div>
        </div>

        <div className="mt-8 h-px bg-white/8" />

        {/* Empty state */}
        {!orders?.length ? (
          <div className="mt-12">
            <Card variant="subtle" padding="none" radius="3xl" className="flex flex-col items-center px-8 py-16 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <svg className="h-7 w-7 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Заказов пока нет</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">
                Выберите шаблон и настройте его под свой бизнес.
                Мы запустим ваш сайт за 3 дня — без предоплаты.
              </p>
              <Btn href="/templates" variant="primary" size="lg" className="mt-7">
                Выбрать шаблон →
              </Btn>
            </Card>

            <div className="mt-8 rounded-2xl border border-white/8 bg-white/4 p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/35">
                Как это работает
              </p>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Выберите шаблон из каталога и настройте под свой бренд" },
                  { step: "2", text: "Оставьте контакты — мы свяжемся в течение 1 часа" },
                  { step: "3", text: "Через 3 дня принимаете готовый сайт. Оплата — только после" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-bold text-cyan-400">
                      {item.step}
                    </span>
                    <p className="text-sm leading-relaxed text-white/55">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* Active orders */}
            {activeOrders.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/35">
                  Активные · {activeOrders.length}
                </p>
                <div className="space-y-4">
                  {activeOrders.map((order) => {
                    const meta = STATUS_META[order.status] ?? {
                      label: order.status,
                      color: "border-white/15 bg-white/8 text-white/50",
                      hint: "",
                      progress: 0,
                    };
                    const pd = pdMap[order.id] ?? {};

                    return (
                      <Card key={order.id} variant="solid" padding="md" hover>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-white">
                              {order.template_name ?? order.template_id}
                            </p>
                            <p className="mt-0.5 text-xs text-white/35">
                              {new Date(order.created_at).toLocaleDateString("ru-RU", {
                                day: "numeric", month: "long", year: "numeric",
                              })}
                              {order.total_price && (
                                <span className="ml-2 font-semibold text-white/55">
                                  · {Number(order.total_price).toLocaleString("ru-RU")} ₽
                                </span>
                              )}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs text-white/40">Прогресс</p>
                            <p className="text-xs font-semibold text-white/60">{meta.progress}%</p>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/8">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all"
                              style={{ width: `${meta.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Status hint */}
                        {meta.hint && (
                          <p className="mt-3 border-t border-white/8 pt-3 text-xs leading-relaxed text-white/40">
                            {meta.hint}
                          </p>
                        )}

                        {/* Developer note */}
                        {pd.developer_note && (
                          <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/8 px-3 py-2.5">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-cyan-400/70">Сообщение от команды</p>
                            <p className="text-sm text-white/80">{pd.developer_note}</p>
                          </div>
                        )}

                        {/* Checklist */}
                        <div className="mt-4 border-t border-white/8 pt-4">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">Этапы</p>
                          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {CHECKLIST.map((item) => {
                              const done = item.statuses.includes(order.status);
                              return (
                                <div key={item.label} className="flex items-center gap-2 text-xs">
                                  {done
                                    ? <span className="text-green-400 font-bold shrink-0">✓</span>
                                    : <span className="text-white/20 shrink-0">○</span>
                                  }
                                  <span className={done ? "text-white/70" : "text-white/30"}>{item.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="mt-4 border-t border-white/8 pt-4">
                          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">История</p>
                          <div className="relative space-y-2 pl-4">
                            <div className="absolute left-1.5 top-0 bottom-0 w-px bg-white/8" />
                            {TIMELINE.filter((t) => t.statuses.includes(order.status)).map((item, i, arr) => (
                              <div key={item.label} className="relative flex items-center gap-2 text-xs">
                                <span className={`absolute -left-4 mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${i === arr.length - 1 ? "bg-cyan-400" : "bg-white/30"}`} />
                                <span className={i === arr.length - 1 ? "text-white/80 font-semibold" : "text-white/40"}>
                                  {item.label}
                                </span>
                                {i === 0 && (
                                  <span className="ml-auto text-white/25">
                                    {new Date(order.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed orders */}
            {doneOrders.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/35">
                  Завершённые · {doneOrders.length}
                </p>
                <div className="space-y-3">
                  {doneOrders.map((order) => (
                    <Card key={order.id} variant="subtle" padding="md">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white/70">
                            {order.template_name ?? order.template_id}
                          </p>
                          <p className="mt-0.5 text-xs text-white/30">
                            {new Date(order.created_at).toLocaleDateString("ru-RU", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                            {order.total_price && (
                              <span className="ml-2">
                                {Number(order.total_price).toLocaleString("ru-RU")} ₽
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">
                          Готово ✓
                        </span>
                      </div>
                      {/* Progress bar — full */}
                      <div className="mt-3 h-1.5 w-full rounded-full bg-white/8">
                        <div className="h-1.5 w-full rounded-full bg-green-500/50" />
                      </div>
                      {order.project_url && (
                        <Link
                          href={order.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-400 transition hover:text-cyan-300"
                        >
                          Открыть сайт ↗
                        </Link>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-center">
              <p className="text-sm text-white/40">
                Нужен ещё один сайт?{" "}
                <Link href="/templates" className="text-cyan-400 transition hover:text-cyan-300">
                  Выбрать шаблон →
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
