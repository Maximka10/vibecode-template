"use client";
import { useState, useEffect, useCallback } from "react";

type DeploymentJob = {
  id: string;
  order_id: string;
  status: string;
  deploy_url: string | null;
  preview_url: string | null;
  vercel_deployment_id: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  building: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  deploying: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  deployed: "bg-green-500/15 text-green-300 border-green-500/30",
  failed: "bg-red-500/15 text-red-300 border-red-500/30",
  cancelled: "bg-white/5 text-white/30 border-white/10",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "В очереди",
  building: "Сборка...",
  deploying: "Деплой...",
  deployed: "Готово",
  failed: "Ошибка",
  cancelled: "Отменено",
};

const ACTIVE = new Set(["pending", "building", "deploying"]);

export default function DeployTab({ orderId }: { orderId: string }) {
  const [jobs, setJobs] = useState<DeploymentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ message: string; created_at: string }[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const fetchJobs = useCallback(async () => {
    const res = await fetch(`/api/orders/${orderId}/deploy`);
    if (res.ok) {
      const data = (await res.json()) as { ok: boolean; jobs: DeploymentJob[] };
      if (data.ok) setJobs(data.jobs);
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => { void fetchJobs(); }, [fetchJobs]);

  const hasActive = jobs.some((j) => ACTIVE.has(j.status));
  useEffect(() => {
    if (!hasActive) return;
    const t = setInterval(() => { void fetchJobs(); }, 4000);
    return () => clearInterval(t);
  }, [hasActive, fetchJobs]);

  const fetchLogs = useCallback(async (jobId: string) => {
    setLogsLoading(true);
    const res = await fetch(`/api/orders/${orderId}/deploy/${jobId}/logs`);
    if (res.ok) {
      const data = (await res.json()) as { ok: boolean; logs: { message: string; created_at: string }[] };
      if (data.ok) setLogs(data.logs);
    }
    setLogsLoading(false);
  }, [orderId]);

  useEffect(() => {
    if (!selectedJobId) return;
    void fetchLogs(selectedJobId);
    if (!hasActive) return;
    const t = setInterval(() => { void fetchLogs(selectedJobId); }, 4000);
    return () => clearInterval(t);
  }, [selectedJobId, hasActive, fetchLogs]);

  const handleDeploy = async () => {
    setDeploying(true);
    const res = await fetch(`/api/orders/${orderId}/deploy`, { method: "POST" });
    const data = (await res.json()) as { ok: boolean; error?: string; jobId?: string };
    if (data.ok && data.jobId) {
      setSelectedJobId(data.jobId);
      await fetchJobs();
    } else {
      alert(data.error ?? "Ошибка запуска деплоя");
    }
    setDeploying(false);
  };

  const handleCopy = (url: string) => {
    void navigator.clipboard.writeText(url).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 1500);
    });
  };

  const latestJob = jobs[0];
  const isRunning = deploying || hasActive;

  return (
    <div className="space-y-6">
      {/* Deploy trigger */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white/90">Деплой на Vercel</h2>
            <p className="mt-1 text-sm text-white/40">
              Сборка проекта и публикация preview-ссылки. URL сохранится в заказе.
            </p>
          </div>
          <button
            onClick={() => void handleDeploy()}
            disabled={isRunning}
            className="shrink-0 rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? "⏳ Деплой..." : "🚀 Задеплоить"}
          </button>
        </div>

        {latestJob?.status === "deployed" && latestJob.preview_url && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3">
            <span className="text-green-400 text-lg">✅</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-green-400/70 font-medium">Последний деплой</p>
              <a
                href={latestJob.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-green-300 hover:underline block"
              >
                {latestJob.preview_url}
              </a>
            </div>
            <button
              onClick={() => handleCopy(latestJob.preview_url!)}
              className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white/80 transition"
            >
              {copyDone ? "✓" : "Копировать"}
            </button>
          </div>
        )}

        {latestJob?.status === "failed" && latestJob.error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-xs text-red-400/70 font-medium">Ошибка деплоя</p>
            <p className="mt-1 text-sm text-red-300">{latestJob.error}</p>
          </div>
        )}
      </div>

      {/* History */}
      {!loading && jobs.length > 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <h3 className="mb-4 text-xs font-bold text-white/40 uppercase tracking-wider">История деплоев</h3>
          <div className="space-y-2">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id === selectedJobId ? null : job.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  selectedJobId === job.id
                    ? "border-cyan-500/40 bg-cyan-500/5"
                    : "border-white/8 bg-white/2 hover:bg-white/4"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                      STATUS_COLOR[job.status] ?? "bg-white/5 text-white/30 border-white/10"
                    }`}
                  >
                    {STATUS_LABEL[job.status] ?? job.status}
                  </span>
                  <span className="text-xs text-white/40">
                    {new Date(job.created_at).toLocaleString("ru-RU")}
                  </span>
                  {job.preview_url && (
                    <a
                      href={job.preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto text-xs text-cyan-400 hover:underline"
                    >
                      Открыть ↗
                    </a>
                  )}
                </div>
                {job.error && (
                  <p className="mt-1 text-xs text-red-400/70 truncate">{job.error}</p>
                )}
              </button>
            ))}
          </div>

          {selectedJobId && (
            <div className="mt-4 rounded-xl border border-white/8 bg-black/30 p-4">
              <p className="mb-3 text-xs font-bold text-white/30 uppercase tracking-wider">Логи</p>
              {logsLoading && logs.length === 0 ? (
                <p className="text-xs text-white/30">Загрузка...</p>
              ) : logs.length === 0 ? (
                <p className="text-xs text-white/30">Нет логов</p>
              ) : (
                <div className="space-y-1 font-mono text-xs">
                  {logs.map((l, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="shrink-0 text-white/20">
                        {new Date(l.created_at).toLocaleTimeString("ru-RU")}
                      </span>
                      <span className="text-white/60">{l.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-3xl">🚀</p>
          <p className="mt-3 text-sm text-white/40">Ещё не было деплоев</p>
          <p className="mt-1 text-xs text-white/20">Нажмите «Задеплоить» чтобы опубликовать сайт на Vercel</p>
        </div>
      )}
    </div>
  );
}
