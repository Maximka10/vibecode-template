import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildOrderSite } from "@/lib/build/buildOrderSite";
import SitePreview from "@/components/admin/workspace/SitePreview";
import { SiteSection } from "@/types/sections";

export default async function PreviewFramePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const auth = await getUserWithRole();
  if (!auth) redirect("/auth/login");
  if (auth.role !== "admin") redirect("/dashboard");

  const { orderId } = await params;
  const admin = createAdminClient();

  const [orderRes, pdRes, buildRes] = await Promise.all([
    admin.from("orders").select("*").eq("id", orderId).maybeSingle(),
    admin.from("project_data").select("*").eq("order_id", orderId).maybeSingle(),
    admin
      .from("site_builds")
      .select("*")
      .eq("order_id", orderId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!orderRes.data) redirect("/admin/orders");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildData = (buildRes.data?.build_data as any) ?? buildOrderSite(orderRes.data, pdRes.data, 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections: SiteSection[] = (pdRes.data?.content_edits as any)?.sections ?? [];

  return (
    <div style={{ margin: 0, padding: 0, background: "white" }}>
      <SitePreview
        data={buildData}
        sections={sections.length > 0 ? sections : undefined}
        device="desktop"
      />
    </div>
  );
}
