"use client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import SitePreview from "@/components/admin/workspace/SitePreview";
import { BuildData } from "@/lib/build/buildOrderSite";
import {
  SiteSection,
  SectionType,
  SectionContent,
  SECTION_TYPE_LABELS,
  ALL_SECTION_TYPES,
} from "@/types/sections";

// ── Types ────────────────────────────────────────────────────────────────────

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
  content_edits?: {
    hero?: { title?: string; subtitle?: string; cta?: string };
    about?: { title?: string; text?: string };
    sections?: SiteSection[];
  };
};

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_ICONS: Record<Device, string> = { desktop: "🖥", tablet: "📱", mobile: "📲" };
const DEVICE_LABELS: Record<Device, string> = { desktop: "Desktop", tablet: "Tablet", mobile: "Mobile" };

// ── Helpers ──────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function defaultContent(type: SectionType): SectionContent {
  switch (type) {
    case "hero": return { title: "", subtitle: "", cta_text: "" };
    case "about": return { title: "О нас", text: "" };
    case "services": return { title: "Наши услуги", items: [] };
    case "gallery": return { title: "Галерея", images: [] };
    case "reviews": return { title: "Отзывы клиентов", items: [] };
    case "faq": return { title: "FAQ", items: [] };
    case "pricing": return { title: "Цены", plans: [] };
    case "cta": return { title: "Свяжитесь с нами", subtitle: "", cta_text: "Оставить заявку" };
    case "contacts": return { title: "Контакты", phone: "", email: "", telegram: "", address: "", working_hours: "" };
    case "map": return { title: "Как нас найти", address: "" };
    case "footer": return { company_name: "", links: [] };
    default: return {};
  }
}

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

// ── Section Content Editor ────────────────────────────────────────────────────

