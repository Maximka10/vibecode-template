"use client";
import { useEffect, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import type { Template } from "@/types";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "@/components/ui/ImageUpload";
import { isImageUrl } from "@/lib/supabase/storage";
import { Input, Textarea } from "@/components/ui/Input";
import { Btn } from "@/components/ui/Btn";

const PALETTES = [
  "#d97706","#be185d","#eab308","#0ea5e9","#b45309",
  "#7c3aed","#16a34a","#dc2626","#0f766e","#c026d3",
];

type Device = "desktop" | "mobile";
type Tab = "hero" | "about" | "services" | "gallery" | "order" | "colors" | "lead";

const SECTION_TABS: { id: Tab; label: string }[] = [
  { id: "hero", label: "Главный экран" },
  { id: "about", label: "О нас" },
  { id: "services", label: "Услуги" },
  { id: "gallery", label: "Галерея" },
  { id: "order", label: "Порядок секций" },
  { id: "colors", label: "Цвета" },
  { id: "lead", label: "Заявка" },
];

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
  const [viewPane, setViewPane] = useState<"editor" | "preview">("editor");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Lead form state
  const [leadForm, setLeadForm] = useState({
    clientName: "",
    clientPhone: "",
    clientTelegram: "",
    clientEmail: "",
    businessType: template.category,
    notes: "",
    budget: "",
    selectedServices: [] as string[],
  });

  const iframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    iframe.current?.contentWindow?.postMessage({ type: "VIBECODE_UPDATE", template }, "*");
  }, [template]);

  const hero = getSectionContent(template, "hero");
  const about = getSectionContent(template, "about");
  const services = getSectionContent(template, "services");

  async function handleOrder() {
    if (!leadForm.clientPhone && !leadForm.clientTelegram) {
      alert("Укажите телефон или Telegram для связи");
      return;
    }
    setSubmitting(true);

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const res = await fetch("/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        templateId: template.id,
        templateName: template.name,
        clientName: leadForm.clientName,
        clientPhone: leadForm.clientPhone,
        clientTelegram: leadForm.clientTelegram,
        clientEmail: leadForm.clientEmail,
        businessType: leadForm.businessType || template.category,
        selectedServices: leadForm.selectedServices,
        budget: leadForm.budget ? Number(leadForm.budget) : template.priceFrom,
        notes: leadForm.notes,
        selectedOptions: template,
        totalPrice: template.priceFrom,
        primaryColor: template.theme.primary,
        bgColor: template.theme.bgBase,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
      if (token) setTimeout(() => (location.href = "/dashboard"), 2000);
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
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Topbar */}
      <div className="border-b border-white/10 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <b className="text-sm">{template.name}</b>
          <span className="text-xs text-white/40">от {template.priceFrom?.toLocaleString("ru-RU")} ₽</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDevice("desktop")}
            className={`rounded-full px-3 py-1.5 text-xs ${device === "desktop" ? "bg-white text-black" : "border border-white/20 text-white/60"}`}
          >
            Desktop
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`rounded-full px-3 py-1.5 text-xs ${device === "mobile" ? "bg-white text-black" : "border border-white/20 text-white/60"}`}
          >
            Mobile
          </button>
          {isAdmin && (
            <button onClick={exportTemplate} className="rounded-full border border-white/20 px-3 py-1.5 text-xs">
              💾 Export
            </button>
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

      <div className="grid md:grid-cols-[320px_1fr] min-h-[calc(100vh-88px)]">
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
            {/* Hero editor */}
            {tab === "hero" && (
              <>
                <Input
                  label="Заголовок"
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
                <ImageUpload
                  label="Фото для главного экрана (необязательно)"
                  value={hero.heroImage as string | undefined}
                  onChange={(url) => setTemplate(updateSectionContent(template, "hero", "heroImage", url ?? ""))}
                  storagePath={`${template.id}/hero`}
                  aspectClass="aspect-video"
                />
              </>
            )}

            {/* About editor */}
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
                <ImageUpload
                  label="Обложка раздела «О нас» (необязательно)"
                  value={about.coverImage as string | undefined}
                  onChange={(url) => setTemplate(updateSectionContent(template, "about", "coverImage", url ?? ""))}
                  storagePath={`${template.id}/about`}
                  aspectClass="aspect-[16/5]"
                />
              </>
            )}

            {/* Services editor */}
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

            {/* Gallery editor */}
            {tab === "gallery" && (() => {
              const gallerySection = template.sections.find((s) => s.type === "gallery");
              const images = ((gallerySection?.content.images as string[]) ?? []);
              return (
                <>
                  <p className="text-xs text-white/50">
                    Добавляйте фото — они появятся в галерее шаблона. Перетащите или нажмите для загрузки.
                  </p>
                  <div className="space-y-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
                        {isImageUrl(img) ? (
                          <img src={img} alt="" className="h-12 w-20 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="h-12 w-20 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <span className="text-xs text-white/40">🖼</span>
                          </div>
                        )}
                        <span className="flex-1 text-xs text-white/60 truncate">
                          {isImageUrl(img) ? img.split("/").pop() : img}
                        </span>
                        <button
                          onClick={() => {
                            const next = images.filter((_, i) => i !== idx);
                            setTemplate(updateSectionContent(template, "gallery", "images", next));
                          }}
                          className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20 shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <ImageUpload
                    label="Добавить фото в галерею"
                    value={null}
                    onChange={(url) => {
                      if (!url) return;
                      const next = [...images, url];
                      setTemplate(updateSectionContent(template, "gallery", "images", next));
                    }}
                    storagePath={`${template.id}/gallery`}
                    aspectClass="aspect-[3/1]"
                  />
                  {images.length === 0 && (
                    <p className="text-xs text-white/30 text-center py-4">
                      Галерея пуста. Загрузите первое фото выше.
                    </p>
                  )}
                </>
              );
            })()}

            {/* Section order */}
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
                    <span className="text-sm">{s.type}</span>
                    <span className="text-white/30">⠿</span>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}

            {/* Color editor */}
            {tab === "colors" && (
              <>
                <div>
                  <label className="text-xs text-white/50">Основной цвет</label>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {PALETTES.map((p) => (
                      <button
                        key={p}
                        style={{ background: p }}
                        className={`h-10 rounded-xl transition ${template.theme.primary === p ? "ring-2 ring-white" : ""}`}
                        onClick={() =>
                          setTemplate((t) => ({
                            ...t,
                            theme: { ...t.theme, primary: p, gradientFrom: p },
                          }))
                        }
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={template.theme.primary?.slice(0, 7) ?? "#000000"}
                    onChange={(e) =>
                      setTemplate((t) => ({
                        ...t,
                        theme: { ...t.theme, primary: e.target.value, gradientFrom: e.target.value },
                      }))
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

            {/* Lead form */}
            {tab === "lead" && (
              submitted ? (
                <div className="rounded-2xl bg-green-500/20 border border-green-500/30 p-5 text-center">
                  <p className="text-2xl">✅</p>
                  <p className="mt-2 font-bold">Заявка отправлена!</p>
                  <p className="mt-1 text-sm text-white/60">Свяжемся с вами в ближайшее время.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-white/50">Оставьте контакты — мы свяжемся и запустим сайт за 3 дня</p>
                  <div className="space-y-3">
                    <Input
                      placeholder="Ваше имя"
                      value={leadForm.clientName}
                      onChange={(e) => setLeadForm((f) => ({ ...f, clientName: e.target.value }))}
                    />
                    <Input
                      placeholder="Телефон *"
                      value={leadForm.clientPhone}
                      onChange={(e) => setLeadForm((f) => ({ ...f, clientPhone: e.target.value }))}
                    />
                    <Input
                      placeholder="Telegram (например @username)"
                      value={leadForm.clientTelegram}
                      onChange={(e) => setLeadForm((f) => ({ ...f, clientTelegram: e.target.value }))}
                    />
                    <Input
                      placeholder="Email (необязательно)"
                      value={leadForm.clientEmail}
                      onChange={(e) => setLeadForm((f) => ({ ...f, clientEmail: e.target.value }))}
                    />
                    <Input
                      placeholder="Тип бизнеса (кофейня, салон...)"
                      value={leadForm.businessType}
                      onChange={(e) => setLeadForm((f) => ({ ...f, businessType: e.target.value }))}
                    />
                    <Textarea
                      rows={3}
                      placeholder="Комментарий, пожелания..."
                      value={leadForm.notes}
                      onChange={(e) => setLeadForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                    <Btn
                      onClick={handleOrder}
                      loading={submitting}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      {submitting ? "Отправляю..." : `Заказать от ${template.priceFrom?.toLocaleString("ru-RU")} ₽`}
                    </Btn>
                    <p className="text-xs text-white/30 text-center">
                      Нажимая кнопку, вы соглашаетесь на обработку данных. Предоплата — 0 ₽.
                    </p>
                  </div>
                </>
              )
            )}
          </div>
        </aside>

        {/* Preview */}
        <section className={`${viewPane === "editor" ? "hidden md:flex" : "flex"} items-start justify-center bg-black/40 p-4`}>
          <div
            className={
              device === "mobile"
                ? "rounded-[2.5rem] border-8 border-zinc-800 p-2 w-[410px]"
                : "w-full"
            }
          >
            <iframe
              ref={iframe}
              src={`/preview/${template.id}`}
              className="h-[80vh] bg-white rounded-lg"
              style={{ width: device === "mobile" ? 393 : "100%" }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
