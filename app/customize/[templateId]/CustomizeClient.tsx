"use client"

import { useEffect, useRef, useState } from "react"
import { Reorder } from "framer-motion"
import type { Template } from "@/types"
import { createClient } from "@/lib/supabase/client"

const PALETTES = [
  "#a78bfa", "#f59e0b", "#22d3ee", "#d946ef",
  "#34d399", "#ef4444", "#0ea5e9", "#f97316",
]

const SECTION_NAMES: Record<string, string> = {
  hero: "Главный экран",
  stats: "Статистика",
  about: "О компании",
  gallery: "Галерея",
  services: "Услуги",
  "hosting-service": "Хостинг и домен",
  "templates-gallery": "Примеры работ",
  calculator: "Калькулятор",
  footer: "Подвал сайта",
  reviews: "Отзывы",
}

const PRICE_HINTS: Record<string, string> = {
  gallery: "+2 000 ₽",
  calculator: "+3 000 ₽",
  reviews: "+1 500 ₽",
  stats: "+1 000 ₽",
  "hosting-service": "+5 000 ₽/год",
}

const BASE_TABS = [
  { id: "sections", label: "Разделы" },
  { id: "order", label: "Порядок" },
  { id: "colors", label: "Цвета" },
  { id: "background", label: "Фон" },
]

const ADMIN_TAB = { id: "style", label: "Стиль" }

