"use client";
import { useEffect, useState } from "react";
import { formatWorkingHoursTable } from "@/lib/utils/workingHours";

// ── Helpers ────────────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={copy}
      className="ml-1.5 rounded px-1 py-0.5 text-[10px] text-white/30 transition hover:bg-white/8 hover:text-cyan-400"
      title="Копировать"
    >
      {copied ? "✓" : "⧉"}
    </button>
  );
}

function Field({ label, value, copy }: { label: string; value?: string | null; copy?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <div className="mt-0.5 flex items-center gap-0.5">
        <p className="text-sm text-white/80">{value}</p>
        {copy && <CopyBtn text={value} />}
      </div>
    </div>
  );
}

function ColorField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="inline-block h-5 w-5 shrink-0 rounded border border-white/20" style={{ backgroundColor: value }} />
        <span className="font-mono text-sm text-white/80">{value}</span>
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

type FileMeta = { type?: string; title?: string; description?: string; placement_notes?: string };
type FileEntry = { name: string; url: string; path?: string; metadata?: FileMeta };

const MATERIAL_TYPE_LABELS: Record<string, string> = {
  logo: "Логотип", hero: "Hero", gallery: "Галерея", background: "Фон",
  team: "Команда", document: "Документ", other: "Прочее",
};

function isImage(name: string) {
  return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name);
}

const SKIP_KEYS = new Set([
  "business_type", "company_description", "company_name", "address", "working_hours",
  "phone", "email", "telegram", "whatsapp", "budget", "notes", "domain_name",
  "seo_title", "seo_description", "primary_color", "secondary_color", "font",
  "sections", "style", "theme", "services", "images", "heroImage", "coverImage",
]);

