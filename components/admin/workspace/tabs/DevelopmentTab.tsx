"use client";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { formatWorkingHours } from "@/lib/utils/workingHours";
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
  whatsapp?: string;
  address?: string;
  working_hours?: string;
  domain_name?: string;
  contact_link?: string;
  services?: string[];
  seo_title?: string;
  seo_description?: string;
  font?: string;
  branding?: { primary_color?: string; secondary_color?: string };
  content_edits?: {
    hero?: { title?: string; subtitle?: string; cta?: string };
    about?: { title?: string; text?: string };
    sections?: SiteSection[];
  };
};

const FONTS = ["Inter", "Manrope", "Montserrat", "Roboto", "Open Sans"] as const;

type Device = "desktop" | "mobile";

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

// ── Working Hours Editor ───────────────────────────────────────────────────────
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type DaySchedule = { open: string; close: string; closed: boolean };
type WeekSchedule = Record<DayKey, DaySchedule>;
const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<DayKey, string> = { mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт", fri: "Пт", sat: "Сб", sun: "Вс" };
const DEFAULT_SCHEDULE: WeekSchedule = {
  mon: { open: "09:00", close: "18:00", closed: false },
  tue: { open: "09:00", close: "18:00", closed: false },
  wed: { open: "09:00", close: "18:00", closed: false },
  thu: { open: "09:00", close: "18:00", closed: false },
  fri: { open: "09:00", close: "18:00", closed: false },
  sat: { open: "10:00", close: "16:00", closed: true },
  sun: { open: "10:00", close: "16:00", closed: true },
};
function parseWeekSchedule(raw?: string | null): WeekSchedule {
  if (!raw) return { ...DEFAULT_SCHEDULE };
  try {
    const parsed = JSON.parse(raw) as WeekSchedule;
    if (parsed.mon && parsed.fri) return parsed;
  } catch { /* fall through */ }
  return { ...DEFAULT_SCHEDULE };
}
function buildSchedulePreview(s: WeekSchedule): string {
  return formatWorkingHours(JSON.stringify(s));
}
function WorkingHoursEditor({ value, onChange }: { value?: string | null; onChange: (v: string) => void }) {
  const [schedule, setSchedule] = useState<WeekSchedule>(() => parseWeekSchedule(value));
  function update(key: DayKey, patch: Partial<DaySchedule>) {
    const next = { ...schedule, [key]: { ...schedule[key], ...patch } };
    setSchedule(next);
    onChange(JSON.stringify(next));
  }
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/30">
              <th className="py-1 text-left font-medium w-10">День</th>
              <th className="py-1 text-left font-medium w-20">Открытие</th>
              <th className="py-1 text-left font-medium w-20">Закрытие</th>
              <th className="py-1 text-center font-medium w-16">Выходной</th>
            </tr>
          </thead>
          <tbody>
            {DAY_KEYS.map((k) => (
              <tr key={k} className={schedule[k].closed ? "opacity-40" : ""}>
                <td className="py-1 font-semibold text-white/70">{DAY_LABELS[k]}</td>
                <td className="py-1 pr-2">
                  <input type="time" disabled={schedule[k].closed} value={schedule[k].open} onChange={(e) => update(k, { open: e.target.value })}
                    className="w-20 rounded border border-white/10 bg-white/5 px-1.5 py-1 text-white/70 disabled:opacity-30" />
                </td>
                <td className="py-1 pr-2">
                  <input type="time" disabled={schedule[k].closed} value={schedule[k].close} onChange={(e) => update(k, { close: e.target.value })}
                    className="w-20 rounded border border-white/10 bg-white/5 px-1.5 py-1 text-white/70 disabled:opacity-30" />
                </td>
                <td className="py-1 text-center">
                  <input type="checkbox" checked={schedule[k].closed} onChange={(e) => update(k, { closed: e.target.checked })} className="accent-cyan-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-white/30">{buildSchedulePreview(schedule)}</p>
    </div>
  );
}

function GalleryPicker({ orderId, onPick }: { orderId: string; onPick: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [imgs, setImgs] = useState<{ name: string; url: string }[]>([]);

  async function load() {
    const res = await fetch(`/api/orders/${orderId}/files`);
    const data = await res.json();
    if (!data.ok) return;
    const photos: { name: string; url: string }[] = [
      ...(data.files.logo ?? []),
      ...(data.files.photos ?? []),
    ].filter((f: { name: string }) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.name));
    setImgs(photos);
  }

  function toggle() {
    if (!open) load();
    setOpen((p) => !p);
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={toggle}
        className="text-xs text-cyan-400/70 hover:text-cyan-400 underline"
      >
        {open ? "Скрыть материалы" : "Выбрать из материалов"}
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-4 gap-1.5 rounded-xl border border-white/10 bg-white/4 p-2">
          {imgs.length === 0 && <p className="col-span-4 py-3 text-center text-xs text-white/30">Нет загруженных фото</p>}
          {imgs.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <button
              key={img.url}
              type="button"
              onClick={() => { onPick(img.url); setOpen(false); }}
              className="overflow-hidden rounded-lg border border-white/10 transition hover:border-cyan-500/60"
            >
              <img src={img.url} alt={img.name} className="w-full aspect-square object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionEditor({
  section,
  onChange,
  orderId,
}: {
  section: SiteSection;
  onChange: (content: SectionContent) => void;
  orderId: string;
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
          <Field label="Фоновое изображение" hint="Накладывается на градиент с прозрачностью">
            {!!c.heroImage && (
              <div className="mb-2 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={String(c.heroImage)} alt="" className="h-12 w-20 rounded-lg object-cover" />
                <button type="button" onClick={() => set("heroImage", "")} className="text-xs text-red-400/60 hover:text-red-400">✕ Удалить</button>
              </div>
            )}
            <GalleryPicker orderId={orderId} onPick={(url) => set("heroImage", url)} />
          </Field>
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
      type GalleryImg = { url: string; title?: string; description?: string; notes?: string; main?: boolean };
      const rawImages = (c.images as (string | GalleryImg)[]) ?? [];
      const images: GalleryImg[] = rawImages.map((i) => typeof i === "string" ? { url: i } : i);
      const displayMode = (c.display_mode as string) ?? "contain";
      const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
      function updateImg(idx: number, patch: Partial<GalleryImg>) {
        const next = images.map((im, j) => j === idx ? { ...im, ...patch } : im);
        set("images", next);
      }
      return (
        <div className="space-y-3">
          <Field label="Заголовок"><input className={FIELD_CLS} value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Режим отображения">
            <div className="flex gap-2">
              {(["contain", "cover"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => set("display_mode", mode)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${displayMode === mode ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300" : "border-white/10 bg-white/5 text-white/40 hover:text-white/70"}`}
                >
                  {mode === "contain" ? "Вписать (Contain)" : "Обрезать (Cover)"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Изображения">
            {images.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {images.map((img, i) => (
                  <div key={i} className="rounded-lg border border-white/8 bg-white/4">
                    <div className="flex items-center gap-2 p-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-10 w-14 shrink-0 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
                      <button type="button" title="Главное фото" onClick={() => updateImg(i, { main: !img.main })} className={`text-base shrink-0 ${img.main ? "opacity-100" : "opacity-20 hover:opacity-60"}`}>⭐</button>
                      <span className="flex-1 truncate font-mono text-[10px] text-white/40">{img.title || img.url.split("/").pop()}</span>
                      <button type="button" onClick={() => setExpandedIdx(expandedIdx === i ? null : i)} className="rounded p-1 text-xs text-white/30 hover:text-white">✏</button>
                      <div className="flex shrink-0 gap-0.5">
                        <button type="button" disabled={i === 0} onClick={() => { const a = [...images]; [a[i-1], a[i]] = [a[i], a[i-1]]; set("images", a); }} className="rounded p-1 text-white/30 hover:text-white disabled:opacity-20">↑</button>
                        <button type="button" disabled={i === images.length - 1} onClick={() => { const a = [...images]; [a[i], a[i+1]] = [a[i+1], a[i]]; set("images", a); }} className="rounded p-1 text-white/30 hover:text-white disabled:opacity-20">↓</button>
                        <button type="button" onClick={() => { set("images", images.filter((_, j) => j !== i)); if (expandedIdx === i) setExpandedIdx(null); }} className="rounded p-1 text-red-400/60 hover:text-red-400">✕</button>
                      </div>
                    </div>
                    {expandedIdx === i && (
                      <div className="space-y-2 border-t border-white/8 px-2 pb-2 pt-2">
                        <input className={`${FIELD_CLS} text-xs`} value={img.title ?? ""} onChange={(e) => updateImg(i, { title: e.target.value })} placeholder="Название фото" />
                        <input className={`${FIELD_CLS} text-xs`} value={img.description ?? ""} onChange={(e) => updateImg(i, { description: e.target.value })} placeholder="Описание" />
                        <input className={`${FIELD_CLS} text-xs`} value={img.notes ?? ""} onChange={(e) => updateImg(i, { notes: e.target.value })} placeholder="Примечание по размещению" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <GalleryPicker
              orderId={orderId}
              onPick={(url) => set("images", [...images, { url }])}
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
          <Field label="Адрес" hint="Карта сгенерируется автоматически по адресу">
            <input
              className={FIELD_CLS}
              value={String(c.address ?? "")}
              onChange={(e) => {
                const addr = e.target.value;
                set("address", addr);
                if (addr.trim() && !c.embed_url) {
                  set("embed_url", `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(addr)}&z=15&lang=ru_RU`);
                }
              }}
            />
          </Field>
          <Field label="URL embed (перезаписывает автоматический)" hint="Оставьте пустым для автогенерации по адресу">
            <input
              className={FIELD_CLS}
              value={String(c.embed_url ?? "")}
              onChange={(e) => set("embed_url", e.target.value)}
              placeholder="https://yandex.ru/map-widget/v1/..."
            />
          </Field>
          {c.address && (
            <button
              type="button"
              className="text-xs text-cyan-400/70 hover:text-cyan-300 underline"
              onClick={() => set("embed_url", `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(String(c.address))}&z=15&lang=ru_RU`)}
            >
              ↺ Пересгенерировать embed по адресу
            </button>
          )}
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

// ── Section Completeness ──────────────────────────────────────────────────────
function sectionComplete(s: SiteSection): boolean {
  const c = s.content;
  switch (s.type) {
    case "hero": return !!(c.title && c.cta_text);
    case "about": return !!(c.title && c.text);
    case "services": return Array.isArray(c.items) && (c.items as unknown[]).length > 0;
    case "gallery": return Array.isArray(c.images) && (c.images as unknown[]).length > 0;
    case "reviews": return Array.isArray(c.items) && (c.items as unknown[]).length > 0;
    case "faq": return Array.isArray(c.items) && (c.items as unknown[]).length > 0;
    case "pricing": return Array.isArray(c.plans) && (c.plans as unknown[]).length > 0;
    case "cta": return !!(c.title && c.cta_text);
    case "contacts": return !!(c.phone || c.email || c.telegram);
    case "map": return !!(c.address || c.embed_url);
    case "footer": return !!c.company_name;
    default: return true;
  }
}

// ── Main Component ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DevelopmentTab({ orderId }: { orderId: string; order: Record<string, any> }) {
  const [pd, setPd] = useState<ProjectData>({});
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [device, setDevice] = useState<Device>("mobile");
  const [previewKey, setPreviewKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiDisabled, setAiDisabled] = useState(false);
  const [applyingMaterials, setApplyingMaterials] = useState(false);

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
  }, [orderId]);

  useEffect(() => {
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

  // Autosave after 3 seconds of inactivity when dirty
  useEffect(() => {
    if (!dirty || saving) return;
    const t = setTimeout(() => { handleSave(); }, 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, pd, sections]);

  // ── Section operations ────────────────────────────────────────────────────
  const UNIQUE_TYPES: SectionType[] = ["hero", "footer", "contacts", "map"];

  function canAdd(type: SectionType) {
    return !UNIQUE_TYPES.includes(type) || !sections.some((s) => s.type === type);
  }

  function addSection(type: SectionType) {
    if (!canAdd(type)) return;
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
    if (result.ok) { setPd(result.data); setSaved(true); setDirty(false); setPreviewKey((k) => k + 1); setTimeout(() => setSaved(false), 3000); }
    else setError(result.error ?? "Ошибка сохранения");
    setSaving(false);
  }

  // ── Generate content ──────────────────────────────────────────────────────
  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setAiDisabled(false);
    const res = await fetch(`/api/orders/${orderId}/generate-content`, { method: "POST" });
    if (res.status === 503) {
      const result = await res.json();
      const msg: string = result.error ?? "AI временно недоступен";
      if (msg.includes("временно недоступен")) setAiDisabled(true);
      else setError(msg);
      setGenerating(false);
      return;
    }
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

  // ── Auto-assign materials by type ─────────────────────────────────────────
  async function handleApplyMaterials() {
    setApplyingMaterials(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/files`);
      const data = await res.json();
      if (!data.ok) return;
      const allFiles: { name: string; url: string; metadata?: { type?: string } }[] = [
        ...(data.files.logo ?? []),
        ...(data.files.photos ?? []),
        ...(data.files.documents ?? []),
      ];
      const byType: Record<string, string[]> = {};
      for (const f of allFiles) {
        const t = f.metadata?.type || "other";
        if (!byType[t]) byType[t] = [];
        byType[t].push(f.url);
      }
      setSections((prev) => prev.map((sec) => {
        if (sec.type === "gallery" && byType.gallery?.length) {
          return { ...sec, content: { ...sec.content, images: byType.gallery } };
        }
        if (sec.type === "hero" && byType.hero?.length) {
          return { ...sec, content: { ...sec.content, heroImage: byType.hero[0] } };
        }
        if (sec.type === "about" && byType.team?.length) {
          return { ...sec, content: { ...sec.content, image: byType.team[0] } };
        }
        return sec;
      }));
      setDirty(true);
    } finally {
      setApplyingMaterials(false);
    }
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
          {aiAvailable && (
            <Btn onClick={handleGenerate} disabled={generating} loading={generating} variant="outline" size="sm">
              {generating ? "Генерация…" : "✨ Сгенерировать контент"}
            </Btn>
          )}
          <Btn onClick={handleApplyMaterials} disabled={applyingMaterials} loading={applyingMaterials} variant="ghost" size="sm">
            {applyingMaterials ? "Применение…" : "🖼 Применить материалы"}
          </Btn>
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

        {aiDisabled && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-300">
            ⚠ AI временно недоступен. Обратитесь к администратору.
          </div>
        )}
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

        {/* Global Settings */}
        <Card variant="solid" padding="md">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Настройки сайта</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Название компании">
              <input className={FIELD_CLS} value={pd.company_name ?? ""} onChange={(e) => { setPd((p) => ({ ...p, company_name: e.target.value })); setDirty(true); }} placeholder="ООО «Компания»" />
            </Field>
            <Field label="Телефон">
              <input className={FIELD_CLS} value={pd.phone ?? ""} onChange={(e) => { setPd((p) => ({ ...p, phone: e.target.value })); setDirty(true); }} placeholder="+7 (999) 000-00-00" />
            </Field>
            <Field label="Email">
              <input className={FIELD_CLS} value={pd.email ?? ""} onChange={(e) => { setPd((p) => ({ ...p, email: e.target.value })); setDirty(true); }} placeholder="info@company.ru" />
            </Field>
            <Field label="Telegram">
              <input className={FIELD_CLS} value={pd.telegram ?? ""} onChange={(e) => { setPd((p) => ({ ...p, telegram: e.target.value })); setDirty(true); }} placeholder="@username" />
            </Field>
            <Field label="WhatsApp">
              <input className={FIELD_CLS} value={pd.whatsapp ?? ""} onChange={(e) => { setPd((p) => ({ ...p, whatsapp: e.target.value })); setDirty(true); }} placeholder="+7 (999) 000-00-00" />
            </Field>
            <Field label="Адрес">
              <input className={FIELD_CLS} value={pd.address ?? ""} onChange={(e) => { setPd((p) => ({ ...p, address: e.target.value })); setDirty(true); }} placeholder="г. Москва, ул. Примерная, 1" />
            </Field>
            <Field label="Режим работы">
              <WorkingHoursEditor value={pd.working_hours} onChange={(v) => { setPd((p) => ({ ...p, working_hours: v })); setDirty(true); }} />
            </Field>
            <div className="col-span-full">
              <Field label="Описание компании">
                <textarea className={`${FIELD_CLS} resize-none`} rows={2} value={pd.company_description ?? ""} onChange={(e) => { setPd((p) => ({ ...p, company_description: e.target.value })); setDirty(true); }} placeholder="Чем занимается компания…" />
              </Field>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Основной цвет">
              <div className="flex items-center gap-2">
                <input type="color" className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5" value={pd.branding?.primary_color ?? "#6366f1"} onChange={(e) => { setPd((p) => ({ ...p, branding: { ...p.branding, primary_color: e.target.value } })); setDirty(true); }} />
                <input className={`${FIELD_CLS} flex-1`} value={pd.branding?.primary_color ?? "#6366f1"} onChange={(e) => { setPd((p) => ({ ...p, branding: { ...p.branding, primary_color: e.target.value } })); setDirty(true); }} />
              </div>
            </Field>
            <Field label="Дополнительный цвет">
              <div className="flex items-center gap-2">
                <input type="color" className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5" value={pd.branding?.secondary_color ?? "#8b5cf6"} onChange={(e) => { setPd((p) => ({ ...p, branding: { ...p.branding, secondary_color: e.target.value } })); setDirty(true); }} />
                <input className={`${FIELD_CLS} flex-1`} value={pd.branding?.secondary_color ?? "#8b5cf6"} onChange={(e) => { setPd((p) => ({ ...p, branding: { ...p.branding, secondary_color: e.target.value } })); setDirty(true); }} />
              </div>
            </Field>
            <Field label="Шрифт">
              <select className={FIELD_CLS} value={pd.font ?? "Inter"} onChange={(e) => { setPd((p) => ({ ...p, font: e.target.value })); setDirty(true); }}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Домен сайта">
              <input className={FIELD_CLS} value={pd.domain_name ?? ""} onChange={(e) => { setPd((p) => ({ ...p, domain_name: e.target.value })); setDirty(true); }} placeholder="example.ru" />
            </Field>
            <Field label="Ссылка для связи (CTA)" hint="Используется в кнопках «Оставить заявку»">
              <input className={FIELD_CLS} value={pd.contact_link ?? ""} onChange={(e) => { setPd((p) => ({ ...p, contact_link: e.target.value })); setDirty(true); }} placeholder="https://t.me/username или tel:+7..." />
            </Field>
            <Field label="SEO заголовок">
              <input className={FIELD_CLS} value={pd.seo_title ?? ""} onChange={(e) => { setPd((p) => ({ ...p, seo_title: e.target.value })); setDirty(true); }} />
            </Field>
            <Field label="SEO описание">
              <input className={FIELD_CLS} value={pd.seo_description ?? ""} onChange={(e) => { setPd((p) => ({ ...p, seo_description: e.target.value })); setDirty(true); }} />
            </Field>
          </div>
        </Card>

        {/* Section List */}
        <Card variant="solid" padding="md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">Структура сайта</h3>
            <Btn onClick={() => setAddOpen(!addOpen)} variant="outline" size="sm">+ Добавить секцию</Btn>
          </div>

          {/* Add section picker */}
          {addOpen && (
            <div className="mb-4 rounded-xl border border-white/10 bg-white/4 p-3">
              {/* Presets */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/25">Пресеты</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {[
                  { label: "Hero Premium", type: "hero" as SectionType, content: { title: "Ваш бизнес — наш приоритет", subtitle: "Профессиональные услуги высокого качества. Работаем быстро и надёжно.", cta_text: "Оставить заявку" } },
                  { label: "Услуги с иконками", type: "services" as SectionType, content: { title: "Что мы делаем", items: ["Консультация и анализ", "Разработка решения", "Внедрение и поддержка", "Обучение команды"] } },
                  { label: "Отзывы Grid", type: "reviews" as SectionType, content: { title: "Что говорят клиенты", items: [{ author: "Алексей М.", text: "Отличная работа, всё сделали быстро и качественно!", rating: 5 }, { author: "Мария К.", text: "Профессиональный подход, рекомендую всем!", rating: 5 }, { author: "Игорь С.", text: "Результат превзошёл все ожидания.", rating: 5 }, { author: "Анна Д.", text: "Работаем уже 3 года, всегда довольны.", rating: 5 }] } },
                  { label: "FAQ Базовый", type: "faq" as SectionType, content: { title: "Часто задаваемые вопросы", items: [{ question: "Как быстро вы приступаете к работе?", answer: "Обычно мы начинаем в течение 1-2 рабочих дней после согласования." }, { question: "Есть ли гарантия на ваши услуги?", answer: "Да, мы даём гарантию на все наши работы. Подробности уточняйте у менеджера." }, { question: "Как связаться с вами?", answer: "Позвоните нам или оставьте заявку на сайте — ответим в течение часа." }] } },
                  { label: "Цены 3 тарифа", type: "pricing" as SectionType, content: { title: "Наши тарифы", plans: [{ name: "Базовый", price: "от 5 000 ₽", features: ["Базовый пакет услуг", "Поддержка по email", "1 месяц гарантии"] }, { name: "Стандарт", price: "от 15 000 ₽", features: ["Полный пакет услуг", "Приоритетная поддержка", "3 месяца гарантии", "Бесплатная консультация"] }, { name: "Премиум", price: "от 40 000 ₽", features: ["VIP обслуживание", "Личный менеджер", "6 месяцев гарантии", "Доступ 24/7"] }] } },
                  { label: "Hero Agency", type: "hero" as SectionType, content: { title: "Мы создаём то, что работает", subtitle: "Агентство полного цикла — от стратегии до результата.", cta_text: "Обсудить проект", variant: "agency" } },
                  { label: "Services Premium", type: "services" as SectionType, content: { title: "Наши услуги", items: ["Стратегический консалтинг", "Брендинг и дизайн", "Веб-разработка", "SEO и продвижение", "Контент-маркетинг", "Аналитика и отчётность"] } },
                  { label: "Pricing SaaS", type: "pricing" as SectionType, content: { title: "Простые и прозрачные цены", description: "Доступны ежемесячная и годовая оплата (скидка 20% при оплате за год)", plans: [{ name: "Стартер", price: "от 3 900 ₽/мес", features: ["До 3 пользователей", "5 GB хранилища", "Базовая аналитика", "Email поддержка"] }, { name: "Бизнес", price: "от 9 900 ₽/мес", features: ["До 20 пользователей", "50 GB хранилища", "Расширенная аналитика", "Приоритетная поддержка", "API доступ"] }, { name: "Про", price: "от 24 900 ₽/мес", features: ["Неограниченно пользователей", "500 GB хранилища", "Полная аналитика", "Выделенный менеджер", "API + webhooks", "SLA 99.9%"] }] } },
                  { label: "About Story", type: "about" as SectionType, content: { title: "Наша история", text: "2015 — Основание компании\nНачали с небольшой команды энтузиастов\n\n2018 — Первые 100 клиентов\nВышли на федеральный уровень\n\n2021 — Международная экспансия\nОткрыли офисы в 3 странах\n\n2024 — Лидер рынка\nБолее 1000 успешных проектов" } },
                ].map((preset) => {
                  const disabled = !canAdd(preset.type);
                  return (
                    <button
                      key={preset.label}
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return;
                        const s: SiteSection = { id: genId(), type: preset.type, enabled: true, content: preset.content as SectionContent };
                        setSections((prev) => [...prev, s]);
                        setEditingId(s.id);
                        setAddOpen(false);
                        setDirty(true);
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${disabled ? "border-white/5 text-white/20 cursor-not-allowed" : "border-cyan-500/20 bg-cyan-500/8 text-cyan-300/80 hover:border-cyan-500/40 hover:bg-cyan-500/15 hover:text-cyan-200"}`}
                    >
                      ✦ {preset.label}
                    </button>
                  );
                })}
              </div>
              {/* Section types */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/25">Секции</p>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                {ALL_SECTION_TYPES.map((type) => {
                  const disabled = !canAdd(type);
                  return (
                    <button
                      key={type}
                      onClick={() => addSection(type)}
                      disabled={disabled}
                      title={disabled ? "Секция уже добавлена" : undefined}
                      className={`rounded-lg border px-2 py-1.5 text-xs transition ${disabled ? "border-white/5 text-white/20 cursor-not-allowed" : "border-white/10 text-white/60 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300"}`}
                    >
                      {SECTION_TYPE_LABELS[type]}
                    </button>
                  );
                })}
              </div>
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
                      <span title={sectionComplete(s) ? "Заполнено" : "Требует заполнения"} className="text-xs">{sectionComplete(s) ? "✅" : "⚠️"}</span>
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
                          orderId={orderId}
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
        <div className="flex items-center gap-1">
          {([["mobile", "📱", "Mobile"], ["desktop", "🖥", "Desktop"]] as const).map(([d, icon, label]) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                device === d ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300" : "border-white/10 text-white/40 hover:text-white/70"
              }`}
            >
              {icon} {label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-white/25 font-mono">
            {device === "mobile" ? "390×844" : "full width"}
          </span>
        </div>

        {/* Preview */}
        {device === "mobile" ? (
          <div className="flex justify-center py-2" style={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
            <div className="flex flex-col items-center gap-0 shrink-0">
              <div
                className="overflow-hidden rounded-[36px] border-[5px] border-slate-700 shadow-2xl bg-slate-800"
                style={{ width: 390 + 10 }}
              >
                <div className="flex justify-center py-1.5 bg-slate-800">
                  <div className="h-1.5 w-14 rounded-full bg-slate-600" />
                </div>
                <iframe
                  ref={iframeRef}
                  key={`mobile-${previewKey}`}
                  src={`/preview-frame/${orderId}`}
                  width={390}
                  height={844}
                  style={{ display: "block", border: "none", background: "white" }}
                  title="Mobile preview"
                />
                <div className="flex justify-center py-1.5 bg-slate-800">
                  <div className="h-1.5 w-20 rounded-full bg-slate-600" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
            <iframe
              key={`desktop-${previewKey}`}
              src={`/preview-frame/${orderId}`}
              style={{ display: "block", border: "none", width: "100%", height: 700, background: "white" }}
              title="Desktop preview"
            />
          </div>
        )}

        {dirty && (
          <p className="text-center text-[10px] text-white/25">Предпросмотр обновится после сохранения</p>
        )}
      </div>
    </div>
  );
}
