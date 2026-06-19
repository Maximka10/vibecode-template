import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { templates } from "@/lib/templates";

type TemplateVisual = {
  bg: string;
  nav: string;
  accent: string;
  text: string;
  subtext: string;
  btn: string;
  btnText: string;
  card1: string;
  card2: string;
  badge: string;
  badgeText: string;
  label: string;
  isDark: boolean;
};

const VISUAL: Record<string, TemplateVisual> = {
  "coffee-shop": {
    bg: "#faf6f1", nav: "#fffdf9", accent: "#d97706", text: "#1c1410",
    subtext: "#6b4f3a", btn: "#d97706", btnText: "#fff",
    card1: "#fff8ef", card2: "#fdf3e3", badge: "#fef3c7", badgeText: "#92400e",
    label: "Светлая · Уют · Тепло", isDark: false,
  },
  "beauty-salon": {
    bg: "#fdf4f7", nav: "#fff", accent: "#be185d", text: "#1a0510",
    subtext: "#831843", btn: "#be185d", btnText: "#fff",
    card1: "#fdf2f8", card2: "#fce7f3", badge: "#fce7f3", badgeText: "#9d174d",
    label: "Светлая · Премиум · Воздух", isDark: false,
  },
  "barber-shop": {
    bg: "#0a0a0a", nav: "#0f0f0f", accent: "#eab308", text: "#f5f5f5",
    subtext: "#a3a3a3", btn: "#eab308", btnText: "#0a0a0a",
    card1: "#141414", card2: "#1c1c1c", badge: "#1c1400", badgeText: "#eab308",
    label: "Тёмная · Брутальная · Золото", isDark: true,
  },
  "car-wash": {
    bg: "#020d18", nav: "#030f1e", accent: "#0ea5e9", text: "#f0f9ff",
    subtext: "#7dd3fc", btn: "#0ea5e9", btnText: "#020d18",
    card1: "#041525", card2: "#062035", badge: "#0c2d45", badgeText: "#38bdf8",
    label: "Тёмная · Технологичная · Неон", isDark: true,
  },
  restaurant: {
    bg: "#fdf8f0", nav: "#fffcf5", accent: "#b45309", text: "#1c1008",
    subtext: "#78350f", btn: "#b45309", btnText: "#fff",
    card1: "#fff8ed", card2: "#fef3c7", badge: "#fef3c7", badgeText: "#78350f",
    label: "Светлая · Editorial · Кино", isDark: false,
  },
};

