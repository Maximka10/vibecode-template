import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import CRMPage from "@/components/admin/crm/CRMPage";

export const metadata = { title: "Telegram CRM — Vibecode Studio" };

export default async function AdminCRMPage() {
  const auth = await getUserWithRole();
  if (!auth) redirect("/auth/login");
  if (auth.role !== "admin") redirect("/dashboard");

  return <CRMPage />;
}
