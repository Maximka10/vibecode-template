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
  const content = section.content ?? fallbackContent;
  const titleLines = content.title.split("\n").filter(Boolean);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 max-w-5xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-zinc-500">{content.badge}</p>

        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          {titleLines.length > 0 ? titleLines.map((line, index) => <span key={`${line}-${index}`} className="block">{line}</span>) : fallbackContent.title}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">{content.subtitle}</p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button className="rounded-2xl bg-white px-6 py-3 font-medium text-black transition hover:scale-105">
            {content.primaryCta}
          </button>

          <button className="rounded-2xl border border-zinc-700 px-6 py-3 transition hover:border-zinc-400">
            {content.secondaryCta}
          </button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
          {(content.meta.length > 0 ? content.meta : fallbackContent.meta).map((item, index, array) => (
            <span key={`${item}-${index}`}>{item}{index < array.length - 1 ? " •" : ""}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
