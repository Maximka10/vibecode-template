import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { generateProject, SiteJson } from "@/lib/export/generateProject";
import JSZip from "jszip";
import { SiteSection } from "@/types/sections";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const admin = createAdminClient();

  // Fetch order + project_data in parallel
  const [orderRes, pdRes] = await Promise.all([
    admin.from("orders").select("*").eq("id", id).single(),
    admin.from("project_data").select("*").eq("order_id", id).maybeSingle(),
  ]);

  if (orderRes.error || !orderRes.data) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }
  if (pdRes.error && !pdRes.data) {
    return NextResponse.json({ ok: false, error: "Failed to load project data" }, { status: 500 });
  }

  const order = orderRes.data;
  const pd = pdRes.data ?? {};

  // Extract sections from content_edits
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentEdits = (pd.content_edits as Record<string, any>) ?? {};
  const allSections: SiteSection[] = contentEdits.sections ?? [];
  const sections = allSections.filter((s) => s.enabled !== false);
  if (allSections.length === 0) {
    return NextResponse.json({ ok: false, error: "No content configured. Add sections in the Development tab first." }, { status: 400 });
  }

  // Build site.json
  const site: SiteJson = {
    meta: {
      title: pd.seo_title ?? pd.company_name ?? order.template_name ?? "",
      description: pd.seo_description ?? pd.company_description ?? "",
      domain: pd.domain_name ?? "",
    },
    branding: {
      primary: pd.branding?.primary_color ?? "#6366f1",
      secondary: pd.branding?.secondary_color ?? "#8b5cf6",
    },
    font: pd.font ?? undefined,
    company: {
      name: pd.company_name ?? order.template_name ?? "Компания",
      description: pd.company_description ?? "",
      address: pd.address ?? "",
      working_hours: pd.working_hours ?? "",
    },
    contacts: {
      phone: pd.phone ?? "",
      email: pd.email ?? "",
      telegram: pd.telegram ?? "",
      whatsapp: pd.whatsapp ?? undefined,
    },
    sections,
  };

  // Generate project files
  const files = generateProject(site);

  // Pack into ZIP
  const zip = new JSZip();
  const projectName = (pd.company_name ?? order.template_name ?? "my-site")
    .toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "my-site";

  const folder = zip.folder(projectName);
  if (!folder) return NextResponse.json({ ok: false, error: "Failed to create ZIP archive" }, { status: 500 });
  for (const [path, content] of Object.entries(files)) {
    folder.file(path, content);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${projectName}.zip"`,
      "Content-Length": String(zipBuffer.byteLength),
    },
  });
}
