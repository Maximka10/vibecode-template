import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PricingTiers } from "@/components/PricingTiers";
import { Reveal } from "@/components/Reveal";

const TRUST_BADGES = [
  { icon: "₽", text: "0 ₽ предоплата" },
  { icon: "🔒", text: "SSL и защита данных" },
  { icon: "📄", text: "Работаем по договору" },
  { icon: "⚡", text: "Запуск за 3 дня" },
];

function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 ${className}`}>
      {TRUST_BADGES.map((b) => (
        <span key={b.text} className="inline-flex items-center gap-1.5 text-xs text-white/45">
          <span className="text-cyan-400">{b.icon}</span>
          {b.text}
        </span>
      ))}
    </div>
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibecode.studio";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "VIBECODE STUDIO",
      url: SITE_URL,
      description: "Разработка сайтов под ключ для малого бизнеса в России за 3 дня.",
      areaServed: "RU",
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}/#service`,
      name: "Разработка сайта под ключ",
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: "RU",
      description:
        "Готовый сайт на отраслевом шаблоне за 3 дня: наполнение, адаптив, форма заявки. Оплата после приёмки.",
      offers: {
        "@type": "Offer",
        price: "13900",
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
      },
    },
  ],
};

const FEATURES = [
  {
    icon: "⚡",
    title: "Готово за 3 дня",
    text: "Запускаем сайт быстро — без длинных брифов и задержек. Вы оставляете заявку, мы приступаем в тот же день.",
    accent: "cyan",
  },
  {
    icon: "🎨",
    title: "5 отраслевых шаблонов",
    text: "Кофейня, барбершоп, салон красоты, автомойка, ресторан — каждый шаблон спроектирован под ваш тип бизнеса.",
    accent: "blue",
  },
  {
    icon: "💬",
    title: "Чат с менеджером",
    text: "Всё общение — в личном кабинете. Правки, вопросы, статус — без мессенджеров и email.",
    accent: "purple",
  },
  {
    icon: "₽",
    title: "0 ₽ предоплата",
    text: "Оплата только после того, как вы увидели готовый сайт и одобрили результат. Никакого риска.",
    accent: "green",
  },
  {
    icon: "🛡",
    title: "12 месяцев поддержки",
    text: "Обновление текстов, замена фото, мелкие правки — включены в стоимость на первый год.",
    accent: "blue",
  },
  {
    icon: "🔧",
    title: "Настройка под бренд",
    text: "Меняете цвета, тексты и фото прямо в редакторе. Всё остальное — домен, SSL, хостинг — по договорённости.",
    accent: "purple",
  },
];

const STEPS = [
  { num: "01", title: "Выберите шаблон", text: "Посмотрите превью и настройте цвета, тексты и фото прямо в редакторе.", color: "cyan" },
  { num: "02", title: "Оставьте заявку", text: "Имя, телефон или Telegram — никаких длинных форм.", color: "blue" },
  { num: "03", title: "Звонок за 1 час", text: "Менеджер уточняет детали и запускает разработку немедленно.", color: "purple" },
  { num: "04", title: "Принимаете сайт", text: "Смотрите результат на своём домене. Правки — до одобрения бесплатны.", color: "pink" },
  { num: "05", title: "Сайт работает", text: "Клиенты находят вас в поиске. Вы занимаетесь бизнесом.", color: "green" },
];

const REVIEWS = [
  {
    text: "Сайт запустили за 2 дня. Уже в первую неделю пошли заявки через контактную форму.",
    author: "Кофейня «Эспрессо Бар»",
    city: "Москва",
    stars: 5,
  },
  {
    text: "Помогли с текстами и фото, домен подключили сами. Мне ничего не пришлось делать — только принять готовый сайт.",
    author: "Салон красоты «Люкс»",
    city: "Санкт-Петербург",
    stars: 5,
  },
  {
    text: "Наконец-то сайт, который не стыдно показать клиентам. Современный дизайн, быстро грузится.",
    author: "Барбершоп «Бритва»",
    city: "Екатеринбург",
    stars: 5,
  },
];

