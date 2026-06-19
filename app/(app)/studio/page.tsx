import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { createAdminClient } from "@/lib/supabase/admin";
import StudioDashboard from "@/components/admin/StudioDashboard";

export default async function StudioPage() {
  const auth = await getUserWithRole();
  if (!auth) redirect("/auth/login");

  const { user, role } = auth;
  if (role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .not("status", "eq", "cancelled")
    .order("created_at", { ascending: false });

  return <StudioDashboard projects={orders ?? []} />;
}
