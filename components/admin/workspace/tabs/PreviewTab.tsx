"use client";
import { useEffect, useState } from "react";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { BuildData } from "@/lib/build/buildOrderSite";

type SiteBuild = {
  id: string;
  order_id: string;
  build_data: BuildData;
  build_version: number;
  created_at: string;
};

function SitePreview({ data }: { data: BuildData }) {
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
        {/* Hero / header */}
        <div
          className="px-8 py-12 text-white"
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
        >
          {data.seo.title && (
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

        {/* Services */}
        {data.services.length > 0 && (
          <div className="px-8 py-8 bg-slate-50 border-b border-slate-100">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Наши услуги</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.services.map((s) => (
                <div
                  key={s}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div
                    className="mb-2 h-1 w-8 rounded-full"
                    style={{ backgroundColor: primary }}
                  />
                  <p className="font-semibold text-slate-800">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts section */}
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

        {/* SEO footer */}
        <div className="px-8 py-4 bg-slate-800 text-slate-400 text-xs flex items-center justify-between">
          <span>{data.company.name}</span>
          {data.content.domain_name && <span>{data.content.domain_name}</span>}
        </div>
      </div>
    </div>
  );
}

export default function PreviewTab({ orderId }: { orderId: string }) {
  const [build, setBuild] = useState<SiteBuild | null>(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadBuild() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/build`);
      const data = await res.json();
      if (data.ok) setBuild(data.build);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBuild(); }, [orderId]);

  async function handleBuild() {
    setBuilding(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/build`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setBuild(data.build);
      } else {
        setError(data.error ?? "Ошибка сборки");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">Предпросмотр сайта</h2>
          {build && (
            <p className="mt-0.5 text-xs text-white/35">
              Версия #{build.build_version} · {new Date(build.created_at).toLocaleString("ru-RU")}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {build && (
            <Btn variant="ghost" size="sm" onClick={loadBuild}>
              ↺ Обновить
            </Btn>
          )}
          <Btn onClick={handleBuild} disabled={building} loading={building} size="sm">
            {building ? "Сборка…" : "Собрать сайт"}
          </Btn>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-white/30">Загрузка…</p>
      ) : build ? (
        <>
          {/* Build metadata */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Шаблон", value: build.build_data.meta.template_name || build.build_data.meta.template_id },
              { label: "Версия", value: `#${build.build_version}` },
              { label: "Услуг", value: build.build_data.services.length },
              { label: "Домен", value: build.build_data.content.domain_name || "—" },
            ].map((s) => (
              <Card key={s.label} variant="solid" padding="sm">
                <p className="text-base font-bold truncate">{s.value}</p>
                <p className="mt-0.5 text-xs text-white/40">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Colors */}
          <Card variant="solid" padding="sm">
            <div className="flex items-center gap-4">
              <p className="text-xs text-white/40">Брендинг</p>
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ backgroundColor: build.build_data.branding.primary_color }}
                  title={build.build_data.branding.primary_color}
                />
                <span className="text-xs text-white/50">{build.build_data.branding.primary_color}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ backgroundColor: build.build_data.branding.secondary_color }}
                  title={build.build_data.branding.secondary_color}
                />
                <span className="text-xs text-white/50">{build.build_data.branding.secondary_color}</span>
              </div>
              {build.build_data.seo.title && (
                <>
                  <p className="text-xs text-white/40 ml-2">SEO</p>
                  <p className="text-xs text-white/60 truncate max-w-xs">{build.build_data.seo.title}</p>
                </>
              )}
            </div>
          </Card>

          {/* Preview */}
          <SitePreview data={build.build_data} />

          <div className="flex gap-2">
            <Btn variant="outline" size="sm" onClick={() => alert("Будет реализовано на следующем этапе")}>
              ↓ Скачать ZIP
            </Btn>
            <Btn variant="ghost" size="sm" onClick={() => alert("Будет реализовано на следующем этапе")}>
              Деплой на Vercel
            </Btn>
          </div>
        </>
      ) : (
        <Card variant="subtle" padding="md">
          <div className="py-12 text-center">
            <p className="text-2xl mb-3">🏗</p>
            <p className="text-sm font-semibold text-white/60">Сборок ещё нет</p>
            <p className="mt-1 text-xs text-white/35">
              Заполните данные во вкладке «Разработка», затем нажмите «Собрать сайт»
            </p>
            <div className="mt-5">
              <Btn onClick={handleBuild} disabled={building} loading={building}>
                {building ? "Сборка…" : "Собрать сайт"}
              </Btn>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