const TEMPLATE_META = [
  { id: "coffee", name: "Кофейня", hint: "Меню, онлайн-заказ, акции", color: "from-amber-500/25 to-orange-500/10", icon: "☕" },
  { id: "beauty", name: "Салон красоты", hint: "Услуги, онлайн-запись, цены", color: "from-pink-500/25 to-rose-500/10", icon: "💅" },
  { id: "barber", name: "Барбершоп", hint: "Мастера, прайс, запись", color: "from-blue-500/25 to-indigo-500/10", icon: "💈" },
  { id: "wash", name: "Автомойка", hint: "Услуги, боксы, очередь", color: "from-cyan-500/25 to-blue-500/10", icon: "🚗" },
  { id: "restaurant", name: "Ресторан", hint: "Меню, бронь стола, акции", color: "from-violet-500/25 to-fuchsia-500/10", icon: "🍽" },
];

const TRUST = [
  { value: "50+", label: "Сайтов запущено", color: "text-cyan-400" },
  { value: "3 дня", label: "Средний срок", color: "text-blue-400" },
  { value: "0 ₽", label: "Предоплата", color: "text-green-400" },
  { value: "12 мес.", label: "Поддержка", color: "text-purple-400" },
];

const STEP_COLORS: Record<string, string> = {
  cyan: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
  blue: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  purple: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  pink: "border-pink-500/30 text-pink-400 bg-pink-500/10",
  green: "border-green-500/30 text-green-400 bg-green-500/10",
};

const ACCENT: Record<string, string> = {
  cyan: "border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-cyan-500/15",
  blue: "border-blue-500/20 hover:border-blue-500/50 hover:shadow-blue-500/15",
  purple: "border-purple-500/20 hover:border-purple-500/50 hover:shadow-purple-500/15",
  green: "border-green-500/20 hover:border-green-500/50 hover:shadow-green-500/15",
};

