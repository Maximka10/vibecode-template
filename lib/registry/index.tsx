import type { Section, Template } from "@/types";
import { getCardClass, getHeadingClass, getRadiusClass, getSectionPadding, themeToCSSVars } from "@/lib/theme/tokens";

type Props = { section: Section; template: Template };

const Wrap = ({ children, template }: { children: React.ReactNode; template: Template }) => (
  <section className={`${getSectionPadding(template.style)} px-4 sm:px-6`}>
    <div className="mx-auto max-w-6xl">{children}</div>
  </section>
);

function isUrl(v: string) {
  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/");
}

// Coerce a list item (string or object) to a display string so React never
// receives a raw object as a child.
function itemText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return String(o.name ?? o.title ?? o.label ?? o.text ?? o.value ?? "");
  }
  return String(v);
}

function Hero({ section, template }: Props) {
  const c = section.content;
  const heroImage = c.heroImage as string | undefined;
  const hasImage = !!heroImage && isUrl(heroImage);
  // Без картинки — всегда центрируем, чтобы текст не висел в пустой колонке.
  const centered = c.layout === "centered" || template.style.heroTextAlign === "center" || !hasImage;
  const badge = String(c.badge ?? "");

  return (
    <section className={`relative overflow-hidden ${getSectionPadding(template.style)} px-4 sm:px-6`}>
      {/* Ambient glow orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -left-16 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: "var(--glow-primary)", animation: "vibe-float 16s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-32 right-0 h-[24rem] w-[24rem] rounded-full blur-3xl"
          style={{ background: "var(--glow-secondary)", animation: "vibe-float 22s ease-in-out infinite reverse" }}
        />
      </div>
      <div className="relative mx-auto max-w-6xl">
        <div className={`grid gap-8 lg:gap-12 ${centered ? "text-center place-items-center" : "md:grid-cols-2 md:items-center"}`}>
          <div className={centered ? "mx-auto max-w-2xl" : ""}>
            {badge && (
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--bg-border)] bg-[var(--bg-surface)]/60 px-4 py-2 text-sm text-[var(--text-secondary)] backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--primary)", boxShadow: "0 0 10px var(--primary)" }} />
                {badge}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] whitespace-pre-line">
              <span style={{ backgroundImage: "linear-gradient(120deg, var(--text-primary), var(--gradient-to))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                {String(c.headline ?? "")}
              </span>
            </h1>
            <p className={`mt-5 text-base sm:text-lg text-[var(--text-secondary)] whitespace-pre-line ${centered ? "mx-auto max-w-2xl" : "max-w-xl"}`}>
              {String(c.subheadline ?? "")}
            </p>
            <div className={`mt-7 flex flex-col xs:flex-row gap-3 ${centered ? "justify-center" : ""}`}>
              <a
                className="rounded-full px-5 sm:px-7 py-3 text-sm sm:text-[15px] font-bold text-white text-center transition hover:-translate-y-0.5"
                style={{ backgroundImage: "linear-gradient(120deg, var(--gradient-from), var(--gradient-to))", boxShadow: "0 12px 34px var(--glow-primary)" }}
                href="#lead"
              >
                {String(c.cta ?? "Заказать")}
              </a>
              <a className="rounded-full border border-[var(--bg-border)] bg-[var(--bg-surface)]/40 px-5 sm:px-7 py-3 text-sm sm:text-[15px] text-center backdrop-blur transition hover:bg-[var(--bg-surface)]/70" href="#services">
                {String(c.secondaryCta ?? "Подробнее")}
              </a>
            </div>
          </div>
          {hasImage && (
            <div className="relative">
              <div aria-hidden className="absolute -inset-3 rounded-[2rem] blur-2xl" style={{ background: "linear-gradient(120deg, var(--glow-primary), var(--glow-secondary))" }} />
              <div className={`relative ${getCardClass(template.style)} w-full overflow-hidden`}>
                <img
                  src={heroImage}
                  alt=""
                  className="aspect-[4/3] md:aspect-[3/4] lg:aspect-[4/3] h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stats({ section, template }: Props) {
  const items = (section.content.items as Record<string, unknown>[]) ?? [];
  if (items.length === 0) return null;
  return (
    <Wrap template={template}>
      <div className={template.style.statsLayout === "inline" ? "flex flex-wrap gap-4" : "grid grid-cols-2 sm:grid-cols-4 gap-4"}>
        {items.map((it, i) => (
          <div key={i} className={`vibe-card ${getCardClass(template.style)} p-5 text-center`}>
            <div className="text-2xl sm:text-3xl font-black">
              <span className="whitespace-nowrap" style={{ backgroundImage: "linear-gradient(120deg, var(--gradient-from), var(--gradient-to))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                {String(it.prefix ?? "")}{String(it.value ?? "")}{String(it.suffix ?? "")}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{String(it.label ?? "")}</p>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

function About({ section, template }: Props) {
  const coverImage = section.content.coverImage as string | undefined;
  const title = String(section.content.title ?? "");
  const text = String(section.content.text ?? "");
  const hasCover = !!coverImage && isUrl(coverImage);
  if (!title && !text && !hasCover) return null;
  return (
    <Wrap template={template}>
      <div className={`vibe-card ${getCardClass(template.style)} overflow-hidden`}>
        {hasCover && (
          <div className="w-full aspect-[16/9] overflow-hidden">
            <img src={coverImage} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          {title && <h2 className={getHeadingClass(template.style)}>{title}</h2>}
          {text && <p className="mt-4 text-[var(--text-secondary)] whitespace-pre-line">{text}</p>}
        </div>
      </div>
    </Wrap>
  );
}

function Gallery({ section, template }: Props) {
  type GalleryImg = { url: string; title?: string };
  const raw = (section.content.images as (string | GalleryImg)[]) ?? [];
  const items: GalleryImg[] = raw.map((x) =>
    typeof x === "string" ? { url: x } : { url: String((x as GalleryImg).url ?? ""), title: (x as GalleryImg).title }
  ).filter((x) => isUrl(x.url));
  const film = template.style.galleryStyle === "film";
  const masonry = template.style.galleryStyle === "masonry";
  if (items.length === 0) return null;

  return (
    <Wrap template={template}>
      {!!section.content.title && (
        <h2 className={`${getHeadingClass(template.style)} mb-6`}>
          {String(section.content.title)}
        </h2>
      )}
      <div
        className={
          film
            ? "flex gap-4 overflow-x-auto pb-4"
            : masonry
            ? "columns-2 gap-4 space-y-4"
            : "grid grid-cols-2 gap-4"
        }
      >
        {items.map((x, i) => (
          <div
            key={`${x.url}-${i}`}
            className={`vibe-tile ${getRadiusClass(template.style)} ${film ? "w-[min(280px,72vw)] shrink-0" : ""} ${masonry ? "break-inside-avoid" : ""} aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-[var(--primary)]/30 to-[var(--secondary)]/15`}
          >
            <img src={x.url} alt={x.title ?? `Gallery ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </Wrap>
  );
}

function Services({ section, template }: Props) {
  const items = ((section.content.items as unknown[]) ?? []).map(itemText).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <Wrap template={template}>
      <h2 id="services" className={getHeadingClass(template.style)}>
        {String(section.content.title ?? "Услуги")}
      </h2>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((x, i) => (
          <div key={`${x}-${i}`} className={`vibe-card ${getCardClass(template.style)} p-5 flex items-start gap-3`}>
            <span className="mt-0.5 text-[var(--primary)] font-bold">✓</span>
            <span className="whitespace-pre-line">{x}</span>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

function Simple({ section, template }: Props) {
  return (
    <Wrap template={template}>
      <div className={`${getCardClass(template.style)} p-6`}>
        <h2 className={getHeadingClass(template.style)}>
          {String(section.content.title ?? section.type)}
        </h2>
        <p className="mt-3 text-[var(--text-secondary)]">
          {String(section.content.text ?? "Оставьте заявку — подготовим сайт под ваш бизнес.")}
        </p>
      </div>
    </Wrap>
  );
}

function Reviews({ section, template }: Props) {
  const items = ((section.content.items as unknown[]) ?? []).filter((x) => !!itemText(x));
  if (items.length === 0) return null;
  return (
    <Wrap template={template}>
      <h2 className={getHeadingClass(template.style)}>
        {String(section.content.title ?? "Отзывы")}
      </h2>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((x, i) => {
          const author = x && typeof x === "object" ? String((x as Record<string, unknown>).author ?? "") : "";
          return (
            <blockquote key={i} className={`vibe-card ${getCardClass(template.style)} p-5`}>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-[var(--primary)] text-sm">★</span>
                ))}
              </div>
              <p className="mt-3 text-[var(--text-secondary)] whitespace-pre-line">«{itemText(x)}»</p>
              {author && <p className="mt-3 text-sm font-semibold">— {author}</p>}
            </blockquote>
          );
        })}
      </div>
    </Wrap>
  );
}

function Pricing({ section, template }: Props) {
  const plans = (section.content.plans as { name?: string; price?: string; features?: string[] }[]) ?? [];
  if (plans.length === 0) return null;
  return (
    <Wrap template={template}>
      <h2 className={getHeadingClass(template.style)}>{String(section.content.title ?? "Цены")}</h2>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((p, i) => (
          <div
            key={i}
            className={`vibe-card ${getCardClass(template.style)} p-6 flex flex-col`}
            style={i === 1 ? { borderColor: "var(--primary)", boxShadow: "0 18px 50px var(--glow-primary)" } : undefined}
          >
            {i === 1 && (
              <span className="mb-3 inline-flex w-fit rounded-full px-3 py-0.5 text-xs font-bold text-white" style={{ backgroundImage: "linear-gradient(120deg, var(--gradient-from), var(--gradient-to))" }}>
                Популярный
              </span>
            )}
            <p className="font-bold">{String(p.name ?? "")}</p>
            <p className="mt-1 text-3xl font-black" style={{ color: "var(--primary)" }}>{String(p.price ?? "")}</p>
            <ul className="mt-4 space-y-2 flex-1">
              {(p.features ?? []).map((f, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="font-bold" style={{ color: "var(--primary)" }}>✓</span>
                  <span>{String(f)}</span>
                </li>
              ))}
            </ul>
            <a href="#lead" className="mt-5 block rounded-full py-2.5 text-center text-sm font-bold text-white transition hover:-translate-y-0.5" style={{ backgroundImage: "linear-gradient(120deg, var(--gradient-from), var(--gradient-to))", boxShadow: "0 10px 26px var(--glow-primary)" }}>
              Выбрать
            </a>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

function FAQ({ section, template }: Props) {
  const items = (section.content.items as { question?: string; answer?: string }[]) ?? [];
  if (items.length === 0) return null;
  return (
    <Wrap template={template}>
      <h2 className={getHeadingClass(template.style)}>{String(section.content.title ?? "Вопросы и ответы")}</h2>
      <div className="mt-6 space-y-3 max-w-3xl">
        {items.map((f, i) => (
          <div key={i} className={`vibe-card ${getCardClass(template.style)} p-5`}>
            <p className="font-bold">{String(f.question ?? "")}</p>
            {!!f.answer && <p className="mt-2 text-[var(--text-secondary)] whitespace-pre-line">{String(f.answer)}</p>}
          </div>
        ))}
      </div>
    </Wrap>
  );
}

function Contacts({ section, template }: Props) {
  const c = section.content;
  const address = String(c.address ?? "");
  const items = [
    c.phone && { icon: "📞", label: "Телефон", value: String(c.phone) },
    c.email && { icon: "✉️", label: "Email", value: String(c.email) },
    c.telegram && { icon: "💬", label: "Telegram", value: String(c.telegram) },
    c.whatsapp && { icon: "📱", label: "WhatsApp", value: String(c.whatsapp) },
    address && { icon: "📍", label: "Адрес", value: address },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];
  if (items.length === 0 && !address) return null;
  const mapSrc = address ? `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(address)}&z=15&lang=ru_RU` : null;
  return (
    <Wrap template={template}>
      <h2 id="contacts" className={getHeadingClass(template.style)}>{String(c.title ?? "Контакты")}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
          {items.map((it, i) => (
            <div key={i} className={`vibe-card ${getCardClass(template.style)} p-4 flex items-center gap-3`}>
              <span className="text-xl">{it.icon}</span>
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-secondary)]">{it.label}</p>
                <p className="font-semibold truncate" style={{ color: "var(--primary)" }}>{it.value}</p>
              </div>
            </div>
          ))}
        </div>
        {mapSrc && (
          <div className={`${getRadiusClass(template.style)} overflow-hidden border border-[var(--bg-border)]`}>
            <iframe src={mapSrc} className="h-64 w-full md:h-full border-0" loading="lazy" title="Карта" />
          </div>
        )}
      </div>
    </Wrap>
  );
}

export const SectionRegistry = {
  hero: Hero,
  stats: Stats,
  about: About,
  gallery: Gallery,
  services: Services,
  pricing: Pricing,
  faq: FAQ,
  contacts: Contacts,
  "hosting-service": Simple,
  "templates-gallery": Simple,
  calculator: Simple,
  footer: Simple,
  reviews: Reviews,
};

const REGISTRY_CSS = `
@keyframes vibe-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(6%, 8%) scale(1.1); }
}
.vibe-site { position: relative; }
.vibe-site > section + section::before {
  content: ""; display: block; height: 1px; width: 100%; max-width: 72rem;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, var(--bg-border), transparent);
}
.vibe-card { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
.vibe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 55px var(--glow-primary);
  border-color: color-mix(in srgb, var(--primary) 45%, var(--bg-border));
}
.vibe-tile { transition: transform .35s ease, box-shadow .35s ease; }
.vibe-tile:hover { transform: scale(1.03); box-shadow: 0 18px 44px var(--glow-secondary); }
@media (prefers-reduced-motion: reduce) {
  .vibe-site * { animation: none !important; }
}
`;

export function SectionRenderer({ template }: { template: Template }) {
  return (
    <div
      style={themeToCSSVars(template.theme) as React.CSSProperties}
      className="vibe-site min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]"
    >
      <style dangerouslySetInnerHTML={{ __html: REGISTRY_CSS }} />
      {template.sections.map((section) => {
        if (section.enabled === false) return null;
        const C = SectionRegistry[section.type];
        if (!C) return null;
        return <C key={section.id} section={section} template={template} />;
      })}
    </div>
  );
}