function SectionEditor({
  section,
  onChange,
}: {
  section: SiteSection;
  onChange: (content: SectionContent) => void;
}) {
  const c = section.content;

  function set(key: string, value: unknown) {
    onChange({ ...c, [key]: value });
  }

  switch (section.type) {
    case "hero":
      return (
        <div className="space-y-3">
          <Field label="Заголовок"><input className={FIELD_CLS} value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} placeholder="Название / слоган" /></Field>
          <Field label="Подзаголовок"><textarea className={`${FIELD_CLS} resize-none`} rows={2} value={String(c.subtitle ?? "")} onChange={(e) => set("subtitle", e.target.value)} placeholder="Краткое описание" /></Field>
          <Field label="Текст кнопки CTA"><input className={FIELD_CLS} value={String(c.cta_text ?? "")} onChange={(e) => set("cta_text", e.target.value)} placeholder="Оставить заявку" /></Field>
        </div>
      );
    case "about":
      return (
        <div className="space-y-3">
          <Field label="Заголовок раздела"><input className={FIELD_CLS} value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Текст"><textarea className={`${FIELD_CLS} resize-none`} rows={5} value={String(c.text ?? "")} onChange={(e) => set("text", e.target.value)} placeholder="Расскажите о компании…" /></Field>
        </div>
      );
    case "services": {
      const items = (c.items as string[]) ?? [];
      return (
        <div className="space-y-3">
          <Field label="Заголовок раздела"><input className={FIELD_CLS} value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Услуги (каждая с новой строки)">
            <textarea
              className={`${FIELD_CLS} resize-none`}
              rows={5}
              value={items.join("\n")}
              onChange={(e) => set("items", e.target.value.split("\n").filter(Boolean))}
              placeholder={"Разработка сайтов\nSEO-продвижение\nДизайн"}
            />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {items.map((s) => <span key={s} className="rounded-full border border-cyan-500/25 bg-cyan-500/15 px-2.5 py-0.5 text-xs text-cyan-300">{s}</span>)}
          </div>
        </div>
      );
    }
    case "gallery": {
      const images = (c.images as string[]) ?? [];
      return (
        <div className="space-y-3">
          <Field label="Заголовок"><input className={FIELD_CLS} value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="URL изображений (каждый с новой строки)">
            <textarea
              className={`${FIELD_CLS} resize-none font-mono`}
              rows={4}
              value={images.join("\n")}
              onChange={(e) => set("images", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
              placeholder="https://..."
            />
          </Field>
        </div>
      );
    }
    case "reviews": {
      const items = (c.items as { author: string; text: string; rating: number }[]) ?? [];
      return (
        <div className="space-y-3">
          <Field label="Заголовок"><input className={FIELD_CLS} value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></Field>
          {items.map((r, i) => (
            <Card key={i} variant="subtle" padding="sm">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input className={`${FIELD_CLS} flex-1`} value={r.author} onChange={(e) => set("items", items.map((x, j) => j === i ? { ...x, author: e.target.value } : x))} placeholder="Имя клиента" />
                  <button onClick={() => set("items", items.filter((_, j) => j !== i))} className="text-red-400/60 hover:text-red-400 text-xs px-2">✕</button>
                </div>
                <textarea className={`${FIELD_CLS} resize-none`} rows={2} value={r.text} onChange={(e) => set("items", items.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} placeholder="Текст отзыва" />
              </div>
            </Card>
          ))}
          <Btn variant="outline" size="sm" onClick={() => set("items", [...items, { author: "", text: "", rating: 5 }])}>+ Добавить отзыв</Btn>
        </div>
      );
    }
    case "faq": {
      const items = (c.items as { question: string; answer: string }[]) ?? [];
      return (
        <div className="space-y-3">
          <Field label="Заголовок"><input className={FIELD_CLS} value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></Field>
          {items.map((f, i) => (
            <Card key={i} variant="subtle" padding="sm">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input className={`${FIELD_CLS} flex-1`} value={f.question} onChange={(e) => set("items", items.map((x, j) => j === i ? { ...x, question: e.target.value } : x))} placeholder="Вопрос" />
                  <button onClick={() => set("items", items.filter((_, j) => j !== i))} className="text-red-400/60 hover:text-red-400 text-xs px-2">✕</button>
                </div>
                <textarea className={`${FIELD_CLS} resize-none`} rows={2} value={f.answer} onChange={(e) => set("items", items.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))} placeholder="Ответ" />
              </div>
            </Card>
          ))}
          <Btn variant="outline" size="sm" onClick={() => set("items", [...items, { question: "", answer: "" }])}>+ Добавить вопрос</Btn>
        </div>
      );
    }
    case "pricing": {
      const plans = (c.plans as { name: string; price: string; features: string[] }[]) ?? [];
      return (
        <div className="space-y-3">
          <Field label="Заголовок"><input className={FIELD_CLS} value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></Field>
          {plans.map((p, i) => (
            <Card key={i} variant="subtle" padding="sm">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input className={`${FIELD_CLS} flex-1`} value={p.name} onChange={(e) => set("plans", plans.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Тариф" />
                  <input className={`${FIELD_CLS} w-28`} value={p.price} onChange={(e) => set("plans", plans.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} placeholder="от 50 000 ₽" />
                  <button onClick={() => set("plans", plans.filter((_, j) => j !== i))} className="text-red-400/60 hover:text-red-400 text-xs px-2">✕</button>
                </div>
                <textarea
                  className={`${FIELD_CLS} resize-none`} rows={3}
                  value={(p.features ?? []).join("\n")}
                  onChange={(e) => set("plans", plans.map((x, j) => j === i ? { ...x, features: e.target.value.split("\n").filter(Boolean) } : x))}
                  placeholder={"Функция 1\nФункция 2"}
                />
              </div>
            </Card>
          ))}
          <Btn variant="outline" size="sm" onClick={() => set("plans", [...plans, { name: "", price: "", features: [] }])}>+ Добавить тариф</Btn>
        </div>
      );
    }
    case "cta":
      return (
        <div className="space-y-3">
          <Field label="Заголовок"><input className={FIELD_CLS} value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Подзаголовок"><input className={FIELD_CLS} value={String(c.subtitle ?? "")} onChange={(e) => set("subtitle", e.target.value)} /></Field>
          <Field label="Текст кнопки"><input className={FIELD_CLS} value={String(c.cta_text ?? "")} onChange={(e) => set("cta_text", e.target.value)} /></Field>
        </div>
      );
    case "contacts":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {(["phone", "email", "telegram", "address", "working_hours"] as const).map((k) => (
            <Field key={k} label={k === "phone" ? "Телефон" : k === "email" ? "Email" : k === "telegram" ? "Telegram" : k === "address" ? "Адрес" : "Режим работы"}>
              <input className={FIELD_CLS} value={String(c[k] ?? "")} onChange={(e) => set(k, e.target.value)} />
            </Field>
          ))}
        </div>
      );
    case "map":
      return (
        <div className="space-y-3">
          <Field label="Заголовок"><input className={FIELD_CLS} value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Адрес"><input className={FIELD_CLS} value={String(c.address ?? "")} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="URL embed карты (необязательно)" hint="iframe src от Яндекс.Карт или Google Maps"><input className={FIELD_CLS} value={String(c.embed_url ?? "")} onChange={(e) => set("embed_url", e.target.value)} /></Field>
        </div>
      );
    case "footer": {
      const links = (c.links as string[]) ?? [];
      return (
        <div className="space-y-3">
          <Field label="Название компании"><input className={FIELD_CLS} value={String(c.company_name ?? "")} onChange={(e) => set("company_name", e.target.value)} /></Field>
          <Field label="Ссылки в подвале (каждая с новой строки)">
            <textarea className={`${FIELD_CLS} resize-none`} rows={3} value={links.join("\n")} onChange={(e) => set("links", e.target.value.split("\n").filter(Boolean))} placeholder={"Политика конфиденциальности\nОферта"} />
          </Field>
        </div>
      );
    }
    default:
      return <p className="text-sm text-white/30">Редактор для этой секции пока не реализован</p>;
  }
}

// ── Unique section types ──────────────────────────────────────────────────────

const UNIQUE_SECTION_TYPES = ["hero", "footer", "contacts", "map"] as const;

function canAddSection(type: string, existingSections: SiteSection[]): boolean {
  if ((UNIQUE_SECTION_TYPES as readonly string[]).includes(type)) {
    return !existingSections.some(s => s.type === type);
  }
  return true;
}

// ── Main Component ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DevelopmentTab({ orderId, order }: { orderId: string; order: Record<string, any> }) {
  const [pd, setPd] = useState<ProjectData>({});
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}/project-data`)
      .then((r) => r.json())
      .then(({ data: d }) => {
        if (d) {
          setPd(d);
          if (d.content_edits?.sections?.length) {
            setSections(d.content_edits.sections);
          }
        }
        setLoading(false);
      });
    fetch(`/api/orders/${orderId}/generate-content`)
      .then((r) => r.json())
      .then((d) => setAiAvailable(!!d.available))
      .catch(() => setAiAvailable(false));
  }, [orderId]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // ── Build live preview data ───────────────────────────────────────────────
  const previewData = useMemo((): BuildData => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opts = order?.selected_options as Record<string, any> | null | undefined;
    const templatePrimary = opts?.theme?.primary ?? "#6366f1";
    const templateSecondary = opts?.theme?.gradientFrom ?? "#8b5cf6";
    const snapshot = order?.project_snapshot ?? {};
    return {
      meta: {
        template_id: snapshot.template_id ?? order?.template_id ?? "",
        template_name: snapshot.template_name ?? order?.template_name ?? "",
        build_version: 0,
        built_at: new Date().toISOString(),
        order_id: order?.id ?? "",
      },
      company: { name: pd.company_name || order?.template_name || "Компания", description: pd.company_description || "", address: pd.address || "", working_hours: pd.working_hours || "" },
      contacts: { phone: pd.phone || "", email: pd.email || "", telegram: pd.telegram || "" },
      services: pd.services ?? [],
      branding: { primary_color: pd.branding?.primary_color ?? templatePrimary, secondary_color: pd.branding?.secondary_color ?? templateSecondary },
      seo: { title: pd.seo_title || pd.company_name || "", description: pd.seo_description || "" },
      content: { domain_name: pd.domain_name || "" },
    };
  }, [pd, order]);

  // ── Section operations ────────────────────────────────────────────────────
  function addSection(type: SectionType) {
    const newSection: SiteSection = { id: genId(), type, enabled: true, content: defaultContent(type) };
    setSections((prev) => [...prev, newSection]);
    setEditingId(newSection.id);
    setAddOpen(false);
    setDirty(true);
  }

  function moveSection(index: number, dir: -1 | 1) {
    const next = [...sections];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setSections(next);
    setDirty(true);
  }

  function deleteSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
    setDirty(true);
  }

  function updateSectionContent(id: string, content: SectionContent) {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, content } : s));
    setDirty(true);
  }

  function toggleSection(id: string) {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
    setDirty(true);
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    const patch = { ...pd, content_edits: { ...(pd.content_edits ?? {}), sections } };
    const res = await fetch(`/api/orders/${orderId}/project-data`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const result = await res.json();
    if (result.ok) { setPd(result.data); setSaved(true); setDirty(false); setTimeout(() => setSaved(false), 3000); }
    else setError(result.error ?? "Ошибка сохранения");
    setSaving(false);
  }

  // ── Generate content ──────────────────────────────────────────────────────
  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/generate-content`, { method: "POST" });
    const result = await res.json();
    if (result.ok) {
      const g = result.generated;
      const generated: SiteSection[] = [];
      if (g.hero) generated.push({ id: genId(), type: "hero", enabled: true, content: { title: g.hero.title, subtitle: g.hero.subtitle, cta_text: g.hero.cta_text } });
      if (g.about) generated.push({ id: genId(), type: "about", enabled: true, content: { title: g.about.title, text: g.about.text } });
      if (pd.services?.length) generated.push({ id: genId(), type: "services", enabled: true, content: { title: "Наши услуги", items: pd.services } });
      if (g.reviews) generated.push({ id: genId(), type: "reviews", enabled: true, content: { title: g.reviews.title, items: g.reviews.items } });
      if (g.faq) generated.push({ id: genId(), type: "faq", enabled: true, content: { title: g.faq.title, items: g.faq.items } });
      if (g.cta) generated.push({ id: genId(), type: "cta", enabled: true, content: { title: g.cta.title, subtitle: g.cta.subtitle, cta_text: g.cta.cta_text } });
      generated.push({ id: genId(), type: "contacts", enabled: true, content: { title: "Контакты", phone: pd.phone || "", email: pd.email || "", telegram: pd.telegram || "", address: pd.address || "", working_hours: pd.working_hours || "" } });
      generated.push({ id: genId(), type: "footer", enabled: true, content: { company_name: pd.company_name || "" } });
      setSections((prev) => prev.length === 0 ? generated : [...prev, ...generated.filter((g) => !prev.some((p) => p.type === g.type))]);
      setDirty(true);
    } else setError(result.error ?? "Ошибка генерации");
    setGenerating(false);
  }

  // ── Save as template ──────────────────────────────────────────────────────
  async function handleSaveTemplate() {
    if (!templateName.trim() || sections.length === 0) return;
    setSavingTemplate(true);
    try {
      await fetch("/api/section-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName.trim(), section_type: "layout", content: { sections } }),
      });
      setShowSaveTemplate(false);
      setTemplateName("");
    } finally { setSavingTemplate(false); }
  }

  const editingSection = sections.find((s) => s.id === editingId);

  if (loading) return <p className="py-12 text-center text-sm text-white/30">Загрузка…</p>;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_440px]">
      {/* ── Editor panel ── */}
      <div className="space-y-4 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {aiAvailable === true && (
            <Btn onClick={handleGenerate} disabled={generating} loading={generating} variant="outline" size="sm">
              {generating ? "Генерация…" : "✨ Сгенерировать контент"}
            </Btn>
          )}
          <Btn onClick={() => setShowSaveTemplate(true)} variant="ghost" size="sm" disabled={sections.length === 0}>
            💾 Сохранить как шаблон
          </Btn>
          <div className="ml-auto flex items-center gap-2">
            {dirty && !saving && (
              <span className="flex items-center gap-1 text-xs text-orange-400/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400" />
                Несохранено
              </span>
            )}
            {saved && !dirty && (
              <span className="flex items-center gap-1 text-xs text-green-400/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                Сохранено
              </span>
            )}
            <Btn onClick={handleSave} disabled={saving} loading={saving} size="sm">
              {saving ? "Сохранение…" : "Сохранить"}
            </Btn>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>
        )}

        {/* Save template dialog */}
        {showSaveTemplate && (
          <Card variant="solid" padding="md">
            <p className="mb-3 text-sm font-semibold">Название шаблона</p>
            <div className="flex gap-2">
              <input
                className={`${FIELD_CLS} flex-1`}
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Мой шаблон…"
                autoFocus
              />
              <Btn onClick={handleSaveTemplate} disabled={!templateName.trim() || savingTemplate} size="sm" loading={savingTemplate}>Сохранить</Btn>
              <Btn onClick={() => { setShowSaveTemplate(false); setTemplateName(""); }} variant="ghost" size="sm">✕</Btn>
            </div>
          </Card>
        )}

        {/* Section List */}
        <Card variant="solid" padding="md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">Структура сайта</h3>
            <Btn onClick={() => setAddOpen(!addOpen)} variant="outline" size="sm">+ Добавить секцию</Btn>
          </div>

          {/* Add section picker */}
          {addOpen && (
            <div className="mb-4 grid grid-cols-3 gap-1.5 rounded-xl border border-white/10 bg-white/4 p-3 sm:grid-cols-4">
              {ALL_SECTION_TYPES.map((type) => {
                const allowed = canAddSection(type, sections);
                return (
                  <button
                    key={type}
                    onClick={() => allowed && addSection(type)}
                    disabled={!allowed}
                    title={!allowed ? "Секция уже добавлена" : undefined}
                    className="rounded-lg border border-white/10 px-2 py-1.5 text-xs text-white/60 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300 transition disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-white/60"
                  >
                    {SECTION_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          )}

          {sections.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-white/30">Секций нет</p>
              <p className="mt-1 text-xs text-white/20">Нажмите «Добавить секцию» или сгенерируйте контент автоматически</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((s, i) => {
                const isEditing = editingId === s.id;
                return (
                  <div key={s.id} className={`rounded-xl border transition ${isEditing ? "border-cyan-500/40 bg-cyan-500/5" : "border-white/8 bg-white/3"}`}>
                    {/* Section header row */}
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="text-white/20 hover:text-white/60 disabled:opacity-20 text-xs leading-none">▲</button>
                        <button onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1} className="text-white/20 hover:text-white/60 disabled:opacity-20 text-xs leading-none">▼</button>
                      </div>
                      <span className="flex-1 text-sm font-semibold text-white/80">{SECTION_TYPE_LABELS[s.type]}</span>
                      <button
                        onClick={() => toggleSection(s.id)}
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold border transition ${s.enabled ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-white/10 text-white/30"}`}
                      >
                        {s.enabled ? "Вкл" : "Выкл"}
                      </button>
                      <button
                        onClick={() => setEditingId(isEditing ? null : s.id)}
                        className={`text-xs px-2 py-1 rounded-lg border transition ${isEditing ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300" : "border-white/10 text-white/40 hover:text-white"}`}
                      >
                        {isEditing ? "Закрыть" : "Изменить"}
                      </button>
                      <button onClick={() => deleteSection(s.id)} className="text-red-400/40 hover:text-red-400 text-xs px-1">✕</button>
                    </div>

                    {/* Inline editor */}
                    {isEditing && (
                      <div className="border-t border-white/8 px-3 py-4">
                        <SectionEditor
                          section={s}
                          onChange={(content) => updateSectionContent(s.id, content)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Preview panel ── */}
      <div className="xl:sticky xl:top-20 xl:self-start space-y-3">
        {/* Device switcher */}
        <div className="flex gap-1">
          {(["desktop", "tablet", "mobile"] as Device[]).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                device === d ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300" : "border-white/10 text-white/40 hover:text-white/70"
              }`}
            >
              {DEVICE_ICONS[d]} {DEVICE_LABELS[d]}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div
          className="overflow-auto rounded-2xl"
          style={{ maxHeight: "calc(100vh - 180px)" }}
        >
          <SitePreview data={previewData} sections={sections.length > 0 ? sections : undefined} device={device} />
        </div>
      </div>
    </div>
  );
}
