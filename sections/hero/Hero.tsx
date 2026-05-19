import { Container } from "@/components/layout/Container";
import { getTheme } from "@/lib/themes/getTheme";
import type { HeroSection } from "@/types/section";

type HeroProps = { section: HeroSection };

const fallbackContent: NonNullable<HeroSection["content"]> = {
  badge: "VIBECODE STUDIO",
  title: "Современные сайты\nдля малого бизнеса",
  subtitle:
    "Быстрые, современные и доступные сайты для кофеен, автомоек, салонов, ресторанов и локальных брендов.",
  primaryCta: "Рассчитать стоимость",
  secondaryCta: "Примеры работ",
  meta: ["от 15 000 ₽", "срок от 2 дней", "Telegram / WhatsApp"],
};

export function Hero({ section }: HeroProps) {
  const theme = getTheme();
  const content = section.content ?? fallbackContent;
  const metaItems = content.meta.length > 0 ? content.meta : fallbackContent.meta;
  const titleLines = content.title.split("\n");

  return (
    <section className="section-shell relative flex min-h-[96vh] items-center overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div
        className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: theme.glow.centerSize, height: theme.glow.centerSize, backgroundColor: theme.gradients.heroGlowCenter, filter: `blur(${theme.glow.blur})` }}
      />
      <div
        className="absolute -left-20 top-10 rounded-full"
        style={{ width: theme.glow.sideSize, height: theme.glow.sideSize, backgroundColor: theme.gradients.heroGlowLeft, filter: `blur(${theme.glow.blur})` }}
      />
      <div
        className="absolute -right-20 bottom-0 rounded-full"
        style={{ width: theme.glow.sideSize, height: theme.glow.sideSize, backgroundColor: theme.gradients.heroGlowRight, filter: `blur(${theme.glow.blur})` }}
      />

      <Container className="relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-6 text-xs uppercase sm:text-sm" style={{ letterSpacing: theme.typography.sectionLabelTracking, color: theme.colors.textMuted }}>
            {content.badge}
          </p>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            {titleLines.map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                {index < titleLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed sm:text-lg" style={{ color: theme.colors.textMuted }}>
            {content.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            <button className="px-6 py-3 text-sm font-medium text-black transition hover:scale-[1.02] sm:px-7 sm:py-3.5" style={{ borderRadius: theme.radius.button, backgroundColor: theme.colors.textPrimary }}>
              {content.primaryCta}
            </button>
            <button className="border px-6 py-3 text-sm transition hover:bg-white/5 sm:px-7 sm:py-3.5" style={{ borderRadius: theme.radius.button, borderColor: theme.colors.borderSubtle }}>
              {content.secondaryCta}
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3 sm:gap-4" style={{ color: theme.colors.textMuted }}>
            {metaItems.map((item) => (
              <span key={item} className="rounded-full border px-4 py-2" style={{ borderColor: theme.colors.borderSubtle }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
