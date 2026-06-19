"use client";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-0.5 text-sm text-white/80">{value || "—"}</p>
    </div>
  );
}

function ColorField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        {value ? (
          <>
            <span
              className="inline-block h-5 w-5 rounded border border-white/20 shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm font-mono text-white/80">{value}</span>
          </>
        ) : (
          <span className="text-sm text-white/30">—</span>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">{title}</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">{children}</div>
    </div>
  );
}

export default function BriefTab({
  order,
  projectData,
}: {
  orderId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projectData?: Record<string, any> | null;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opts: Record<string, any> = order.selected_options ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pd: Record<string, any> = projectData ?? {};

  const companyName = pd.company_name || order.template_name || opts.company_name;
  const companyDescription = pd.company_description || opts.company_description;
  const businessType = opts.business_type || order.template_name;
  const address = pd.address || opts.address;
  const workingHours = pd.working_hours || opts.working_hours;

  const phone = pd.phone || opts.phone;
  const email = pd.email || opts.email;
  const telegram = pd.telegram || opts.telegram;
  const whatsapp = pd.whatsapp || opts.whatsapp;

  const budget = order.budget || opts.budget;
  const notes = order.notes || order.client_notes || opts.notes;
  const selectedTemplate = order.template_id || order.template_name;
  const domainName = pd.domain_name || opts.domain_name || order.domain;
  const seoTitle = pd.seo_title || opts.seo_title;
  const seoDescription = pd.seo_description || opts.seo_description;

  const primaryColor = pd.primary_color || opts.primary_color;
  const secondaryColor = pd.secondary_color || opts.secondary_color;
  const font = pd.font || opts.font;

  const SKIP_KEYS = new Set([
    "business_type", "company_description", "company_name", "address", "working_hours",
    "phone", "email", "telegram", "whatsapp", "budget", "notes", "domain_name",
    "seo_title", "seo_description", "primary_color", "secondary_color", "font",
  ]);
  const extraOpts = Object.entries(opts).filter(([k]) => !SKIP_KEYS.has(k));

  return (
    <div className="space-y-4">
      <Section title="Компания">
        <div className="col-span-full">
          <Field label="Название компании" value={companyName} />
        </div>
        {companyDescription && (
          <div className="col-span-full">
            <p className="text-xs text-white/40">Описание</p>
            <p className="mt-0.5 text-sm text-white/80">{companyDescription}</p>
          </div>
        )}
        <Field label="Тип бизнеса" value={businessType} />
        <Field label="Адрес" value={address} />
        <Field label="Часы работы" value={workingHours} />
      </Section>

      <Section title="Контакты">
        <Field label="Телефон" value={phone} />
        <Field label="Email" value={email} />
        <Field label="Telegram" value={telegram} />
        <Field label="WhatsApp" value={whatsapp} />
      </Section>

      <Section title="Проект">
        <Field label="Бюджет" value={budget} />
        <Field label="Шаблон" value={selectedTemplate} />
        <Field label="Домен" value={domainName} />
        <Field label="SEO заголовок" value={seoTitle} />
        <div className="col-span-full sm:col-span-2">
          <Field label="SEO описание" value={seoDescription} />
        </div>
        {notes && (
          <div className="col-span-full">
            <p className="text-xs text-white/40">Примечания клиента</p>
            <p className="mt-0.5 text-sm text-white/80">{notes}</p>
          </div>
        )}
      </Section>

      <Section title="Брендинг">
        <ColorField label="Основной цвет" value={primaryColor} />
        <ColorField label="Вторичный цвет" value={secondaryColor} />
        <Field label="Шрифт" value={font} />
      </Section>

      <div className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Пожелания клиента</h3>
        {extraOpts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {extraOpts.map(([key, val]) => (
              <div key={key}>
                <p className="text-xs text-white/40">{key}</p>
                <p className="mt-0.5 text-sm text-white/80">
                  {val === null || val === undefined
                    ? "—"
                    : typeof val === "object"
                    ? JSON.stringify(val, null, 2)
                    : String(val)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/30">Дополнительных пожеланий нет</p>
        )}
      </div>
    </div>
  );
}
