import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const FEATURES = [
  { icon: "⚡", title: "Готово за 3 дня", text: "Запускаем сайт быстро — без лишних согласований и задержек." },
  { icon: "🎨", title: "5 отраслевых шаблонов", text: "Кофейня, барбершоп, салон, автомойка, ресторан — сразу в деле." },
  { icon: "💬", title: "Чат с менеджером", text: "Общайтесь с командой прямо в личном кабинете — без мессенджеров." },
  { icon: "🌐", title: "Домен + хостинг", text: "Регистрируем домен, настраиваем SSL и аналитику под ключ." },
  { icon: "₽", title: "0 ₽ предоплата", text: "Оплата только после того, как вы увидите готовый сайт." },
  { icon: "🛡", title: "12 месяцев поддержки", text: "Правки, обновления и техническая поддержка включены." },
];

const REVIEWS = [
  { text: "Сайт запустили за 2 дня. Уже в первую неделю пошли заявки через форму.", author: "Кофейня «Эспрессо Бар»" },
  { text: "Помогли с текстами и фото, домен подключили сами. Очень удобно.", author: "Салон красоты «Люкс»" },
  { text: "Наконец-то сайт, который не стыдно показать клиентам.", author: "Барбершоп «Бритва»" },
];

const TEMPLATE_IDS = ["coffee-shop", "beauty-salon", "barber-shop", "car-wash", "restaurant"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[120px]" />
          <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-blue-600/6 blur-[80px]" />
          <div className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-purple-600/6 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Для малого бизнеса в России
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Готовый сайт за 3 дня
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              от 13 900 ₽
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            Берём шаблон под ваш бизнес, вносим тексты и фото, подключаем домен и хостинг.
            Все вопросы решаем в личном кабинете.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition hover:bg-white/90 hover:scale-[1.02]"
            >
              Выбрать шаблон →
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-medium text-white/80 transition hover:border-white/40 hover:bg-white/10"
            >
              Войти в кабинет
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
            <span>✓ 50+ сайтов запущено</span>
            <span className="hidden sm:block">·</span>
            <span>✓ 0 ₽ предоплата</span>
            <span className="hidden sm:block">·</span>
            <span>✓ 3 дня срок</span>
            <span className="hidden sm:block">·</span>
            <span>✓ 12 мес. поддержка</span>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="border-t border-white/5 bg-slate-900/30">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Что включено</p>
            <h2 className="mt-3 text-3xl font-black">Всё готово с первого дня</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/8 bg-white/4 p-6 transition hover:border-white/15 hover:bg-white/6"
              >
                <div className="mb-4 text-2xl">{f.icon}</div>
                <h3 className="font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates strip */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Шаблоны</p>
              <h2 className="mt-2 text-3xl font-black">5 готовых шаблонов</h2>
              <p className="mt-2 text-white/55">Кофейня, салон, барбершоп, автомойка, ресторан</p>
            </div>
            <Link
              href="/templates"
              className="shrink-0 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/40"
            >
              Смотреть все →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TEMPLATE_IDS.map((id) => (
              <Link
                key={id}
                href={`/customize/${id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/25 hover:scale-[1.03]"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={`/templates/${id}.svg`}
                    alt={id}
                    className="h-full w-full object-cover object-top opacity-90 transition group-hover:opacity-100 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                  <p className="text-xs font-semibold text-white/90">Выбрать →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="border-t border-white/5 bg-slate-900/20">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Отзывы</p>
            <h2 className="mt-3 text-3xl font-black">Клиенты о нас</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {REVIEWS.map((r) => (
              <blockquote
                key={r.author}
                className="rounded-2xl border border-white/8 bg-white/4 p-6"
              >
                <div className="mb-3 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-sm text-cyan-400">★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-white/70">"{r.text}"</p>
                <footer className="mt-4 text-xs font-semibold text-white/40">{r.author}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">Готовы запустить сайт?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Выберите шаблон, заполните форму и мы свяжемся с вами в течение часа.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-black transition hover:bg-white/90"
            >
              Выбрать шаблон
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-medium text-white/80 transition hover:border-white/40"
            >
              Войти в кабинет
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 bg-black/40">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-black text-white">VIBECODE STUDIO</p>
              <p className="mt-1 text-sm text-white/40">Сайты для малого бизнеса · Москва</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-white/50">
              <Link href="/templates" className="transition hover:text-white">Шаблоны</Link>
              <Link href="/auth/login" className="transition hover:text-white">Личный кабинет</Link>
            </div>
          </div>
          <p className="mt-8 text-xs text-white/25">© {new Date().getFullYear()} Vibecode Studio. Все права защищены.</p>
        </div>
      </footer>
    </main>
  );
}
