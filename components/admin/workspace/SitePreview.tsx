import { BuildData } from "@/lib/build/buildOrderSite";
import { SiteSection } from "@/types/sections";
import { formatWorkingHours } from "@/lib/utils/workingHours";

type PreviewDevice = "desktop" | "mobile";

const DEVICE_WIDTH: Record<PreviewDevice, string> = {
  desktop: "100%",
  mobile: "375px",
};

const ICONS = ["✦", "◈", "◆", "⬡", "◉", "⬟"];

function s(v: unknown): string { return v != null ? String(v) : ""; }

function resolveCtaHref(contactLink?: string): string {
  if (!contactLink) return "#contacts";
  if (contactLink.startsWith("tel:") || contactLink.startsWith("http") || contactLink.startsWith("https://")) return contactLink;
  return contactLink;
}

function SectionHero({ content, primary, secondary, contactLink }: { content: Record<string, unknown>; primary: string; secondary: string; contactLink?: string }) {
  const href = s(content.contact_link) || contactLink || "#contacts";
  return (
    <div
      className="relative px-6 py-16 text-white sm:px-8 sm:py-20"
      style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
    >
      <div className="relative mx-auto max-w-4xl">
        {!!content.title && (
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl break-words">{s(content.title)}</h1>
        )}
        {!!content.subtitle && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed opacity-85 sm:text-base">{s(content.subtitle)}</p>
        )}
        {!!content.cta_text && (
          <div className="mt-8">
            <a
              href={resolveCtaHref(href)}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold shadow-lg transition hover:opacity-90"
              style={{ backgroundColor: "white", color: primary }}
            >
              {s(content.cta_text)}
            </a>
          </div>
        )}
        <div className="mt-10 flex flex-wrap gap-4 opacity-70">
          {[{ icon: "⭐", text: "5.0 рейтинг" }, { icon: "✓", text: "Гарантия" }, { icon: "🚀", text: "Быстро" }].map((b) => (
            <div key={b.text} className="flex items-center gap-1.5 text-xs font-semibold">
              <span>{b.icon}</span><span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionAbout({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  return (
    <div className="px-8 py-14 bg-white border-b border-slate-100">
      <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: primary }} />
      {!!content.title && <h2 className="mb-5 text-2xl font-black text-slate-900">{s(content.title)}</h2>}
      {!!content.text && <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line max-w-3xl">{s(content.text)}</p>}
    </div>
  );
}

function SectionServices({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  const items = (content.items as string[]) ?? [];
  return (
    <div className="px-8 py-14 bg-slate-50 border-b border-slate-100">
      <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: primary }} />
      {!!content.title && <h2 className="mb-7 text-2xl font-black text-slate-900">{s(content.title)}</h2>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-lg text-white"
              style={{ backgroundColor: primary }}
            >
              {ICONS[i % ICONS.length]}
            </div>
            <p className="font-bold text-slate-800 leading-snug">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionGallery({ content }: { content: Record<string, unknown> }) {
  const images = (content.images as string[]) ?? [];
  return (
    <div className="px-8 py-14 bg-white border-b border-slate-100">
      {!!content.title && <h2 className="mb-7 text-2xl font-black text-slate-900">{s(content.title)}</h2>}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={img}
              alt=""
              className="rounded-2xl w-full aspect-video object-contain bg-slate-50"
              onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='128'%3E%3Crect width='200' height='128' rx='16' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='%23cbd5e1'%3E🖼%3C/text%3E%3C/svg%3E"; }}
            />
          ))}
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
    <div className="px-8 py-14 bg-slate-50 border-b border-slate-100">
      <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: primary }} />
      {!!content.title && <h2 className="mb-7 text-2xl font-black text-slate-900">{s(content.title)}</h2>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((r, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <svg key={j} className="h-4 w-4" viewBox="0 0 20 20" fill={j < (r.rating ?? 5) ? primary : "#e2e8f0"}>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">«{r.text}»</p>
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
      <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: primary }} />
      {!!content.title && <h2 className="mb-7 text-2xl font-black text-slate-900">{s(content.title)}</h2>}
      <div className="space-y-3 max-w-3xl">
        {items.map((f, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <p className="font-bold text-slate-800 text-sm">{f.question}</p>
              <span className="text-xl font-black shrink-0" style={{ color: primary }}>+</span>
            </div>
            <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600">{f.answer}</div>
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
    <div className="px-8 py-14 bg-slate-50 border-b border-slate-100">
      <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: primary }} />
      {!!content.title && <h2 className="mb-7 text-2xl font-black text-slate-900">{s(content.title)}</h2>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
      {!!content.title && <h2 className="text-3xl font-black">{s(content.title)}</h2>}
      {!!content.subtitle && <p className="mt-3 text-base opacity-80">{s(content.subtitle)}</p>}
      {!!content.cta_text && (
        <a
          href={href}
          className="mt-8 inline-flex items-center gap-2 rounded-full px-10 py-4 text-sm font-bold shadow-lg transition hover:opacity-90"
          style={{ backgroundColor: "white", color: primary }}
        >
          {s(content.cta_text)} →
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
      <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: primary }} />
      {!!content.title && <h2 className="mb-7 text-2xl font-black text-slate-900">{s(content.title)}</h2>}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
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
      <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: primary }} />
      {!!content.title && <h2 className="mb-4 text-2xl font-black text-slate-900">{s(content.title)}</h2>}
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

const FONT_FAMILIES: Record<string, string> = {
  Inter: '"Inter", system-ui, sans-serif',
  Manrope: '"Manrope", system-ui, sans-serif',
  Montserrat: '"Montserrat", system-ui, sans-serif',
  Roboto: '"Roboto", system-ui, sans-serif',
  "Open Sans": '"Open Sans", system-ui, sans-serif',
  "PT Sans": '"PT Sans", system-ui, sans-serif',
};

export default function SitePreview({
  data,
  sections,
  device = "desktop",
}: {
  data: BuildData;
  sections?: SiteSection[];
  device?: PreviewDevice;
}) {
  const primary = data.branding.primary_color || "#6366f1";
  const secondary = data.branding.secondary_color || "#8b5cf6";
  const contactLink = data.content.contact_link;
  const fontFamily = data.font ? (FONT_FAMILIES[data.font] ?? data.font) : undefined;

  return (
    <div
      className="mx-auto transition-all duration-300"
      style={{ maxWidth: DEVICE_WIDTH[device], width: "100%" }}
    >
      <div
        className="overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-900 shadow-2xl"
        style={fontFamily ? { fontFamily } : undefined}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-400">
            {data.content.domain_name ? `https://${data.content.domain_name}` : `preview — ${data.meta.template_name}`}
          </div>
          {device !== "desktop" && (
            <span className="text-xs text-slate-400">375px</span>
          )}
        </div>

        {/* Content */}
        <div>
          {sections && sections.length > 0
            ? sections.filter((s) => s.enabled).map((s) => renderSection(s, primary, secondary, contactLink))
            : (
              /* Fallback when no sections configured yet */
              <>
                <SectionHero
                  content={{ title: data.company.name || "Название компании", subtitle: data.company.description, cta_text: data.content.hero_cta }}
                  primary={primary} secondary={secondary} contactLink={contactLink}
                />
                {data.services.length > 0 && (
                  <SectionServices content={{ title: "Наши услуги", items: data.services }} primary={primary} />
                )}
                {(data.contacts.phone || data.contacts.email || data.contacts.telegram || data.company.address) && (
                  <SectionContacts
                    content={{ title: "Контакты", phone: data.contacts.phone, email: data.contacts.email, telegram: data.contacts.telegram, address: data.company.address, working_hours: data.company.working_hours }}
                    primary={primary}
                  />
                )}
                <SectionFooter content={{ company_name: data.company.name }} primary={primary} />
              </>
            )
          }
        </div>
      </div>
    </div>
  );
}
