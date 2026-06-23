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

// Coerce a gallery item (string URL, or object like {url}/{src}/{image}) to a
// plain string so the renderer never calls string methods on an object — which
// would throw and break the whole preview. Returns "" for unusable entries.
function imageUrl(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const u = o.url ?? o.src ?? o.image ?? o.value;
    return typeof u === "string" ? u : "";
  }
  return "";
}

function Hero({ section, template }: Props) {
  const c = section.content;
  const heroImage = c.heroImage as string | undefined;
  const hasImage = !!heroImage && isUrl(heroImage);
  // Без картинки — всегда центрируем, чтобы текст не висел в пустой колонке.
  const centered = c.layout === "centered" || template.style.heroTextAlign === "center" || !hasImage;
  const badge = String(c.badge ?? "");

  return (
    <Wrap template={template}>
      <div className={`grid gap-8 lg:gap-12 ${centered ? "text-center place-items-center" : "md:grid-cols-2 md:items-center"}`}>
        <div className={centered ? "mx-auto max-w-2xl" : ""}>
          {badge && (
            <p className="mb-4 inline-flex rounded-full border border-[var(--bg-border)] px-4 py-2 text-sm text-[var(--text-secondary)]">
              {badge}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] whitespace-pre-line">
            {String(c.headline ?? "")}
          </h1>
          <p className={`mt-5 text-base sm:text-lg text-[var(--text-secondary)] whitespace-pre-line ${centered ? "mx-auto max-w-2xl" : "max-w-xl"}`}>
            {String(c.subheadline ?? "")}
          </p>
          <div className={`mt-7 flex flex-col xs:flex-row gap-3 ${centered ? "justify-center" : ""}`}>
            <a className="rounded-full bg-[var(--primary)] px-5 sm:px-7 py-3 text-sm sm:text-[15px] font-bold text-black text-center" href="#lead">
              {String(c.cta ?? "Заказать")}
            </a>
            <a className="rounded-full border border-[var(--bg-border)] px-5 sm:px-7 py-3 text-sm sm:text-[15px] text-center" href="#services">
              {String(c.secondaryCta ?? "Подробнее")}
            </a>
          </div>
        </div>
        {hasImage && (
          <div className={`${getCardClass(template.style)} w-full overflow-hidden`}>
            <img
              src={heroImage}
              alt=""
              className="aspect-[4/3] md:aspect-[3/4] lg:aspect-[4/3] h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </Wrap>
  );
}

function Stats({ section, template }: Props) {
  const items = (section.content.items as Record<string, unknown>[]) ?? [];
  if (items.length === 0) return null;
  return (
    <Wrap template={template}>
      <div className={template.style.statsLayout === "inline" ? "flex flex-wrap gap-4" : "grid grid-cols-2 sm:grid-cols-4 gap-4"}>
        {items.map((it, i) => (
          <div key={i} className={`${getCardClass(template.style)} p-5 text-center`}>
            <div className="text-2xl sm:text-3xl font-black">
              <span className="whitespace-nowrap">
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
      <div className={`${getCardClass(template.style)} overflow-hidden`}>
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
  const items = ((section.content.images as unknown[]) ?? []).map(imageUrl).filter(Boolean);
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
            key={`${x}-${i}`}
            className={`${getRadiusClass(template.style)} ${film ? "w-[min(280px,72vw)] shrink-0" : ""} ${masonry ? "break-inside-avoid" : ""} aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-[var(--primary)]/30 to-[var(--secondary)]/15`}
          >
            {isUrl(x) ? (
              <img src={x} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-end p-4">
                <span className="text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)]/70 rounded-lg px-3 py-1.5">
                  {x}
                </span>
              </div>
            )}
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
          <div key={`${x}-${i}`} className={`${getCardClass(template.style)} p-5 flex items-start gap-3`}>
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
        <p className="mt-3 text-[var(--text-secondary)] whitespace-pre-line">
          {String(section.content.text ?? "Оставьте заявку — подготовим сайт под ваш бизнес.")}
        </p>
      </div>
    </Wrap>
  );
}

function Reviews({ section, template }: Props) {
  const items = (section.content.items as string[]) ?? [];
  if (items.length === 0) return null;
  return (
    <Wrap template={template}>
      <h2 className={getHeadingClass(template.style)}>
        {String(section.content.title ?? "Отзывы")}
      </h2>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((x, i) => (
          <blockquote key={i} className={`${getCardClass(template.style)} p-5`}>
            <p className="text-[var(--text-secondary)] whitespace-pre-line">"{itemText(x)}"</p>
            <div className="mt-3 flex gap-1">
              {[1,2,3,4,5].map((s) => (
                <span key={s} className="text-[var(--primary)] text-sm">★</span>
              ))}
            </div>
          </blockquote>
        ))}
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
  "hosting-service": Simple,
  "templates-gallery": Simple,
  calculator: Simple,
  footer: Simple,
  reviews: Reviews,
};

export function SectionRenderer({ template }: { template: Template }) {
  return (
    <div
      style={themeToCSSVars(template.theme) as React.CSSProperties}
      className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]"
    >
      {template.sections.map((section) => {
        const C = SectionRegistry[section.type];
        if (!C) return null;
        return <C key={section.id} section={section} template={template} />;
      })}
    </div>
  );
}
