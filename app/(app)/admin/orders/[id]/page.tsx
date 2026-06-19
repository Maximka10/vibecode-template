import { notFound, redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { createAdminClient } from "@/lib/supabase/admin";
import OrderWorkflow from "@/components/admin/OrderWorkflow";

export default async function OrderWorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const auth = await getUserWithRole();
  if (!auth) redirect("/auth/login");

  const { user, role } = auth;
  if (role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();

  const [orderRes, messagesRes] = await Promise.all([
    admin.from("orders").select("*").eq("id", id).single(),
    admin
      .from("messages")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (orderRes.error || !orderRes.data) notFound();

  return (
    <OrderWorkflow
      order={orderRes.data}
      initialMessages={messagesRes.data ?? []}
      adminId={user.id}
    />
  );
}
