"use client";
// Must be a Client Component: SectionGallery passes onError handlers to <img>.
// Event-handler props can't be passed to host elements during a Server
// Component render — doing so throws ("A server error occurred"), which is why
// the preview crashed whenever a gallery section had images.
import { BuildData } from "@/lib/build/buildOrderSite";
import { SiteSection } from "@/types/sections";
import { formatWorkingHours } from "@/lib/utils/workingHours";
import { DESIGN_THEMES, fontStack, googleFontsHref } from "@/lib/export/designThemes";

type PreviewDevice = "desktop" | "mobile";

const DEVICE_WIDTH: Record<PreviewDevice, string> = {
  desktop: "100%",
  mobile: "375px",
};

const ICONS = ["✦", "◈", "◆", "⬡", "◉", "⬟"];

function s(v: unknown): string { return v != null ? String(v) : ""; }

// Coerce any list item (string or object like {name,title,text,label}) to a
// display string so React never receives an object as a child (→ 500 error).
function itemText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return s(o.name ?? o.title ?? o.label ?? o.text ?? o.value ?? "");
  }
  return String(v);
}

function resolveCtaHref(contactLink?: string): string {
  if (!contactLink) return "#contacts";
  if (contactLink.startsWith("tel:") || contactLink.startsWith("http") || contactLink.startsWith("https://")) return contactLink;
  return contactLink;
}

function ctaIcon(href: string): string {
  if (href.includes("t.me") || href.includes("telegram")) return "💬 ";
  if (href.includes("wa.me") || href.includes("whatsapp")) return "📱 ";
  if (href.includes("vk.com")) return "VK ";
  if (href.startsWith("tel:")) return "📞 ";
  if (href.startsWith("http")) return "🌐 ";
  return "";
}

