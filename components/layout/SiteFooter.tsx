import Link from "next/link";
import CookieBanner from "@/components/CookieBanner";

const COLUMNS = [
  {
    title: "Компания",
    links: [
      { label: "Как это работает", href: "/#process" },
      { label: "Цены", href: "/#pricing" },
      { label: "Отзывы", href: "/#reviews" },
    ],
  },
  {
    title: "Продукт",
    links: [
      { label: "Шаблоны", href: "/templates" },
      { label: "Личный кабинет", href: "/dashboard" },
      { label: "Оставить заявку", href: "/templates" },
    ],
  },
  {
    title: "Документы",
    links: [
      { label: "Условия использования", href: "/legal/terms" },
      { label: "Конфиденциальность", href: "/legal/privacy" },
      { label: "Политика правок", href: "/legal/revisions" },
    ],
  },
  {
    title: "Поддержка",
    links: [
      { label: "Связаться с нами", href: "/templates" },
      { label: "Частые вопросы", href: "/#faq" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8">
      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-40 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/4 blur-[60px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
        {/* Top row */}
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Brand */}
          <div className="shrink-0 lg:w-56">
            <Link href="/" className="group inline-block">
              <p className="text-base font-black tracking-tight text-white">
                VIBECODE{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  STUDIO
                </span>
              </p>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-white/30">
              Сайты для малого бизнеса в России.
              <br />
              Быстро, честно, без предоплаты.
            </p>
            {/* Accent dot */}
            <div className="mt-5 h-1 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-60" />
          </div>

          {/* Nav columns */}
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-xs text-white/45 transition-colors hover:text-white/80"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom row */}
        <div className="mt-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} Vibecode Studio. Все права защищены.
          </p>
          <p className="text-xs text-white/15">
            Домен, хостинг и SSL — отдельно · Правки 12 месяцев включены
          </p>
        </div>
      </div>

      <CookieBanner />
    </footer>
  );
}
