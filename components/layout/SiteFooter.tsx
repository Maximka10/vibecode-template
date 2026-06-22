import Link from "next/link";

const LINKS = {
  company: [
    { label: "О нас", href: "/#about" },
    { label: "Как это работает", href: "/#process" },
    { label: "Цены", href: "/#pricing" },
  ],
  product: [
    { label: "Шаблоны", href: "/templates" },
    { label: "Личный кабинет", href: "/dashboard" },
    { label: "Оставить заявку", href: "/templates" },
  ],
  legal: [
    { label: "Условия использования", href: "/legal/terms" },
    { label: "Политика конфиденциальности", href: "/legal/privacy" },
    { label: "Политика правок", href: "/legal/revisions" },
  ],
  support: [
    { label: "Связаться с нами", href: "/templates" },
    { label: "Частые вопросы", href: "/#faq" },
  ],
};

const COLUMNS = [
  { title: "Компания", links: LINKS.company },
  { title: "Продукт", links: LINKS.product },
  { title: "Документы", links: LINKS.legal },
  { title: "Поддержка", links: LINKS.support },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-black/60">
      <div className="mx-auto max-w-5xl px-4 py-14">
        {/* Top row */}
        <div className="flex flex-col gap-10 sm:flex-row sm:gap-8">
          {/* Brand */}
          <div className="shrink-0 sm:w-52">
            <p className="text-sm font-black tracking-wide text-white">VIBECODE STUDIO</p>
            <p className="mt-2 text-xs leading-relaxed text-white/35">
              Сайты для малого бизнеса в России.
              Быстро, честно, без предоплаты.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white/35">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-xs text-white/50 transition hover:text-white"
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
        <div className="mt-10 h-px bg-white/8" />

        {/* Bottom row */}
        <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Vibecode Studio. Все права защищены.
          </p>
          <p className="text-xs text-white/20">
            Домен, хостинг и SSL оплачиваются отдельно · Правки первые 12 месяцев включены
          </p>
        </div>
      </div>
    </footer>
  );
}
