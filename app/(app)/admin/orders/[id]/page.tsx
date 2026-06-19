import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/role";
import { createAdminClient } from "@/lib/supabase/admin";
import OrderWorkflow from "@/components/admin/OrderWorkflow";

export default async function OrderWorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const role = await getUserRole(user.id);
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
