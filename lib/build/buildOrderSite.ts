import { formatWorkingHours } from "@/lib/utils/workingHours";

export type BuildData = {
  meta: {
    template_id: string;
    template_name: string;
    version: number;
    built_at: string;
    order_id: string;
  };
  company: {
    name: string;
    description: string;
    address: string;
    working_hours: string;
  };
  contacts: {
    phone: string;
    email: string;
    telegram: string;
  };
  services: string[];
  branding: {
    primary_color: string;
    secondary_color: string;
  };
  font?: string;
  seo: {
    title: string;
    description: string;
  };
  content: {
    domain_name: string;
    contact_link?: string;
    hero_cta?: string;
    about_title?: string;
    about_text?: string;
  };
};

type TemplateSnapshot = {
  template_id?: string;
  template_name?: string;
  selected_options?: Record<string, unknown>;
};

type ContentEdits = {
  hero?: { title?: string; subtitle?: string; cta?: string };
  about?: { title?: string; text?: string };
};

type ProjectData = {
  company_name?: string | null;
  company_description?: string | null;
  phone?: string | null;
  email?: string | null;
  telegram?: string | null;
  address?: string | null;
  working_hours?: string | null;
  domain_name?: string | null;
  services?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  font?: string | null;
  contact_link?: string | null;
  branding?: { primary_color?: string; secondary_color?: string } | null;
  content_edits?: ContentEdits | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderRow = Record<string, any>;

export function buildOrderSite(
  order: OrderRow,
  projectData: ProjectData | null,
  buildVersion: number = 1
): BuildData {
  const snapshot: TemplateSnapshot =
    order.project_snapshot ?? {
      template_id: order.template_id,
      template_name: order.template_name,
    };

  const pd = projectData ?? {};
  const ce = pd.content_edits ?? {};

  return {
    meta: {
      template_id: snapshot.template_id ?? order.template_id ?? "",
      template_name: snapshot.template_name ?? order.template_name ?? "",
      version: buildVersion,
      built_at: new Date().toISOString(),
      order_id: order.id,
    },
    company: {
      name: ce.hero?.title || pd.company_name || order.template_name || "Компания",
      description: ce.hero?.subtitle || pd.company_description || "",
      address: pd.address ?? "",
      working_hours: formatWorkingHours(pd.working_hours) || (pd.working_hours ?? ""),
    },
    contacts: {
      phone: pd.phone ?? "",
      email: pd.email ?? "",
      telegram: pd.telegram ?? "",
    },
    services: pd.services ?? [],
    branding: {
      primary_color: pd.branding?.primary_color ?? "#6366f1",
      secondary_color: pd.branding?.secondary_color ?? "#8b5cf6",
    },
    font: pd.font ?? undefined,
    seo: {
      title: pd.seo_title ?? ce.hero?.title ?? pd.company_name ?? order.template_name ?? "",
      description: pd.seo_description ?? ce.about?.text ?? pd.company_description ?? "",
    },
    content: {
      domain_name: pd.domain_name ?? "",
      contact_link: pd.contact_link ?? undefined,
      hero_cta: ce.hero?.cta,
      about_title: ce.about?.title,
      about_text: ce.about?.text || pd.company_description || undefined,
    },
  };
}
