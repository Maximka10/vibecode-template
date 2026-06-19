import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import AppSidebar from "@/components/layout/AppSidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getUserWithRole();

  if (!auth) redirect("/auth/login");

  const { user, role } = auth;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white lg:flex-row">
      <AppSidebar isAdmin={role === "admin"} userEmail={user.email ?? ""} />
      <div className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
