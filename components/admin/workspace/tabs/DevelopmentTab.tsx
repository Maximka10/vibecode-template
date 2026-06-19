"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";

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
};

const FIELD_CLS = "w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-white/50">{label}</label>
      {children}
    </div>
  );
}

export default function DevelopmentTab({ orderId }: { orderId: string }) {
  const [data, setData] = useState<ProjectData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [servicesText, setServicesText] = useState("");

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
    if (result.ok) { setData(result.data); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  }

  function set(key: keyof ProjectData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function setBranding(key: "primary_color" | "secondary_color", value: string) {
    setData((prev) => ({ ...prev, branding: { ...prev.branding, [key]: value } }));
  }

  if (loading) return <p className="py-12 text-center text-sm text-white/30">Загрузка…</p>;

  return (
    <div className="space-y-5">
      {/* Company */}
      <Card variant="solid" padding="md">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Компания</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Название компании">
            <input className={FIELD_CLS} value={data.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} placeholder="ООО Название" />
          </Field>
          <Field label="Адрес">
            <input className={FIELD_CLS} value={data.address ?? ""} onChange={(e) => set("address", e.target.value)} placeholder="г. Москва, ул. Пример, 1" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Описание">
              <textarea className={`${FIELD_CLS} resize-none`} rows={3} value={data.company_description ?? ""} onChange={(e) => set("company_description", e.target.value)} placeholder="Краткое описание компании…" />
            </Field>
          </div>
          <Field label="Режим работы">
            <input className={FIELD_CLS} value={data.working_hours ?? ""} onChange={(e) => set("working_hours", e.target.value)} placeholder="Пн–Пт 9:00–18:00" />
          </Field>
        </div>
      </Card>

      {/* Contacts */}
      <Card variant="solid" padding="md">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Контакты</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Телефон">
            <input className={FIELD_CLS} value={data.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+7 (999) 000-00-00" />
          </Field>
          <Field label="Email">
            <input className={FIELD_CLS} type="email" value={data.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="info@company.ru" />
          </Field>
          <Field label="Telegram">
            <input className={FIELD_CLS} value={data.telegram ?? ""} onChange={(e) => set("telegram", e.target.value)} placeholder="@username" />
          </Field>
        </div>
      </Card>

      {/* Services */}
      <Card variant="solid" padding="md">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Услуги</h3>
        <Field label="Услуги (через запятую)">
          <textarea
            className={`${FIELD_CLS} resize-none`}
            rows={3}
            value={servicesText}
            onChange={(e) => setServicesText(e.target.value)}
            placeholder="Разработка сайтов, SEO-продвижение, Дизайн"
          />
        </Field>
        {servicesText && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {servicesText.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
              <span key={s} className="rounded-full bg-cyan-500/15 border border-cyan-500/25 px-2.5 py-0.5 text-xs text-cyan-300">{s}</span>
            ))}
          </div>
        )}
      </Card>

      {/* Domain & SEO */}
      <Card variant="solid" padding="md">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Домен и SEO</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Доменное имя">
            <input className={FIELD_CLS} value={data.domain_name ?? ""} onChange={(e) => set("domain_name", e.target.value)} placeholder="company.ru" />
          </Field>
          <Field label="SEO Заголовок">
            <input className={FIELD_CLS} value={data.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} placeholder="Компания — разработка сайтов" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="SEO Описание">
              <textarea className={`${FIELD_CLS} resize-none`} rows={2} value={data.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} placeholder="Мета-описание для поисковиков…" />
            </Field>
          </div>
        </div>
      </Card>

      {/* Branding */}
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

      {/* Save */}
      <div className="flex items-center gap-3 pt-1">
        <Btn onClick={handleSave} disabled={saving} loading={saving}>
          {saving ? "Сохранение…" : "Сохранить"}
        </Btn>
        {saved && <span className="text-sm text-green-400/80">Сохранено ✓</span>}
      </div>
    </div>
  );
}
