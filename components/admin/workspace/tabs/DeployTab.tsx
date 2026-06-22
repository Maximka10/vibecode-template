"use client";
import { useState } from "react";

export default function DeployTab({ orderId }: { orderId: string }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadZip() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/export-zip`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
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
    <div className="space-y-6">
      {/* Frozen notice */}
      <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/8 p-6">
        <div className="flex items-start gap-4">
          <span className="text-2xl">⏸</span>
          <div>
            <h2 className="text-base font-bold text-yellow-300">Автоматический деплой временно отключён</h2>
            <p className="mt-1.5 text-sm text-yellow-200/60">
              Используйте экспорт ZIP — готовый Next.js проект, который можно задеплоить
              на Vercel, Netlify или любой другой хостинг за 2 минуты.
            </p>
          </div>
        </div>
      </div>

      {/* Primary action — Download ZIP */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-white/90">Скачать ZIP</h3>
            <p className="mt-1 text-sm text-white/40">
              Полный Next.js 14 проект с Tailwind CSS. Инструкции по деплою внутри архива.
            </p>
          </div>
          <button
            onClick={() => void downloadZip()}
            disabled={downloading}
            className="shrink-0 rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? "⏳ Скачивание..." : "⬇ Скачать ZIP"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Deployment guide */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Как задеплоить</h3>

        <div className="space-y-3">
          <DeployStep
            icon="▲"
            title="Vercel (рекомендуется)"
            steps={[
              "Скачайте ZIP и распакуйте",
              "Зайдите на vercel.com → New Project",
              "Перетащите папку проекта",
              "Нажмите Deploy — готово через 2 минуты",
            ]}
          />
          <DeployStep
            icon="◆"
            title="Netlify"
            steps={[
              "Скачайте ZIP и распакуйте",
              "Зайдите на netlify.com → Add new site",
              "Выберите «Deploy manually»",
              "Перетащите папку dist (npm run build сначала)",
            ]}
          />
          <DeployStep
            icon="🐙"
            title="GitHub + Vercel"
            steps={[
              "Создайте репозиторий на GitHub",
              "Загрузите файлы из ZIP",
              "Подключите репозиторий в Vercel",
              "Автодеплой на каждый push",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function DeployStep({ icon, title, steps }: { icon: string; title: string; steps: string[] }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/2 px-4 py-4">
      <p className="text-sm font-semibold text-white/70">
        <span className="mr-2">{icon}</span>{title}
      </p>
      <ol className="mt-2 space-y-1">
        {steps.map((s, i) => (
          <li key={i} className="text-xs text-white/40">
            <span className="mr-2 text-white/20">{i + 1}.</span>{s}
          </li>
        ))}
      </ol>
    </div>
  );
}