const ICON_BG: Record<string, string> = {
  cyan: "bg-cyan-500/15 text-cyan-400 shadow-lg shadow-cyan-500/20",
  blue: "bg-blue-500/15 text-blue-400 shadow-lg shadow-blue-500/20",
  purple: "bg-purple-500/15 text-purple-400 shadow-lg shadow-purple-500/20",
  green: "bg-green-500/15 text-green-400 shadow-lg shadow-green-500/20",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Rich layered glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-120px] h-[800px] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/20 via-blue-600/12 to-transparent blur-[140px]" />
          <div className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-700/15 blur-[120px]" />
          <div className="absolute -right-32 top-1/3 h-[500px] w-[500px] rounded-full bg-purple-700/15 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/6 blur-[100px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>

        <div className="relative mx-auto max-w-6xl 2xl:max-w-[1440px] px-4 pb-24 pt-24 text-center sm:pb-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-5 py-2 text-sm font-medium text-cyan-300 shadow-lg shadow-cyan-500/20 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            Запускаем сайты для малого бизнеса в России
          </div>

          <h1 className="mx-auto mt-8 max-w-5xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-white drop-shadow-[0_0_40px_rgba(34,211,238,0.15)]">
              Сайт для бизнеса
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-none">
              за 3 дня от 13 900 ₽
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl">
            Выбираете шаблон, вносите тексты и фото — мы делаем остальное.
            <br className="hidden sm:block" />
            <span className="text-white/80 font-medium">Оплата только после приёмки готового сайта.</span>
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/templates"
              className="group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-9 py-4 text-base font-bold text-white shadow-xl shadow-cyan-500/30 transition hover:shadow-cyan-500/50 hover:scale-[1.04]"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 transition group-hover:opacity-100 blur-sm -z-10" />
              Выбрать шаблон
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/6 px-9 py-4 text-base font-medium text-white/80 backdrop-blur transition hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              Войти в кабинет
            </Link>
          </div>

          <TrustBadges className="mt-8" />

          {/* Trust bar */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {TRUST.map((t) => (
              <div
                key={t.label}
                className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/6 to-white/2 py-6 backdrop-blur transition hover:border-white/15 hover:from-white/8"
              >
                <p className={`text-3xl font-black ${t.color} drop-shadow-[0_0_12px_currentColor]`}>{t.value}</p>
                <p className="mt-1.5 text-xs text-white/40">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee strip ────────────────────────────────────────────────── */}
      <div className="relative border-y border-white/6 bg-white/2 py-4 overflow-hidden">
        <div className="flex gap-12 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex shrink-0 gap-12 items-center">
              {["Кофейня", "Барбершоп", "Салон красоты", "Автомойка", "Ресторан", "Быстро", "0 ₽ предоплата", "12 мес. поддержки"].map((t) => (
                <span key={t} className="text-xs font-semibold uppercase tracking-widest text-white/25">{t}</span>
              ))}
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }`}</style>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/5 py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-600/8 blur-[100px]" />
          <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-purple-600/8 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl 2xl:max-w-[1440px] px-4">
          <Reveal className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Процесс работы</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">Как мы работаем</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/50 text-lg">
              От заявки до готового сайта — 5 шагов. Вы тратите максимум 20 минут.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className="group relative rounded-2xl border border-white/8 bg-gradient-to-b from-white/5 to-transparent p-6 transition hover:border-white/20 hover:shadow-lg"
              >
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-2 top-8 hidden h-px w-4 bg-gradient-to-r from-white/20 to-transparent lg:block" />
                )}
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black mb-4 transition group-hover:scale-110 ${STEP_COLORS[s.color]}`}>
                  {s.num}
                </div>
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/45">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/5 py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-purple-600/8 blur-[100px]" />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-cyan-500/6 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl 2xl:max-w-[1440px] px-4">
          <Reveal className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Что включено</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">Всё необходимое для запуска</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/50 text-lg">
              Цена фиксированная. Ниже — что входит и что оплачивается отдельно.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group rounded-2xl border bg-gradient-to-b from-white/6 to-white/2 p-7 shadow-lg transition hover:shadow-xl hover:scale-[1.02] ${ACCENT[f.accent]}`}
              >
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${ICON_BG[f.accent]}`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/50">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing transparency ──────────────────────────────────────────── */}
      <section className="relative border-t border-white/5 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-green-500/8 to-transparent blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-400">Прозрачные условия</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">Что входит — что нет</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/50">
              Никаких скрытых платежей. Честный список.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-green-500/25 bg-gradient-to-b from-green-500/10 to-green-500/3 p-7 shadow-lg shadow-green-500/5">
              <p className="mb-5 text-sm font-bold text-green-400 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-xs">✓</span>
                Входит в стоимость
              </p>
              <ul className="space-y-3 text-sm text-white/65">
                {[
                  "Разработка сайта на готовом шаблоне",
                  "Наполнение текстами и фотографиями",
                  "Адаптация под мобильные устройства",
                  "Подключение формы заявки",
                  "12 месяцев бесплатных правок",
                  "Общение в личном кабинете",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-green-400 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-orange-500/25 bg-gradient-to-b from-orange-500/10 to-orange-500/3 p-7 shadow-lg shadow-orange-500/5">
              <p className="mb-5 text-sm font-bold text-orange-400 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-xs">⚠</span>
                Оплачивается отдельно
              </p>
              <ul className="space-y-3 text-sm text-white/65">
                {[
                  "Доменное имя (≈ 500–1 500 ₽/год)",
                  "Хостинг для сайта (≈ 1 000–3 000 ₽/год)",
                  "SSL-сертификат (часто с хостингом)",
                  "Интеграции с кассой, CRM, доставкой",
                  "SEO-продвижение и реклама",
                  "Добавление изображений в шаблон",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-orange-400 shrink-0">⚠</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/4 p-7">
            <p className="mb-4 text-sm font-bold text-white">📋 Правила после запуска</p>
            <div className="grid gap-3 sm:grid-cols-3 text-sm text-white/60">
              <div className="rounded-xl bg-white/4 p-4">
                <p className="font-semibold text-white/80 mb-1">В течение 12 месяцев</p>
                <p>Базовые правки входят: обновить текст, заменить фото, добавить услугу.</p>
              </div>
              <div className="rounded-xl bg-white/4 p-4">
                <p className="font-semibold text-white/80 mb-1">После 12 месяцев</p>
                <p>Доработки по согласованному прайсу. Без сюрпризов.</p>
              </div>
              <div className="rounded-xl bg-white/4 p-4">
                <p className="font-semibold text-white/80 mb-1">Крупные изменения</p>
                <p>Новые разделы, функционал, редизайн — по отдельному договору.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing tiers ─────────────────────────────────────────────────── */}
      <PricingTiers />

      {/* ── Templates strip ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/5 py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-500/8 blur-[100px]" />
          <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-purple-500/6 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl 2xl:max-w-[1440px] px-4">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Один шаблон</p>
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">Подходит под любой бизнес</h2>
              <p className="mt-3 text-white/50 text-lg">
                Универсальный премиум-шаблон. Настраиваем под вашу нишу и бренд.
              </p>
            </div>
            <Link
              href="/templates"
              className="shrink-0 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/15"
            >
              О шаблоне →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {TEMPLATE_META.map(({ id, name, hint, color, icon }) => (
              <Link
                key={id}
                href="/customize/universal"
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 transition hover:border-white/25 hover:shadow-xl hover:scale-[1.04]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-60 transition group-hover:opacity-100`} />
                <div className="relative flex aspect-[3/4] items-center justify-center">
                  <span className="text-5xl drop-shadow-lg transition group-hover:scale-110">{icon}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-14">
                  <p className="text-xs font-bold text-white">{name}</p>
                  <p className="text-[10px] text-white/45">{hint}</p>
                </div>
                <div className="absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset ring-cyan-500/30 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/5 py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-96 w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/6 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-6xl 2xl:max-w-[1440px] px-4">
          <Reveal className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Отзывы</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">Клиенты о нас</h2>
            <p className="mx-auto mt-4 max-w-lg text-white/50">Реальные истории малого бизнеса</p>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {REVIEWS.map((r) => (
              <blockquote
                key={r.author}
                className="group rounded-2xl border border-white/8 bg-gradient-to-b from-white/6 to-white/2 p-7 transition hover:border-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/8"
              >
                <div className="mb-4 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-lg text-cyan-400 drop-shadow-[0_0_6px_#22d3ee]">★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-white/70">«{r.text}»</p>
                <footer className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500/40 to-blue-500/40 border border-white/10 flex items-center justify-center text-xs font-black text-white/60">
                    {r.author[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/80">{r.author}</p>
                    <p className="text-xs text-white/35">{r.city}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">FAQ</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">Частые вопросы</h2>
          </Reveal>
          <div className="space-y-3">
            {[
              {
                q: "Правда ли, что сайт будет готов за 3 дня?",
                a: "Да. После подтверждения заявки и получения материалов мы запускаем сайт в течение 3 рабочих дней. Большинство проектов готово быстрее.",
              },
              {
                q: "Что если мне нужны правки после запуска?",
                a: "Первые 12 месяцев базовые правки входят в стоимость: обновить текст, заменить фото, добавить услугу. Крупные изменения — по отдельному договору.",
              },
              {
                q: "Хостинг и SSL входят в стоимость?",
                a: "Нет. Домен, хостинг и SSL оплачиваются отдельно. Мы помогаем с выбором и настройкой, но аккаунт регистрируется на вас.",
              },
              {
                q: "Нужны ли технические знания?",
                a: "Нет. Вы выбираете шаблон, заполняете контакты и общаетесь через личный кабинет. Всё остальное делаем мы.",
              },
              {
                q: "Когда нужно платить?",
                a: "Только после того, как увидите готовый сайт на своём домене и одобрите его. Никакой предоплаты.",
              },
              {
                q: "Можно ли загружать свои фото в шаблон?",
                a: "Да. В конструкторе есть загрузка фото до 25 МБ. Добавление изображений оплачивается отдельно — менеджер уточнит сумму при оформлении.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-white/8 bg-white/3 p-7 transition hover:border-cyan-500/20 hover:bg-white/5"
              >
                <p className="font-bold text-white text-base">{item.q}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-[120px]" />
          <div className="absolute left-1/4 bottom-0 h-64 w-64 rounded-full bg-purple-600/10 blur-[80px]" />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-cyan-500/8 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/8 px-5 py-2 text-sm text-cyan-400 mb-8">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            Предоплата 0 ₽
          </div>
          <h2 className="text-5xl font-black sm:text-6xl lg:text-7xl leading-tight">
            <span className="text-white">Готовы запустить</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              свой сайт?
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/55">
            Выберите шаблон, заполните короткую форму — и мы свяжемся с вами в течение часа.
          </p>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/templates"
              className="group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-5 text-base font-bold text-white shadow-2xl shadow-cyan-500/30 transition hover:shadow-cyan-500/50 hover:scale-[1.04]"
            >
              Выбрать шаблон
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/6 px-10 py-5 text-base font-medium text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              Войти в кабинет
            </Link>
          </div>

          <TrustBadges className="mt-10" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
