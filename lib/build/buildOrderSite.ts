export type BuildData = {
  meta: {
    template_id: string;
    template_name: string;
    build_version: number;
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
  seo: {
    title: string;
    description: string;
  };
  content: {
    domain_name: string;
  };
};

type TemplateSnapshot = {
  template_id?: string;
  template_name?: string;
  selected_options?: Record<string, unknown>;
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
  branding?: { primary_color?: string; secondary_color?: string } | null;
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

  return {
    meta: {
      template_id: snapshot.template_id ?? order.template_id ?? "",
      template_name: snapshot.template_name ?? order.template_name ?? "",
      build_version: buildVersion,
      built_at: new Date().toISOString(),
      order_id: order.id,
    },
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
    },
    services: pd.services ?? [],
    branding: {
      primary_color: pd.branding?.primary_color ?? "#6366f1",
      secondary_color: pd.branding?.secondary_color ?? "#8b5cf6",
    },
    seo: {
      title: pd.seo_title ?? pd.company_name ?? order.template_name ?? "",
      description: pd.seo_description ?? pd.company_description ?? "",
    },
    content: {
      domain_name: pd.domain_name ?? "",
    },
  };
}