function TemplatePreview({ id, vis }: { id: string; vis: TemplateVisual }) {
  return (
    <svg
      viewBox="0 0 400 240"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Background */}
      <rect width="400" height="240" fill={vis.bg} />

      {/* Subtle grid for dark themes */}
      {vis.isDark && (
        <>
          <line x1="0" y1="80" x2="400" y2="80" stroke={vis.card1} strokeWidth="1" />
          <line x1="0" y1="160" x2="400" y2="160" stroke={vis.card1} strokeWidth="1" />
          <line x1="133" y1="0" x2="133" y2="240" stroke={vis.card1} strokeWidth="1" />
          <line x1="266" y1="0" x2="266" y2="240" stroke={vis.card1} strokeWidth="1" />
        </>
      )}

      {/* Accent glow */}
      <circle cx={vis.isDark ? "300" : "350"} cy="60" r="120"
        fill={vis.accent} fillOpacity="0.08" />

      {/* Navbar */}
      <rect width="400" height="28" fill={vis.nav} fillOpacity="0.97" />
      <rect x="0" y="27" width="400" height="1" fill={vis.accent} fillOpacity="0.2" />
      <rect x="12" y="9" width="48" height="10" rx="3" fill={vis.text} fillOpacity="0.75" />
      <rect x="12" y="9" width="6" height="10" rx="1.5" fill={vis.accent} fillOpacity="0.9" />
      <rect x="262" y="10" width="32" height="8" rx="2" fill={vis.subtext} fillOpacity="0.4" />
      <rect x="302" y="10" width="32" height="8" rx="2" fill={vis.subtext} fillOpacity="0.4" />
      <rect x="342" y="9" width="46" height="10" rx="5" fill={vis.btn} />
      <rect x="352" y="12" width="26" height="4" rx="1.5" fill={vis.btnText} fillOpacity="0.9" />

      {/* Badge */}
      <rect x="12" y="36" width="90" height="12" rx="6" fill={vis.badge} />
      <rect x="18" y="39" width="78" height="6" rx="2" fill={vis.badgeText} fillOpacity="0.7" />

      {/* Headline */}
      <rect x="12" y="54" width="200" height="14" rx="2" fill={vis.text} fillOpacity="0.88" />
      <rect x="12" y="73" width="170" height="10" rx="2" fill={vis.text} fillOpacity="0.65" />

      {/* Subtext */}
      <rect x="12" y="90" width="155" height="6" rx="2" fill={vis.subtext} fillOpacity="0.55" />
      <rect x="12" y="100" width="135" height="6" rx="2" fill={vis.subtext} fillOpacity="0.4" />

      {/* CTA buttons */}
      <rect x="12" y="114" width="96" height="22" rx="11" fill={vis.btn} />
      <rect x="26" y="120" width="68" height="10" rx="2" fill={vis.btnText} fillOpacity="0.9" />
      <rect x="117" y="114" width="88" height="22" rx="11" fill="none"
        stroke={vis.accent} strokeWidth="1.5" />
      <rect x="131" y="120" width="60" height="10" rx="2" fill={vis.accent} fillOpacity="0.8" />

      {/* Hero visual panel (right) */}
      <rect x="242" y="34" width="148" height="108" rx="8" fill={vis.card1} />
      <rect x="242" y="34" width="148" height="108" rx="8" fill={vis.accent} fillOpacity="0.12" />
      <rect x="242" y="34" width="148" height="108" rx="8" fill="none"
        stroke={vis.accent} strokeWidth="1" strokeOpacity="0.25" />
      {/* Abstract shape in panel */}
      <circle cx="316" cy="88" r="34" fill={vis.accent} fillOpacity="0.15" />
      <circle cx="316" cy="88" r="20" fill={vis.accent} fillOpacity="0.18" />
      <rect x="296" y="108" width="40" height="4" rx="2" fill={vis.accent} fillOpacity="0.5" />
      <rect x="306" y="116" width="20" height="16" rx="4" fill={vis.subtext} fillOpacity="0.2" />

      {/* Stats bar */}
      <rect x="0" y="152" width="400" height="38" fill={vis.nav} fillOpacity="0.8" />
      <rect x="0" y="152" width="400" height="1" fill={vis.accent} fillOpacity="0.2" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={24 + i * 90} y={162} width={52} height={10} rx="3"
            fill={vis.accent} fillOpacity={i % 2 === 0 ? 0.75 : 0.5} />
          <rect x={24 + i * 90} y={176} width={46} height={5} rx="2"
            fill={vis.subtext} fillOpacity="0.4" />
        </g>
      ))}

      {/* Service cards */}
      <rect x="12" y="200" width="180" height="32" rx="6" fill={vis.card1} />
      <rect x="12" y="200" width="180" height="32" rx="6" fill="none"
        stroke={vis.accent} strokeWidth="0.8" strokeOpacity="0.25" />
      <rect x="22" y="209" width="8" height="8" rx="2" fill={vis.accent} fillOpacity="0.6" />
      <rect x="36" y="208" width="80" height="8" rx="2" fill={vis.text} fillOpacity="0.65" />
      <rect x="36" y="220" width="120" height="5" rx="2" fill={vis.subtext} fillOpacity="0.35" />

      <rect x="208" y="200" width="180" height="32" rx="6" fill={vis.card1} />
      <rect x="208" y="200" width="180" height="32" rx="6" fill="none"
        stroke={vis.accent} strokeWidth="0.8" strokeOpacity="0.25" />
      <rect x="218" y="209" width="8" height="8" rx="2" fill={vis.accent} fillOpacity="0.6" />
      <rect x="232" y="208" width="68" height="8" rx="2" fill={vis.text} fillOpacity="0.65" />
      <rect x="232" y="220" width="110" height="5" rx="2" fill={vis.subtext} fillOpacity="0.35" />
    </svg>
  );
}

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
            const vis = VISUAL[t.id];
            return (
              <Link
                key={t.id}
                href={`/customize/${t.id}`}
                className="group rounded-3xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20"
              >
                {/* Preview */}
                <div className="relative aspect-video overflow-hidden">
                  {vis ? (
                    <TemplatePreview id={t.id} vis={vis} />
                  ) : (
                    <div className="w-full h-full bg-slate-800" />
                  )}
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
                      style={vis ? {
                        background: vis.isDark ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)",
                        color: vis.isDark ? "rgba(255,255,255,0.85)" : vis.text,
                      } : {}}
                    >
                      {t.category}
                    </span>
                  </div>
                  {/* Theme type badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm ${
                      vis?.isDark
                        ? "bg-white/10 text-white/60 border border-white/10"
                        : "bg-black/10 text-black/50 border border-black/10"
                    }`}>
                      {vis?.isDark ? "Тёмная" : "Светлая"}
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
                  {vis && (
                    <p className="mt-2 text-xs text-white/30">{vis.label}</p>
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
            Выберите любой шаблон и настройте под свой бизнес — мы поможем с запуском.
          </p>
          <Link
            href="/auth/login"
            className="mt-5 inline-flex rounded-full bg-white px-6 py-3 font-bold text-black transition hover:bg-white/90"
          >
            Войти и оставить заявку →
          </Link>
        </div>
      </section>
    </main>
  );
}