export default function CustomizeClient({
  initialTemplate,
  isAdmin,
}: {
  initialTemplate: Template
  isAdmin: boolean
}) {
  const [template, setTemplate] = useState(initialTemplate)
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [tab, setTab] = useState("sections")
  const iframe = useRef<HTMLIFrameElement>(null)

  const tabs = isAdmin ? [...BASE_TABS, ADMIN_TAB] : BASE_TABS
  const tabIndex = tabs.findIndex((t) => t.id === tab)

  useEffect(() => {
    iframe.current?.contentWindow?.postMessage({ type: "VIBECODE_UPDATE", template }, "*")
  }, [template])

  const updateHero = (key: string, value: string) =>
    setTemplate((t) => ({
      ...t,
      sections: t.sections.map((s) =>
        s.type === "hero" ? { ...s, content: { ...s.content, [key]: value } } : s
      ),
    }))

  async function order() {
    const supabase = createClient()
    const token = supabase
      ? (await supabase.auth.getSession()).data.session?.access_token
      : undefined
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
    })
    if (res.ok && token) setTimeout(() => (location.href = "/dashboard"), 1800)
  }

  function save() {
    const name = template.id.replace(/-([a-z])/g, (_, x) => x.toUpperCase())
    const blob = new Blob(
      [`export const ${name} = ${JSON.stringify(template, null, 2)} as const;`],
      { type: "text/typescript" }
    )
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${template.id}.ts`
    a.click()
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10 p-3 flex justify-between items-center">
        <b>Конструктор: {template.name}</b>
        <div className="flex gap-2">
          <button
            onClick={() => setDevice("desktop")}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${device === "desktop" ? "bg-white/20" : "bg-white/5 hover:bg-white/10"}`}
          >
            Desktop
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${device === "mobile" ? "bg-white/20" : "bg-white/5 hover:bg-white/10"}`}
          >
            Mobile
          </button>
        </div>
      </div>

      <div className="md:hidden flex border-b border-white/10">
        <button className="flex-1 p-3 text-sm" onClick={() => setTab("sections")}>
          ⚙️ Настройки
        </button>
        <button className="flex-1 p-3 text-sm" onClick={() => setTab("preview")}>
          👁 Превью
        </button>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] min-h-[calc(100vh-56px)]">
        <aside className={`${tab === "preview" ? "hidden md:flex" : "flex"} flex-col border-r border-white/10 p-4 gap-4`}>
          {/* Tab navigation */}
          <div className="flex flex-wrap gap-2 text-sm">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-3 py-2 transition ${
                  tab === t.id
                    ? "bg-white text-black font-semibold"
                    : "bg-white/10 hover:bg-white/15"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 space-y-3">
            {tab === "sections" && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">Главный экран</p>
                <input
                  className="w-full rounded-xl p-3 text-black"
                  value={String(template.sections[0]?.content.headline ?? "")}
                  onChange={(e) => updateHero("headline", e.target.value)}
                  placeholder="Заголовок"
                />
                <textarea
                  className="w-full rounded-xl p-3 text-black"
                  rows={3}
                  value={String(template.sections[0]?.content.subheadline ?? "")}
                  onChange={(e) => updateHero("subheadline", e.target.value)}
                  placeholder="Подзаголовок"
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
              <div>
                <p className="mb-3 text-xs text-zinc-400">Перетащите разделы, чтобы изменить порядок</p>
                <Reorder.Group
                  axis="y"
                  values={template.sections}
                  onReorder={(sections) => setTemplate((t) => ({ ...t, sections }))}
                >
                  {template.sections.map((s) => (
                    <Reorder.Item
                      key={s.id}
                      value={s}
                      className="mb-2 rounded-xl bg-white/10 p-3 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {SECTION_NAMES[s.type] ?? s.type}
                        </p>
                        {PRICE_HINTS[s.type] && (
                          <span className="text-xs text-cyan-400">{PRICE_HINTS[s.type]}</span>
                        )}
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            )}

            {tab === "colors" && (
              <div>
                <p className="mb-3 text-xs text-zinc-400">Основной цвет</p>
                <div className="grid grid-cols-4 gap-2">
                  {PALETTES.map((p) => (
                    <button
                      key={p}
                      style={{ background: p }}
                      className={`h-10 rounded-xl transition ${
                        template.theme.primary === p ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950" : ""
                      }`}
                      onClick={() =>
                        setTemplate((t) => ({
                          ...t,
                          theme: { ...t.theme, primary: p, gradientFrom: p },
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {tab === "background" && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">Цвета фона</p>
                {(["bgBase", "bgSurface", "bgBorder"] as const).map((k) => (
                  <div key={k} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={((template.theme as unknown as Record<string, string>)[k] ?? "#000000").slice(0, 7)}
                      onChange={(e) =>
                        setTemplate((t) => ({ ...t, theme: { ...t.theme, [k]: e.target.value } }))
                      }
                      className="h-10 w-10 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    />
                    <span className="text-sm text-zinc-400">
                      {k === "bgBase" ? "Основной" : k === "bgSurface" ? "Поверхность" : "Граница"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === "style" && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">Стиль галереи</p>
                <select
                  className="w-full rounded-xl p-3 text-black"
                  value={template.style.galleryStyle}
                  onChange={(e) =>
                    setTemplate((t) => ({
                      ...t,
                      style: { ...t.style, galleryStyle: e.target.value as "grid" | "masonry" | "film" },
                    }))
                  }
                >
                  <option value="grid">Сетка</option>
                  <option value="masonry">Масонри</option>
                  <option value="film">Кинолента</option>
                </select>
              </div>
            )}
          </div>

          {/* Prev / Next step buttons */}
          <div className="flex gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => tabIndex > 0 && setTab(tabs[tabIndex - 1].id)}
              disabled={tabIndex === 0}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5 disabled:opacity-30"
            >
              ← Назад
            </button>
            <button
              onClick={() => tabIndex < tabs.length - 1 && setTab(tabs[tabIndex + 1].id)}
              disabled={tabIndex === tabs.length - 1}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5 disabled:opacity-30"
            >
              Далее →
            </button>
          </div>

          <button
            id="lead"
            onClick={order}
            className="w-full rounded-full bg-cyan-300 px-5 py-3 font-bold text-black transition hover:bg-cyan-200"
          >
            Заказать
          </button>

          {isAdmin && (
            <button
              onClick={save}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              💾 Сохранить шаблон клиента
            </button>
          )}
        </aside>

        <section
          className={`${tab !== "preview" ? "hidden md:flex" : "flex"} items-start justify-center bg-black/40 p-4`}
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
  )
}
