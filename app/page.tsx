import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";

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
    accent: "cyan",
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
    text: "Меняете цвета, тексты и фото прямо в редакторе. Домен, SSL, хостинг — по договорённости отдельно.",
    accent: "purple",
  },
];

const STEPS = [
  { num: "01", title: "Выберите шаблон", text: "Превью и редактор прямо в браузере." },
  { num: "02", title: "Оставьте заявку", text: "Имя и Telegram — никаких длинных форм." },
  { num: "03", title: "Звоним за 1 час", text: "Уточняем детали и запускаем разработку." },
  { num: "04", title: "Принимаете сайт", text: "Правки до одобрения — бесплатно." },
  { num: "05", title: "Сайт работает", text: "Клиенты находят вас в поиске." },
];

const REVIEWS = [
  {
    text: "Сайт запустили за 2 дня. Уже в первую неделю пошли заявки через контактную форму.",
    author: "Кофейня «Эспрессо Бар»",
    city: "Москва",
    avatar: "ЭБ",
  },
  {
    text: "Помогли с текстами и фото, домен подключили сами. Мне ничего не пришлось делать — только принять готовый сайт.",
    author: "Салон красоты «Люкс»",
    city: "Санкт-Петербург",
    avatar: "СЛ",
  },
  {
    text: "Наконец-то сайт, который не стыдно показать клиентам. Современный дизайн, быстро грузится.",
    author: "Барбершоп «Бритва»",
    city: "Екатеринбург",
    avatar: "ББ",
  },
];

const TEMPLATE_META = [
  { id: "coffee-shop", name: "Кофейня", hint: "Меню · онлайн-заказ · акции" },
  { id: "beauty-salon", name: "Салон красоты", hint: "Услуги · запись · цены" },
  { id: "barber-shop", name: "Барбершоп", hint: "Мастера · прайс · запись" },
  { id: "car-wash", name: "Автомойка", hint: "Услуги · боксы · очередь" },
  { id: "restaurant", name: "Ресторан", hint: "Меню · бронь · акции" },
];

const TRUST = [
  { value: "50+", label: "Сайтов запущено" },
  { value: "3 дня", label: "Средний срок" },
  { value: "0 ₽", label: "Предоплата" },
  { value: "12 мес.", label: "Поддержка" },
];

const GLOW: Record<string, string> = {
  cyan: "hover:shadow-[0_0_40px_-8px_rgba(34,211,238,0.35)] hover:border-cyan-500/50",
  blue: "hover:shadow-[0_0_40px_-8px_rgba(96,165,250,0.35)] hover:border-blue-500/50",
  purple: "hover:shadow-[0_0_40px_-8px_rgba(192,132,252,0.35)] hover:border-purple-500/50",
};

const ICON_BG: Record<string, string> = {
  cyan: "bg-cyan-500/15 text-cyan-400 shadow-[0_0_20px_-4px_rgba(34,211,238,0.4)]",
  blue: "bg-blue-500/15 text-blue-400 shadow-[0_0_20px_-4px_rgba(96,165,250,0.4)]",
  purple: "bg-purple-500/15 text-purple-400 shadow-[0_0_20px_-4px_rgba(192,132,252,0.4)]",
};

