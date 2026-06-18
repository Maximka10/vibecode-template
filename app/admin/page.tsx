import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/role";
import AdminChat from "@/components/chat/AdminChat";

const STATUS_LABEL: Record<string, string> = {
  new: "Новая",
  inprogress: "В работе",
  done: "Готово",
  cancelled: "Отменена",
};

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  inprogress: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  done: "bg-green-500/20 text-green-300 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const role = await getUserRole(user.id);
  if (role !== "admin") redirect("/dashboard");

  // Admin client bypass RLS to see all orders
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const { data: orders } = await admin
    .from("orders")
    .select("*, profiles(email, name)")
    .order("created_at");

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, name, role, created_at")
    .order("created_at");

  const { data: unreadMessages } = await admin
    .from("messages")
    .select("order_id")
    .eq("is_read", false);

  const unreadByOrder = (unreadMessages ?? []).reduce<Record<string, number>>(
    (acc, m) => ({ ...acc, [m.order_id]: (acc[m.order_id] ?? 0) + 1 }),
    {}
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">Админ-панель</h1>
          <form action="/api/auth/logout" method="POST">
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/60 hover:text-white">
              Выйти
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Всего заказов", value: orders?.length ?? 0 },
            { label: "Новых", value: orders?.filter((o) => o.status === "new").length ?? 0 },
            { label: "В работе", value: orders?.filter((o) => o.status === "inprogress").length ?? 0 },
            { label: "Клиентов", value: profiles?.filter((p) => p.role === "client").length ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-black">{s.value}</p>
              <p className="mt-1 text-xs text-white/50">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders */}
        <h2 className="mt-10 text-xl font-bold">Заказы</h2>
        {!orders?.length ? (
          <p className="mt-4 text-white/50">Заказов пока нет.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{order.template_name ?? order.template_id}</p>
                    <p className="mt-1 text-sm text-white/50">
                      {(order.profiles as any)?.email ?? "—"}
                      {" · "}
                      {new Date(order.created_at).toLocaleDateString("ru-RU")}
                      {order.total_price && ` · ${order.total_price.toLocaleString("ru-RU")} ₽`}
                    </p>
                    {order.notes && (
                      <p className="mt-2 text-sm text-white/40">{order.notes}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? "border-white/10 bg-white/10 text-white/60"}`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
                <AdminChat orderId={order.id} unread={unreadByOrder[order.id] ?? 0} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
