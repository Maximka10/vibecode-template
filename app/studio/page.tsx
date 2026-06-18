import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/role";
import { createAdminClient } from "@/lib/supabase/admin";
import StudioDashboard from "@/components/admin/StudioDashboard";

export default async function StudioPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const role = await getUserRole(user.id);
  if (role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .not("status", "eq", "cancelled")
    .order("created_at", { ascending: false });

  return <StudioDashboard projects={orders ?? []} />;
}
