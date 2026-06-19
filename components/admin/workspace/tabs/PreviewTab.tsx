"use client";
import { useEffect, useState } from "react";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { BuildData } from "@/lib/build/buildOrderSite";
import SitePreview from "@/components/admin/workspace/SitePreview";

type SiteBuild = {
  id: string;
  order_id: string;
  version: number;
  build_status?: string;
  build_data: BuildData;
  zip_url?: string;
  created_by?: string;
  created_at: string;
};

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
              Версия #{build.version} · {new Date(build.created_at).toLocaleString("ru-RU")}
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
              { label: "Версия", value: `#${build.version}` },
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
