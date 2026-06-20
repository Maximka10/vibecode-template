import { SiteSection, SectionType } from "@/types/sections";

export type SiteJson = {
  meta: { title: string; description: string; domain: string };
  branding: { primary: string; secondary: string; accent?: string };
  font?: string;
  contact_link?: string;
  company: { name: string; description: string; address: string; working_hours: string };
  contacts: { phone: string; email: string; telegram: string; whatsapp?: string | undefined };
  sections: SiteSection[];
};

// ── Section nav labels ─────────────────────────────────────────────────────────

const SECTION_NAV: Partial<Record<SectionType, { href: string; label: string }>> = {
  about:    { href: "#about",    label: "О нас" },
  services: { href: "#services", label: "Услуги" },
  gallery:  { href: "#gallery",  label: "Галерея" },
  reviews:  { href: "#reviews",  label: "Отзывы" },
  pricing:  { href: "#pricing",  label: "Цены" },
  faq:      { href: "#faq",      label: "FAQ" },
  contacts: { href: "#contacts", label: "Контакты" },
};

// ── Navigation component ───────────────────────────────────────────────────────

function genNavigation(site: SiteJson, sections: SiteSection[]): string {
  const navItems = sections
    .filter((s) => s.enabled && SECTION_NAV[s.type as SectionType])
    .map((s) => SECTION_NAV[s.type as SectionType]!);

  const itemsJson = JSON.stringify(navItems);
  const companyName = JSON.stringify(site.company.name || "Компания");

  return `"use client";
import { useState, useEffect } from "react";

const NAV_ITEMS = ${itemsJson};

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header
      className={\`fixed inset-x-0 top-0 z-50 transition-all duration-300 \${
        scrolled ? "bg-white/90 shadow-sm backdrop-blur-md" : "bg-transparent"
      }\`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a
          href="#"
          onClick={close}
          className="text-lg font-black"
          style={{ color: "var(--primary)" }}
        >
          {${companyName}}
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-700 transition hover:opacity-70"
              style={{ color: scrolled ? undefined : "inherit" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Burger */}
        <button
          className="flex flex-col items-center justify-center gap-1.5 md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Меню"
        >
          <span className={\`block h-0.5 w-6 bg-slate-800 transition-all duration-300 \${open ? "translate-y-2 rotate-45" : ""}\`} />
          <span className={\`block h-0.5 w-6 bg-slate-800 transition-all duration-300 \${open ? "opacity-0" : ""}\`} />
          <span className={\`block h-0.5 w-6 bg-slate-800 transition-all duration-300 \${open ? "-translate-y-2 -rotate-45" : ""}\`} />
        </button>
      </div>

      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer (slides in from right) */}
      <div
        className={\`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden \${
          open ? "translate-x-0" : "translate-x-full"
        }\`}
      >
        <div className="flex h-full flex-col px-6 py-6">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg font-black" style={{ color: "var(--primary)" }}>
              {${companyName}}
            </span>
            <button
              onClick={close}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Закрыть меню"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={close}
                className="rounded-xl px-4 py-3.5 text-sm font-semibold transition hover:bg-slate-50"
                style={{ color: "var(--primary)" }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
`;
}

// ── Sticky mobile CTA ──────────────────────────────────────────────────────────

function genStickyMobileCTA(contacts: SiteJson["contacts"]): string {
  const hasPhone = !!contacts.phone;
  const hasTelegram = !!contacts.telegram;
  if (!hasPhone && !hasTelegram) return "";

  const phone = JSON.stringify(contacts.phone || "");
  const tg = JSON.stringify((contacts.telegram || "").replace("@", ""));

  return `export default function MobileCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden">
      <div
        className="flex gap-0 border-t border-white/20"
        style={{ background: "var(--primary)" }}
      >
        ${hasPhone ? `<a
          href={\`tel:${phone.slice(1, -1)}\`}
          className="flex flex-1 items-center justify-center gap-2 py-4 text-sm font-bold text-white"
        >
          <span>📞</span> Позвонить
        </a>` : ""}
        ${hasPhone && hasTelegram ? `<div className="w-px bg-white/20" />` : ""}
        ${hasTelegram ? `<a
          href={\`https://t.me/${tg.slice(1, -1)}\`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 py-4 text-sm font-bold text-white"
        >
          <span>💬</span> Telegram
        </a>` : ""}
      </div>
    </div>
  );
}
`;
}

// ── Component templates ───────────────────────────────────────────────────────

function resolveContactLink(contactLink: string, contacts: SiteJson["contacts"]): string {
  if (contactLink) return contactLink;
  if (contacts.telegram) return `https://t.me/${contacts.telegram.replace("@", "")}`;
  if (contacts.phone) return `tel:${contacts.phone}`;
  return "#contacts";
}

