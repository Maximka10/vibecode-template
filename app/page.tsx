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
    text: "Меняете цвета, тексты и фото прямо в редакторе. Всё остальное — домен, SSL, хостинг — оплачивается отдельно.",
    accent: "purple",
  },
];

const STEPS = [
  { num: "01", title: "Выберите шаблон", text: "Посмотрите превью и настройте цвета, тексты и фото прямо в редакторе." },
  { num: "02", title: "Оставьте заявку", text: "Имя, телефон или Telegram — никаких длинных форм." },
  { num: "03", title: "Мы свяжемся за 1 час", text: "Менеджер уточняет детали и запускает разработку." },
  { num: "04", title: "Принимаете сайт", text: "Смотрите результат на своём домене. Правки — до одобрения бесплатны." },
  { num: "05", title: "Сайт работает", text: "Клиенты находят вас в поиске. Вы занимаетесь бизнесом." },
];

const REVIEWS = [
  {
    text: "Сайт запустили за 2 дня. Уже в первую неделю пошли заявки через контактную форму.",
    author: "Кофейня «Эспрессо Бар»",
    city: "Москва",
  },
  {
    text: "Помогли с текстами и фото, домен подключили сами. Мне ничего не пришлось делать — только принять готовый сайт.",
    author: "Салон красоты «Люкс»",
    city: "Санкт-Петербург",
  },
  {
    text: "Наконец-то сайт, который не стыдно показать клиентам. Современный дизайн, быстро грузится.",
    author: "Барбершоп «Бритва»",
    city: "Екатеринбург",
  },
];

const TEMPLATE_META = [
  { id: "coffee-shop", name: "Кофейня", hint: "Меню, онлайн-заказ, акции" },
  { id: "beauty-salon", name: "Салон красоты", hint: "Услуги, онлайн-запись, цены" },
  { id: "barber-shop", name: "Барбершоп", hint: "Мастера, прайс, запись" },
  { id: "car-wash", name: "Автомойка", hint: "Услуги, боксы, онлайн-очередь" },
  { id: "restaurant", name: "Ресторан", hint: "Меню, бронь стола, акции" },
];

const TRUST = [
  { value: "50+", label: "Сайтов запущено" },
  { value: "3 дня", label: "Средний срок" },
  { value: "0 ₽", label: "Предоплата" },
  { value: "12 мес.", label: "Поддержка" },
];

const ACCENT: Record<string, string> = {
  cyan: "border-cyan-500/20 group-hover:border-cyan-500/40 group-hover:shadow-cyan-500/10",
  blue: "border-blue-500/20 group-hover:border-blue-500/40 group-hover:shadow-blue-500/10",
  purple: "border-purple-500/20 group-hover:border-purple-500/40 group-hover:shadow-purple-500/10",
};

