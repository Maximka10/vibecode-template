import { BuildData } from "@/lib/build/buildOrderSite";
import { SiteSection } from "@/types/sections";

type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTH: Record<PreviewDevice, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

function SectionHero({ content, primary, secondary }: { content: Record<string, unknown>; primary: string; secondary: string }) {
  return (
    <div className="px-8 py-14 text-white" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
      {!!(content.title || content.subtitle) && (
        <>
          <h1 className="text-3xl font-black leading-tight">{String(content.title || "Заголовок")}</h1>
          {!!content.subtitle && <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-85">{String(content.subtitle)}</p>}
        </>
      )}
      {!!content.cta_text && (
        <button className="mt-6 rounded-full border-2 border-white/40 bg-white/20 px-6 py-2 text-sm font-bold" style={{ cursor: "default" }}>
          {String(content.cta_text)}
        </button>
      )}
    </div>
  );
}

function SectionAbout({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  return (
    <div className="px-8 py-10 bg-white border-b border-slate-100">
      <h2 className="mb-4 text-xl font-bold text-slate-800" style={{ color: primary }}>{String(content.title || "О нас")}</h2>
      {!!content.text && <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{String(content.text)}</p>}
    </div>
  );
}

function SectionServices({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  const items = (content.items as string[]) ?? [];
  return (
    <div className="px-8 py-10 bg-slate-50 border-b border-slate-100">
      <h2 className="mb-5 text-xl font-bold text-slate-800">{String(content.title || "Наши услуги")}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 h-1 w-8 rounded-full" style={{ backgroundColor: primary }} />
            <p className="font-semibold text-slate-800">{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionGallery({ content }: { content: Record<string, unknown> }) {
  const images = (content.images as string[]) ?? [];
  return (
    <div className="px-8 py-10 bg-white border-b border-slate-100">
      <h2 className="mb-5 text-xl font-bold text-slate-800">{String(content.title || "Галерея")}</h2>
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={img} alt="" className="rounded-xl object-cover w-full h-32" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Нет изображений</p>
      )}
    </div>
  );
}

function SectionReviews({ content }: { content: Record<string, unknown> }) {
  const items = (content.items as { author: string; text: string; rating: number }[]) ?? [];
  return (
    <div className="px-8 py-10 bg-slate-50 border-b border-slate-100">
      <h2 className="mb-5 text-xl font-bold text-slate-800">{String(content.title || "Отзывы")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((r, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-yellow-500">{"★".repeat(r.rating ?? 5)}</p>
            <p className="mt-2 text-sm text-slate-600">{r.text}</p>
            <p className="mt-3 text-xs font-semibold text-slate-500">— {r.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionFAQ({ content }: { content: Record<string, unknown> }) {
  const items = (content.items as { question: string; answer: string }[]) ?? [];
  return (
    <div className="px-8 py-10 bg-white border-b border-slate-100">
      <h2 className="mb-5 text-xl font-bold text-slate-800">{String(content.title || "FAQ")}</h2>
      <div className="space-y-4">
        {items.map((f, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-800">{f.question}</p>
            <p className="mt-2 text-sm text-slate-600">{f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionPricing({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  const plans = (content.plans as { name: string; price: string; features: string[] }[]) ?? [];
  return (
    <div className="px-8 py-10 bg-slate-50 border-b border-slate-100">
      <h2 className="mb-5 text-xl font-bold text-slate-800">{String(content.title || "Цены")}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((p, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="font-bold text-slate-800">{p.name}</p>
            <p className="mt-1 text-2xl font-black" style={{ color: primary }}>{p.price}</p>
            <ul className="mt-3 space-y-1">
              {(p.features ?? []).map((f, j) => <li key={j} className="text-xs text-slate-600">✓ {f}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionCTA({ content, primary, secondary }: { content: Record<string, unknown>; primary: string; secondary: string }) {
  return (
    <div className="px-8 py-12 text-center text-white" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
      <h2 className="text-2xl font-black">{String(content.title || "Свяжитесь с нами")}</h2>
      {!!content.subtitle && <p className="mt-2 text-sm opacity-80">{String(content.subtitle)}</p>}
      {!!content.cta_text && (
        <button className="mt-6 rounded-full bg-white px-8 py-3 text-sm font-bold" style={{ color: primary, cursor: "default" }}>
          {String(content.cta_text)}
        </button>
      )}
    </div>
  );
}

function SectionContacts({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="px-8 py-10 bg-white border-b border-slate-100">
      <h2 className="mb-5 text-xl font-bold text-slate-800">{String(content.title || "Контакты")}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {!!content.phone && <div className="flex gap-3"><span>📞</span><div><p className="text-xs text-slate-400">Телефон</p><p className="font-semibold text-slate-700">{String(content.phone)}</p></div></div>}
        {!!content.email && <div className="flex gap-3"><span>✉️</span><div><p className="text-xs text-slate-400">Email</p><p className="font-semibold text-slate-700">{String(content.email)}</p></div></div>}
        {!!content.telegram && <div className="flex gap-3"><span>💬</span><div><p className="text-xs text-slate-400">Telegram</p><p className="font-semibold text-slate-700">{String(content.telegram)}</p></div></div>}
        {!!content.address && <div className="flex gap-3"><span>📍</span><div><p className="text-xs text-slate-400">Адрес</p><p className="font-semibold text-slate-700">{String(content.address)}</p></div></div>}
        {!!content.working_hours && <div className="flex gap-3"><span>🕐</span><div><p className="text-xs text-slate-400">Режим работы</p><p className="font-semibold text-slate-700">{String(content.working_hours)}</p></div></div>}
      </div>
    </div>
  );
}

function SectionMap({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="px-8 py-10 bg-slate-50 border-b border-slate-100">
      <h2 className="mb-4 text-xl font-bold text-slate-800">{String(content.title || "Как нас найти")}</h2>
      {!!content.address && <p className="text-sm text-slate-600 mb-3">📍 {String(content.address)}</p>}
      <div className="h-40 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-sm">
        Карта
      </div>
    </div>
  );
}

function SectionFooter({ content, primary }: { content: Record<string, unknown>; primary: string }) {
  return (
    <div className="px-8 py-6 text-slate-400 text-xs flex items-center justify-between" style={{ backgroundColor: "#1e293b" }}>
      <span style={{ color: primary }}>{String(content.company_name || "Компания")}</span>
      <div className="flex gap-4">
        {(content.links as string[] ?? []).map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

function renderSection(section: SiteSection, primary: string, secondary: string) {
  const c = section.content;
  switch (section.type) {
    case "hero": return <SectionHero key={section.id} content={c} primary={primary} secondary={secondary} />;
    case "about": return <SectionAbout key={section.id} content={c} primary={primary} />;
    case "services": return <SectionServices key={section.id} content={c} primary={primary} />;
    case "gallery": return <SectionGallery key={section.id} content={c} />;
    case "reviews": return <SectionReviews key={section.id} content={c} />;
    case "faq": return <SectionFAQ key={section.id} content={c} />;
    case "pricing": return <SectionPricing key={section.id} content={c} primary={primary} />;
    case "cta": return <SectionCTA key={section.id} content={c} primary={primary} secondary={secondary} />;
    case "contacts": return <SectionContacts key={section.id} content={c} />;
    case "map": return <SectionMap key={section.id} content={c} />;
    case "footer": return <SectionFooter key={section.id} content={c} primary={primary} />;
    default: return null;
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
  const primary = data.branding.primary_color || "#6366f1";
  const secondary = data.branding.secondary_color || "#8b5cf6";

  return (
    <div
      className="mx-auto transition-all duration-300"
      style={{ maxWidth: DEVICE_WIDTH[device], width: "100%" }}
    >
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white text-slate-900 text-sm shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2.5 border-b border-slate-200">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 rounded-md bg-white border border-slate-200 px-3 py-1 text-xs text-slate-400">
            {data.content.domain_name ? `https://${data.content.domain_name}` : `preview — ${data.meta.template_name}`}
          </div>
          {device !== "desktop" && (
            <span className="text-xs text-slate-400">{device === "tablet" ? "768px" : "375px"}</span>
          )}
        </div>

        {/* Content */}
        {sections && sections.length > 0 ? (
          <div>
            {sections.filter((s) => s.enabled).map((s) => renderSection(s, primary, secondary))}
          </div>
        ) : (
          /* Legacy fallback */
          <div>
            <div className="px-8 py-12 text-white" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
              {data.content.domain_name && <p className="mb-2 text-xs font-semibold uppercase tracking-widest opacity-70">{data.content.domain_name}</p>}
              <h1 className="text-3xl font-black leading-tight">{data.company.name || "Название компании"}</h1>
              {data.company.description && <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-85">{data.company.description}</p>}
              {data.content.hero_cta && (
                <button className="mt-6 rounded-full border-2 border-white/40 bg-white/20 px-6 py-2 text-sm font-bold" style={{ cursor: "default" }}>
                  {data.content.hero_cta}
                </button>
              )}
              {(data.contacts.phone || data.contacts.email) && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {data.contacts.phone && <span className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">📞 {data.contacts.phone}</span>}
                  {data.contacts.email && <span className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">✉️ {data.contacts.email}</span>}
                </div>
              )}
            </div>
            {data.content.about_text && (
              <div className="px-8 py-8 border-b border-slate-100">
                <h2 className="mb-3 text-lg font-bold text-slate-800">{data.content.about_title || "О нас"}</h2>
                <p className="text-sm leading-relaxed text-slate-600">{data.content.about_text}</p>
              </div>
            )}
            {data.services.length > 0 && (
              <div className="px-8 py-8 bg-slate-50 border-b border-slate-100">
                <h2 className="mb-4 text-lg font-bold text-slate-800">Наши услуги</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.services.map((s) => (
                    <div key={s} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-2 h-1 w-8 rounded-full" style={{ backgroundColor: primary }} />
                      <p className="font-semibold text-slate-800">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(data.contacts.phone || data.contacts.email || data.contacts.telegram || data.company.address) && (
              <div className="px-8 py-8 border-b border-slate-100">
                <h2 className="mb-4 text-lg font-bold text-slate-800">Контакты</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.contacts.phone && <div className="flex gap-3"><span>📞</span><div><p className="text-xs text-slate-400">Телефон</p><p className="font-semibold text-slate-700">{data.contacts.phone}</p></div></div>}
                  {data.contacts.email && <div className="flex gap-3"><span>✉️</span><div><p className="text-xs text-slate-400">Email</p><p className="font-semibold text-slate-700">{data.contacts.email}</p></div></div>}
                  {data.contacts.telegram && <div className="flex gap-3"><span>💬</span><div><p className="text-xs text-slate-400">Telegram</p><p className="font-semibold text-slate-700">{data.contacts.telegram}</p></div></div>}
                  {data.company.address && <div className="flex gap-3"><span>📍</span><div><p className="text-xs text-slate-400">Адрес</p><p className="font-semibold text-slate-700">{data.company.address}</p></div></div>}
                </div>
              </div>
            )}
            <div className="px-8 py-4 bg-slate-800 text-slate-400 text-xs flex items-center justify-between">
              <span>{data.company.name}</span>
              {data.content.domain_name && <span>{data.content.domain_name}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