const COMPONENT_TEMPLATES: Record<SectionType, (s: SiteSection, site: SiteJson) => string> = {
  hero: (s, site) => {
    const phone = (s.content as { phone?: string }).phone ?? "";
    const phoneStr = JSON.stringify(phone);
    const ctaHref = JSON.stringify(resolveContactLink(site.contact_link ?? "", site.contacts));
    const heroImage = (s.content as { heroImage?: string }).heroImage ?? "";
    const heroImageStr = JSON.stringify(heroImage);
    return `import { SiteSection } from "@/types";

export default function Hero({ section }: { section: SiteSection }) {
  const { title, subtitle, cta_text, phone, heroImage } = section.content as {
    title?: string; subtitle?: string; cta_text?: string; phone?: string; heroImage?: string;
  };
  const tel = phone || ${phoneStr};
  const bg = heroImage || ${heroImageStr};
  return (
    <section
      className="relative flex min-h-[90svh] flex-col items-center justify-center px-4 py-24 text-center text-white sm:px-6 sm:py-32 lg:px-8"
      style={{ background: \`linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)\` }}
    >
      {bg && (
        <img src={bg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20" />
      )}
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-black/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Trust badges */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3 opacity-90">
          {["✓ Быстро", "✓ Качественно", "✓ Гарантия"].map((b) => (
            <span key={b} className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
              {b}
            </span>
          ))}
        </div>

        {title && (
          <h1 className="text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed opacity-85 sm:text-xl">
            {subtitle}
          </p>
        )}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {cta_text && (
            <a
              href={${ctaHref}}
              className="w-full rounded-full bg-white py-4 px-8 text-lg font-bold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95 sm:w-auto"
              style={{ color: "var(--primary)" }}
            >
              {cta_text}
            </a>
          )}
          {tel && (
            <a
              href={\`tel:\${tel}\`}
              className="w-full rounded-full border-2 border-white/60 py-4 px-8 text-base font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              📞 {tel}
            </a>
          )}
        </div>

        {/* Scroll hint */}
        <div className="mt-12 flex flex-col items-center gap-1 opacity-60 select-none">
          <span className="text-sm font-medium">↓ Узнать больше</span>
          <span className="animate-bounce text-lg">↓</span>
        </div>
      </div>
    </section>
  );
}
`;
  },

  about: (_s, _site) => `import { SiteSection } from "@/types";

export default function About({ section }: { section: SiteSection }) {
  const { title, text } = section.content as { title?: string; text?: string };
  return (
    <section className="px-4 py-20 bg-white sm:px-6 lg:px-8" id="about">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 h-1 w-12 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
        {title && (
          <h2 className="mb-6 text-2xl font-black leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {title}
          </h2>
        )}
        {text && (
          <p className="text-lg leading-relaxed text-slate-600 whitespace-pre-line max-w-3xl">
            {text}
          </p>
        )}
      </div>
    </section>
  );
}
`,

  services: (_s, _site) => `import { SiteSection } from "@/types";

const ICONS = ["✦", "◈", "◆", "⬡", "◉", "⬟"];

export default function Services({ section }: { section: SiteSection }) {
  const { title, items } = section.content as { title?: string; items?: string[] };
  if (!items?.length) return null;
  return (
    <section className="px-4 py-20 bg-slate-50 sm:px-6 lg:px-8" id="services">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 h-1 w-12 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
        {title && (
          <h2 className="mb-10 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {ICONS[i % ICONS.length]}
              </div>
              <p className="font-bold text-slate-800 leading-snug">{item}</p>
              <div
                className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: "var(--secondary)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

  gallery: (s, _site) => {
    const displayMode = (s.content as { display_mode?: string }).display_mode ?? "contain";
    const objFit = displayMode === "cover" ? "object-cover" : "object-contain";
    return `import { SiteSection } from "@/types";
import Image from "next/image";

type GalleryImg = { url: string; title?: string; description?: string; main?: boolean };

export default function Gallery({ section }: { section: SiteSection }) {
  const { title, images: rawImages } = section.content as { title?: string; images?: (string | GalleryImg)[] };
  if (!rawImages?.length) return null;
  const images: GalleryImg[] = rawImages.map((i) => typeof i === "string" ? { url: i } : i);
  const mainImg = images.find((i) => i.main) ?? images[0];
  const rest = images.filter((i) => i !== mainImg);
  return (
    <section className="px-4 py-20 bg-white sm:px-6 lg:px-8" id="gallery">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 h-1 w-12 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
        {title && (
          <h2 className="mb-10 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">{title}</h2>
        )}
        <div className="space-y-3">
          {mainImg && (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
              <Image src={mainImg.url} alt={mainImg.title ?? title ?? "Галерея"} fill className="${objFit}" />
            </div>
          )}
          {rest.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {rest.slice(0, 8).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 transition hover:scale-[1.02]">
                  <Image src={img.url} alt={img.title ?? \`Фото \${i + 2}\`} fill className="${objFit}" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
`;
  },

  reviews: (_s, _site) => `import { SiteSection } from "@/types";

type Review = { author: string; text: string; rating: number };

export default function Reviews({ section }: { section: SiteSection }) {
  const { title, items } = section.content as { title?: string; items?: Review[] };
  if (!items?.length) return null;
  return (
    <section className="px-4 py-20 bg-slate-50 sm:px-6 lg:px-8" id="reviews">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 h-1 w-12 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
        {title && (
          <h2 className="mb-4 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">{title}</h2>
        )}
        <p className="mb-8 text-base font-semibold text-slate-500">⭐ 4.9 из 5 — на основе отзывов клиентов</p>
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((r, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} className="h-5 w-5" viewBox="0 0 20 20" fill={j < (r.rating ?? 5) ? "var(--primary)" : "#e2e8f0"}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="mt-4 leading-relaxed text-slate-600">«{r.text}»</p>
              <p className="mt-5 text-sm font-bold text-slate-700">— {r.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

  faq: (_s, _site) => `"use client";
import { useState } from "react";
import { SiteSection } from "@/types";

type FAQItem = { question: string; answer: string };

export default function FAQ({ section }: { section: SiteSection }) {
  const { title, items } = section.content as { title?: string; items?: FAQItem[] };
  const [open, setOpen] = useState<number | null>(null);
  if (!items?.length) return null;
  return (
    <section className="px-4 py-20 bg-white sm:px-6 lg:px-8 overflow-x-hidden" id="faq">
      <div className="mx-auto max-w-3xl w-full">
        <div className="mb-3 h-1 w-12 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
        {title && (
          <h2 className="mb-10 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">{title}</h2>
        )}
        <div className="space-y-3">
          {items.map((f, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 transition-shadow hover:shadow-sm">
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-bold text-slate-800 hover:bg-slate-50"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-base leading-snug">{f.question}</span>
                <span
                  className="shrink-0 text-xl font-black transition-transform duration-200"
                  style={{ color: "var(--primary)", transform: open === i ? "rotate(45deg)" : "none" }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="border-t border-slate-100 px-6 py-5 text-slate-600 leading-relaxed">
                  {f.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

  pricing: (_s, site) => {
    const ctaHref = JSON.stringify(resolveContactLink(site.contact_link ?? "", site.contacts));
    return `import { SiteSection } from "@/types";

type Plan = { name: string; price: string; features: string[] };

export default function Pricing({ section }: { section: SiteSection }) {
  const { title, plans } = section.content as { title?: string; plans?: Plan[] };
  if (!plans?.length) return null;
  return (
    <section className="px-4 py-20 bg-slate-50 sm:px-6 lg:px-8" id="pricing">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 h-1 w-12 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
        {title && (
          <h2 className="mb-10 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">{title}</h2>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {plans.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              style={i === 1 ? { borderColor: "var(--primary)", borderWidth: 2 } : { borderColor: "#e2e8f0" }}
            >
              {i === 1 && (
                <p className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>
                  Популярный
                </p>
              )}
              <p className="text-lg font-bold text-slate-800">{p.name}</p>
              <p className="mt-2 text-4xl font-black" style={{ color: "var(--primary)" }}>{p.price}</p>
              <ul className="mt-6 space-y-3">
                {(p.features ?? []).map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-0.5 shrink-0 font-bold" style={{ color: "var(--primary)" }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={${ctaHref}}
                className="mt-7 block rounded-full py-3 text-center text-sm font-bold transition hover:opacity-80"
                style={i === 1
                  ? { backgroundColor: "var(--primary)", color: "white" }
                  : { backgroundColor: "#f1f5f9", color: "var(--primary)" }}
              >
                Выбрать
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
  },

  cta: (_s, site) => {
    const ctaHref = JSON.stringify(resolveContactLink(site.contact_link ?? "", site.contacts));
    return `import { SiteSection } from "@/types";

export default function CTA({ section }: { section: SiteSection }) {
  const { title, subtitle, cta_text } = section.content as {
    title?: string; subtitle?: string; cta_text?: string;
  };
  return (
    <section
      className="relative overflow-hidden px-4 py-24 text-center text-white sm:px-6 lg:px-8"
      style={{ background: \`linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--secondary) 80%, #7c3aed) 100%)\` }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-60 w-60 rounded-full bg-black/15 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-2xl">
        {title && <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl">{title}</h2>}
        {subtitle && <p className="mt-4 text-base opacity-85 sm:text-lg">{subtitle}</p>}
        {cta_text && (
          <a
            href={${ctaHref}}
            className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 px-8 text-lg font-bold shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl active:scale-95 sm:w-auto sm:px-12"
            style={{ color: "var(--primary)" }}
          >
            {cta_text} →
          </a>
        )}
      </div>
    </section>
  );
}
`;
  },

  contacts: (_s, _site) => `import { SiteSection } from "@/types";

function fmtHours(raw?: string | null): string {
  if (!raw) return "";
  try {
    const s = JSON.parse(raw) as Record<string, { open: string; close: string; closed: boolean }>;
    if (!s.mon) return raw;
    const DAYS = ["mon","tue","wed","thu","fri","sat","sun"] as const;
    const LABELS: Record<string, string> = { mon:"Пн",tue:"Вт",wed:"Ср",thu:"Чт",fri:"Пт",sat:"Сб",sun:"Вс" };
    const groups: string[] = [];
    let i = 0;
    while (i < DAYS.length) {
      const key = DAYS[i]; const day = s[key]; let j = i + 1;
      while (j < DAYS.length) { const n = s[DAYS[j]]; if (n.closed !== day.closed || n.open !== day.open || n.close !== day.close) break; j++; }
      const range = j - i > 1 ? \`\${LABELS[DAYS[i]]}–\${LABELS[DAYS[j-1]]}\` : LABELS[key];
      groups.push(day.closed ? \`\${range}: выходной\` : \`\${range}: \${day.open}–\${day.close}\`);
      i = j;
    }
    return groups.join(", ");
  } catch { return raw; }
}

export default function Contacts({ section }: { section: SiteSection }) {
  const { title, phone, email, telegram, whatsapp, address, working_hours } = section.content as {
    title?: string; phone?: string; email?: string; telegram?: string; whatsapp?: string;
    address?: string; working_hours?: string;
  };
  const hoursDisplay = fmtHours(working_hours);
  const items = [
    phone && { icon: "📞", label: "Телефон", value: phone, href: \`tel:\${phone}\` },
    email && { icon: "✉️", label: "Email", value: email, href: \`mailto:\${email}\` },
    telegram && { icon: "💬", label: "Telegram", value: telegram, href: \`https://t.me/\${telegram.replace("@", "")}\` },
    whatsapp && { icon: "📱", label: "WhatsApp", value: whatsapp, href: \`https://wa.me/\${whatsapp.replace(/[^0-9]/g, "")}\` },
    address && { icon: "📍", label: "Адрес", value: address, href: null },
    hoursDisplay && { icon: "🕐", label: "Режим работы", value: hoursDisplay, href: null },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string | null }[];

  return (
    <section className="px-4 py-20 bg-white sm:px-6 lg:px-8" id="contacts">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 h-1 w-12 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
        {title && (
          <h2 className="mb-10 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">{title}</h2>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <div key={i} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, white)" }}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{item.label}</p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-1 font-bold text-slate-800 hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 font-semibold text-slate-700">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

  map: (_s, _site) => `import { SiteSection } from "@/types";

function buildYandexEmbed(address: string): string {
  return \`https://yandex.ru/map-widget/v1/?text=\${encodeURIComponent(address)}&z=15&lang=ru_RU\`;
}

function buildYandexLink(address: string): string {
  return \`https://yandex.ru/maps/?text=\${encodeURIComponent(address)}\`;
}

function buildGoogleLink(address: string): string {
  return \`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(address)}\`;
}

export default function Map({ section }: { section: SiteSection }) {
  const { title, address, embed_url } = section.content as {
    title?: string; address?: string; embed_url?: string;
  };
  const src = embed_url || (address ? buildYandexEmbed(address) : null);
  return (
    <section className="px-4 py-20 bg-slate-50 sm:px-6 lg:px-8" id="map">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 h-1 w-12 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
        {title && <h2 className="mb-4 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">{title}</h2>}
        {address && <p className="mb-6 text-slate-600">📍 {address}</p>}
        {src ? (
          <div className="overflow-hidden rounded-2xl shadow-sm">
            <iframe
              src={src}
              className="h-80 w-full border-0"
              loading="lazy"
              allowFullScreen
              title="Карта"
            />
          </div>
        ) : (
          <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
            Укажите адрес для отображения карты
          </div>
        )}
        {address && (
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={buildYandexLink(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              🗺 Открыть в Яндекс.Картах
            </a>
            <a
              href={buildGoogleLink(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              📍 Построить маршрут
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
`,

  footer: (s, _site) => {
    const phone = (s.content as { phone?: string }).phone ?? "";
    const email = (s.content as { email?: string }).email ?? "";
    const phoneStr = JSON.stringify(phone);
    const emailStr = JSON.stringify(email);
    return `import { SiteSection } from "@/types";

export default function Footer({ section }: { section: SiteSection }) {
  const { company_name, links, phone, email } = section.content as {
    company_name?: string; links?: string[]; phone?: string; email?: string;
  };
  const tel = phone || ${phoneStr};
  const mail = email || ${emailStr};
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 px-4 pt-12 pb-8 text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <span className="text-lg font-black" style={{ color: "var(--primary)" }}>
              {company_name}
            </span>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              Профессиональные услуги для вашего бизнеса
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {tel && (
                <a href={\`tel:\${tel}\`} className="text-sm text-slate-400 hover:text-white transition">
                  📞 {tel}
                </a>
              )}
              {mail && (
                <a href={\`mailto:\${mail}\`} className="text-sm text-slate-400 hover:text-white transition">
                  ✉️ {mail}
                </a>
              )}
            </div>
          </div>
          {(links ?? []).length > 0 && (
            <div className="lg:col-span-2 flex flex-wrap gap-x-8 gap-y-2 lg:justify-end lg:items-start">
              {(links ?? []).map((l, i) => (
                <span key={i} className="text-sm text-slate-500 hover:text-slate-300 cursor-pointer transition">
                  {l}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom strip */}
        <div className="mt-10 border-t border-slate-800 pt-6 space-y-3">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-slate-600">
              © {year} {company_name}. Все права защищены.
            </p>
            <p className="text-xs text-slate-700">
              Создано в{" "}
              <span className="text-slate-500">Vibecode Studio</span>
            </p>
          </div>
          <div className="text-center text-xs text-slate-700">
            Нажимая на кнопки, вы соглашаетесь с{" "}
            <a href="/privacy" className="text-slate-500 underline hover:text-slate-300 transition">
              политикой конфиденциальности
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
`;
  },
};

// ── Legal generators ──────────────────────────────────────────────────────────

function genCookieBanner(): string {
  return `"use client";
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 px-4">
      <div className="flex flex-col gap-3 rounded-xl bg-slate-900 px-5 py-4 shadow-xl ring-1 ring-white/10 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-slate-300">
          Мы используем cookies для улучшения работы сайта.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={accept}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Принять
          </button>
          <button
            onClick={decline}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>
  );
}
`;
}

function genPrivacyPage(site: SiteJson): string {
  const company = site.company.name || "Компания";
  const email = site.contacts.email || "";
  const phone = site.contacts.phone || "";
  return `export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-black text-slate-900">
        Политика конфиденциальности
      </h1>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
        <section>
          <h2 className="text-xl font-bold text-slate-800">1. Сбор данных</h2>
          <p>
            ${company} собирает персональные данные, которые вы предоставляете при заполнении
            форм на сайте: имя, номер телефона, адрес электронной почты и иные контактные
            сведения, необходимые для обработки вашего обращения.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">2. Цели обработки</h2>
          <p>
            Собранные данные используются исключительно для обратной связи с вами, оказания
            запрошенных услуг и улучшения качества обслуживания. Мы не передаём ваши данные
            третьим лицам без вашего согласия, за исключением случаев, предусмотренных
            действующим законодательством Российской Федерации.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">3. Cookies</h2>
          <p>
            Сайт использует файлы cookies для корректной работы и улучшения пользовательского
            опыта. Вы можете отключить cookies в настройках браузера, однако это может повлиять
            на функциональность сайта.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">4. Хранение данных</h2>
          <p>
            Персональные данные хранятся на защищённых серверах и не дольше, чем это необходимо
            для достижения целей обработки. По истечении срока хранения данные уничтожаются.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">5. Права пользователя</h2>
          <p>
            Вы вправе запросить доступ к своим персональным данным, их исправление или удаление,
            а также отозвать согласие на обработку в любой момент, направив запрос на наши
            контактные данные.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800">6. Контакты</h2>
          <p>
            По вопросам, связанным с обработкой персональных данных, обращайтесь:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Компания: ${company}</li>
            ${email ? `<li>Email: <a href="mailto:${email}" className="text-blue-600 hover:underline">${email}</a></li>` : ""}
            ${phone ? `<li>Телефон: <a href="tel:${phone}" className="text-blue-600 hover:underline">${phone}</a></li>` : ""}
          </ul>
        </section>
      </div>
    </main>
  );
}
`;
}

// ── File generators ───────────────────────────────────────────────────────────

function genPackageJson(siteName: string): string {
  return JSON.stringify({
    name: siteName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "my-site",
    version: "0.1.0",
    private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start" },
    dependencies: {
      next: "14.2.30",
      react: "^18",
      "react-dom": "^18",
    },
    devDependencies: {
      "@types/node": "^20",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      autoprefixer: "^10",
      postcss: "^8",
      tailwindcss: "^3",
      typescript: "^5",
    },
  }, null, 2);
}

function genNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
`;
}

function genTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  }, null, 2);
}

function genTailwindConfig(primary: string, secondary: string): string {
  return `import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "${primary}",
        secondary: "${secondary}",
      },
    },
  },
  plugins: [],
};

export default config;
`;
}

function genPostcssConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

const FONT_IMPORTS: Record<string, string> = {
  Inter:       "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  Manrope:     "https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap",
  Montserrat:  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap",
  Roboto:      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  "Open Sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap",
};

function genGlobalsCSS(primary: string, secondary: string, font?: string): string {
  const fontImport = font && FONT_IMPORTS[font]
    ? `@import url("${FONT_IMPORTS[font]}");\n`
    : "";
  const fontFamily = font && font !== "Inter"
    ? `  --font: "${font}", sans-serif;`
    : `  --font: "Inter", "system-ui", sans-serif;`;

  return `${fontImport}@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: ${primary};
  --secondary: ${secondary};
${fontFamily}
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font);
}

button, a {
  touch-action: manipulation;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;
}

function genTypes(): string {
  return `export type SiteSection = {
  id: string;
  type: string;
  enabled: boolean;
  content: Record<string, unknown>;
};
`;
}

function genLayout(site: SiteJson, hasNav: boolean, hasMobileCTA: boolean): string {
  const title = JSON.stringify(site.meta.title || site.company.name || "Сайт компании");
  const description = JSON.stringify(site.meta.description || site.company.description || "");
  const domain = site.meta.domain ? `https://${site.meta.domain}` : "";
  const ogImage = domain ? `${domain}/og-image.jpg` : "";

  return `import type { Metadata } from "next";
import "./globals.css";
${hasNav ? `import Navigation from "@/components/Navigation";` : ""}
${hasMobileCTA ? `import MobileCTA from "@/components/MobileCTA";` : ""}
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: ${title},
  description: ${description},
  ${domain ? `metadataBase: new URL(${JSON.stringify(domain)}),` : ""}
  openGraph: {
    title: ${title},
    description: ${description},
    type: "website",
    locale: "ru_RU",
    ${ogImage ? `images: [{ url: ${JSON.stringify(ogImage)} }],` : ""}
  },
  twitter: {
    card: "summary_large_image",
    title: ${title},
    description: ${description},
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-slate-900 antialiased">
        ${hasNav ? `<Navigation />` : ""}
        <div${hasNav ? ` className="pt-[72px]"` : ""}>{children}</div>
        ${hasMobileCTA ? `<MobileCTA />` : ""}
        <CookieBanner />
      </body>
    </html>
  );
}
`;
}

function genPage(sections: SiteSection[]): string {
  const enabled = sections.filter((s) => s.enabled);

  // Deduplicate imports — multiple sections of same type share one component file
  const seenTypes = new Set<string>();
  const imports = enabled
    .filter((s) => {
      const name = s.type.charAt(0).toUpperCase() + s.type.slice(1);
      if (seenTypes.has(name)) return false;
      seenTypes.add(name);
      return true;
    })
    .map((s) => {
      const name = s.type.charAt(0).toUpperCase() + s.type.slice(1);
      return `import ${name} from "@/components/sections/${name}";`;
    })
    .join("\n");

  // Inline each section's data as a typed constant to avoid JSON module import issues
  const sectionConstants = enabled
    .map((s, i) => {
      const varName = `section${i}`;
      return `const ${varName}: SiteSection = ${JSON.stringify(s)};`;
    })
    .join("\n");

  const sectionComponents = enabled
    .map((s, i) => {
      const name = s.type.charAt(0).toUpperCase() + s.type.slice(1);
      return `      <${name} section={section${i}} />`;
    })
    .join("\n");

  return `import type { SiteSection } from "@/types";
${imports}

${sectionConstants}

export default function Home() {
  return (
    <main>
${sectionComponents}
    </main>
  );
}
`;
}

function genReadme(site: SiteJson): string {
  return `# ${site.company.name || "Сайт компании"}

Сгенерировано — [Vibecode Studio](https://vibecode-studio-pink.vercel.app)

## Запуск

\`\`\`bash
npm install
npm run dev
\`\`\`

Откройте [http://localhost:3000](http://localhost:3000)

## Деплой

\`\`\`bash
npm run build
npm start
\`\`\`

Или задеплойте на [Vercel](https://vercel.com).
`;
}

// ── Main generator ─────────────────────────────────────────────────────────────

export function generateProject(site: SiteJson): Record<string, string> {
  const files: Record<string, string> = {};
  const primary = site.branding.primary || "#6366f1";
  const secondary = site.branding.secondary || "#8b5cf6";
  const enabledSections = site.sections.filter((s) => s.enabled);

  const hasNav = enabledSections.some((s) => SECTION_NAV[s.type as SectionType]);
  const hasMobileCTA = !!(site.contacts.phone || site.contacts.telegram);

  // Config files
  files["package.json"] = genPackageJson(site.company.name);
  files["next.config.mjs"] = genNextConfig();
  files["tsconfig.json"] = genTsConfig();
  files["tailwind.config.ts"] = genTailwindConfig(primary, secondary);
  files["postcss.config.js"] = genPostcssConfig();
  files[".gitignore"] = "node_modules\n.next\n.env.local\n";
  files["README.md"] = genReadme(site);

  // Types
  files["types/index.ts"] = genTypes();

  // Content
  files["content/site.json"] = JSON.stringify(site, null, 2);

  // App shell
  files["app/layout.tsx"] = genLayout(site, hasNav, hasMobileCTA);
  files["app/page.tsx"] = genPage(enabledSections);
  files["app/globals.css"] = genGlobalsCSS(primary, secondary, site.font);

  // Navigation
  if (hasNav) {
    files["components/Navigation.tsx"] = genNavigation(site, enabledSections);
  }

  // Sticky mobile CTA
  if (hasMobileCTA) {
    files["components/MobileCTA.tsx"] = genStickyMobileCTA(site.contacts);
  }

  // Legal compliance
  files["components/CookieBanner.tsx"] = genCookieBanner();
  files["app/privacy/page.tsx"] = genPrivacyPage(site);

  // Section components
  for (const section of enabledSections) {
    const type = section.type as SectionType;
    const tpl = COMPONENT_TEMPLATES[type];
    if (tpl) {
      const name = type.charAt(0).toUpperCase() + type.slice(1);
      files[`components/sections/${name}.tsx`] = tpl(section, site);
    }
  }

  // Public placeholder
  files["public/.gitkeep"] = "";

  return files;
}
