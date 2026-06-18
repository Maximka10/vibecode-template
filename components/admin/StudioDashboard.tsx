"use client";
import { useState } from "react";
import Link from "next/link";

const PROJECT_STATUS = {
  new: { label: "Черновик", color: "bg-slate-500/20 text-slate-300" },
  contacted: { label: "Знакомство", color: "bg-purple-500/20 text-purple-300" },
  in_progress: { label: "В работе", color: "bg-yellow-500/20 text-yellow-300" },
  waiting_client: { label: "На согласовании", color: "bg-orange-500/20 text-orange-300" },
  completed: { label: "Запущен", color: "bg-green-500/20 text-green-300" },
  cancelled: { label: "Отменён", color: "bg-red-500/20 text-red-300" },
} as const;

type Project = Record<string, any>;

async function patchOrder(id: string, update: Record<string, unknown>) {
  await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
}

function ProjectCard({ project, onUpdate }: { project: Project; onUpdate: (id: string, update: Record<string, unknown>) => void }) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(project.project_url ?? "");
  const [domain, setDomain] = useState(project.domain ?? "");
  const [saving, setSaving] = useState(false);

  const cfg = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS] ??
    { label: project.status, color: "bg-white/10 text-white/60" };

  async function save() {
    setSaving(true);
    await patchOrder(project.id, { project_url: url || null, domain: domain || null });
    onUpdate(project.id, { project_url: url || null, domain: domain || null });
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      {/* Top row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{project.template_name ?? project.template_id ?? "Проект"}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/50">
            {project.client_name ?? project.client_email ?? "Клиент неизвестен"}
            {project.client_phone && ` · ${project.client_phone}`}
          </p>
          <p className="mt-0.5 text-xs text-white/30">
            #{project.id.slice(0, 8)} · {new Date(project.created_at).toLocaleDateString("ru-RU")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/customize/${project.template_id}`}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:border-white/40"
          >
            Редактор
          </Link>
          <Link
            href={`/admin?order=${project.id}`}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs hover:border-white/40"
          >
            CRM →
          </Link>
        </div>
      </div>

      {/* Project details */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {/* Domain */}
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <p className="text-xs text-white/40">Домен</p>
          {editing ? (
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.ru"
              className="mt-1 w-full bg-transparent text-sm outline-none"
            />
          ) : (
            <p className="mt-1 text-sm">{project.domain ?? "—"}</p>
          )}
        </div>

        {/* Site URL */}
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <p className="text-xs text-white/40">Ссылка на сайт</p>
          {editing ? (
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full bg-transparent text-sm outline-none"
            />
          ) : project.project_url ? (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm text-cyan-400 hover:underline truncate"
            >
              {project.project_url}
            </a>
          ) : (
            <p className="mt-1 text-sm text-white/30">Не указана</p>
          )}
        </div>

        {/* Budget */}
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <p className="text-xs text-white/40">Бюджет</p>
          <p className="mt-1 text-sm">
            {project.total_price
              ? `${project.total_price.toLocaleString("ru-RU")} ₽`
              : project.budget
              ? `${Number(project.budget).toLocaleString("ru-RU")} ₽`
              : "—"}
          </p>
        </div>
      </div>

      {/* Edit / Save */}
      <div className="mt-3 flex gap-2">
        {editing ? (
          <>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black disabled:opacity-40"
            >
              {saving ? "Сохраняю..." : "Сохранить"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full border border-white/20 px-4 py-1.5 text-xs"
            >
              Отмена
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs hover:border-white/40"
          >
            Редактировать
          </button>
        )}
      </div>
    </div>
  );
}

export default function StudioDashboard({ projects: initialProjects }: { projects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [filter, setFilter] = useState<string>("all");

  function handleUpdate(id: string, update: Record<string, unknown>) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...update } : p)));
  }

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const statusGroups = Object.entries(PROJECT_STATUS);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-2xl font-black">⚡ Studio</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-white/20 px-3 py-1.5 text-sm hover:border-white/40"
            >
              CRM →
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/50 hover:text-white">
                Выйти
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Kanban-style status counts */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {statusGroups.map(([key, cfg]) => {
            const count = projects.filter((p) => p.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(filter === key ? "all" : key)}
                className={`rounded-2xl border p-3 text-center transition ${
                  filter === key
                    ? "border-white/30 bg-white/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <p className="text-xl font-black">{count}</p>
                <p className="mt-1 text-xs text-white/50">{cfg.label}</p>
              </button>
            );
          })}
        </div>

        {/* Projects */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-white/40">Проектов нет</p>
            <Link
              href="/templates"
              className="mt-4 inline-block rounded-full border border-white/20 px-5 py-2 text-sm hover:border-white/40"
            >
              Создать проект из шаблона
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
