import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminOrders from "@/components/admin/AdminOrders";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const auth = await getUserWithRole();
  if (!auth) redirect("/auth/login");

  const { role } = auth;
  if (role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const { tab = "orders" } = await searchParams;

  const [ordersRes, profilesRes, messagesRes] = await Promise.all([
    admin.from("orders").select("*").order("created_at", { ascending: false }),
    admin.from("profiles").select("*").order("created_at", { ascending: false }),
    admin.from("messages").select("order_id").eq("is_read", false),
  ]);

  const orders = ordersRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const unreadMessages = messagesRes.data ?? [];

  const unreadByOrder = unreadMessages.reduce<Record<string, number>>(
    (acc, m) => ({ ...acc, [m.order_id]: (acc[m.order_id] ?? 0) + 1 }),
    {}
  );

  const stats = {
    total: orders.length,
    new: orders.filter((o) => o.status === "new").length,
    inProgress: orders.filter((o) => o.status === "in_progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
    clients: profiles.filter((p) => p.role === "client").length,
    revenue: orders
      .filter((o) => o.status === "completed")
      .reduce((s, o) => s + (o.total_price ?? 0), 0),
  };

  return (
    <AdminOrders
      orders={orders}
      profiles={profiles}
      unreadByOrder={unreadByOrder}
      stats={stats}
      activeTab={tab}
    />
  );
}
