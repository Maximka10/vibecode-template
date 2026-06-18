"use client";
import { useEffect, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import type { Template } from "@/types";
import { createClient } from "@/lib/supabase/client";

const PALETTES = [
  "#d97706","#be185d","#eab308","#0ea5e9","#b45309",
  "#7c3aed","#16a34a","#dc2626","#0f766e","#c026d3",
];

type Device = "desktop" | "mobile";
type Tab = "hero" | "about" | "services" | "order" | "colors" | "lead";

const SECTION_TABS: { id: Tab; label: string }[] = [
  { id: "hero", label: "Главный экран" },
  { id: "about", label: "О нас" },
  { id: "services", label: "Услуги" },
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
                <div>
                  <label className="text-xs text-white/50">Заголовок</label>
                  <input
                    className="mt-1 w-full rounded-xl bg-white/10 p-3 text-sm outline-none"
                    value={String(hero.headline ?? "")}
                    onChange={(e) => setTemplate(updateSectionContent(template, "hero", "headline", e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Подзаголовок</label>
                  <textarea
                    rows={3}
                    className="mt-1 w-full rounded-xl bg-white/10 p-3 text-sm outline-none resize-none"
                    value={String(hero.subheadline ?? "")}
                    onChange={(e) => setTemplate(updateSectionContent(template, "hero", "subheadline", e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Кнопка CTA</label>
                  <input
                    className="mt-1 w-full rounded-xl bg-white/10 p-3 text-sm outline-none"
                    value={String(hero.cta ?? "")}
                    onChange={(e) => setTemplate(updateSectionContent(template, "hero", "cta", e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Бейдж</label>
                  <input
                    className="mt-1 w-full rounded-xl bg-white/10 p-3 text-sm outline-none"
                    value={String(hero.badge ?? "")}
                    onChange={(e) => setTemplate(updateSectionContent(template, "hero", "badge", e.target.value))}
                  />
                </div>
              </>
            )}

            {/* About editor */}
            {tab === "about" && (
              <>
                <div>
                  <label className="text-xs text-white/50">Заголовок раздела</label>
                  <input
                    className="mt-1 w-full rounded-xl bg-white/10 p-3 text-sm outline-none"
                    value={String(about.title ?? "")}
                    onChange={(e) => setTemplate(updateSectionContent(template, "about", "title", e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Описание</label>
                  <textarea
                    rows={4}
                    className="mt-1 w-full rounded-xl bg-white/10 p-3 text-sm outline-none resize-none"
                    value={String(about.text ?? "")}
                    onChange={(e) => setTemplate(updateSectionContent(template, "about", "text", e.target.value))}
                  />
                </div>
              </>
            )}

            {/* Services editor */}
            {tab === "services" && (
              <>
                <div>
                  <label className="text-xs text-white/50">Заголовок раздела</label>
                  <input
                    className="mt-1 w-full rounded-xl bg-white/10 p-3 text-sm outline-none"
                    value={String(services.title ?? "")}
                    onChange={(e) => setTemplate(updateSectionContent(template, "services", "title", e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Услуги (по одной в строку)</label>
                  <textarea
                    rows={8}
                    className="mt-1 w-full rounded-xl bg-white/10 p-3 text-sm outline-none resize-none font-mono"
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
                </div>
              </>
            )}

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
                    <input
                      className="w-full rounded-xl bg-white/10 p-3 text-sm outline-none"
                      placeholder="Ваше имя"
                      value={leadForm.clientName}
                      onChange={(e) => setLeadForm((f) => ({ ...f, clientName: e.target.value }))}
                    />
                    <input
                      className="w-full rounded-xl bg-white/10 p-3 text-sm outline-none"
                      placeholder="Телефон *"
                      value={leadForm.clientPhone}
                      onChange={(e) => setLeadForm((f) => ({ ...f, clientPhone: e.target.value }))}
                    />
                    <input
                      className="w-full rounded-xl bg-white/10 p-3 text-sm outline-none"
                      placeholder="Telegram (например @username)"
                      value={leadForm.clientTelegram}
                      onChange={(e) => setLeadForm((f) => ({ ...f, clientTelegram: e.target.value }))}
                    />
                    <input
                      className="w-full rounded-xl bg-white/10 p-3 text-sm outline-none"
                      placeholder="Email (необязательно)"
                      value={leadForm.clientEmail}
                      onChange={(e) => setLeadForm((f) => ({ ...f, clientEmail: e.target.value }))}
                    />
                    <input
                      className="w-full rounded-xl bg-white/10 p-3 text-sm outline-none"
                      placeholder="Тип бизнеса (кофейня, салон...)"
                      value={leadForm.businessType}
                      onChange={(e) => setLeadForm((f) => ({ ...f, businessType: e.target.value }))}
                    />
                    <textarea
                      rows={3}
                      className="w-full rounded-xl bg-white/10 p-3 text-sm outline-none resize-none"
                      placeholder="Комментарий, пожелания..."
                      value={leadForm.notes}
                      onChange={(e) => setLeadForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                    <button
                      onClick={handleOrder}
                      disabled={submitting}
                      className="w-full rounded-full bg-white px-5 py-3 font-bold text-black disabled:opacity-50"
                    >
                      {submitting ? "Отправляю..." : `Заказать от ${template.priceFrom?.toLocaleString("ru-RU")} ₽`}
                    </button>
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
