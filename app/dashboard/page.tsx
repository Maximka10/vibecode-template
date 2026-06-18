import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ClientChat from "@/components/chat/ClientChat";

const STATUS_LABEL: Record<string, string> = {
  new: "Новая",
  inprogress: "В работе",
  done: "Готово",
  cancelled: "Отменена",
};

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-300",
  inprogress: "bg-yellow-500/20 text-yellow-300",
  done: "bg-green-500/20 text-green-300",
  cancelled: "bg-red-500/20 text-red-300",
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
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">Личный кабинет</h1>
          <form action="/api/auth/logout" method="POST">
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/60 hover:text-white">
              Выйти
            </button>
          </form>
        </div>
        <p className="mt-1 text-white/50 text-sm">{user.email}</p>

        {!orders?.length ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/60">У вас пока нет заказов.</p>
            <Link
              href="/templates"
              className="mt-4 inline-block rounded-full bg-white px-6 py-3 font-bold text-black"
            >
              Выбрать шаблон
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{order.template_name ?? order.template_id}</p>
                    <p className="mt-1 text-sm text-white/50">
                      {new Date(order.created_at).toLocaleDateString("ru-RU")}
                      {order.total_price && ` · ${order.total_price.toLocaleString("ru-RU")} ₽`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? "bg-white/10 text-white/60"}`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
                <ClientChat orderId={order.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
