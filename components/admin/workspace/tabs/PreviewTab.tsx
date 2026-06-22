"use client";
import { useEffect, useState } from "react";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { BuildData } from "@/lib/build/buildOrderSite";
import { SiteSection } from "@/types/sections";

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

type DevicePreset = {
  id: string;
  label: string;
  icon: string;
  width: number;
  height: number;
  mobile: boolean;
};

const DEVICES: DevicePreset[] = [
  { id: "desktop",   label: "Desktop",          icon: "🖥",  width: 1280, height: 800,  mobile: false },
  { id: "iphonese",  label: "iPhone SE",         icon: "📱",  width: 375,  height: 667,  mobile: true  },
  { id: "iphone14",  label: "iPhone 14",         icon: "📱",  width: 390,  height: 844,  mobile: true  },
  { id: "iphone14pm",label: "iPhone 14 Pro Max", icon: "📱",  width: 430,  height: 932,  mobile: true  },
  { id: "ipad",      label: "iPad",              icon: "⬛",  width: 768,  height: 1024, mobile: true  },
];

const DEFAULT_DEVICE = "iphone14";

export default function PreviewTab({ orderId }: { orderId: string }) {
  const [build, setBuild] = useState<SiteBuild | null>(null);
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>(DEFAULT_DEVICE);

  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[2];

  async function loadBuild() {
    setLoading(true);
    try {
      const [buildRes, pdRes] = await Promise.all([
        fetch(`/api/orders/${orderId}/build`),
        fetch(`/api/orders/${orderId}/project-data`),
      ]);
      const buildData = await buildRes.json();
      const pdData = await pdRes.json();
      if (buildData.ok) setBuild(buildData.build);
      if (pdData.ok) {
        const sects: SiteSection[] = pdData.data?.content_edits?.sections ?? [];
        setSections(sects);
      }
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

  const previewUrl = build ? `/api/orders/${orderId}/build` : undefined;

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
        <div className="flex flex-wrap gap-2">
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

      {/* Device selector */}
      <div className="flex flex-wrap items-center gap-2">
        {DEVICES.map((d) => (
          <button
            key={d.id}
            onClick={() => setDeviceId(d.id)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              deviceId === d.id
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
            }`}
          >
            <span>{d.icon}</span>
            <span>{d.label}</span>
            <span className={`font-mono text-[10px] ${deviceId === d.id ? "text-cyan-400/70" : "text-white/25"}`}>
              {d.width}×{d.height}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {sections.length === 0 && !loading && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/8 px-4 py-2 text-xs text-yellow-300">
          Секции не настроены. Перейдите во вкладку «Разработка» для добавления секций.
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
              { label: "Секций", value: sections.filter((s) => s.enabled !== false).length || "—" },
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

          {/* Preview iframe */}
          {device.mobile ? (
            <div className="flex justify-center py-4">
              {/* Viewport label */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-xs text-white/30 font-mono">{device.width} × {device.height}px · {device.label}</span>
                <div
                  className="overflow-hidden rounded-[40px] border-[6px] border-slate-700 shadow-2xl bg-slate-800"
                  style={{ width: device.width + 12, flexShrink: 0 }}
                >
                  {/* speaker slot */}
                  <div className="flex justify-center py-2 bg-slate-800">
                    <div className="h-1.5 w-16 rounded-full bg-slate-600" />
                  </div>
                  <iframe
                    key={device.id}
                    src={`/preview-frame/${orderId}`}
                    width={device.width}
                    height={device.height}
                    style={{ display: "block", border: "none", background: "white" }}
                    title={`${device.label} preview`}
                  />
                  {/* home bar */}
                  <div className="flex justify-center py-2 bg-slate-800">
                    <div className="h-1.5 w-24 rounded-full bg-slate-600" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs text-white/30 font-mono">Desktop · full width</span>
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <iframe
                  key="desktop"
                  src={`/preview-frame/${orderId}`}
                  style={{ display: "block", border: "none", width: "100%", height: 700, background: "white" }}
                  title="Desktop preview"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Btn
              variant="outline"
              size="sm"
              href={`/api/orders/${orderId}/export-zip`}
              external
            >
              ↓ Скачать ZIP
            </Btn>
            {previewUrl && (
              <Btn variant="ghost" size="sm" onClick={() => window.open(`/preview/${build.build_data.meta.template_id}`, "_blank")}>
                Открыть шаблон ↗
              </Btn>
            )}
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
