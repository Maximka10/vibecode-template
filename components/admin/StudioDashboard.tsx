"use client";
import { useState } from "react";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const PROJECT_STATUS = {
  new: { label: "Черновик", color: "bg-slate-500/15 text-slate-300 border-slate-500/25" },
  contacted: { label: "Знакомство", color: "bg-purple-500/15 text-purple-300 border-purple-500/25" },
  in_progress: { label: "В работе", color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25" },
  waiting_client: { label: "На согласовании", color: "bg-orange-500/15 text-orange-300 border-orange-500/25" },
  completed: { label: "Запущен", color: "bg-green-500/15 text-green-300 border-green-500/25" },
  cancelled: { label: "Отменён", color: "bg-red-500/15 text-red-300 border-red-500/25" },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Project = Record<string, any>;

async function patchOrder(id: string, update: Record<string, unknown>) {
  await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
}

function ProjectCard({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: (id: string, update: Record<string, unknown>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(project.project_url ?? "");
  const [domain, setDomain] = useState(project.domain ?? "");
  const [saving, setSaving] = useState(false);

  const status = project.status as keyof typeof PROJECT_STATUS;
  const cfg = PROJECT_STATUS[status] ?? { label: project.status, color: "bg-white/10 text-white/60 border-white/15" };

  async function save() {
    setSaving(true);
    await patchOrder(project.id, { project_url: url || null, domain: domain || null });
    onUpdate(project.id, { project_url: url || null, domain: domain || null });
    setSaving(false);
    setEditing(false);
  }

  return (
    <Card variant="solid" padding="md" hover>
      {/* Top row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{project.template_name ?? project.template_id ?? "Проект"}</h3>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/50">
            {project.notes ? project.notes.slice(0, 60) : "Нет комментария"}
          </p>
          <p className="mt-0.5 text-xs text-white/30">
            #{project.id.slice(0, 8)} · {new Date(project.created_at).toLocaleDateString("ru-RU")}
          </p>
        </div>

        <div className="flex gap-2">
          <Btn href={`/customize/${project.template_id}`} variant="outline" size="sm">
            Редактор
          </Btn>
          <Btn href={`/admin?order=${project.id}`} variant="outline" size="sm">
            CRM →
          </Btn>
        </div>
      </div>

      {/* Project details */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-white/6 bg-white/4 px-3 py-2">
          <p className="text-xs text-white/40">Домен</p>
          {editing ? (
            <Input
              variant="inline"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.ru"
              className="mt-1"
            />
          ) : (
            <p className="mt-1 text-sm">{project.domain ?? "—"}</p>
          )}
        </div>

        <div className="rounded-xl border border-white/6 bg-white/4 px-3 py-2">
          <p className="text-xs text-white/40">Ссылка на сайт</p>
          {editing ? (
            <Input
              variant="inline"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1"
            />
          ) : project.project_url ? (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block truncate text-sm text-cyan-400 hover:underline"
            >
              {project.project_url}
            </a>
          ) : (
            <p className="mt-1 text-sm text-white/30">Не указана</p>
          )}
        </div>

        <div className="rounded-xl border border-white/6 bg-white/4 px-3 py-2">
          <p className="text-xs text-white/40">Стоимость</p>
          <p className="mt-1 text-sm">
            {project.total_price
              ? `${Number(project.total_price).toLocaleString("ru-RU")} ₽`
              : "—"}
          </p>
        </div>
      </div>

      {/* Edit / Save */}
      <div className="mt-3 flex gap-2">
        {editing ? (
          <>
            <Btn onClick={save} loading={saving} variant="primary" size="sm">
              {saving ? "Сохраняю..." : "Сохранить"}
            </Btn>
            <Btn onClick={() => setEditing(false)} variant="outline" size="sm">
              Отмена
            </Btn>
          </>
        ) : (
          <Btn onClick={() => setEditing(true)} variant="outline" size="sm">
            Редактировать
          </Btn>
        )}
      </div>
    </Card>
  );
}

export default function StudioDashboard({ projects: initialProjects }: { projects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [filter, setFilter] = useState<string>("all");

  function handleUpdate(id: string, update: Record<string, unknown>) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...update } : p)));
  }

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);
  const statusGroups = Object.entries(PROJECT_STATUS);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Kanban status filters */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {statusGroups.map(([key, cfg]) => {
            const count = projects.filter((p) => p.status === key).length;
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(active ? "all" : key)}
                className={`rounded-2xl border p-3 text-center transition ${
                  active
                    ? "border-white/30 bg-white/10"
                    : "border-white/8 bg-white/4 hover:border-white/20"
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
          <Card variant="subtle" padding="none" radius="3xl">
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-white/40">
                {filter === "all"
                  ? "Проектов пока нет"
                  : `Нет проектов со статусом «${PROJECT_STATUS[filter as keyof typeof PROJECT_STATUS]?.label ?? filter}»`}
              </p>
              {filter !== "all" ? (
                <Btn variant="ghost" size="sm" onClick={() => setFilter("all")} className="mt-3">
                  Показать все
                </Btn>
              ) : (
                <Btn href="/templates" variant="outline" size="sm" className="mt-4">
                  Создать из шаблона →
                </Btn>
              )}
            </div>
          </Card>
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
