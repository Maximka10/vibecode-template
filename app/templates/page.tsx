import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { templates } from "@/lib/templates";

const THEME_PREVIEW: Record<string, { bg: string; from: string; to: string; label: string }> = {
  "coffee-shop": {
    bg: "bg-amber-50",
    from: "from-amber-800",
    to: "to-amber-400",
    label: "Светлая · Уют · Тепло",
  },
  "beauty-salon": {
    bg: "bg-pink-50",
    from: "from-pink-800",
    to: "to-pink-400",
    label: "Светлая · Премиум · Воздух",
  },
  "barber-shop": {
    bg: "bg-zinc-950",
    from: "from-yellow-900",
    to: "to-yellow-500",
    label: "Тёмная · Брутальная · Золото",
  },
  "car-wash": {
    bg: "bg-slate-950",
    from: "from-cyan-900",
    to: "to-cyan-400",
    label: "Тёмная · Технологичная · Неон",
  },
  restaurant: {
    bg: "bg-orange-50",
    from: "from-amber-900",
    to: "to-amber-500",
    label: "Светлая · Editorial · Кино",
  },
};

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 text-center">
          <p className="text-sm text-cyan-400">5 готовых шаблонов</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black">Выберите шаблон</h1>
          <p className="mt-3 text-white/60 max-w-xl mx-auto">
            Каждый шаблон адаптируется под ваш бренд. Мы меняем тексты, фото и цвета — вы получаете готовый сайт за 3 дня.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => {
            const preview = THEME_PREVIEW[t.id];
            const isDark = ["barber-shop", "car-wash"].includes(t.id);
            return (
              <Link
                key={t.id}
                href={`/customize/${t.id}`}
                className="group rounded-3xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/30 transition"
              >
                {/* Preview */}
                <div
                  className={`relative aspect-video ${preview?.bg ?? "bg-slate-800"} overflow-hidden`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${preview?.from ?? "from-slate-700"} ${preview?.to ?? "to-slate-500"} opacity-60`}
                  />
                  {/* Mock browser chrome */}
                  <div className={`absolute inset-3 rounded-xl ${isDark ? "bg-black/50" : "bg-white/70"} backdrop-blur-sm p-3`}>
                    <div className="flex gap-1.5 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-400/60" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                      <div className="w-2 h-2 rounded-full bg-green-400/60" />
                    </div>
                    <div className={`h-2 rounded-full w-3/4 mb-2 ${isDark ? "bg-white/20" : "bg-black/15"}`} />
                    <div className={`h-6 rounded-lg w-full mb-1 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-8 rounded-md ${isDark ? "bg-white/10" : "bg-black/8"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isDark ? "bg-black/60 text-white/80" : "bg-white/80 text-black"}`}>
                      {t.category}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold">{t.name}</h2>
                      <p className="mt-1 text-sm text-white/55">{t.description}</p>
                    </div>
                  </div>
                  {preview && (
                    <p className="mt-2 text-xs text-white/30">{preview.label}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm">
                      <span className="font-bold">от {t.priceFrom?.toLocaleString("ru-RU")} ₽</span>
                      <span className="text-white/40"> · {t.deliveryDays} дня</span>
                    </p>
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold group-hover:bg-white group-hover:text-black transition">
                      Выбрать →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h2 className="text-2xl font-black">Не нашли подходящий?</h2>
          <p className="mt-3 text-white/60 max-w-lg mx-auto">
            Расскажите о своём бизнесе — подберём шаблон или сделаем индивидуальный дизайн.
          </p>
          <a
            href="https://t.me/vibecode_studio"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-full bg-white px-6 py-3 font-bold text-black"
          >
            Написать в Telegram
          </a>
        </div>
      </section>
    </main>
  );
}
