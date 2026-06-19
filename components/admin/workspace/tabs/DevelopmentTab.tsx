"use client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import SitePreview from "@/components/admin/workspace/SitePreview";
import { BuildData } from "@/lib/build/buildOrderSite";

type ContentEdits = {
  hero?: { title?: string; subtitle?: string; cta?: string };
  about?: { title?: string; text?: string };
};

type ProjectData = {
  company_name?: string;
  company_description?: string;
  phone?: string;
  email?: string;
  telegram?: string;
  address?: string;
  working_hours?: string;
  domain_name?: string;
  services?: string[];
  seo_title?: string;
  seo_description?: string;
  branding?: { primary_color?: string; secondary_color?: string };
  content_edits?: ContentEdits;
};

type EditorSection = "hero" | "about" | "services" | "contacts" | "seo" | "branding";

const SECTIONS: { id: EditorSection; label: string }[] = [
  { id: "hero", label: "Главный экран" },
  { id: "about", label: "О нас" },
  { id: "services", label: "Услуги" },
  { id: "contacts", label: "Контакты" },
  { id: "seo", label: "SEO" },
  { id: "branding", label: "Брендинг" },
];

const FIELD_CLS =
  "w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-white/50">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-white/25">{hint}</p>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildLivePreview(data: ProjectData, servicesText: string, order: Record<string, any>): BuildData {
  const ce = data.content_edits ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opts = order?.selected_options as Record<string, any> | null | undefined;
  const templatePrimary = opts?.theme?.primary ?? "#6366f1";
  const templateSecondary = opts?.theme?.gradientFrom ?? "#8b5cf6";
  const snapshot = order?.project_snapshot ?? {};

  const services = servicesText
    ? servicesText.split(",").map((s: string) => s.trim()).filter(Boolean)
    : (data.services ?? []);

  return {
    meta: {
      template_id: snapshot.template_id ?? order?.template_id ?? "",
      template_name: snapshot.template_name ?? order?.template_name ?? "",
      build_version: 0,
      built_at: new Date().toISOString(),
      order_id: order?.id ?? "",
    },
    company: {
      name: ce.hero?.title || data.company_name || order?.template_name || "Название компании",
      description: ce.hero?.subtitle || data.company_description || "",
      address: data.address ?? "",
      working_hours: data.working_hours ?? "",
    },
    contacts: {
      phone: data.phone ?? "",
      email: data.email ?? "",
      telegram: data.telegram ?? "",
    },
    services,
    branding: {
      primary_color: data.branding?.primary_color ?? templatePrimary,
      secondary_color: data.branding?.secondary_color ?? templateSecondary,
    },
    seo: {
      title: data.seo_title ?? ce.hero?.title ?? data.company_name ?? "",
      description: data.seo_description ?? ce.about?.text ?? data.company_description ?? "",
    },
    content: {
      domain_name: data.domain_name ?? "",
      hero_cta: ce.hero?.cta,
      about_title: ce.about?.title,
      about_text: ce.about?.text || data.company_description || undefined,
    },
  };
}

