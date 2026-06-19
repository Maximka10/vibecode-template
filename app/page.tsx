import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const FEATURES = [
  {
    icon: "⚡",
    title: "Готово за 3 дня",
    text: "Запускаем сайт быстро — без длинных брифов, планёрок и задержек. Вы оставляете заявку, мы приступаем в тот же день.",
  },
  {
    icon: "🎨",
    title: "5 отраслевых шаблонов",
    text: "Кофейня, барбершоп, салон красоты, автомойка, ресторан — каждый шаблон спроектирован под конкретный тип бизнеса.",
  },
  {
    icon: "💬",
    title: "Чат с менеджером",
    text: "Всё общение — в личном кабинете. Задавайте вопросы, согласовывайте правки и следите за прогрессом без мессенджеров.",
  },
  {
    icon: "🌐",
    title: "Домен + хостинг",
    text: "Регистрируем доменное имя, настраиваем SSL-сертификат и подключаем аналитику. Технические детали — наша забота.",
  },
  {
    icon: "₽",
    title: "0 ₽ предоплата",
    text: "Оплата только после того, как вы увидели готовый сайт и остались довольны. Никакого риска с вашей стороны.",
  },
  {
    icon: "🛡",
    title: "12 месяцев поддержки",
    text: "Обновление текстов, замена фото, мелкие доработки и техническая поддержка — включены в стоимость на год.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Выберите шаблон",
    text: "Выберите шаблон, подходящий вашему бизнесу. Посмотрите превью и настройте цвета, тексты и фотографии прямо в редакторе.",
  },
  {
    num: "02",
    title: "Оставьте заявку",
    text: "Укажите контакты — телефон или Telegram. Никаких длинных форм: имя, номер, пожелания — и всё.",
  },
  {
    num: "03",
    title: "Мы свяжемся за 1 час",
    text: "Менеджер уточнит детали, согласует структуру и запустит разработку. Вы увидите первый результат уже через день.",
  },
  {
    num: "04",
    title: "Принимаете сайт",
    text: "Смотрите готовый сайт на своём домене. Если нужны правки — вносим бесплатно. Только после вашего «ок» выставляем счёт.",
  },
  {
    num: "05",
    title: "Сайт работает",
    text: "Клиенты находят вас в поиске и оставляют заявки. Вы занимаетесь бизнесом — мы поддерживаем сайт.",
  },
];

const REVIEWS = [
  {
    text: "Сайт запустили за 2 дня. Уже в первую неделю пошли заявки через контактную форму. Очень доволен результатом.",
    author: "Кофейня «Эспрессо Бар»",
    city: "Москва",
  },
  {
    text: "Помогли с текстами и фото, домен подключили сами. Мне ничего не пришлось делать — только принять готовый сайт.",
    author: "Салон красоты «Люкс»",
    city: "Санкт-Петербург",
  },
  {
    text: "Наконец-то сайт, который не стыдно показать клиентам. Современный дизайн, быстро грузится, есть онлайн-запись.",
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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
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
            Берём готовый шаблон под ваш бизнес, вносим тексты и фотографии, подключаем домен и хостинг.
            Все вопросы и правки решаем прямо в личном кабинете — без звонков и переписок.
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

          {/* Trust bar */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TRUST.map((t) => (
              <div key={t.label} className="rounded-2xl border border-white/8 bg-white/4 py-4">
                <p className="text-2xl font-black text-white">{t.value}</p>
                <p className="mt-1 text-xs text-white/40">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-slate-900/30">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Процесс</p>
            <h2 className="mt-3 text-3xl font-black">Как это работает</h2>
            <p className="mt-3 text-white/50 max-w-lg mx-auto">
              От заявки до готового сайта — 5 шагов. Вы тратите максимум 20 минут, остальное делаем мы.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {STEPS.map((s) => (
              <div key={s.num} className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <p className="text-3xl font-black text-white/15">{s.num}</p>
                <h3 className="mt-3 font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Что включено</p>
            <h2 className="mt-3 text-3xl font-black">Всё в одном пакете</h2>
            <p className="mt-3 text-white/50 max-w-lg mx-auto">
              Никаких скрытых доплат. Цена — фиксированная. В неё входит всё необходимое для запуска.
            </p>
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

      {/* ── Templates strip ───────────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-slate-900/20">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Шаблоны</p>
              <h2 className="mt-2 text-3xl font-black">5 отраслевых шаблонов</h2>
              <p className="mt-2 text-white/55">
                Каждый шаблон создан под конкретный тип бизнеса — структура, тексты и блоки уже продуманы.
              </p>
            </div>
            <Link
              href="/templates"
              className="shrink-0 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/40"
            >
              Смотреть все →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {TEMPLATE_META.map(({ id, name, hint }) => (
              <Link
                key={id}
                href={`/customize/${id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/25 hover:scale-[1.03]"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={`/templates/${id}.svg`}
                    alt={name}
                    className="h-full w-full object-cover object-top opacity-90 transition group-hover:opacity-100 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10">
                  <p className="text-xs font-bold text-white">{name}</p>
                  <p className="text-[10px] text-white/50">{hint}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5">
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
                <p className="text-sm leading-relaxed text-white/70">«{r.text}»</p>
                <footer className="mt-4">
                  <p className="text-xs font-semibold text-white/60">{r.author}</p>
                  <p className="text-xs text-white/30">{r.city}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-slate-900/30">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Частые вопросы</p>
            <h2 className="mt-3 text-3xl font-black">Ответы на главные вопросы</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Правда ли, что сайт будет готов за 3 дня?",
                a: "Да. После подтверждения заявки и получения материалов (тексты, фото) мы запускаем сайт в течение 3 рабочих дней. Большинство проектов готово даже быстрее.",
              },
              {
                q: "Что если мне нужны правки после запуска?",
                a: "Первые 12 месяцев правки входят в стоимость. Обновить тексты, заменить фото, добавить новую услугу — просто напишите в чат в личном кабинете.",
              },
              {
                q: "Нужны ли у меня технические знания?",
                a: "Нет. Вы выбираете шаблон, заполняете форму и общаетесь с нами через личный кабинет. Всё остальное — домен, хостинг, настройка — делаем мы.",
              },
              {
                q: "Когда нужно платить?",
                a: "Только после того, как вы увидите готовый сайт на вашем домене и одобрите его. Никакой предоплаты — это наш принцип.",
              },
              {
                q: "Можно ли адаптировать шаблон под свой бренд?",
                a: "Да. В редакторе вы меняете цвета, загружаете фотографии и правите все тексты. Наша команда дополнительно настроит шаблон под ваш фирменный стиль.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/8 bg-white/4 p-6">
                <p className="font-semibold text-white">{item.q}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">Готовы запустить сайт?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Выберите шаблон, заполните короткую форму — и мы свяжемся с вами в течение часа.
            Без предоплаты, без долгих согласований.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-black transition hover:bg-white/90"
            >
              Выбрать шаблон →
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

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 bg-black/40">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-black text-white">VIBECODE STUDIO</p>
              <p className="mt-1 text-sm text-white/40">Сайты для малого бизнеса · Россия</p>
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
