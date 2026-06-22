import Link from "next/link";
import { Reveal } from "@/components/Reveal";

type Tier = {
  name: string;
  price: string;
  note: string;
  features: string[];
  popular?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Старт",
    price: "13 900 ₽",
    note: "Одностраничный сайт",
    features: [
      "Готовый отраслевой шаблон",
      "Наполнение вашими текстами и фото",
      "Адаптив под смартфоны",
      "Форма заявки",
      "6 месяцев правок",
    ],
  },
  {
    name: "Бизнес",
    price: "24 900 ₽",
    note: "Оптимальный выбор",
    popular: true,
    features: [
      "Всё из «Старт»",
      "До 5 секций (галерея, отзывы, карта)",
      "Индивидуальные цвета и шрифты",
      "Подключение Telegram / WhatsApp",
      "12 месяцев правок",
    ],
  },
  {
    name: "Премиум",
    price: "39 900 ₽",
    note: "Под ключ с контентом",
    features: [
      "Всё из «Бизнес»",
      "Копирайтинг и подбор изображений",
      "Помощь с доменом, хостингом и SSL",
      "Приоритетная поддержка",
      "Расширенная гарантия",
    ],
  },
];

export function PricingTiers() {
  return (
    <section id="pricing" className="relative border-t border-white/5 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-64 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/8 to-transparent blur-[90px]" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal className="mb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Тарифы</p>
          <h2 className="mt-4 text-4xl font-black sm:text-5xl">Понятные пакеты — без сюрпризов</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/50 text-lg">
            Фиксированная цена. Оплата только после того, как вы одобрите готовый сайт.
          </p>
        </Reveal>

        <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08} className="h-full">
              <div
                className={`relative flex h-full flex-col rounded-3xl border p-7 transition hover:scale-[1.02] ${
                  tier.popular
                    ? "border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-blue-500/5 shadow-xl shadow-cyan-500/10"
                    : "border-white/10 bg-gradient-to-b from-white/6 to-white/2"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-cyan-500/30">
                    Популярный
                  </span>
                )}
                <p className="text-sm font-bold text-white/70">{tier.name}</p>
                <p className="mt-1 text-xs text-white/35">{tier.note}</p>
                <p className="mt-5 text-4xl font-black tracking-tight text-white">
                  <span className="text-base font-medium text-white/40">от </span>
                  {tier.price}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                      <span className="mt-0.5 shrink-0 text-cyan-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/templates"
                  className={`mt-7 block rounded-full py-3.5 text-center text-sm font-bold transition ${
                    tier.popular
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                      : "border border-white/15 text-white/80 hover:border-white/35 hover:bg-white/5"
                  }`}
                >
                  Выбрать шаблон
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-white/35">
          Домен, хостинг и SSL оплачиваются отдельно. Точную смету менеджер подтвердит до старта работ.
        </p>
      </div>
    </section>
  );
}
