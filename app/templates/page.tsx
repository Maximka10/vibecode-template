import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { templates } from "@/lib/templates";

export const metadata = {
  title: "Премиум-шаблон — Vibecode Studio",
  description:
    "Один универсальный премиум-шаблон под любой бизнес: светлая и тёмная темы, свечение и градиенты, все секции и полное редактирование.",
};

function PremiumPreview() {
  return (
    <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="glow" cx="0.7" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill="#0b1020" />
      <rect width="400" height="240" fill="url(#glow)" />
      <circle cx="320" cy="40" r="120" fill="#22d3ee" fillOpacity="0.12" />
      {/* nav */}
      <rect width="400" height="26" fill="#0b1020" fillOpacity="0.85" />
      <rect x="14" y="9" width="44" height="9" rx="3" fill="url(#g1)" />
      <rect x="320" y="8" width="62" height="12" rx="6" fill="url(#g1)" />
      {/* hero text */}
      <rect x="20" y="58" width="150" height="14" rx="3" fill="#fff" fillOpacity="0.92" />
      <rect x="20" y="78" width="120" height="14" rx="3" fill="#fff" fillOpacity="0.92" />
      <rect x="20" y="102" width="160" height="6" rx="3" fill="#cbd5e1" fillOpacity="0.6" />
      <rect x="20" y="114" width="130" height="6" rx="3" fill="#cbd5e1" fillOpacity="0.45" />
      <rect x="20" y="132" width="92" height="22" rx="11" fill="url(#g1)" />
      {/* hero card with glow */}
      <rect x="232" y="56" width="150" height="104" rx="16" fill="#0f172a" stroke="#ffffff22" />
      <rect x="248" y="72" width="118" height="58" rx="10" fill="url(#g1)" fillOpacity="0.5" />
      <rect x="248" y="138" width="70" height="8" rx="4" fill="#fff" fillOpacity="0.4" />
      {/* feature row */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={20 + i * 92} y={178} width={78} height={44} rx="10" fill="#0f172a" stroke="#ffffff14" />
          <circle cx={34 + i * 92} cy={194} r="6" fill="url(#g1)" />
          <rect x={46 + i * 92} y={190} width={40} height={6} rx="3" fill="#fff" fillOpacity="0.5" />
          <rect x={30 + i * 92} y={206} width={56} height={5} rx="2" fill="#cbd5e1" fillOpacity="0.3" />
        </g>
      ))}
    </svg>
  );
}

const FEATURES = [
  "Светлая и тёмная тема в один клик",
  "Свечение, градиенты и плавные анимации",
  "Все секции: hero, услуги, галерея, отзывы, цены, FAQ, карта, контакты",
  "Адаптив под телефон, планшет и десктоп",
  "Форма заявки с уведомлением в Telegram",
  "Домен, хостинг и SSL на 1 год",
];

const INCLUDED = [
  { icon: "🌐", text: "Домен и хостинг" },
  { icon: "🔒", text: "SSL-сертификат" },
  { icon: "📱", text: "Мобильная версия" },
  { icon: "📊", text: "Аналитика (Метрика)" },
  { icon: "💬", text: "Форма заявки" },
  { icon: "🛡", text: "12 мес. поддержки" },
];

export default function TemplatesPage() {
  const t = templates[0];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Премиум-шаблон</p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Один шаблон, который{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">выглядит дорого</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-white/55">
            Универсальный дизайн под любой бизнес. Светлая и тёмная темы, свечение и градиенты,
            гибкое редактирование. Подстроим под ваш бренд и запустим за 3 дня.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-white/40">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">✓ Домен + хостинг включены</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">✓ 0 ₽ предоплата</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">✓ Готово за 3 дня</span>
          </div>
        </div>
      </section>

      {/* Feature card */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          {/* Preview */}
          <Link
            href={`/customize/${t.id}`}
            className="group relative block overflow-hidden rounded-3xl border border-white/10 transition hover:border-white/30"
          >
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 opacity-0 transition group-hover:opacity-100" />
            <div className="relative aspect-video">
              <PremiumPreview />
            </div>
          </Link>

          {/* Info */}
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">{t.name}</h2>
            <p className="mt-3 leading-relaxed text-white/55">{t.description}</p>
            <ul className="mt-6 space-y-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="mt-0.5 shrink-0 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text font-bold text-transparent">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href={`/customize/${t.id}`}
                className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-7 py-3 font-bold text-white shadow-lg shadow-violet-500/30 transition hover:-translate-y-0.5 hover:shadow-violet-500/50"
              >
                Настроить под себя →
              </Link>
              <Link href="/portfolio" className="text-sm font-semibold text-white/60 transition hover:text-white">
                Смотреть примеры работ ↗
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/35">
              <span className="font-black text-white">от {t.priceFrom?.toLocaleString("ru-RU")} ₽</span> · {t.deliveryDays} дня под ключ
            </p>
          </div>
        </div>

        {/* What's included */}
        <div className="mt-16 rounded-3xl border border-white/8 bg-white/4 p-8">
          <h2 className="text-center text-xl font-black">В стоимость входит</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {INCLUDED.map((item) => (
              <div key={item.text} className="flex flex-col items-center gap-2 text-center">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-white/50">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-600/5 p-8 text-center">
          <h2 className="text-2xl font-black">Готовы запустить сайт?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/55">
            Настройте шаблон под свой бренд прямо сейчас — без предоплаты. Оплата только после приёмки.
          </p>
          <Link
            href={`/customize/${t.id}`}
            className="mt-6 inline-flex rounded-full bg-white px-7 py-3 font-bold text-black transition hover:bg-white/90"
          >
            Перейти в конструктор →
          </Link>
        </div>
      </section>
    </main>
  );
}
