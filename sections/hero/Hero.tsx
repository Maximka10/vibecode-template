import { getTheme } from "@/lib/themes/getTheme";

export function Hero() {
  const theme = getTheme();

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{
        paddingInline: theme.spacing.sectionX,
        color: theme.colors.textPrimary,
      }}
    >
      {/* Theme-driven glow: keeps visual style centralized for future per-template branding. */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: theme.glow.centerSize,
          height: theme.glow.centerSize,
          backgroundColor: theme.gradients.heroGlowCenter,
          filter: `blur(${theme.glow.blur})`,
        }}
      />

      <div
        className="absolute left-0 top-0 rounded-full"
        style={{
          width: theme.glow.sideSize,
          height: theme.glow.sideSize,
          backgroundColor: theme.gradients.heroGlowLeft,
          filter: `blur(${theme.glow.blur})`,
        }}
      />

      <div
        className="absolute bottom-0 right-0 rounded-full"
        style={{
          width: theme.glow.sideSize,
          height: theme.glow.sideSize,
          backgroundColor: theme.gradients.heroGlowRight,
          filter: `blur(${theme.glow.blur})`,
        }}
      />

      <div className="relative z-10 max-w-5xl text-center">
        <p className="mb-4 text-sm uppercase text-zinc-500" style={{ letterSpacing: theme.typography.sectionLabelTracking }}>
          VIBECODE STUDIO
        </p>

        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          Современные сайты
          <br />
          для малого бизнеса
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg" style={{ color: theme.colors.textMuted }}>
          Быстрые, современные и доступные сайты для кофеен, автомоек, салонов, ресторанов и локальных брендов.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            className="px-6 py-3 font-medium text-black transition hover:scale-105"
            style={{
              borderRadius: theme.radius.button,
              backgroundColor: theme.colors.textPrimary,
            }}
          >
            Рассчитать стоимость
          </button>

          <button
            className="border px-6 py-3 transition hover:border-zinc-400"
            style={{
              borderRadius: theme.radius.button,
              borderColor: theme.colors.borderSubtle,
            }}
          >
            Примеры работ
          </button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm" style={{ color: theme.colors.textMuted }}>
          <span>от 15 000 ₽</span>
          <span>•</span>
          <span>срок от 2 дней</span>
          <span>•</span>
          <span>Telegram / WhatsApp</span>
        </div>
      </div>
    </section>
  );
}
