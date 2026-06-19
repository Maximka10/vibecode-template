import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ClientChat from "@/components/chat/ClientChat";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";

const STATUS_LABEL: Record<string, string> = {
  new: "Новая",
  inprogress: "В работе",
  done: "Готово",
  cancelled: "Отменена",
};

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  inprogress: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  done: "bg-green-500/15 text-green-300 border-green-500/30",
  cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at");

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/6 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-purple-600/4 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Личный кабинет</p>
          <h1 className="mt-1 text-3xl font-black">Мои заказы</h1>
          <p className="mt-1 text-sm text-white/40">{user.email}</p>
        </div>

        <div className="mt-8 h-px bg-white/8" />

        {/* Content */}
        {!orders?.length ? (
          <Card variant="subtle" padding="none" radius="3xl" className="mt-12 flex flex-col items-center px-8 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <svg className="h-7 w-7 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Заказов пока нет</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">
              Выберите шаблон, настройте его под свой бизнес — и мы запустим сайт за 3 дня.
            </p>
            <Btn href="/templates" variant="primary" size="lg" className="mt-7">
              Выбрать шаблон →
            </Btn>
          </Card>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <Card key={order.id} variant="solid" padding="md" hover>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{order.template_name ?? order.template_id}</p>
                    <p className="mt-1 text-sm text-white/40">
                      {new Date(order.created_at).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {order.total_price && (
                        <span className="ml-2 font-semibold text-white/60">
                          {order.total_price.toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? "border-white/15 bg-white/8 text-white/50"}`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
                <ClientChat orderId={order.id} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
