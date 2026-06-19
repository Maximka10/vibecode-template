"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";

type BuildStatus = "idle" | "building" | "ready" | "error";

interface BuildResult {
  version: string;
  builtAt: string;
  sectionCount: number;
  fileCount: number;
}

export default function ExportTab({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<BuildStatus>("idle");
  const [build, setBuild] = useState<BuildResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleBuild() {
    setStatus("building");
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/export-zip`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      // Trigger download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      a.href = url;
      a.download = match?.[1] ?? "project.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setBuild({
        version: `1.0.${Date.now().toString(36).slice(-4).toUpperCase()}`,
        builtAt: new Date().toLocaleString("ru-RU"),
        sectionCount: 0,
        fileCount: 0,
      });
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сборки");
      setStatus("error");
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/export-zip`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      a.href = url;
      a.download = match?.[1] ?? "project.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка скачивания");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Build control */}
      <Card variant="solid" padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">Экспорт проекта</h3>
            <p className="mt-0.5 text-xs text-white/35">
              Генерирует готовый к деплою Next.js проект из данных Разработки
            </p>
          </div>
          <Btn
            variant="primary"
            size="sm"
            onClick={handleBuild}
            disabled={status === "building"}
            loading={status === "building"}
          >
            {status === "building" ? "Сборка…" : "Собрать проект"}
          </Btn>
        </div>

        {/* Status strip */}
        {status !== "idle" && (
          <div className="mt-4 rounded-xl border border-white/8 bg-white/4 px-4 py-3">
            <div className="flex items-center gap-2">
              {status === "building" && (
                <>
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                  <span className="text-xs text-yellow-300">Сборка…</span>
                </>
              )}
              {status === "ready" && (
                <>
                  <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-300">Готово</span>
                </>
              )}
              {status === "error" && (
                <>
                  <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                  <span className="text-xs text-red-300">Ошибка</span>
                </>
              )}
            </div>

            {build && status === "ready" && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <Stat label="Версия" value={build.version} />
                <Stat label="Дата сборки" value={build.builtAt} />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Download */}
      <Card variant="solid" padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">Скачать ZIP</h3>
            <p className="mt-0.5 text-xs text-white/35">
              Скачать архив с исходным кодом проекта
            </p>
          </div>
          <Btn
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            loading={downloading}
          >
            {downloading ? "Скачивание…" : "Скачать ZIP"}
          </Btn>
        </div>

        <div className="mt-4 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-xs text-white/40 space-y-1">
          <p>• Генерируется на основе данных раздела <span className="text-white/60">Разработка</span></p>
          <p>• Содержит полный Next.js 14 проект с Tailwind CSS</p>
          <p>• Готов к деплою на Vercel / Netlify без доп. настроек</p>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/4 px-3 py-2">
      <p className="text-white/30 text-[10px] uppercase tracking-wider">{label}</p>
      <p className="mt-0.5 text-white/80 font-mono text-xs">{value}</p>
    </div>
  );
}
