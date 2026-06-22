import { notFound, redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatWorkingHoursTable } from "@/lib/utils/workingHours";

export default async function OrderBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const auth = await getUserWithRole();
  if (!auth) redirect("/auth/login");
  if (auth.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const [orderRes, pdRes] = await Promise.all([
    admin.from("orders").select("*").eq("id", id).single(),
    admin.from("project_data").select("*").eq("order_id", id).maybeSingle(),
  ]);

  if (orderRes.error || !orderRes.data) notFound();

  const order = orderRes.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pd: Record<string, any> = pdRes.data ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opts: Record<string, any> = order.selected_options ?? {};

  const companyName = pd.company_name || order.template_name || opts.company_name;
  const companyDescription = pd.company_description || opts.company_description;
  const businessType = opts.business_type || order.template_name;
  const address = pd.address || opts.address;
  const phone = pd.phone || opts.phone;
  const email = pd.email || opts.email;
  const telegram = pd.telegram || opts.telegram;
  const whatsapp = pd.whatsapp || opts.whatsapp;
  const domainName = pd.domain_name || opts.domain_name || order.domain;
  const seoTitle = pd.seo_title || opts.seo_title;
  const seoDescription = pd.seo_description || opts.seo_description;
  const primaryColor = pd.branding?.primary_color || pd.primary_color || opts.primary_color;
  const secondaryColor = pd.branding?.secondary_color || pd.secondary_color || opts.secondary_color;
  const font = pd.font || pd.branding?.font || opts.font;
  const budget = order.budget || opts.budget;
  const notes = order.notes || order.client_notes || opts.notes;
  const workingHoursRaw = pd.working_hours || opts.working_hours;
  const workingHoursTable = formatWorkingHoursTable(workingHoursRaw);
  const services: string[] = Array.isArray(pd.services) ? pd.services : Array.isArray(opts.services) ? opts.services : [];
  const contactLink = pd.contact_link || null;

  const SKIP_KEYS = new Set([
    "business_type", "company_description", "company_name", "address", "working_hours",
    "phone", "email", "telegram", "whatsapp", "budget", "notes", "domain_name",
    "seo_title", "seo_description", "primary_color", "secondary_color", "font",
    "sections", "style", "theme", "services", "images", "heroImage", "coverImage",
  ]);

  const extraOpts = Object.entries(opts)
    .filter(([k, v]) => !SKIP_KEYS.has(k) && typeof v !== "object" && v !== null && v !== undefined)
    .map(([k, v]) => ({ key: k, value: String(v) }))
    .filter((x) => x.value);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/8 bg-slate-950/95 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Бриф клиента</p>
            <h1 className="mt-0.5 text-lg font-black text-white">
              {companyName || `Заказ #${order.id.slice(0, 8)}`}
            </h1>
          </div>
          <a
            href={`/admin/orders/${order.id}`}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ← Назад к заказу
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-5 px-6 py-8">
        {/* Company */}
        <Section title="Компания">
          <Row label="Название" value={companyName} />
          <Row label="Тип бизнеса" value={businessType} />
          <Row label="Адрес" value={address} />
          {companyDescription && (
            <div className="col-span-full">
              <p className="text-xs text-white/40">Описание</p>
              <p className="mt-0.5 text-sm text-white/80">{companyDescription}</p>
            </div>
          )}
        </Section>

        {/* Working hours */}
        {workingHoursRaw && (
          <div className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Режим работы</h3>
            {workingHoursTable ? (
              <table className="text-sm">
                <tbody>
                  {workingHoursTable.map(({ day, value }) => (
                    <tr key={day} className={value === "Выходной" ? "text-white/30" : ""}>
                      <td className="w-8 py-0.5 pr-6 font-semibold text-white/60">{day}</td>
                      <td className="py-0.5 text-white/80">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-white/80">{workingHoursRaw}</p>
            )}
          </div>
        )}

        {/* Contacts */}
        <Section title="Контакты">
          <Row label="Телефон" value={phone} />
          <Row label="Email" value={email} />
          <Row label="Telegram" value={telegram} />
          <Row label="WhatsApp" value={whatsapp} />
          {contactLink && <Row label="Ссылка для связи" value={contactLink} />}
        </Section>

        {/* Project */}
        <Section title="Проект">
          <Row label="Бюджет" value={budget} />
          <Row label="Шаблон" value={order.template_name || order.template_id} />
          <Row label="Домен" value={domainName} />
          <Row label="SEO заголовок" value={seoTitle} />
          {seoDescription && (
            <div className="col-span-full sm:col-span-2">
              <p className="text-xs text-white/40">SEO описание</p>
              <p className="mt-0.5 text-sm text-white/80">{seoDescription}</p>
            </div>
          )}
          {notes && (
            <div className="col-span-full">
              <p className="text-xs text-white/40">Примечания клиента</p>
              <p className="mt-0.5 text-sm text-white/80">{notes}</p>
            </div>
          )}
        </Section>

        {/* Services */}
        {services.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Услуги</h3>
            <div className="flex flex-wrap gap-2">
              {services.map((s, i) => (
                <span key={i} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  {typeof s === "string" ? s : JSON.stringify(s)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Branding */}
        <Section title="Брендинг">
          {primaryColor && (
            <div>
              <p className="text-xs text-white/40">Основной цвет</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-block h-5 w-5 shrink-0 rounded border border-white/20" style={{ backgroundColor: primaryColor }} />
                <span className="font-mono text-sm text-white/80">{primaryColor}</span>
              </div>
            </div>
          )}
          {secondaryColor && (
            <div>
              <p className="text-xs text-white/40">Вторичный цвет</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-block h-5 w-5 shrink-0 rounded border border-white/20" style={{ backgroundColor: secondaryColor }} />
                <span className="font-mono text-sm text-white/80">{secondaryColor}</span>
              </div>
            </div>
          )}
          <Row label="Шрифт" value={font} />
        </Section>

        {/* Extra options */}
        {extraOpts.length > 0 && (
          <Section title="Пожелания клиента">
            {extraOpts.map(({ key, value }) => (
              <Row key={key} label={key} value={value} />
            ))}
          </Section>
        )}

        {/* Technical */}
        <div className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Технические данные</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-white/30">ID заказа</p>
              <p className="font-mono text-xs text-white/50">{order.id}</p>
            </div>
            <div>
              <p className="text-xs text-white/30">Template ID</p>
              <p className="font-mono text-xs text-white/50">{order.template_id}</p>
            </div>
            {order.created_at && (
              <div>
                <p className="text-xs text-white/30">Создан</p>
                <p className="text-xs text-white/50">{new Date(order.created_at).toLocaleString("ru-RU")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
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

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-0.5 text-sm text-white/80">{value}</p>
    </div>
  );
}
