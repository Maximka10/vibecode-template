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

const PALETTES = [
  "#d97706","#be185d","#eab308","#0ea5e9","#b45309",
  "#7c3aed","#16a34a","#dc2626","#0f766e","#c026d3",
];

type Device = "desktop" | "mobile";
type Tab = "hero" | "about" | "services" | "gallery" | "order" | "colors" | "lead";
type OrderStep = "form" | "confirm" | "done";

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
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderStep, setOrderStep] = useState<OrderStep>("form");

  const [leadForm, setLeadForm] = useState({
    clientName: "",
    clientPhone: "",
    clientTelegram: "",
    clientEmail: "",
    businessType: template.category,
    notes: "",
    selectedServices: [] as string[],
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
      console.log("[handleOrder] session token present:", !!token);

      const payload = {
        templateId: template.id,
        templateName: template.name,
        clientName: leadForm.clientName,
        clientPhone: leadForm.clientPhone,
        clientTelegram: leadForm.clientTelegram,
        clientEmail: leadForm.clientEmail,
        businessType: leadForm.businessType || template.category,
        selectedServices: leadForm.selectedServices,
        budget: breakdown.total,
        notes: leadForm.notes,
        selectedOptions: template,
        totalPrice: breakdown.total,
        primaryColor: template.theme.primary,
        bgColor: template.theme.bgBase,
      };

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      console.log("[handleOrder] API response status:", res.status);

      if (!res.ok) {
        let errMsg = `Ошибка сервера (${res.status})`;
        try {
          const body = await res.json();
          console.error("[handleOrder] API error body:", body);
          if (body?.error) errMsg = body.error;
        } catch { /* non-JSON response */ }
        setOrderError(errMsg);
        return;
      }

      const result = await res.json();
      console.log("[handleOrder] success:", result);

      setOrderStep("done");
      try { localStorage.removeItem(`draft-${template.id}`); } catch { /* ignore */ }
      if (token) setTimeout(() => (location.href = "/dashboard"), 2500);
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
    <main className="min-h-screen bg-slate-950 text-white">
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

            {/* ── Hero ── */}
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
                <ImageUpload
                  label="Обложка раздела «О нас» (необязательно)"
                  value={about.coverImage as string | undefined}
                  onChange={(url) => setTemplate(updateSectionContent(template, "about", "coverImage", url ?? ""))}
                  storagePath={`${template.id}/about`}
                  aspectClass="aspect-[16/5]"
                />
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
                  <ImageUpload
                    label="Добавить фото в галерею"
                    value={null}
                    onChange={(url) => {
                      if (!url) return;
                      setTemplate(updateSectionContent(template, "gallery", "images", [...images, url]));
                    }}
                    storagePath={`${template.id}/gallery`}
                    aspectClass="aspect-[3/1]"
                  />
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
                    <span className="text-sm">{s.type}</span>
                    <span className="text-white/30">⠿</span>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}

            {/* ── Colors ── */}
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
                  <p className="mt-3 text-lg font-bold">Заявка отправлена!</p>
                  <p className="mt-2 text-sm text-white/60">Свяжемся в ближайшее время. Переходим в личный кабинет…</p>
                </div>
              ) : orderStep === "confirm" ? (
                /* Confirm */
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Шаг 2 из 2</p>
                    <h3 className="mt-1 font-bold">Проверьте перед отправкой</h3>
                  </div>

                  {/* Price breakdown */}
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/4">
                    <div className="p-4 space-y-2.5">
                      {breakdown.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-white/65">{item.label}</span>
                          <span className="font-semibold tabular-nums">{item.price.toLocaleString("ru-RU")} ₽</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 p-4">
                      <span className="font-bold">Итого</span>
                      <span className="text-xl font-black text-cyan-400 tabular-nums">
                        {breakdown.total.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>

                  {/* Contact summary */}
                  <div className="rounded-2xl border border-white/10 bg-white/4 p-4 space-y-2 text-sm">
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-white/40">Ваши контакты</p>
                    {[
                      { label: "Имя", value: leadForm.clientName },
                      { label: "Телефон", value: leadForm.clientPhone },
                      { label: "Telegram", value: leadForm.clientTelegram ? `@${leadForm.clientTelegram.replace("@", "")}` : "" },
                      { label: "Email", value: leadForm.clientEmail },
                    ]
                      .filter((r) => r.value)
                      .map((r) => (
                        <div key={r.label} className="flex justify-between">
                          <span className="text-white/45">{r.label}</span>
                          <span className="text-white/85">{r.value}</span>
                        </div>
                      ))}
                  </div>

                  <p className="text-center text-xs text-white/30">Предоплата — 0 ₽. Оплата после приёмки сайта.</p>

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
                    {submitting ? "Отправляю..." : `Подтвердить — ${breakdown.total.toLocaleString("ru-RU")} ₽`}
                  </Btn>

                  <Btn onClick={() => { setOrderStep("form"); setOrderError(null); }} variant="ghost" size="sm" className="w-full">
                    ← Назад к форме
                  </Btn>
                </div>
              ) : (
                /* Form */
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-white/50">
                      Шаг 1 из 2 — Оставьте контакты, запустим за 3 дня
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs">
                      <span className="text-white/50">Стоимость:</span>
                      <span className="font-bold text-cyan-400 tabular-nums">
                        {breakdown.total.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>
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
                    placeholder="Telegram (@username)"
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
                    onClick={() => {
                      if (!leadForm.clientPhone && !leadForm.clientTelegram) {
                        alert("Укажите телефон или Telegram для связи");
                        return;
                      }
                      setOrderStep("confirm");
                    }}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Продолжить → {breakdown.total.toLocaleString("ru-RU")} ₽
                  </Btn>
                  <p className="text-center text-xs text-white/30">
                    Предоплата — 0 ₽. Следующий шаг — подтверждение заказа.
                  </p>
                </div>
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