const BORDER: Record<string, string> = {
  cyan: "border-cyan-500/20",
  blue: "border-blue-500/20",
  purple: "border-purple-500/20",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Ambient glow layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 -top-32 h-[800px] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/18 via-blue-600/10 to-transparent blur-[140px]" />
          <div className="absolute -left-64 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute -right-64 top-1/3 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-28 text-center sm:pb-36 sm:pt-32">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/8 px-5 py-2 text-sm font-medium text-cyan-400 shadow-[0_0_30px_-8px_rgba(34,211,238,0.5)] backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.8)]" />
            Для малого бизнеса в России
          </div>

          {/* Headline */}
          <h1 className="mx-auto mt-8 max-w-5xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Готовый сайт
            <br />
            <span className="relative inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(34,211,238,0.4)]">
              за 3 дня
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/50 sm:text-xl">
            Берём готовый шаблон под ваш бизнес, вносим тексты и фотографии.
            <br className="hidden sm:block" />
            Все правки — в личном кабинете. Оплата — только после приёмки.
          </p>

          {/* Price tag */}
          <p className="mt-4 text-sm font-semibold text-white/30">
            от{" "}
            <span className="font-black text-white/60">13 900 ₽</span>
            {" "}· без предоплаты
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/templates"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-9 py-4 text-base font-bold text-white shadow-[0_0_40px_-4px_rgba(34,211,238,0.6)] transition-all hover:shadow-[0_0_60px_-4px_rgba(34,211,238,0.8)] hover:scale-[1.04] active:scale-[0.98]"
            >
              Выбрать шаблон
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-9 py-4 text-base font-medium text-white/70 backdrop-blur transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              Войти в кабинет
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {TRUST.map((t, i) => (
              <div
                key={t.label}
                className="rounded-2xl border border-white/8 bg-white/3 py-6 backdrop-blur transition-all hover:border-white/15 hover:bg-white/5"
                style={{ boxShadow: i % 2 === 0 ? "0 0 30px -10px rgba(34,211,238,0.15)" : "0 0 30px -10px rgba(192,132,252,0.15)" }}
              >
                <p className="bg-gradient-to-br from-white to-white/60 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                  {t.value}
                </p>
                <p className="mt-1 text-xs text-white/35 sm:text-sm">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600/6 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Процесс</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">Как это работает</h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/45">
              От заявки до готового сайта — 5 шагов. Вы тратите максимум 20 минут.
            </p>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {/* Connecting line on lg */}
            <div className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent lg:block" />

            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className="group relative rounded-2xl border border-white/8 bg-gradient-to-b from-white/5 to-transparent p-6 transition-all hover:border-cyan-500/30 hover:shadow-[0_0_40px_-10px_rgba(34,211,238,0.25)]"
              >
                <div className="relative z-10 mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 text-sm font-black text-white/50 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-all lg:mx-0">
                  {s.num}
                </div>
                <h3 className="text-sm font-bold text-white sm:text-base">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/40 sm:text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-purple-600/6 blur-[100px]" />
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-cyan-600/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Что включено</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">Всё для старта</h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/45">
              Цена фиксированная. Ниже — честный список того, что входит в стоимость.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group rounded-2xl border bg-gradient-to-b from-white/5 to-white/2 p-6 transition-all duration-300 ${BORDER[f.accent]} ${GLOW[f.accent]}`}
              >
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-all group-hover:scale-110 ${ICON_BG[f.accent]}`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing transparency ─────────────────────────────────────────────── */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 py-24 sm:py-32">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Прозрачность</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">Что входит — что нет</h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/45">
              Никаких скрытых платежей. Честно.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/8 to-transparent p-7 shadow-[0_0_40px_-12px_rgba(16,185,129,0.3)]">
              <p className="mb-5 flex items-center gap-2 text-sm font-bold text-emerald-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs">✓</span>
                Входит в стоимость
              </p>
              <ul className="space-y-3 text-sm text-white/60">
                {[
                  "Разработка сайта на готовом шаблоне",
                  "Наполнение текстами и фотографиями",
                  "Адаптация под мобильные устройства",
                  "Подключение формы заявки",
                  "12 месяцев бесплатных правок",
                  "Общение в личном кабинете",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-500/8 to-transparent p-7 shadow-[0_0_40px_-12px_rgba(249,115,22,0.2)]">
              <p className="mb-5 flex items-center gap-2 text-sm font-bold text-orange-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-xs">⚠</span>
                Оплачивается отдельно
              </p>
              <ul className="space-y-3 text-sm text-white/60">
                {[
                  "Доменное имя (≈ 500–1 500 ₽/год)",
                  "Хостинг (≈ 1 000–3 000 ₽/год)",
                  "SSL-сертификат (часто идёт с хостингом)",
                  "Интеграции с кассой, доставкой, CRM",
                  "SEO-продвижение и реклама",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-orange-400">⚠</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-6">
            <p className="mb-3 text-sm font-bold text-white">📋 После запуска</p>
            <div className="space-y-2 text-sm text-white/50">
              <p><span className="font-semibold text-white/75">Первые 12 месяцев</span> — обновить текст, заменить фото, добавить услугу. Бесплатно.</p>
              <p><span className="font-semibold text-white/75">После 12 месяцев</span> — доработки по согласованному прайсу.</p>
              <p><span className="font-semibold text-white/75">Крупные изменения</span> — новый функционал, редизайн — по отдельному договору.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Templates strip ──────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 bottom-0 h-64 w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Шаблоны</p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">
                5 отраслевых
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  шаблонов
                </span>
              </h2>
              <p className="mt-3 text-base text-white/45">
                Структура и блоки уже продуманы под каждый бизнес.
              </p>
            </div>
            <Link
              href="/templates"
              className="shrink-0 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white/70 backdrop-blur transition-all hover:border-cyan-500/40 hover:bg-white/8 hover:text-white"
            >
              Все шаблоны →
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
            {TEMPLATE_META.map(({ id, name, hint }) => (
              <Link
                key={id}
                href={`/customize/${id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_40px_-8px_rgba(34,211,238,0.3)] hover:-translate-y-1"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={`/templates/${id}.svg`}
                    alt={name}
                    className="h-full w-full object-cover object-top opacity-80 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 pt-14">
                  <p className="text-xs font-bold text-white sm:text-sm">{name}</p>
                  <p className="mt-0.5 text-[10px] text-white/40 sm:text-xs">{hint}</p>
                </div>
                <div className="absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset ring-cyan-500/30 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Отзывы</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl lg:text-5xl">Клиенты о нас</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {REVIEWS.map((r, i) => (
              <blockquote
                key={r.author}
                className="group relative rounded-2xl border border-white/8 bg-gradient-to-b from-white/5 to-transparent p-7 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]"
              >
                {/* Quote mark */}
                <div className="absolute right-6 top-5 text-5xl font-black leading-none text-white/5 select-none">"</div>
                <div className="mb-4 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-base text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]">★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-white/60 sm:text-base">«{r.text}»</p>
                <footer className="mt-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: i === 0
                        ? "linear-gradient(135deg,rgba(34,211,238,0.3),rgba(96,165,250,0.3))"
                        : i === 1
                        ? "linear-gradient(135deg,rgba(192,132,252,0.3),rgba(96,165,250,0.3))"
                        : "linear-gradient(135deg,rgba(96,165,250,0.3),rgba(34,211,238,0.3))",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/75">{r.author}</p>
                    <p className="text-xs text-white/30">{r.city}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 py-24 sm:py-32">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">FAQ</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Частые вопросы</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Правда ли, что сайт будет готов за 3 дня?",
                a: "Да. После подтверждения заявки и получения материалов мы запускаем сайт в течение 3 рабочих дней. Большинство проектов готово быстрее.",
              },
              {
                q: "Что если мне нужны правки после запуска?",
                a: "Первые 12 месяцев базовые правки входят в стоимость. Крупные изменения — по отдельному договору.",
              },
              {
                q: "Хостинг и SSL входят в стоимость?",
                a: "Нет. Домен, хостинг и SSL оплачиваются отдельно. Мы помогаем с выбором и настройкой.",
              },
              {
                q: "Нужны ли технические знания?",
                a: "Нет. Выбираете шаблон, заполняете контакты, общаетесь в личном кабинете. Всё остальное делаем мы.",
              },
              {
                q: "Когда нужно платить?",
                a: "Только после того, как увидите готовый сайт на своём домене и одобрите его. Никакой предоплаты.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-white/8 bg-white/3 p-6 transition-all hover:border-white/15 hover:bg-white/5"
              >
                <p className="font-bold text-white">{item.q}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/15 via-blue-500/8 to-transparent blur-[120px]" />
          <div className="absolute left-1/4 bottom-0 h-64 w-64 rounded-full bg-purple-500/8 blur-[80px]" />
          <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-cyan-500/8 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-32 text-center sm:py-40">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Готовы начать?</p>
          <h2 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Запустите сайт
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(34,211,238,0.3)]">
              без предоплаты
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/45">
            Выберите шаблон и заполните короткую форму. Позвоним в течение часа.
          </p>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/templates"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-10 py-4 text-base font-bold text-white shadow-[0_0_50px_-8px_rgba(34,211,238,0.7)] transition-all hover:shadow-[0_0_70px_-8px_rgba(34,211,238,0.9)] hover:scale-[1.04] active:scale-[0.98]"
            >
              Выбрать шаблон
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-10 py-4 text-base font-medium text-white/65 backdrop-blur transition-all hover:border-white/30 hover:bg-white/8 hover:text-white"
            >
              Войти в кабинет
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
