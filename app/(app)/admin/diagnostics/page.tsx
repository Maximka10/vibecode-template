import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { createAdminClient } from "@/lib/supabase/admin";
import DiagnosticsClient from "./DiagnosticsClient";

export default async function DiagnosticsPage() {
  const auth = await getUserWithRole();
  if (!auth) redirect("/auth/login");
  if (auth.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();

  const [ordersRes, messagesRes, storageRes] = await Promise.all([
    admin.from("orders").select("id, status, created_at, template_id, client_name").order("created_at", { ascending: false }).limit(20),
    admin.from("messages").select("id, created_at, is_read").order("created_at", { ascending: false }).limit(50),
    admin.storage.from("uploads").list("", { limit: 5 }).catch(() => ({ data: null, error: "Storage error" })),
  ]);

  const stats = {
    totalOrders: ordersRes.data?.length ?? 0,
    ordersByStatus: ordersRes.data?.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {}) ?? {},
    totalMessages: messagesRes.data?.length ?? 0,
    unreadMessages: messagesRes.data?.filter((m) => !m.is_read).length ?? 0,
    storageOk: !storageRes.error,
    dbOk: !ordersRes.error,
    ordersError: ordersRes.error?.message ?? null,
    messagesError: messagesRes.error?.message ?? null,
    recentOrders: ordersRes.data ?? [],
  };

  return <DiagnosticsClient stats={stats} />;
}
