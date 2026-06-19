import { BuildData } from "@/lib/build/buildOrderSite";

export default function SitePreview({ data }: { data: BuildData }) {
  const primary = data.branding.primary_color || "#6366f1";
  const secondary = data.branding.secondary_color || "#8b5cf6";

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white text-slate-900 text-sm shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 bg-slate-100 px-4 py-2.5 border-b border-slate-200">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 rounded-md bg-white border border-slate-200 px-3 py-1 text-xs text-slate-400">
          {data.content.domain_name ? `https://${data.content.domain_name}` : `preview — ${data.meta.template_name}`}
        </div>
      </div>

      {/* Site content */}
      <div>
        {/* Hero */}
        <div
          className="px-8 py-12 text-white"
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
        >
          {data.content.domain_name && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest opacity-70">
              {data.content.domain_name}
            </p>
          )}
          <h1 className="text-3xl font-black leading-tight">
            {data.company.name || "Название компании"}
          </h1>
          {data.company.description && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-85">
              {data.company.description}
            </p>
          )}
          {data.content.hero_cta && (
            <button
              className="mt-6 rounded-full border-2 border-white/40 bg-white/20 px-6 py-2 text-sm font-bold backdrop-blur-sm"
              style={{ cursor: "default" }}
            >
              {data.content.hero_cta}
            </button>
          )}
          {(data.contacts.phone || data.contacts.email) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {data.contacts.phone && (
                <span className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
                  📞 {data.contacts.phone}
                </span>
              )}
              {data.contacts.email && (
                <span className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
                  ✉️ {data.contacts.email}
                </span>
              )}
            </div>
          )}
        </div>

        {/* About */}
        {data.content.about_text && (
          <div className="px-8 py-8 border-b border-slate-100 bg-white">
            <h2 className="mb-3 text-lg font-bold text-slate-800">
              {data.content.about_title || "О нас"}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">{data.content.about_text}</p>
          </div>
        )}

        {/* Services */}
        {data.services.length > 0 && (
          <div className="px-8 py-8 bg-slate-50 border-b border-slate-100">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Наши услуги</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.services.map((s) => (
                <div key={s} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 h-1 w-8 rounded-full" style={{ backgroundColor: primary }} />
                  <p className="font-semibold text-slate-800">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts */}
        {(data.contacts.phone || data.contacts.email || data.contacts.telegram || data.company.address) && (
          <div className="px-8 py-8 border-b border-slate-100">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Контакты</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.contacts.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-lg">📞</span>
                  <div>
                    <p className="text-xs text-slate-400">Телефон</p>
                    <p className="font-semibold text-slate-700">{data.contacts.phone}</p>
                  </div>
                </div>
              )}
              {data.contacts.email && (
                <div className="flex items-center gap-3">
                  <span className="text-lg">✉️</span>
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="font-semibold text-slate-700">{data.contacts.email}</p>
                  </div>
                </div>
              )}
              {data.contacts.telegram && (
                <div className="flex items-center gap-3">
                  <span className="text-lg">💬</span>
                  <div>
                    <p className="text-xs text-slate-400">Telegram</p>
                    <p className="font-semibold text-slate-700">{data.contacts.telegram}</p>
                  </div>
                </div>
              )}
              {data.company.address && (
                <div className="flex items-center gap-3">
                  <span className="text-lg">📍</span>
                  <div>
                    <p className="text-xs text-slate-400">Адрес</p>
                    <p className="font-semibold text-slate-700">{data.company.address}</p>
                  </div>
                </div>
              )}
              {data.company.working_hours && (
                <div className="flex items-center gap-3">
                  <span className="text-lg">🕐</span>
                  <div>
                    <p className="text-xs text-slate-400">Режим работы</p>
                    <p className="font-semibold text-slate-700">{data.company.working_hours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-800 text-slate-400 text-xs flex items-center justify-between">
          <span>{data.company.name}</span>
          {data.content.domain_name && <span>{data.content.domain_name}</span>}
        </div>
      </div>
    </div>
  );
}
