import { notFound, redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { createAdminClient } from "@/lib/supabase/admin";
import OrderWorkspace from "@/components/admin/workspace/OrderWorkspace";

export default async function OrderWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const auth = await getUserWithRole();
  if (!auth) redirect("/auth/login");

  if (auth.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();

  const [orderRes, pdRes] = await Promise.all([
    admin.from("orders").select("*").eq("id", id).single(),
    admin.from("project_data").select("*").eq("order_id", id).maybeSingle(),
  ]);

  if (orderRes.error || !orderRes.data) notFound();

  return (
    <OrderWorkspace
      order={orderRes.data}
      projectData={pdRes.data ?? null}
    />
  );
}
