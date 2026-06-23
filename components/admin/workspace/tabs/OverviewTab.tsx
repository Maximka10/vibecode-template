"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";

// ── Project Health Card ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProjectHealthCard({ order, projectData }: { order: Record<string, any>; projectData?: Record<string, any> | null }) {
  const opts = order.selected_options ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pd: Record<string, any> = projectData ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections: any[] = pd.content_edits?.sections ?? order.content_edits?.sections ?? [];

  const checks: { label: string; done: boolean }[] = [
    { label: "Название компании", done: !!(pd.company_name || opts.company_name || order.template_name) },
    { label: "Телефон или email", done: !!(pd.phone || pd.email || opts.phone || opts.email) },
    { label: "Адрес", done: !!(pd.address || opts.address) },
    { label: "Режим работы", done: !!(pd.working_hours || opts.working_hours) },
    { label: "Секция Hero", done: sections.some((s) => s.type === "hero") },
    { label: "Секция Услуги", done: sections.some((s) => s.type === "services") },
    { label: "Секция Галерея или О нас", done: sections.some((s) => s.type === "gallery" || s.type === "about") },
    { label: "SEO заголовок", done: !!(pd.seo_title || opts.seo_title) },
    { label: "SEO описание", done: !!(pd.seo_description || opts.seo_description) },
    { label: "Домен сайта", done: !!(pd.domain_name || opts.domain_name) },
    { label: "Минимум 3 активные секции", done: sections.filter((s) => s.enabled !== false).length >= 3 },
  ];

  const score = checks.filter((c) => c.done).length;
  const total = checks.length;
  const pct = Math.round((score / total) * 100);

  const ringColor = pct < 40 ? "#ef4444" : pct <= 70 ? "#eab308" : "#22c55e";
  const textColor = pct < 40 ? "text-red-400" : pct <= 70 ? "text-yellow-400" : "text-green-400";

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Готовность проекта</h2>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="48" cy="48" r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 48 48)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${textColor}`}>
            {pct}%
          </span>
        </div>
        <div className="min-w-0">
          <p className={`text-2xl font-bold ${textColor}`}>{score} из {total}</p>
          <p className="mt-0.5 text-xs text-white/40">пунктов выполнено</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-xs">
            {c.done
              ? <span className="shrink-0 font-bold text-green-400">✓</span>
              : <span className="shrink-0 text-white/25">○</span>
            }
            <span className={c.done ? "text-white/70" : "text-white/35"}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  contacted: { label: "Связались", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  in_progress: { label: "В работе", color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
  waiting_client: { label: "Ожидает клиента", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  completed: { label: "Готово", color: "bg-green-500/15 text-green-300 border-green-500/30" },
  cancelled: { label: "Отменена", color: "bg-red-500/15 text-red-300 border-red-500/30" },
};

const WORKFLOW_ACTIONS: { action: string; label: string; fromStatuses: string[] }[] = [
  { action: "START_WORK", label: "Начать работу", fromStatuses: ["new", "contacted"] },
  { action: "REQUEST_CLIENT_INPUT", label: "Ожидать клиента", fromStatuses: ["in_progress", "contacted"] },
  { action: "RESUME_WORK", label: "Возобновить работу", fromStatuses: ["waiting_client"] },
  { action: "COMPLETE_ORDER", label: "Завершить заказ", fromStatuses: ["in_progress", "waiting_client"] },
  { action: "REOPEN_ORDER", label: "Вернуть в работу", fromStatuses: ["completed"] },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function OverviewTab({ order: initialOrder, projectData }: { order: Record<string, any>; projectData?: Record<string, any> | null }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<Record<string, any>>(initialOrder);
  const [statusSaving, setStatusSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [developerNote, setDeveloperNote] = useState<string>(projectData?.developer_note ?? "");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [isPortfolio, setIsPortfolio] = useState<boolean>(Boolean(order.is_portfolio));
  const [portfolioIndustry, setPortfolioIndustry] = useState<string>(order.portfolio_industry ?? "");
  const [leadStatus, setLeadStatus] = useState<string>(order.lead_status ?? "new");
  const [portfolioSaving, setPortfolioSaving] = useState(false);

  async function savePortfolioField(patch: Record<string, unknown>) {
    setPortfolioSaving(true);
    try {
      await fetch(`/api/orders/${order.id}/portfolio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } finally {
      setPortfolioSaving(false);
    }
  }

  async function saveDeveloperNote() {
    setNoteSaving(true);
    try {
      await fetch(`/api/orders/${order.id}/project-data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developer_note: developerNote }),
      });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } finally {
      setNoteSaving(false);
    }
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "bg-white/10 text-white/60 border-white/10" };

  async function applyTransition(action: string) {
    setStatusSaving(true);
    setActionError(null);
    try {
      const res = await fetch("/api/orders/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action }),
      });
      // "Idempotent" rejections (already in the target status) are not real
      // failures — refresh from the server instead of showing an error.
      const result = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
      if (result.ok) {
        setOrder((prev) => ({ ...prev, status: result.status }));
      } else if (typeof result.error === "string" && result.error.includes("idempotent")) {
        router.refresh();
      } else {
        const detail = result.error ? ` (${result.error})` : ` (HTTP ${res.status})`;
        setActionError(`Не удалось изменить статус${detail}`);
      }
    } catch { setActionError("Ошибка соединения. Проверьте подключение к сети."); }
    finally { setStatusSaving(false); }
  }

  async function handleCancel() {
    setCancelLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/orders/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action: "CANCEL_ORDER" }),
      });
      const result = await res.json();
      if (result.ok) {
        setOrder((prev) => ({ ...prev, status: "cancelled" }));
        setCancelOpen(false);
      } else setActionError("Не удалось отменить заказ. Попробуйте ещё раз.");
    } catch { setActionError("Ошибка соединения. Проверьте подключение к сети."); }
    finally { setCancelLoading(false); }
  }

  async function handleDelete() {
    if (!window.confirm("Удалить заказ безвозвратно?")) return;
    setDeleting(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/delete`, { method: "DELETE" });
      const result = await res.json();
      if (result.ok) router.push("/admin/orders");
      else { setActionError("Не удалось удалить заказ. Попробуйте ещё раз."); setDeleting(false); }
    } catch { setActionError("Ошибка соединения. Проверьте подключение к сети."); setDeleting(false); }
  }

  return (
    <div className="space-y-6">
      <ProjectHealthCard order={order} projectData={projectData} />
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* LEFT */}
      <div className="space-y-5">
        {/* Order info */}
        <Card variant="solid" padding="md">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Информация о заказе</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {order.total_price && (
              <div>
                <p className="text-xs text-white/40">Стоимость</p>
                <p className="mt-0.5 text-sm">{Number(order.total_price).toLocaleString("ru-RU")} ₽</p>
              </div>
            )}
            {order.notes && (
              <div className="col-span-full">
                <p className="text-xs text-white/40">Комментарий</p>
                <p className="mt-0.5 text-sm text-white/85 whitespace-pre-line">{order.notes}</p>
              </div>
            )}
            {order.project_snapshot && (
              <div className="col-span-full">
                <p className="text-xs text-white/40">Снепшот проекта</p>
                <p className="mt-0.5 font-mono text-xs text-white/40">{order.project_snapshot.template_id}</p>
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-white/25">
            Создан: {new Date(order.created_at).toLocaleString("ru-RU")}
            {order.updated_at && ` · Обновлён: ${new Date(order.updated_at).toLocaleString("ru-RU")}`}
          </p>
        </Card>

        {/* Brief summary */}
        <Card variant="solid" padding="md">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Краткий бриф</h2>
          <div className="space-y-3">
            {(order.selected_options?.company_name || order.template_name) && (
              <div>
                <p className="text-xs text-white/40">Компания</p>
                <p className="mt-0.5 text-sm font-semibold text-white/85">
                  {order.selected_options?.company_name || order.template_name}
                </p>
                {order.selected_options?.company_description && (
                  <p className="mt-1 text-xs text-white/50 whitespace-pre-line line-clamp-3">
                    {String(order.selected_options.company_description).slice(0, 200)}
                    {String(order.selected_options.company_description).length > 200 ? "…" : ""}
                  </p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {(order.selected_options?.phone) && (
                <div>
                  <p className="text-xs text-white/40">Телефон</p>
                  <p className="mt-0.5 text-xs text-white/70">{order.selected_options.phone}</p>
                </div>
              )}
              {(order.selected_options?.email) && (
                <div>
                  <p className="text-xs text-white/40">Email</p>
                  <p className="mt-0.5 text-xs text-white/70">{order.selected_options.email}</p>
                </div>
              )}
              {(order.budget || order.selected_options?.budget) && (
                <div>
                  <p className="text-xs text-white/40">Бюджет</p>
                  <p className="mt-0.5 text-xs text-white/70">{order.budget || order.selected_options?.budget}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card variant="subtle" padding="md">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Экспорт</h2>
          <p className="text-xs text-white/30">Для скачивания ZIP-архива используйте вкладку <span className="text-white/50">Экспорт</span>.</p>
        </Card>
      </div>

      {/* RIGHT */}
      <div className="space-y-5">
        {/* Action error */}
        {actionError && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="shrink-0 text-red-400 hover:text-red-200">✕</button>
          </div>
        )}

        {/* Status */}
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Статус</h2>
          <div className={`mb-4 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold ${statusCfg.color}`}>
            {statusCfg.label}
          </div>
          <div className="space-y-2">
            {WORKFLOW_ACTIONS.filter((a) => a.fromStatuses.includes(order.status)).map(({ action, label }) => (
              <button
                key={action}
                disabled={statusSaving}
                onClick={() => applyTransition(action)}
                className="w-full rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/50 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {label}
              </button>
            ))}
            {WORKFLOW_ACTIONS.every((a) => !a.fromStatuses.includes(order.status)) && (
              <p className="text-center text-xs text-white/25">Нет доступных переходов</p>
            )}
          </div>
        </Card>

        {/* Developer note for client */}
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Сообщение для клиента</h2>
          <p className="mb-2 text-xs text-white/35">Клиент видит это в личном кабинете</p>
          <textarea
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder-white/25 focus:border-cyan-500/50 focus:outline-none"
            placeholder="Собираем структуру сайта…"
            value={developerNote}
            onChange={(e) => setDeveloperNote(e.target.value)}
          />
          <button
            onClick={saveDeveloperNote}
            disabled={noteSaving}
            className="mt-2 w-full rounded-xl border border-white/10 py-2 text-xs font-semibold text-white/50 transition hover:border-cyan-500/30 hover:text-cyan-300 disabled:opacity-40"
          >
            {noteSaved ? "✓ Сохранено" : noteSaving ? "Сохранение…" : "Сохранить"}
          </button>
        </Card>

        {/* Lead status */}
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Воронка продаж</h2>
          <select
            value={leadStatus}
            onChange={(e) => {
              setLeadStatus(e.target.value);
              void savePortfolioField({ lead_status: e.target.value });
            }}
            className="w-full rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60"
          >
            <option value="new">🆕 Новый лид</option>
            <option value="contacted">📞 Связались</option>
            <option value="qualified">✅ Квалифицирован</option>
            <option value="proposal_sent">📄 Предложение отправлено</option>
            <option value="won">🏆 Победа</option>
            <option value="lost">❌ Проигрыш</option>
          </select>
          {portfolioSaving && <p className="mt-1 text-xs text-white/25">Сохранение...</p>}
        </Card>

        {/* Portfolio */}
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Портфолио</h2>
          <label className="flex cursor-pointer items-center gap-3">
            <div
              onClick={() => {
                const next = !isPortfolio;
                setIsPortfolio(next);
                void savePortfolioField({ is_portfolio: next });
              }}
              className={`relative h-5 w-9 rounded-full transition ${isPortfolio ? "bg-cyan-500" : "bg-white/15"}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isPortfolio ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </div>
            <span className="text-sm text-white/70">Добавить в портфолио</span>
          </label>
          {isPortfolio && (
            <input
              type="text"
              placeholder="Отрасль (кофейня, барбершоп...)"
              value={portfolioIndustry}
              onChange={(e) => setPortfolioIndustry(e.target.value)}
              onBlur={() => void savePortfolioField({ portfolio_industry: portfolioIndustry })}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder-white/25 focus:border-cyan-500/50 focus:outline-none"
            />
          )}
        </Card>

        {/* Quick actions */}
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Действия</h2>
          <div className="space-y-2">
            <Btn href={`/customize/${order.template_id}`} variant="outline" size="sm" className="w-full">
              Открыть в редакторе →
            </Btn>
            {order.project_url && (
              <Btn href={order.project_url} variant="secondary" size="sm" className="w-full" external>
                Сайт клиента ↗
              </Btn>
            )}
            <button
              disabled={statusSaving || order.status === "cancelled"}
              onClick={() => setCancelOpen(true)}
              className="w-full rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
            >
              ✕ Отменить заказ
            </button>
            <button
              disabled={deleting}
              onClick={handleDelete}
              className="w-full rounded-full border border-red-900/40 bg-red-900/10 px-4 py-2 text-xs font-semibold text-red-500/70 transition hover:text-red-400 disabled:opacity-40"
            >
              {deleting ? "Удаление…" : "🗑 Удалить заказ"}
            </button>
          </div>
        </Card>

        {/* Telegram */}
        <Card variant="subtle" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Telegram</h2>
          {order.telegram_username ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                <span className="text-green-400 font-semibold">Привязан</span>
              </div>
              <p className="text-white/50">@{order.telegram_username}</p>
              {order.telegram_linked_at && (
                <p className="text-white/30">С {new Date(order.telegram_linked_at).toLocaleDateString("ru-RU")}</p>
              )}
              <a
                href={`https://t.me/${order.telegram_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
              >
                Написать клиенту ↗
              </a>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-white/40">
              <p>Клиент не привязан к Telegram</p>
              {process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME && (
                <a
                  href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:text-white/70"
                >
                  Ссылка для клиента ↗
                </a>
              )}
            </div>
          )}
        </Card>

        {/* Meta */}
        <Card variant="subtle" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Системная информация</h2>
          <div className="space-y-1.5 text-xs text-white/35">
            <p>ID: <span className="font-mono text-white/50">{order.id}</span></p>
            <p>Шаблон: <span className="text-white/50">{order.template_id}</span></p>
            {order.domain && <p>Домен: <span className="text-white/50">{order.domain}</span></p>}
          </div>
        </Card>
      </div>
    </div>

      {/* Cancel dialog */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="mb-1 text-base font-bold">Отменить заказ</h3>
            <p className="mb-6 text-sm text-white/50">Это действие изменит статус заказа на «Отменена». Подтвердите отмену.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCancelOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white">
                Назад
              </button>
              <button
                disabled={cancelLoading}
                onClick={handleCancel}
                className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30 disabled:opacity-40"
              >
                {cancelLoading ? "Отмена…" : "Подтвердить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
