"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import type { Template } from "@/types";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "@/components/ui/ImageUpload";
import { isImageUrl } from "@/lib/supabase/storage";
import { Input, Textarea } from "@/components/ui/Input";
import { Btn } from "@/components/ui/Btn";
import { calcPrice } from "@/lib/pricing/engine";
import { LIGHT_THEME, DARK_THEME } from "@/lib/templates";

const PALETTES = [
  "#d97706","#be185d","#eab308","#0ea5e9","#b45309",
  "#7c3aed","#16a34a","#dc2626","#0f766e","#c026d3",
];

function isDarkBg(hex?: string): boolean {
  if (!hex) return true;
  const h = hex.replace("#", "");
  if (h.length < 6) return true;
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

type Device = "desktop" | "mobile";
type Tab = "hero" | "about" | "services" | "gallery" | "order" | "colors" | "lead";
type OrderStep = "form" | "company" | "confirm" | "done";

const SECTION_TABS: { id: Tab; label: string }[] = [
  { id: "hero", label: "Главный экран" },
  { id: "about", label: "О нас" },
  { id: "services", label: "Услуги" },
  { id: "gallery", label: "Галерея" },
  { id: "order", label: "Порядок секций" },
  { id: "colors", label: "Цвета" },
  { id: "lead", label: "Заявка" },
];

// Russian labels for every section type that can appear in the reorder list
const SECTION_LABELS: Record<string, string> = {
  hero: "Главный экран",
  stats: "Статистика",
  about: "О нас",
  gallery: "Галерея",
  services: "Услуги",
  "hosting-service": "Хостинг и домен",
  "templates-gallery": "Примеры работ",
  calculator: "Калькулятор",
  footer: "Подвал сайта",
  reviews: "Отзывы",
};

function updateSectionContent(
  template: Template,
  sectionType: string,
  key: string,
  value: unknown
): Template {
  return {
    ...template,
    sections: template.sections.map((s) =>
      s.type === sectionType
        ? { ...s, content: { ...s.content, [key]: value } }
        : s
    ),
  };
}

function getSectionContent(template: Template, type: string): Record<string, unknown> {
  return (template.sections.find((s) => s.type === type)?.content ?? {}) as Record<string, unknown>;
}

export default function CustomizeClient({
  initialTemplate,
  isAdmin,
}: {
  initialTemplate: Template;
  isAdmin: boolean;
}) {
  const [template, setTemplate] = useState(initialTemplate);
  const [device, setDevice] = useState<Device>("desktop");
  const [tab, setTab] = useState<Tab>("hero");
  const tabIndex = SECTION_TABS.findIndex((t) => t.id === tab);
  const goPrev = () => { if (tabIndex > 0) setTab(SECTION_TABS[tabIndex - 1].id); };
  const goNext = () => { if (tabIndex < SECTION_TABS.length - 1) setTab(SECTION_TABS[tabIndex + 1].id); };
  const [viewPane, setViewPane] = useState<"editor" | "preview">("editor");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderStep, setOrderStep] = useState<OrderStep>("form");
  const [wasAuthenticated, setWasAuthenticated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const [leadForm, setLeadForm] = useState({ notes: "" });
  const [companyForm, setCompanyForm] = useState({
    company_name: "",
    company_description: "",
    phone: "",
    email: "",
    telegram: "",
    address: "",
    working_hours: "",
    domain_name: "",
  });

  const iframe = useRef<HTMLIFrameElement>(null);

  // Sync preview on template change
  useEffect(() => {
    iframe.current?.contentWindow?.postMessage({ type: "VIBECODE_UPDATE", template }, "*");
  }, [template]);

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`draft-${initialTemplate.id}`);
      if (saved) {
        const parsed = JSON.parse(saved) as Template;
        if (parsed.id === initialTemplate.id) setTemplate(parsed);
      }
    } catch { /* ignore parse errors */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist draft to localStorage (debounced 800ms)
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(`draft-${template.id}`, JSON.stringify(template)); } catch { /* ignore */ }
    }, 800);
    return () => clearTimeout(t);
  }, [template]);

  // Live pricing
  const breakdown = useMemo(() => calcPrice(template), [template]);

  const hero = getSectionContent(template, "hero");
  const about = getSectionContent(template, "about");
  const services = getSectionContent(template, "services");

  async function handleOrder() {
    setSubmitting(true);
    setOrderError(null);
    console.log("[handleOrder] starting order submission");

    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (token) setWasAuthenticated(true);
      console.log("[handleOrder] session token present:", !!token);

      // Step 1: create the order record
      const leadPayload = {
        templateId: template.id,
        templateName: template.name,
        notes: leadForm.notes,
        selectedOptions: template,
        totalPrice: breakdown.total,
        primaryColor: template.theme.primary,
        bgColor: template.theme.bgBase,
        companyData: companyForm,
      };

      const leadRes = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(leadPayload),
      });

      console.log("[handleOrder] /api/lead status:", leadRes.status);

      if (!leadRes.ok) {
        let errMsg = `Ошибка при создании заказа (${leadRes.status})`;
        try {
          const errBody = await leadRes.json();
          console.error("[handleOrder] /api/lead error:", errBody);
          if (errBody?.error) errMsg = errBody.error;
        } catch { /* non-JSON */ }
        setOrderError(errMsg);
        return;
      }

      const { orderId } = await leadRes.json();
      console.log("[handleOrder] order created:", orderId);

      // Step 2: confirm via workflow engine (only if authenticated)
      if (token && orderId) {
        const transitionRes = await fetch("/api/orders/transition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, action: "CONFIRM_PAYMENT" }),
        });

        console.log("[handleOrder] /api/orders/transition status:", transitionRes.status);

        if (!transitionRes.ok) {
          // Non-fatal: order was created. Log but don't block the user.
          try {
            const errBody = await transitionRes.json();
            console.warn("[handleOrder] transition failed (non-fatal):", errBody);
          } catch { /* ignore */ }
        } else {
          const transitionResult = await transitionRes.json();
          console.log("[handleOrder] transition result:", transitionResult);
        }
      }

      if (orderId) setCreatedOrderId(orderId);
      setOrderStep("done");
      try { localStorage.removeItem(`draft-${template.id}`); } catch { /* ignore */ }
      // No auto-redirect — let the client link Telegram first via the button below.
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
      console.error("[handleOrder] fetch threw:", msg);
      setOrderError(`Ошибка соединения: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  function exportTemplate() {
    const name = template.id.replace(/-([a-z])/g, (_, x) => x.toUpperCase());
    const blob = new Blob(
      [`export const ${name} = ${JSON.stringify(template, null, 2)} as const;`],
      { type: "text/typescript" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${template.id}.ts`;
    a.click();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Topbar */}
      <div className="border-b border-white/10 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <b className="text-sm">{template.name}</b>
          <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-0.5 text-xs font-bold text-cyan-400">
            {breakdown.total.toLocaleString("ru-RU")} ₽
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Btn
            onClick={() => setDevice("desktop")}
            variant={device === "desktop" ? "primary" : "outline"}
            size="sm"
          >
            Desktop
          </Btn>
          <Btn
            onClick={() => setDevice("mobile")}
            variant={device === "mobile" ? "primary" : "outline"}
            size="sm"
          >
            Mobile
          </Btn>
          {isAdmin && (
            <Btn onClick={exportTemplate} variant="outline" size="sm">
              💾 Export
            </Btn>
          )}
        </div>
      </div>

      {/* Mobile pane toggle */}
      <div className="md:hidden flex border-b border-white/10">
        <button
          className={`flex-1 py-2.5 text-sm ${viewPane === "editor" ? "bg-white/10 font-semibold" : "text-white/50"}`}
          onClick={() => setViewPane("editor")}
        >
          Настройки
        </button>
        <button
          className={`flex-1 py-2.5 text-sm ${viewPane === "preview" ? "bg-white/10 font-semibold" : "text-white/50"}`}
          onClick={() => setViewPane("preview")}
        >
          Превью
        </button>
      </div>

      <div className="flex-1 grid md:grid-cols-[320px_1fr] lg:grid-cols-[340px_1fr] min-h-0">
        {/* Editor */}
        <aside className={`${viewPane === "preview" ? "hidden md:block" : ""} border-r border-white/10 flex flex-col`}>
          {/* Tab nav */}
          <div className="flex flex-wrap gap-1 p-3 border-b border-white/10">
            {SECTION_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  tab === t.id ? "bg-white text-black" : "text-white/50 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* ── Hero ── */}
            {tab === "hero" && (
              <>
                <Textarea
                  label="Заголовок"
                  rows={2}
                  value={String(hero.headline ?? "")}
                  onChange={(e) => setTemplate(updateSectionContent(template, "hero", "headline", e.target.value))}
                />
                <Textarea
                  label="Подзаголовок"
                  rows={3}
                  value={String(hero.subheadline ?? "")}
                  onChange={(e) => setTemplate(updateSectionContent(template, "hero", "subheadline", e.target.value))}
                />
                <Input
                  label="Кнопка CTA"
                  value={String(hero.cta ?? "")}
                  onChange={(e) => setTemplate(updateSectionContent(template, "hero", "cta", e.target.value))}
                />
                <Input
                  label="Бейдж"
                  value={String(hero.badge ?? "")}
                  onChange={(e) => setTemplate(updateSectionContent(template, "hero", "badge", e.target.value))}
                />
                <div>
                  <ImageUpload
                    label="Фото для главного экрана (необязательно)"
                    value={hero.heroImage as string | undefined}
                    onChange={(url) => setTemplate(updateSectionContent(template, "hero", "heroImage", url ?? ""))}
                    storagePath={`${template.id}/hero`}
                    aspectClass="aspect-video"
                    enableCrop
                    cropAspect={16 / 9}
                  />
                  <p className="mt-1 text-xs text-white/35">≈ +1 500 ₽ при наличии фото</p>
                </div>
              </>
            )}

            {/* ── About ── */}
            {tab === "about" && (
              <>
                <Input
                  label="Заголовок раздела"
                  value={String(about.title ?? "")}
                  onChange={(e) => setTemplate(updateSectionContent(template, "about", "title", e.target.value))}
                />
                <Textarea
                  label="Описание"
                  rows={4}
                  value={String(about.text ?? "")}
                  onChange={(e) => setTemplate(updateSectionContent(template, "about", "text", e.target.value))}
                />
                <div>
                  <ImageUpload
                    label="Обложка раздела «О нас» (необязательно)"
                    value={about.coverImage as string | undefined}
                    onChange={(url) => setTemplate(updateSectionContent(template, "about", "coverImage", url ?? ""))}
                    storagePath={`${template.id}/about`}
                    aspectClass="aspect-[16/5]"
                    enableCrop
                    cropAspect={16 / 5}
                  />
                  <p className="mt-1 text-xs text-white/35">≈ +500 ₽ при наличии фото</p>
                </div>
              </>
            )}

            {/* ── Services ── */}
            {tab === "services" && (
              <>
                <Input
                  label="Заголовок раздела"
                  value={String(services.title ?? "")}
                  onChange={(e) => setTemplate(updateSectionContent(template, "services", "title", e.target.value))}
                />
                <Textarea
                  label="Услуги (по одной в строку)"
                  rows={8}
                  className="font-mono"
                  value={((services.items as string[]) ?? []).join("\n")}
                  onChange={(e) =>
                    setTemplate(
                      updateSectionContent(
                        template,
                        "services",
                        "items",
                        e.target.value.split("\n").filter(Boolean)
                      )
                    )
                  }
                />
              </>
            )}

            {/* ── Gallery ── */}
            {tab === "gallery" && (() => {
              const gallerySection = template.sections.find((s) => s.type === "gallery");
              const images = ((gallerySection?.content.images as string[]) ?? []);
              return (
                <>
                  <p className="text-xs text-white/50">
                    Добавляйте фото — они появятся в галерее шаблона.
                  </p>
                  <div className="space-y-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
                        {isImageUrl(img) ? (
                          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-white/10">
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-16 w-24 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <span className="text-xs text-white/40">🖼</span>
                          </div>
                        )}
                        <span className="flex-1 text-xs text-white/60 truncate">
                          {isImageUrl(img) ? img.split("/").pop() : img}
                        </span>
                        <button
                          onClick={() =>
                            setTemplate(updateSectionContent(template, "gallery", "images", images.filter((_, i) => i !== idx)))
                          }
                          className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20 shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <ImageUpload
                      label="Добавить фото в галерею"
                      value={null}
                      onChange={(url) => {
                        if (!url) return;
                        setTemplate(updateSectionContent(template, "gallery", "images", [...images, url]));
                      }}
                      storagePath={`${template.id}/gallery`}
                      aspectClass="aspect-[3/1]"
                      enableCrop
                    />
                    <p className="mt-1 text-xs text-white/35">≈ +500 ₽ за фото (макс. +2 500 ₽)</p>
                  </div>
                  {images.length === 0 && (
                    <p className="text-xs text-white/30 text-center py-4">Галерея пуста. Загрузите первое фото выше.</p>
                  )}
                </>
              );
            })()}

            {/* ── Section order ── */}
            {tab === "order" && (
              <Reorder.Group
                axis="y"
                values={template.sections}
                onReorder={(sections) => setTemplate((t) => ({ ...t, sections }))}
                className="space-y-2"
              >
                {template.sections.map((s) => (
                  <Reorder.Item
                    key={s.id}
                    value={s}
                    className="flex items-center justify-between rounded-xl bg-white/10 p-3 cursor-grab active:cursor-grabbing"
                  >
                    <span className="text-sm">{SECTION_LABELS[s.type] ?? s.type}</span>
                    <span className="text-white/30">⠿</span>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}

            {/* ── Colors ── */}
            {tab === "colors" && (
              <>
                <div>
                  <label className="text-xs text-white/50 block mb-2">Тема оформления</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([["dark", "Тёмная", DARK_THEME], ["light", "Светлая", LIGHT_THEME]] as const).map(([mode, label, preset]) => {
                      const active = isDarkBg(template.theme.bgBase) === (mode === "dark");
                      return (
                        <button
                          key={mode}
                          onClick={() => setTemplate((t) => ({
                            ...t,
                            theme: {
                              ...preset,
                              // keep the brand accent
                              primary: t.theme.primary, secondary: t.theme.secondary, accent: t.theme.accent,
                              gradientFrom: t.theme.gradientFrom, gradientTo: t.theme.gradientTo,
                            },
                          }))}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${active ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300" : "border-white/10 text-white/50 hover:text-white"}`}
                        >
                          {mode === "dark" ? "🌙" : "☀️"} {label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-[11px] text-white/30">Свечение и градиенты включены в обеих темах</p>
                </div>
                <div>
                  <label className="text-xs text-white/50">Основной цвет</label>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {PALETTES.map((p) => (
                      <button
                        key={p}
                        style={{ background: p }}
                        className={`h-10 rounded-xl transition ${template.theme.primary === p ? "ring-2 ring-white" : ""}`}
                        onClick={() =>
                          setTemplate((t) => ({ ...t, theme: { ...t.theme, primary: p, gradientFrom: p } }))
                        }
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={template.theme.primary?.slice(0, 7) ?? "#000000"}
                    onChange={(e) =>
                      setTemplate((t) => ({ ...t, theme: { ...t.theme, primary: e.target.value, gradientFrom: e.target.value } }))
                    }
                    className="mt-3 h-10 w-full rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-2">Фон</label>
                  {(["bgBase", "bgSurface"] as const).map((k) => (
                    <div key={k} className="flex items-center gap-2 mb-2">
                      <input
                        type="color"
                        value={((template.theme as unknown as Record<string, string>)[k])?.slice(0, 7) ?? "#000000"}
                        onChange={(e) =>
                          setTemplate((t) => ({ ...t, theme: { ...t.theme, [k]: e.target.value } }))
                        }
                        className="h-8 w-12 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs text-white/40">{k}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Lead / Order ── */}
            {tab === "lead" && (
              orderStep === "done" ? (
                /* Done */
                <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center">
                  <p className="text-3xl">✅</p>
                  <p className="mt-3 text-lg font-bold">Заявка принята!</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    Подключите Telegram — туда будут приходить статусы заказа и сообщения от менеджера.
                  </p>

                  {process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME && createdOrderId ? (
                    <a
                      href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=${createdOrderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1d8dc4]"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.07-3.01-1.97 1.91c-.22.21-.4.39-.81.39z"/></svg>
                      Подключить Telegram
                    </a>
                  ) : (
                    <p className="mt-4 text-xs text-white/40">
                      Менеджер свяжется с вами в течение часа.
                    </p>
                  )}

                  <p className="mt-4 text-xs text-white/35">
                    После нажатия откроется бот — нажмите <b className="text-white/60">Start</b>, и заказ
                    автоматически привяжется к вашему Telegram.
                  </p>

                  <div className="mt-5 flex justify-center gap-3 text-xs">
                    <a href={wasAuthenticated ? "/dashboard" : "/"} className="rounded-lg border border-white/15 px-4 py-2 text-white/60 transition hover:bg-white/5 hover:text-white">
                      {wasAuthenticated ? "В личный кабинет" : "На главную"}
                    </a>
                  </div>
                </div>
              ) : orderStep === "company" ? (
                /* Company info */
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Шаг 2 из 3</p>
                    <h3 className="mt-1 font-bold">Информация о компании</h3>
                    <p className="mt-1 text-xs text-white/40">
                      Эти данные заполнят ваш сайт автоматически. Все поля необязательны.
                    </p>
                  </div>
                  <Input
                    label="Название компании"
                    placeholder="ООО «Ромашка»"
                    value={companyForm.company_name}
                    onChange={(e) => setCompanyForm((f) => ({ ...f, company_name: e.target.value }))}
                  />
                  <Textarea
                    label="Описание"
                    rows={2}
                    placeholder="Чем занимается ваша компания?"
                    value={companyForm.company_description}
                    onChange={(e) => setCompanyForm((f) => ({ ...f, company_description: e.target.value }))}
                  />
                  <Input
                    label="Телефон"
                    placeholder="+7 (999) 123-45-67"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                  <Input
                    label="Email"
                    placeholder="info@company.ru"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  <Input
                    label="Telegram"
                    placeholder="@company"
                    value={companyForm.telegram}
                    onChange={(e) => setCompanyForm((f) => ({ ...f, telegram: e.target.value }))}
                  />
                  <Input
                    label="Адрес"
                    placeholder="г. Москва, ул. Примерная, 1"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm((f) => ({ ...f, address: e.target.value }))}
                  />
                  <Input
                    label="Режим работы"
                    placeholder="Пн–Пт 9:00–18:00"
                    value={companyForm.working_hours}
                    onChange={(e) => setCompanyForm((f) => ({ ...f, working_hours: e.target.value }))}
                  />
                  <Input
                    label="Домен (если есть)"
                    placeholder="company.ru"
                    value={companyForm.domain_name}
                    onChange={(e) => setCompanyForm((f) => ({ ...f, domain_name: e.target.value }))}
                  />
                  <Btn
                    onClick={() => setOrderStep("confirm")}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!companyForm.company_name?.trim() || !companyForm.email?.trim()}
                  >
                    Продолжить →
                  </Btn>
                  {(!companyForm.company_name?.trim() || !companyForm.email?.trim()) && (
                    <p className="text-center text-xs text-red-400/70">Заполните название компании и email</p>
                  )}
                  <Btn onClick={() => setOrderStep("form")} variant="ghost" size="sm" className="w-full">
                    ← Назад
                  </Btn>
                </div>
              ) : orderStep === "confirm" ? (
                /* Confirm */
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Шаг 3 из 3</p>
                    <h3 className="mt-1 font-bold">Проверьте и подтвердите заказ</h3>
                    <p className="mt-1 text-xs text-white/40">
                      После отправки с вами свяжется менеджер в течение 1 часа.
                    </p>
                  </div>

                  {/* Price breakdown */}
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/4">
                    <p className="px-4 pt-4 text-xs font-medium uppercase tracking-widest text-white/35">
                      Состав заказа
                    </p>
                    <div className="p-4 space-y-2.5">
                      {breakdown.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-white/65">{item.label}</span>
                          <span className="font-semibold tabular-nums">{item.price.toLocaleString("ru-RU")} ₽</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 bg-white/3 p-4">
                      <div>
                        <span className="font-bold">Итого</span>
                        <p className="text-xs text-white/35">Оплата — после приёмки сайта</p>
                      </div>
                      <span className="text-xl font-black text-cyan-400 tabular-nums">
                        {breakdown.total.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>

                  {leadForm.notes && (
                    <div className="rounded-2xl border border-white/10 bg-white/4 p-4 text-sm">
                      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-white/35">
                        Пожелания
                      </p>
                      <p className="text-white/75">{leadForm.notes}</p>
                    </div>
                  )}

                  <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-xs text-white/40 leading-relaxed">
                    Предоплата — <strong className="text-white/60">0 ₽</strong>.
                    Оплата происходит только после того, как вы увидели готовый сайт и одобрили его.
                  </div>

                  {orderError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {orderError}
                    </div>
                  )}

                  <Btn
                    onClick={handleOrder}
                    loading={submitting}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    {submitting ? "Отправляю заявку…" : `Подтвердить заказ — ${breakdown.total.toLocaleString("ru-RU")} ₽`}
                  </Btn>

                  <Btn onClick={() => { setOrderStep("company"); setOrderError(null); }} variant="ghost" size="sm" className="w-full">
                    ← Изменить данные компании
                  </Btn>
                </div>
              ) : (
                /* Form */
                <div className="space-y-3">
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/8 p-3">
                    <p className="text-xs font-semibold text-cyan-400">Шаг 1 из 3 — Детали заказа</p>
                    <p className="mt-1 text-xs text-white/45">
                      Менеджер свяжется с вами через аккаунт после получения заявки.
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-xs text-white/35">Стоимость:</span>
                      <span className="text-xs font-black text-cyan-400 tabular-nums">
                        {breakdown.total.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>
                  <Textarea
                    label="Пожелания к сайту"
                    rows={3}
                    placeholder="Особые пожелания, акцент на услугах, стиль..."
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                  <Btn
                    onClick={() => setOrderStep("company")}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Далее: данные компании →
                  </Btn>
                  <p className="text-center text-xs text-white/30">
                    Предоплата — 0 ₽. Оплата только после приёмки готового сайта.
                  </p>
                </div>
              )
            )}

          </div>

          {/* Step navigation */}
          <div className="shrink-0 border-t border-white/10 p-3 flex items-center justify-between gap-2">
            <button
              onClick={goPrev}
              disabled={tabIndex === 0}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed"
            >
              ← Назад
            </button>
            <span className="text-xs text-white/30">{tabIndex + 1} / {SECTION_TABS.length}</span>
            <button
              onClick={goNext}
              disabled={tabIndex === SECTION_TABS.length - 1}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition hover:shadow-cyan-500/30 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              Далее →
            </button>
          </div>
        </aside>

        {/* Preview */}
        <section className={`${viewPane === "editor" ? "hidden md:flex" : "flex"} items-start justify-center bg-black/40 p-4 overflow-auto`}>
          <div
            className={
              device === "mobile"
                ? "rounded-[2.5rem] border-8 border-zinc-800 p-2 w-[410px] shrink-0"
                : "w-full max-w-[1400px]"
            }
          >
            <iframe
              ref={iframe}
              src={`/preview/${template.id}`}
              className="h-[calc(100vh-140px)] min-h-[500px] bg-white rounded-lg"
              style={{ width: device === "mobile" ? 393 : "100%" }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
