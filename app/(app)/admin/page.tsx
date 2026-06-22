import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminOrders from "@/components/admin/AdminOrders";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; order?: string }>;
}) {
  const auth = await getUserWithRole();

  if (!auth) redirect("/auth/login");
  if (auth.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const { tab = "orders" } = await searchParams;

  const [ordersRes, profilesRes, messagesRes, tgLinkedRes] = await Promise.all([
    admin.from("orders").select("*").order("created_at", { ascending: false }),
    admin.from("profiles").select("*").order("created_at", { ascending: false }),
    admin.from("messages").select("order_id").eq("is_read", false),
    admin.from("orders").select("id", { count: "exact", head: true }).not("telegram_client_id", "is", null),
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
    waitingClient: orders.filter((o) => o.status === "waiting_client").length,
    completed: orders.filter((o) => o.status === "completed").length,
    clients: profiles.filter((p) => p.role === "client").length,
    tgLinked: tgLinkedRes.count ?? 0,
    revenue: orders
      .filter((o) => o.status === "completed")
      .reduce((s, o) => s + (o.total_price ?? 0), 0),
    // Sales funnel by lead_status
    leadNew: orders.filter((o) => o.lead_status === "new").length,
    leadContacted: orders.filter((o) => o.lead_status === "contacted").length,
    leadQualified: orders.filter((o) => o.lead_status === "qualified").length,
    leadProposalSent: orders.filter((o) => o.lead_status === "proposal_sent").length,
    leadWon: orders.filter((o) => o.lead_status === "won").length,
    leadLost: orders.filter((o) => o.lead_status === "lost").length,
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