const ICON_BG: Record<string, string> = {
  cyan: "bg-cyan-500/15 text-cyan-400",
  blue: "bg-blue-500/15 text-blue-400",
  purple: "bg-purple-500/15 text-purple-400",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Layered glow background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-80px] h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/12 via-blue-500/8 to-transparent blur-[120px]" />
          <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-blue-600/8 blur-[100px]" />
          <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-purple-600/8 blur-[100px]" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/4 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 shadow-lg shadow-cyan-500/10">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            Для малого бизнеса в России
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Готовый сайт за 3 дня
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              от 13 900 ₽
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/55">
            Берём готовый шаблон под ваш бизнес, вносим тексты и фотографии.
            Все правки — в личном кабинете. Домен, хостинг и SSL — по договорённости отдельно.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/templates"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 hover:scale-[1.03]"
            >
              Выбрать шаблон →
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-medium text-white/80 backdrop-blur transition hover:border-white/35 hover:bg-white/8 hover:text-white"
            >
              Войти в кабинет
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRUST.map((t) => (
              <div
                key={t.label}
                className="rounded-2xl border border-white/8 bg-white/4 py-5 backdrop-blur transition hover:border-white/15 hover:bg-white/6"
              >
                <p className="bg-gradient-to-br from-white to-white/70 bg-clip-text text-2xl font-black text-transparent">{t.value}</p>
                <p className="mt-1 text-xs text-white/40">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-600/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-24">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Процесс</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Как это работает</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/50">
              От заявки до готового сайта — 5 шагов. Вы тратите максимум 20 минут, остальное делаем мы.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className="group relative rounded-2xl border border-white/8 bg-gradient-to-b from-white/5 to-white/2 p-5 transition hover:border-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/5"
              >
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-1.5 top-7 hidden h-px w-3 bg-white/15 lg:block" />
                )}
                <p className="text-3xl font-black text-white/10 group-hover:text-cyan-500/20 transition">{s.num}</p>
                <h3 className="mt-3 text-sm font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/45">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/5 bg-gradient-to-b from-slate-900/40 to-transparent">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-purple-600/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-24">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Что включено</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Всё необходимое для запуска</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/50">
              Цена фиксированная. Ниже — что входит в стоимость, а что оплачивается отдельно.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group rounded-2xl border bg-gradient-to-b from-white/5 to-white/2 p-6 shadow-lg transition hover:shadow-xl ${ACCENT[f.accent]}`}
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl ${ICON_BG[f.accent]}`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing transparency ──────────────────────────────────────────── */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Прозрачные условия</p>
            <h2 className="mt-3 text-3xl font-black">Что входит — что нет</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/50">
              Никаких скрытых платежей. Ниже — честный список того, что включено в цену, а что нужно оплатить отдельно.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Included */}
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
              <p className="mb-4 text-sm font-bold text-green-400">✓ Входит в стоимость</p>
              <ul className="space-y-2.5 text-sm text-white/65">
                {[
                  "Разработка сайта на готовом шаблоне",
                  "Наполнение текстами и фотографиями",
                  "Адаптация под мобильные устройства",
                  "Подключение формы заявки/обратной связи",
                  "12 месяцев бесплатных правок после запуска",
                  "Общение и согласование в личном кабинете",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Not included */}
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
              <p className="mb-4 text-sm font-bold text-orange-400">⚠ Оплачивается отдельно</p>
              <ul className="space-y-2.5 text-sm text-white/65">
                {[
                  "Доменное имя (≈ 500–1 500 ₽/год)",
                  "Хостинг для сайта (≈ 1 000–3 000 ₽/год)",
                  "SSL-сертификат (часто идёт с хостингом)",
                  "Интеграции с кассой, доставкой, CRM",
                  "SEO-продвижение и реклама",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-orange-400">⚠</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Post-launch policy */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/4 p-6">
            <p className="mb-3 text-sm font-bold text-white">📋 Правила после запуска</p>
            <div className="space-y-2 text-sm text-white/60">
              <p>
                <span className="text-white/80 font-medium">В течение 12 месяцев после запуска</span> — правки
                входят в стоимость: обновить текст, заменить фото, добавить услугу.
              </p>
              <p>
                <span className="text-white/80 font-medium">После 12 месяцев или за рамками базовых правок</span> —
                доработки оплачиваются отдельно по согласованному прайсу.
              </p>
              <p>
                <span className="text-white/80 font-medium">Крупные изменения</span> (новые разделы, функционал,
                редизайн) — всегда по отдельному договору, независимо от срока.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Templates strip ───────────────────────────────────────────────── */}
      <section className="relative border-t border-white/5 bg-gradient-to-b from-slate-900/30 to-transparent">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-cyan-500/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-24">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Шаблоны</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">5 отраслевых шаблонов</h2>
              <p className="mt-2 text-white/50">
                Каждый шаблон создан под конкретный тип бизнеса — структура и блоки уже продуманы.
              </p>
            </div>
            <Link
              href="/templates"
              className="shrink-0 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-cyan-500/40 hover:text-white"
            >
              Смотреть все →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TEMPLATE_META.map(({ id, name, hint }) => (
              <Link
                key={id}
                href={`/customize/${id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 transition hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.03]"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={`/templates/${id}.svg`}
                    alt={name}
                    className="h-full w-full object-cover object-top opacity-85 transition group-hover:opacity-100 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-12">
                  <p className="text-xs font-bold text-white">{name}</p>
                  <p className="text-[10px] text-white/45">{hint}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-24">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Отзывы</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Клиенты о нас</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {REVIEWS.map((r) => (
              <blockquote
                key={r.author}
                className="group rounded-2xl border border-white/8 bg-gradient-to-b from-white/5 to-white/2 p-6 transition hover:border-white/15"
              >
                <div className="mb-3 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-sm text-cyan-400">★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-white/65">«{r.text}»</p>
                <footer className="mt-5 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-white/10" />
                  <div>
                    <p className="text-xs font-semibold text-white/70">{r.author}</p>
                    <p className="text-xs text-white/30">{r.city}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-gradient-to-b from-slate-900/40 to-transparent">
        <div className="mx-auto max-w-3xl px-4 py-24">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">FAQ</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Частые вопросы</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Правда ли, что сайт будет готов за 3 дня?",
                a: "Да. После подтверждения заявки и получения материалов (тексты, фото) мы запускаем сайт в течение 3 рабочих дней. Большинство проектов готово быстрее.",
              },
              {
                q: "Что если мне нужны правки после запуска?",
                a: "Первые 12 месяцев базовые правки входят в стоимость: обновить текст, заменить фото, добавить услугу. Крупные изменения (новый функционал, новый дизайн) — по отдельному договору.",
              },
              {
                q: "Хостинг и SSL входят в стоимость?",
                a: "Нет. Домен, хостинг и SSL-сертификат оплачиваются отдельно. Мы помогаем с выбором и настройкой, но регистрация — на ваш аккаунт.",
              },
              {
                q: "Нужны ли у меня технические знания?",
                a: "Нет. Вы выбираете шаблон, заполняете контакты и общаетесь через личный кабинет. Всё остальное делаем мы.",
              },
              {
                q: "Когда нужно платить?",
                a: "Только после того, как вы увидите готовый сайт на вашем домене и одобрите его. Никакой предоплаты.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-white/8 bg-white/3 p-6 transition hover:border-white/15 hover:bg-white/4"
              >
                <p className="font-semibold text-white">{item.q}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/10 via-blue-500/6 to-transparent blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-28 text-center">
          <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl">
            Готовы запустить сайт?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/55">
            Выберите шаблон, заполните короткую форму — и мы свяжемся с вами в течение часа.
            Без предоплаты, без долгих согласований.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-9 py-4 font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 hover:scale-[1.03]"
            >
              Выбрать шаблон →
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-9 py-4 font-medium text-white/80 transition hover:border-white/35 hover:text-white"
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
