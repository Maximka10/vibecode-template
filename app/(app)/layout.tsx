import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/role";
import AppSidebar from "@/components/layout/AppSidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const role = await getUserRole(user.id);
  const isAdmin = role === "admin";

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white lg:flex-row">
      <AppSidebar isAdmin={isAdmin} userEmail={user.email ?? ""} />
      <div className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