export default function DevelopmentTab({
  orderId,
  order,
}: {
  orderId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: Record<string, any>;
}) {
  const [data, setData] = useState<ProjectData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [servicesText, setServicesText] = useState("");
  const [section, setSection] = useState<EditorSection>("hero");

  useEffect(() => {
    fetch(`/api/orders/${orderId}/project-data`)
      .then((r) => r.json())
      .then(({ data: d }) => {
        if (d) {
          setData(d);
          setServicesText((d.services ?? []).join(", "));
        }
        setLoading(false);
      });
  }, [orderId]);

  const previewData = useMemo(
    () => buildLivePreview(data, servicesText, order),
    [data, servicesText, order]
  );

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const patch: ProjectData = {
      ...data,
      services: servicesText.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const res = await fetch(`/api/orders/${orderId}/project-data`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const result = await res.json();
    if (result.ok) {
      setData(result.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  function setField(key: keyof ProjectData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function setContentEdit(section: "hero" | "about", key: string, value: string) {
    setData((prev) => ({
      ...prev,
      content_edits: {
        ...prev.content_edits,
        [section]: { ...(prev.content_edits?.[section] ?? {}), [key]: value },
      },
    }));
  }

  function setBranding(key: "primary_color" | "secondary_color", value: string) {
    setData((prev) => ({ ...prev, branding: { ...prev.branding, [key]: value } }));
  }

  if (loading) return <p className="py-12 text-center text-sm text-white/30">Загрузка…</p>;

  const ce = data.content_edits ?? {};

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      {/* ── Editor ── */}
      <div className="space-y-4">
        {/* Section tabs */}
        <div className="flex flex-wrap gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                section === s.id
                  ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-300"
                  : "border border-white/8 text-white/40 hover:text-white/70"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Hero ── */}
        {section === "hero" && (
          <Card variant="solid" padding="md">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Главный экран</h3>
            <div className="space-y-4">
              <Field label="Заголовок" hint="Отображается как основной заголовок сайта">
                <input
                  className={FIELD_CLS}
                  value={ce.hero?.title ?? ""}
                  onChange={(e) => setContentEdit("hero", "title", e.target.value)}
                  placeholder={data.company_name || "Название компании"}
                />
              </Field>
              <Field label="Подзаголовок" hint="Краткое описание под заголовком">
                <textarea
                  className={`${FIELD_CLS} resize-none`}
                  rows={3}
                  value={ce.hero?.subtitle ?? ""}
                  onChange={(e) => setContentEdit("hero", "subtitle", e.target.value)}
                  placeholder={data.company_description || "Описание компании…"}
                />
              </Field>
              <Field label="Текст кнопки CTA">
                <input
                  className={FIELD_CLS}
                  value={ce.hero?.cta ?? ""}
                  onChange={(e) => setContentEdit("hero", "cta", e.target.value)}
                  placeholder="Связаться с нами"
                />
              </Field>
            </div>
          </Card>
        )}

        {/* ── About ── */}
        {section === "about" && (
          <Card variant="solid" padding="md">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">О нас</h3>
            <div className="space-y-4">
              <Field label="Заголовок раздела">
                <input
                  className={FIELD_CLS}
                  value={ce.about?.title ?? ""}
                  onChange={(e) => setContentEdit("about", "title", e.target.value)}
                  placeholder="О компании"
                />
              </Field>
              <Field label="Текст раздела «О нас»">
                <textarea
                  className={`${FIELD_CLS} resize-none`}
                  rows={6}
                  value={ce.about?.text ?? ""}
                  onChange={(e) => setContentEdit("about", "text", e.target.value)}
                  placeholder="Расскажите о компании подробнее…"
                />
              </Field>
            </div>
          </Card>
        )}

        {/* ── Services ── */}
        {section === "services" && (
          <Card variant="solid" padding="md">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Услуги</h3>
            <Field label="Услуги (через запятую)">
              <textarea
                className={`${FIELD_CLS} resize-none`}
                rows={4}
                value={servicesText}
                onChange={(e) => setServicesText(e.target.value)}
                placeholder="Разработка сайтов, SEO-продвижение, Дизайн"
              />
            </Field>
            {servicesText && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {servicesText.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                  <span key={s} className="rounded-full border border-cyan-500/25 bg-cyan-500/15 px-2.5 py-0.5 text-xs text-cyan-300">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ── Contacts ── */}
        {section === "contacts" && (
          <Card variant="solid" padding="md">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Контакты</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Телефон">
                <input className={FIELD_CLS} value={data.phone ?? ""} onChange={(e) => setField("phone", e.target.value)} placeholder="+7 (999) 000-00-00" />
              </Field>
              <Field label="Email">
                <input className={FIELD_CLS} type="email" value={data.email ?? ""} onChange={(e) => setField("email", e.target.value)} placeholder="info@company.ru" />
              </Field>
              <Field label="Telegram">
                <input className={FIELD_CLS} value={data.telegram ?? ""} onChange={(e) => setField("telegram", e.target.value)} placeholder="@username" />
              </Field>
              <Field label="Адрес">
                <input className={FIELD_CLS} value={data.address ?? ""} onChange={(e) => setField("address", e.target.value)} placeholder="г. Москва, ул. Пример, 1" />
              </Field>
              <Field label="Режим работы">
                <input className={FIELD_CLS} value={data.working_hours ?? ""} onChange={(e) => setField("working_hours", e.target.value)} placeholder="Пн–Пт 9:00–18:00" />
              </Field>
            </div>
          </Card>
        )}

        {/* ── SEO ── */}
        {section === "seo" && (
          <Card variant="solid" padding="md">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">SEO</h3>
            <div className="space-y-4">
              <Field label="Доменное имя">
                <input className={FIELD_CLS} value={data.domain_name ?? ""} onChange={(e) => setField("domain_name", e.target.value)} placeholder="company.ru" />
              </Field>
              <Field label="SEO Заголовок" hint="Отображается в поисковой выдаче и вкладке браузера">
                <input className={FIELD_CLS} value={data.seo_title ?? ""} onChange={(e) => setField("seo_title", e.target.value)} placeholder="Компания — разработка сайтов" />
              </Field>
              <Field label="SEO Описание" hint="Meta description для поисковиков (до 160 символов)">
                <textarea
                  className={`${FIELD_CLS} resize-none`}
                  rows={3}
                  value={data.seo_description ?? ""}
                  onChange={(e) => setField("seo_description", e.target.value)}
                  placeholder="Краткое описание для поисковиков…"
                />
              </Field>
            </div>
          </Card>
        )}

        {/* ── Branding ── */}
        {section === "branding" && (
          <Card variant="solid" padding="md">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Брендинг</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Основной цвет">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.branding?.primary_color ?? "#6366f1"}
                    onChange={(e) => setBranding("primary_color", e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                  />
                  <input
                    className={`${FIELD_CLS} flex-1`}
                    value={data.branding?.primary_color ?? ""}
                    onChange={(e) => setBranding("primary_color", e.target.value)}
                    placeholder="#6366f1"
                  />
                </div>
              </Field>
              <Field label="Вторичный цвет">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.branding?.secondary_color ?? "#8b5cf6"}
                    onChange={(e) => setBranding("secondary_color", e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                  />
                  <input
                    className={`${FIELD_CLS} flex-1`}
                    value={data.branding?.secondary_color ?? ""}
                    onChange={(e) => setBranding("secondary_color", e.target.value)}
                    placeholder="#8b5cf6"
                  />
                </div>
              </Field>
            </div>
          </Card>
        )}

        {/* Save */}
        <div className="flex items-center gap-3 pt-1">
          <Btn onClick={handleSave} disabled={saving} loading={saving}>
            {saving ? "Сохранение…" : "Сохранить"}
          </Btn>
          {saved && <span className="text-sm text-green-400/80">Сохранено ✓</span>}
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div className="xl:sticky xl:top-20 xl:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">Предпросмотр</p>
        <div className="overflow-hidden rounded-2xl" style={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
          <SitePreview data={previewData} />
        </div>
      </div>
    </div>
  );
}