export default function BriefTab({
  orderId,
  order,
  projectData,
}: {
  orderId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projectData?: Record<string, any> | null;
}) {
  const [materials, setMaterials] = useState<{
    logo: FileEntry[]; photos: FileEntry[]; documents: FileEntry[];
  } | null>(null);
  const [showTech, setShowTech] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${orderId}/files`)
      .then((r) => r.json())
      .then((d) => { if (d.ok) setMaterials(d.files); })
      .catch(() => {});
  }, [orderId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opts: Record<string, any> = order.selected_options ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pd: Record<string, any> = projectData ?? {};

  const companyName = pd.company_name || order.template_name || opts.company_name;
  const companyDescription = pd.company_description || opts.company_description;
  const businessType = opts.business_type || order.template_name;
  const address = pd.address || opts.address;
  const workingHoursRaw = pd.working_hours || opts.working_hours;
  const workingHoursTable = formatWorkingHoursTable(workingHoursRaw);

  const phone = pd.phone || opts.phone;
  const email = pd.email || opts.email;
  const telegram = pd.telegram || opts.telegram;
  const whatsapp = pd.whatsapp || opts.whatsapp;

  const budget = order.budget || opts.budget;
  const notes = order.notes || order.client_notes || opts.notes;
  const selectedTemplate = order.template_name || order.template_id;
  const domainName = pd.domain_name || opts.domain_name || order.domain;
  const seoTitle = pd.seo_title || opts.seo_title;
  const seoDescription = pd.seo_description || opts.seo_description;

  const primaryColor = pd.branding?.primary_color || pd.primary_color || opts.primary_color;
  const secondaryColor = pd.branding?.secondary_color || pd.secondary_color || opts.secondary_color;
  const font = pd.font || pd.branding?.font || opts.font;

  const services: string[] = Array.isArray(pd.services)
    ? pd.services
    : Array.isArray(opts.services)
    ? opts.services
    : [];

  const extraOpts = Object.entries(opts)
    .filter(([k, v]) => !SKIP_KEYS.has(k) && typeof v !== "object" && v !== null && v !== undefined)
    .map(([k, v]) => ({ key: k, value: String(v) }))
    .filter((x) => x.value);

  const allMaterials: (FileEntry & { folder: string })[] = materials
    ? [
        ...materials.logo.map((f) => ({ ...f, folder: "logo" })),
        ...materials.photos.map((f) => ({ ...f, folder: "photos" })),
        ...materials.documents.map((f) => ({ ...f, folder: "documents" })),
      ]
    : [];

  return (
    <div className="space-y-4">
      {/* Company */}
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
        {address && (
          <div>
            <p className="text-xs text-white/40">&nbsp;</p>
            <a
              href={`https://yandex.ru/maps/?text=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-block text-xs text-cyan-400 hover:text-cyan-300"
            >
              Открыть в картах ↗
            </a>
          </div>
        )}
      </Section>

      {/* Working Hours */}
      {workingHoursRaw && (
        <div className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Режим работы</h3>
          {workingHoursTable ? (
            <table className="text-sm">
              <tbody>
                {workingHoursTable.map(({ day, value }) => (
                  <tr key={day} className={value === "Выходной" ? "text-white/30" : ""}>
                    <td className="py-0.5 pr-6 font-semibold text-white/60 w-8">{day}</td>
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
        <Field label="Телефон" value={phone} copy />
        <Field label="Email" value={email} copy />
        <Field label="Telegram" value={telegram} copy />
        <Field label="WhatsApp" value={whatsapp} copy />
      </Section>

      {/* Project */}
      <Section title="Проект">
        <Field label="Бюджет" value={budget} />
        <Field label="Шаблон" value={selectedTemplate} />
        <Field label="Домен" value={domainName} copy />
        <Field label="SEO заголовок" value={seoTitle} />
        {seoDescription && (
          <div className="col-span-full sm:col-span-2">
            <Field label="SEO описание" value={seoDescription} />
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
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Выбранные услуги</h3>
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
        <ColorField label="Основной цвет" value={primaryColor} />
        <ColorField label="Вторичный цвет" value={secondaryColor} />
        <Field label="Шрифт" value={font} />
      </Section>

      {/* Materials */}
      <div className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Загруженные материалы</h3>
        {materials === null ? (
          <p className="text-sm text-white/30">Загрузка…</p>
        ) : allMaterials.length === 0 ? (
          <p className="text-sm text-white/30">Файлы не загружены</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {allMaterials.map((f, i) => {
              const meta = f.metadata ?? {};
              return (
                <div key={i} className="rounded-xl border border-white/8 bg-white/4 overflow-hidden">
                  {isImage(f.name) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.url}
                      alt={meta.title || f.name}
                      className="w-full aspect-video object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="flex w-full aspect-video items-center justify-center text-2xl bg-white/4">📄</div>
                  )}
                  <div className="px-2.5 py-2">
                    {meta.title && <p className="truncate text-xs font-semibold text-white/80">{meta.title}</p>}
                    <p className="truncate text-xs text-white/40">{f.name}</p>
                    {meta.type && (
                      <span className="mt-1 inline-block rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] text-white/50">
                        {MATERIAL_TYPE_LABELS[meta.type] ?? meta.type}
                      </span>
                    )}
                    {meta.placement_notes && (
                      <p className="mt-0.5 text-[10px] text-cyan-400/70">{meta.placement_notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Extra client wishes */}
      {extraOpts.length > 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Пожелания клиента</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {extraOpts.map(({ key, value }) => (
              <div key={key}>
                <p className="text-xs text-white/40">{key}</p>
                <p className="mt-0.5 text-sm text-white/80">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical details (collapsed) */}
      <div className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4">
        <button
          onClick={() => setShowTech((p) => !p)}
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-widest text-white/30 hover:text-white/50 transition"
        >
          <span>Технические данные</span>
          <span>{showTech ? "▲" : "▼"}</span>
        </button>
        {showTech && (
          <div className="mt-4 space-y-2">
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
        )}
      </div>
    </div>
  );
}