function SectionHero({ content, primary, secondary, contactLink }: { content: Record<string, unknown>; primary: string; secondary: string; contactLink?: string }) {
  const href = resolveCtaHref(s(content.contact_link) || contactLink);
  const heroImage = s(content.heroImage);
  return (
    <div
      className="relative overflow-hidden px-6 py-24 sm:px-8 sm:py-28"
      style={{ background: "linear-gradient(165deg, color-mix(in srgb, var(--bg-surface) 65%, var(--grad-from) 14%), var(--bg-base))", color: "var(--text-primary)" }}
    >
      {heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
      )}
      {/* Animated glow orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="vp-orb absolute -top-24 left-[8%] h-80 w-80 rounded-full blur-3xl" style={{ background: "var(--glow-primary)" }} />
        <div className="vp-orb absolute -bottom-28 right-[6%] h-72 w-72 rounded-full blur-3xl" style={{ background: "var(--glow-secondary)", animationDirection: "reverse" }} />
      </div>
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap gap-2">
          {[{ icon: "★", text: "5.0 рейтинг" }, { icon: "✓", text: "Гарантия" }, { icon: "🚀", text: "Быстро" }].map((b) => (
            <span key={b.text} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm" style={{ borderColor: "var(--bg-border)", background: "color-mix(in srgb, var(--bg-surface) 60%, transparent)" }}>
              <span>{b.icon}</span><span>{b.text}</span>
            </span>
          ))}
        </div>
        {!!content.title && (
          <h1 className="grad-text text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-6xl break-words whitespace-pre-line">{s(content.title)}</h1>
        )}
        {!!content.subtitle && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed sm:text-lg whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{s(content.subtitle)}</p>
        )}
        {!!content.cta_text && (
          <div className="mt-8">
            <a href={href} className="btn-grad inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition hover:-translate-y-0.5">
              {ctaIcon(href)}{s(content.cta_text)}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionAbout({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  return (
    <div className="px-4 py-12 bg-white border-b border-slate-100 sm:px-8 sm:py-14">
      <div className="vp-accent" />
      {!!content.title && <h2 className="mb-4 text-xl font-black text-slate-900 whitespace-pre-line sm:mb-5 sm:text-2xl">{s(content.title)}</h2>}
      {!!content.text && <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line max-w-3xl">{s(content.text)}</p>}
    </div>
  );
}

function SectionServices({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  const items = ((content.items as unknown[]) ?? []).map(itemText).filter(Boolean);
  return (
    <div className="px-4 py-12 bg-slate-50 border-b border-slate-100 sm:px-8 sm:py-14">
      <div className="vp-accent" />
      {!!content.title && <h2 className="mb-6 text-xl font-black text-slate-900 whitespace-pre-line sm:mb-7 sm:text-2xl">{s(content.title)}</h2>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="glow-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div
              className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl text-base text-white sm:h-10 sm:w-10 sm:text-lg"
              style={{ backgroundColor: primary }}
            >
              {ICONS[i % ICONS.length]}
            </div>
            <p className="text-sm font-bold text-slate-800 leading-snug sm:text-base whitespace-pre-line">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionGallery({ content }: { content: Record<string, unknown> }) {
  type GalleryImg = { url: string; title?: string; description?: string; main?: boolean };
  // Normalize: items may be plain URL strings or objects ({url}/{src}/{image}),
  // possibly mixed. Coerce each to a GalleryImg with a guaranteed string url and
  // drop anything without a usable url so the grid never renders broken <img>s.
  const rawImages = (content.images as unknown[]) ?? [];
  const images: GalleryImg[] = rawImages
    .map((i): GalleryImg => {
      if (typeof i === "string") return { url: i };
      if (i && typeof i === "object") {
        const o = i as Record<string, unknown>;
        const u = o.url ?? o.src ?? o.image ?? o.value;
        return { ...(o as GalleryImg), url: typeof u === "string" ? u : "" };
      }
      return { url: "" };
    })
    .filter((i) => !!i.url);
  const displayMode = (content.display_mode as string) ?? "contain";
  const imgClass = displayMode === "cover" ? "object-cover" : "object-contain bg-slate-50";
  const mainImg = images.find((i) => i.main) ?? images[0];
  const restImages = images.filter((i) => i !== mainImg);
  return (
    <div className="px-4 py-12 bg-white border-b border-slate-100 sm:px-8 sm:py-14">
      {!!content.title && <h2 className="mb-6 text-xl font-black text-slate-900 whitespace-pre-line sm:mb-7 sm:text-2xl">{s(content.title)}</h2>}
      {images.length > 0 ? (
        <div className="space-y-3">
          {mainImg && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainImg.url}
              alt={mainImg.title ?? ""}
              className={`w-full rounded-2xl aspect-video ${imgClass}`}
              onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='128'%3E%3Crect width='200' height='128' rx='16' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='%23cbd5e1'%3E🖼%3C/text%3E%3C/svg%3E"; }}
            />
          )}
          {restImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {restImages.slice(0, 8).map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img.url}
                  alt={img.title ?? ""}
                  className={`w-full rounded-xl aspect-square ${imgClass}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' rx='12' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%23cbd5e1'%3E🖼%3C/text%3E%3C/svg%3E"; }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 text-2xl">🖼</div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionReviews({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  const items = (content.items as { author: string; text: string; rating: number }[]) ?? [];
  return (
    <div className="px-4 py-12 bg-slate-50 border-b border-slate-100 sm:px-8 sm:py-14">
      <div className="vp-accent" />
      {!!content.title && <h2 className="mb-6 text-xl font-black text-slate-900 whitespace-pre-line sm:mb-7 sm:text-2xl">{s(content.title)}</h2>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((r, i) => (
          <div key={i} className="glow-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <svg key={j} className="h-4 w-4" viewBox="0 0 20 20" fill={j < (r.rating ?? 5) ? primary : "#e2e8f0"}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 whitespace-pre-line">«{r.text}»</p>
            <p className="mt-4 text-xs font-bold text-slate-700">— {r.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionFAQ({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  const items = (content.items as { question: string; answer: string }[]) ?? [];
  return (
    <div className="px-8 py-14 bg-white border-b border-slate-100">
      <div className="vp-accent" />
      {!!content.title && <h2 className="mb-7 text-2xl font-black text-slate-900 whitespace-pre-line">{s(content.title)}</h2>}
      <div className="space-y-3 max-w-3xl">
        {items.map((f, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <p className="font-bold text-slate-800 text-sm">{f.question}</p>
              <span className="text-xl font-black shrink-0" style={{ color: primary }}>+</span>
            </div>
            <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600 whitespace-pre-line">{f.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionPricing({ content, primary, contactLink }: { content: Record<string, unknown>; primary: string; contactLink?: string }) {
  const plans = (content.plans as { name: string; price: string; features: string[] }[]) ?? [];
  const href = resolveCtaHref(s(content.contact_link) || contactLink);
  return (
    <div className="px-4 py-12 bg-slate-50 border-b border-slate-100 sm:px-8 sm:py-14">
      <div className="vp-accent" />
      {!!content.title && <h2 className="mb-6 text-xl font-black text-slate-900 whitespace-pre-line sm:mb-7 sm:text-2xl">{s(content.title)}</h2>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((p, i) => (
          <div
            key={i}
            className="rounded-2xl border bg-white p-6 shadow-sm"
            style={i === 1 ? { borderColor: primary, borderWidth: 2 } : { borderColor: "#e2e8f0" }}
          >
            {i === 1 && (
              <span className="mb-3 inline-block rounded-full px-3 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: primary }}>
                Популярный
              </span>
            )}
            <p className="font-bold text-slate-800">{p.name}</p>
            <p className="mt-1 text-3xl font-black" style={{ color: primary }}>{p.price}</p>
            <ul className="mt-4 space-y-2">
              {(p.features ?? []).map((f, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="font-bold" style={{ color: primary }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href={href}
              className="mt-5 block rounded-full py-2.5 text-center text-xs font-bold transition hover:opacity-80"
              style={i === 1
                ? { backgroundColor: primary, color: "white" }
                : { backgroundColor: "#f1f5f9", color: primary }}
            >
              Выбрать
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionCTA({ content, primary, secondary, contactLink }: { content: Record<string, unknown>; primary: string; secondary: string; contactLink?: string }) {
  const href = resolveCtaHref(s(content.contact_link) || contactLink);
  return (
    <div
      className="px-8 py-20 text-center text-white"
      style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
    >
      {!!content.title && <h2 className="text-3xl font-black whitespace-pre-line">{s(content.title)}</h2>}
      {!!content.subtitle && <p className="mt-3 text-base opacity-80 whitespace-pre-line">{s(content.subtitle)}</p>}
      {!!content.cta_text && (
        <a
          href={href}
          className="mt-8 inline-flex items-center gap-2 rounded-full px-10 py-4 text-sm font-bold shadow-lg transition hover:opacity-90"
          style={{ backgroundColor: "white", color: primary }}
        >
          {ctaIcon(href)}{s(content.cta_text)}
        </a>
      )}
    </div>
  );
}

function SectionContacts({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  const items = [
    content.phone && { icon: "📞", label: "Телефон", value: s(content.phone) },
    content.email && { icon: "✉️", label: "Email", value: s(content.email) },
    content.telegram && { icon: "💬", label: "Telegram", value: s(content.telegram) },
    content.whatsapp && { icon: "📱", label: "WhatsApp", value: s(content.whatsapp) },
    content.address && { icon: "📍", label: "Адрес", value: s(content.address) },
    content.working_hours && { icon: "🕐", label: "Режим работы", value: formatWorkingHours(s(content.working_hours)) || s(content.working_hours) },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  return (
    <div className="px-8 py-14 bg-white border-b border-slate-100">
      <div className="vp-accent" />
      {!!content.title && <h2 className="mb-7 text-2xl font-black text-slate-900 whitespace-pre-line">{s(content.title)}</h2>}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} className="glow-card flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: `${primary}1a` }}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{item.label}</p>
              <p className="mt-1 font-bold text-slate-800" style={{ color: primary }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionMap({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  const embedUrl = (content.embed_url as string) ||
    (content.address ? `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(s(content.address))}&z=15&lang=ru_RU` : null);

  return (
    <div className="px-8 py-14 bg-slate-50 border-b border-slate-100">
      <div className="vp-accent" />
      {!!content.title && <h2 className="mb-4 text-2xl font-black text-slate-900 whitespace-pre-line">{s(content.title)}</h2>}
      {!!content.address && <p className="mb-5 text-sm text-slate-600">📍 {s(content.address)}</p>}
      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="h-64 w-full rounded-2xl border-0"
          loading="lazy"
          title="Карта"
        />
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-200 text-slate-400 text-sm">
          Введите адрес для отображения карты
        </div>
      )}
      {!!content.address && (
        <div className="mt-4 flex gap-3">
          <a
            href={`https://yandex.ru/maps/?text=${encodeURIComponent(s(content.address))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            🗺 Яндекс.Карты
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s(content.address))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            📍 Маршрут
          </a>
        </div>
      )}
    </div>
  );
}

function SectionFooter({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  return (
    <div className="bg-slate-900 px-8 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-base font-black" style={{ color: primary }}>
            {s(content.company_name || "Компания")}
          </span>
          <p className="mt-1 text-xs text-slate-500">Профессиональные услуги</p>
        </div>
        {(content.links as string[] ?? []).length > 0 && (
          <div className="flex flex-wrap gap-5">
            {(content.links as string[]).map((l, i) => (
              <span key={i} className="text-xs text-slate-500">{l}</span>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-600">
        © {new Date().getFullYear()} {s(content.company_name || "Компания")}. Все права защищены.
      </div>
    </div>
  );
}

function renderSection(section: SiteSection, primary: string, secondary: string, contactLink?: string) {
  const c = section.content;
  switch (section.type) {
    case "hero":     return <SectionHero     key={section.id} content={c} primary={primary} secondary={secondary} contactLink={contactLink} />;
    case "about":    return <SectionAbout    key={section.id} content={c} primary={primary} />;
    case "services": return <SectionServices key={section.id} content={c} primary={primary} />;
    case "gallery":  return <SectionGallery  key={section.id} content={c} />;
    case "reviews":  return <SectionReviews  key={section.id} content={c} primary={primary} />;
    case "faq":      return <SectionFAQ      key={section.id} content={c} primary={primary} />;
    case "pricing":  return <SectionPricing  key={section.id} content={c} primary={primary} contactLink={contactLink} />;
    case "cta":      return <SectionCTA      key={section.id} content={c} primary={primary} secondary={secondary} contactLink={contactLink} />;
    case "contacts": return <SectionContacts key={section.id} content={c} primary={primary} />;
    case "map":      return <SectionMap      key={section.id} content={c} primary={primary} />;
    case "footer":   return <SectionFooter   key={section.id} content={c} primary={primary} />;
    default:         return null;
  }
}

export default function SitePreview({
  data,
  sections,
  device = "desktop",
}: {
  data: BuildData;
  sections?: SiteSection[];
  device?: PreviewDevice;
}) {
  // Defensive: a stored site_builds.build_data snapshot may predate the current
  // BuildData shape, so any of these nested objects can be missing. Never let
  // the preview throw (→ "A server error occurred") because of an old build.
  const branding = data.branding ?? ({} as BuildData["branding"]);
  const content = data.content ?? ({} as BuildData["content"]);
  const company = data.company ?? ({} as BuildData["company"]);
  const contacts = data.contacts ?? ({} as BuildData["contacts"]);
  const meta = data.meta ?? ({} as BuildData["meta"]);
  const services = data.services ?? [];
  const primary = branding.primary_color || "#6366f1";
  const secondary = branding.secondary_color || "#8b5cf6";
  const contactLink = content.contact_link;
  const design = data.design ?? DESIGN_THEMES[0];
  const bodyFont = data.font || design.bodyFont;
  const t = data.theme ?? ({
    bgBase: "#0b1020", bgSurface: "#141b2e", bgBorder: "rgba(255,255,255,0.1)",
    textPrimary: "#f8fafc", textSecondary: "#cbd5e1",
    glowPrimary: "rgba(124,58,237,0.3)", glowSecondary: "rgba(34,211,238,0.22)",
    gradientFrom: primary, gradientTo: secondary,
  } as BuildData["theme"]);

  // Scoped theme CSS — applies the chosen visual theme (dark/light premium) by
  // setting tokens AND remapping the hardcoded section colours, so the preview
  // matches the real exported design instead of a flat light layout.
  const themeCss = `
    @import url("${googleFontsHref([design.headingFont, bodyFont])}");
    .vp { font-family: ${fontStack(bodyFont)};
      --primary: ${primary}; --secondary: ${secondary}; --glow: ${design.glow.toFixed(2)};
      --bg-base: ${t.bgBase}; --bg-surface: ${t.bgSurface}; --bg-border: ${t.bgBorder};
      --text-primary: ${t.textPrimary}; --text-secondary: ${t.textSecondary};
      --glow-primary: ${t.glowPrimary}; --glow-secondary: ${t.glowSecondary};
      --grad-from: ${t.gradientFrom}; --grad-to: ${t.gradientTo};
      position: relative; }
    .vp h1, .vp h2, .vp h3 { font-family: ${fontStack(design.headingFont)};${design.uppercaseHeads ? " text-transform: uppercase; letter-spacing: -0.01em;" : ""} }
    /* ── theme remap (scoped to the site, not the browser chrome) ── */
    .vp-site { background: var(--bg-base); color: var(--text-primary); }
    .vp-site .bg-white { background: var(--bg-surface) !important; }
    .vp-site .bg-slate-50 { background: var(--bg-base) !important; }
    .vp-site .bg-slate-100 { background: var(--bg-surface) !important; }
    .vp-site .bg-slate-900 { background: color-mix(in srgb, var(--bg-base) 80%, #000) !important; }
    .vp-site .bg-slate-200 { background: var(--bg-surface) !important; }
    .vp-site .text-slate-900, .vp-site .text-slate-800 { color: var(--text-primary) !important; }
    .vp-site .text-slate-700, .vp-site .text-slate-600, .vp-site .text-slate-500, .vp-site .text-slate-400, .vp-site .text-slate-300 { color: var(--text-secondary) !important; }
    .vp-site .border-slate-100, .vp-site .border-slate-200, .vp-site .border-slate-300 { border-color: var(--bg-border) !important; }
    .vp-accent { height: 5px; width: 48px; border-radius: 9999px; margin-bottom: 12px; background: linear-gradient(90deg, var(--grad-from), var(--grad-to)); box-shadow: 0 0 16px color-mix(in srgb, var(--grad-from) calc(70% * var(--glow)), transparent); }
    .vp .grad-text { background: linear-gradient(120deg, var(--text-primary), var(--grad-to)); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .vp .glow-card { transition: transform .3s ease, box-shadow .3s ease; }
    .vp .glow-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px var(--glow-primary); }
    .vp .btn-grad { background: linear-gradient(120deg, var(--grad-from), var(--grad-to)) !important; color: #fff !important; box-shadow: 0 12px 34px var(--glow-primary); }
    @keyframes vp-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(5%,7%) scale(1.1); } }
    .vp .vp-orb { animation: vp-float 16s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .vp * { animation: none !important; } }
  `;

  return (
    <div
      className="mx-auto transition-all duration-300"
      style={{ maxWidth: DEVICE_WIDTH[device], width: "100%" }}
    >
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      <div className="vp overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-900 shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-400">
            {content.domain_name ? `https://${content.domain_name}` : `preview — ${meta.template_name ?? ""}`}
          </div>
          {device !== "desktop" && (
            <span className="text-xs text-slate-400">375px</span>
          )}
        </div>

        {/* Content */}
        <div className="vp-site">
          {data.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <div className="flex items-center border-b border-slate-100 bg-white px-6 py-3">
              <img src={data.logo} alt="" className="h-8 w-auto object-contain" />
            </div>
          )}
          {sections && sections.length > 0
            ? sections.filter((s) => s.enabled !== false).map((s) => renderSection(s, primary, secondary, contactLink))
            : (
              /* Fallback when no sections configured yet */
              <>
                <SectionHero
                  content={{ title: company.name || "Название компании", subtitle: company.description, cta_text: content.hero_cta }}
                  primary={primary} secondary={secondary} contactLink={contactLink}
                />
                {services.length > 0 && (
                  <SectionServices content={{ title: "Наши услуги", items: services }} primary={primary} />
                )}
                {(contacts.phone || contacts.email || contacts.telegram || company.address) && (
                  <SectionContacts
                    content={{ title: "Контакты", phone: contacts.phone, email: contacts.email, telegram: contacts.telegram, address: company.address, working_hours: company.working_hours }}
                    primary={primary}
                  />
                )}
                <SectionFooter content={{ company_name: company.name }} primary={primary} />
              </>
            )
          }
        </div>
      </div>
    </div>
  );
}
