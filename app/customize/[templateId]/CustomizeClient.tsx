"use client";
import { useEffect, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import type { Template } from "@/types";
import { createClient } from "@/lib/supabase/client";

const palettes = [
  "#a78bfa","#f59e0b","#22d3ee","#d946ef",
  "#34d399","#ef4444","#0ea5e9","#f97316",
];

const SECTION_NAMES: Record<string, string> = {
  'hero': 'Главный экран',
  'stats': 'Статистика',
  'about': 'О компании',
  'gallery': 'Галерея',
  'services': 'Услуги',
  'hosting-service': 'Хостинг и домен',
  'templates-gallery': 'Примеры работ',
  'calculator': 'Калькулятор',
  'footer': 'Подвал сайта',
  'reviews': 'Отзывы',
};

const SECTION_PRICES: Record<string, number> = {
  'gallery': 1500,
  'calculator': 2000,
  'reviews': 1000,
  'hosting-service': 500,
};

const STEPS_BASE = ["sections", "order", "colors", "background"] as const;
const STEP_LABELS: Record<string, string> = {
  sections: "Контент",
  order: "Разделы",
  colors: "Цвета",
  background: "Фон",
  style: "Стиль",
};

export default function CustomizeClient({
  initialTemplate,
  isAdmin,
}: {
  initialTemplate: Template;
  isAdmin: boolean;
}) {
  const steps = isAdmin ? [...STEPS_BASE, "style"] : [...STEPS_BASE];
  const [template, setTemplate] = useState(initialTemplate);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [stepIndex, setStepIndex] = useState(0);
  const [mobileView, setMobileView] = useState<"settings" | "preview">("settings");
  const iframe = useRef<HTMLIFrameElement>(null);

  const tab = steps[stepIndex];

  useEffect(() => {
    iframe.current?.contentWindow?.postMessage(
      { type: "VIBECODE_UPDATE", template },
      "*"
    );
  }, [template]);

  const updateHero = (key: string, value: string) =>
    setTemplate((t) => ({
      ...t,
      sections: t.sections.map((s) =>
        s.type === "hero"
          ? { ...s, content: { ...s.content, [key]: value } }
          : s
      ),
    }));

  async function order() {
    const supabase = createClient();
    const token = supabase
      ? (await supabase.auth.getSession()).data.session?.access_token
      : undefined;
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        templateId: template.id,
        templateName: template.name,
        selectedOptions: template,
        totalPrice: template.priceFrom,
        primaryColor: template.theme.primary,
        bgColor: template.theme.bgBase,
      }),
    });
    if (res.ok) {
      if (token) {
        setTimeout(() => (location.href = "/dashboard"), 1800);
      } else {
        const botUsername =
          process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
          process.env.NEXT_PUBLIC_TELEGRAM_USERNAME;
        if (botUsername) {
          window.open(`https://t.me/${botUsername}`, "_blank");
        }
      }
    }
  }

  function save() {
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

  const canPrev = stepIndex > 0;
  const canNext = stepIndex < steps.length - 1;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 p-3 flex justify-between items-center">
        <b>Конструктор: {template.name}</b>
        <div className="flex gap-2">
          <button
            onClick={() => setDevice("desktop")}
            className={`px-3 py-1 rounded-lg text-sm ${device === "desktop" ? "bg-white/20" : "bg-white/5"}`}
          >
            Desktop
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`px-3 py-1 rounded-lg text-sm ${device === "mobile" ? "bg-white/20" : "bg-white/5"}`}
          >
            Mobile
          </button>
        </div>
      </div>

      {/* Mobile tab toggle */}
      <div className="md:hidden flex border-b border-white/10">
        <button
          className={`flex-1 p-3 text-sm ${mobileView === "settings" ? "bg-white/10" : ""}`}
          onClick={() => setMobileView("settings")}
        >
          Настройки
        </button>
        <button
          className={`flex-1 p-3 text-sm ${mobileView === "preview" ? "bg-white/10" : ""}`}
          onClick={() => setMobileView("preview")}
        >
          Превью
        </button>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] min-h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside
          className={`${
            mobileView === "preview" ? "hidden md:flex" : "flex"
          } flex-col border-r border-white/10`}
        >
          {/* Step indicator */}
          <div className="p-4 border-b border-white/10">
            <div className="flex gap-1 flex-wrap">
              {steps.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStepIndex(i)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    i === stepIndex
                      ? "bg-white text-black"
                      : i < stepIndex
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {i + 1}. {STEP_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {tab === "sections" && (
              <div className="space-y-3">
                <label className="block text-xs text-zinc-400 mb-1">Заголовок</label>
                <input
                  className="w-full rounded-xl p-3 text-black"
                  value={String(template.sections[0]?.content.headline ?? "")}
                  onChange={(e) => updateHero("headline", e.target.value)}
                />
                <label className="block text-xs text-zinc-400 mb-1">Подзаголовок</label>
                <textarea
                  className="w-full rounded-xl p-3 text-black"
                  value={String(template.sections[0]?.content.subheadline ?? "")}
                  onChange={(e) => updateHero("subheadline", e.target.value)}
                />
                {isAdmin && (
                  <input
                    className="w-full rounded-xl p-3 text-black"
                    placeholder="ADM telegramUsername"
                  />
                )}
              </div>
            )}

            {tab === "order" && (
              <Reorder.Group
                axis="y"
                values={template.sections}
                onReorder={(sections) =>
                  setTemplate((t) => ({ ...t, sections }))
                }
              >
                {template.sections.map((s) => (
                  <Reorder.Item
                    key={s.id}
                    value={s}
                    className="mb-2 rounded-xl bg-white/10 p-3 cursor-grab"
                  >
                    <div className="flex justify-between items-center">
                      <span>{SECTION_NAMES[s.type] ?? s.type}</span>
                      {SECTION_PRICES[s.type] && (
                        <span className="text-zinc-400 text-xs">
                          +{SECTION_PRICES[s.type].toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}

            {tab === "colors" && (
              <div className="grid grid-cols-4 gap-2">
                {palettes.map((p) => (
                  <button
                    key={p}
                    style={{ background: p }}
                    className="h-10 rounded-xl"
                    onClick={() =>
                      setTemplate((t) => ({
                        ...t,
                        theme: { ...t.theme, primary: p, gradientFrom: p },
                      }))
                    }
                  />
                ))}
              </div>
            )}

            {tab === "background" && (
              <div className="space-y-3">
                {(["bgBase", "bgSurface", "bgBorder"] as const).map((k) => (
                  <div key={k} className="flex items-center gap-3">
                    <label className="text-sm text-zinc-400 w-28">{k}</label>
                    <input
                      type="color"
                      value={(template.theme as unknown as Record<string, string>)[k]?.slice(0, 7) ?? "#000000"}
                      onChange={(e) =>
                        setTemplate((t) => ({
                          ...t,
                          theme: { ...t.theme, [k]: e.target.value },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {tab === "style" && (
              <div className="space-y-3">
                <label className="block text-xs text-zinc-400">Стиль галереи</label>
                <select
                  className="text-black rounded-xl p-3 w-full"
                  value={template.style.galleryStyle}
                  onChange={(e) =>
                    setTemplate((t) => ({
                      ...t,
                      style: {
                        ...t.style,
                        galleryStyle: e.target.value as "grid" | "masonry" | "film",
                      },
                    }))
                  }
                >
                  <option value="grid">grid</option>
                  <option value="masonry">masonry</option>
                  <option value="film">film</option>
                </select>
              </div>
            )}
          </div>

          {/* Navigation footer */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex gap-2">
              {canPrev && (
                <button
                  onClick={() => setStepIndex((i) => i - 1)}
                  className="flex-1 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
                >
                  ← Назад
                </button>
              )}
              {canNext && (
                <button
                  onClick={() => setStepIndex((i) => i + 1)}
                  className="flex-1 rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition"
                >
                  Далее →
                </button>
              )}
            </div>
            <button
              id="lead"
              onClick={order}
              className="w-full rounded-full bg-cyan-300 px-5 py-3 font-bold text-black"
            >
              Заказать
            </button>
            {isAdmin && (
              <button
                onClick={save}
                className="w-full rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
              >
                Сохранить шаблон клиента
              </button>
            )}
          </div>
        </aside>

        {/* Preview */}
        <section
          className={`${
            mobileView !== "preview" ? "hidden md:flex" : "flex"
          } items-start justify-center bg-black/40 p-4`}
        >
          <div
            className={
              device === "mobile"
                ? "rounded-[2.5rem] border-8 border-zinc-800 p-2"
                : "w-full"
            }
          >
            <iframe
              ref={iframe}
              src={`/preview/${template.id}`}
              className="h-[80vh] bg-white"
              style={{ width: device === "mobile" ? 393 : "100%" }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
