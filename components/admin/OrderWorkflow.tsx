"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  contacted: { label: "Связались", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  in_progress: { label: "В работе", color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
  waiting_client: { label: "Ожидает клиента", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  completed: { label: "Готово", color: "bg-green-500/15 text-green-300 border-green-500/30" },
  cancelled: { label: "Отменена", color: "bg-red-500/15 text-red-300 border-red-500/30" },
};

type Message = {
  id: string;
  text: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = Record<string, any>;

type WorkspaceTab = "overview" | "sections" | "preview" | "brief" | "deploy";

const TABS: { id: WorkspaceTab; label: string; icon: string }[] = [
  { id: "overview", label: "Обзор", icon: "◈" },
  { id: "sections", label: "Секции", icon: "⊞" },
  { id: "preview", label: "Предпросмотр", icon: "◉" },
  { id: "brief", label: "Бриф", icon: "≡" },
  { id: "deploy", label: "Деплой", icon: "⬆" },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-white/10 text-white/60 border-white/10" };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-0.5 text-sm text-white/85">{value}</p>
    </div>
  );
}

export default function OrderWorkflow({
  order: initialOrder,
  initialMessages,
  adminId,
}: {
  order: Order;
  initialMessages: Message[];
  adminId: string;
}) {
  const router = useRouter();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [statusSaving, setStatusSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [deployUrl, setDeployUrl] = useState(initialOrder.project_url ?? "");
  const [deployDomain, setDeployDomain] = useState(initialOrder.domain ?? "");
  const [deploySaving, setDeploySaving] = useState(false);
  const [adminNotes, setAdminNotes] = useState(initialOrder.admin_notes ?? "");
  const [notesSaving, setNotesSaving] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("messages").update({ is_read: true }).eq("order_id", order.id).eq("is_read", false).then(() => null);
  }, [order.id]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-workflow-${order.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `order_id=eq.${order.id}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
          if (msg.sender_id !== adminId) {
            supabase.from("messages").update({ is_read: true }).eq("id", msg.id).then(() => null);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [order.id, adminId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const supabase = createClient();
    const optimistic: Message = { id: crypto.randomUUID(), text: text.trim(), sender_id: adminId, is_read: true, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    await supabase.from("messages").insert({ order_id: order.id, sender_id: adminId, text: optimistic.text });
  }

  async function handleCancel() {
    if (!cancelReason.trim()) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", cancel_reason: cancelReason.trim() }),
      });
      if (res.ok) {
        setOrder((prev) => ({ ...prev, status: "cancelled" }));
        setCancelOpen(false);
        setCancelReason("");
      }
    } finally {
      setCancelLoading(false);
    }
  }

  async function applyTransition(action: string) {
    setStatusSaving(true);
    try {
      const res = await fetch("/api/orders/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action }),
      });
      const result = await res.json();
      if (result.ok) {
        setOrder((prev) => ({ ...prev, status: result.status }));
      } else {
        alert(`Ошибка: ${result.error}`);
      }
    } catch {
      alert("Ошибка соединения");
    } finally {
      setStatusSaving(false);
    }
  }

  async function saveDeploy() {
    setDeploySaving(true);
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_url: deployUrl || null, domain: deployDomain || null }),
    });
    setOrder((prev) => ({ ...prev, project_url: deployUrl || null, domain: deployDomain || null }));
    setDeploySaving(false);
  }

  async function saveNotes() {
    setNotesSaving(true);
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_url: adminNotes }),
    });
    setNotesSaving(false);
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "bg-white/10 text-white/60 border-white/10" };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Topbar */}
      <div className="border-b border-white/8 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <Btn href="/admin" variant="ghost" size="sm">← Заказы</Btn>
            <span className="text-white/20">/</span>
            <h1 className="truncate text-sm font-bold text-white/85">
              #{order.id.slice(0, 8)} · {order.template_name ?? order.template_id ?? "Заказ"}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex shrink-0 gap-2">
            <Btn href={`/preview/${order.template_id}`} variant="ghost" size="sm" external>Превью ↗</Btn>
            <Btn href={`/customize/${order.template_id}`} variant="outline" size="sm">Редактор →</Btn>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === t.id
                    ? "border-cyan-400 text-white"
                    : "border-transparent text-white/45 hover:text-white/75"
                }`}
              >
                <span className="text-xs">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">

        {/* ── Обзор ── */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              {/* Order info */}
              <Card variant="solid" padding="md">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Информация о заказе</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <InfoRow label="Клиент" value={order.client_name} />
                  <InfoRow label="Телефон" value={order.client_phone} />
                  <InfoRow label="Telegram" value={order.client_telegram ? `@${order.client_telegram.replace("@", "")}` : null} />
                  <InfoRow label="Стоимость" value={order.total_price ? `${Number(order.total_price).toLocaleString("ru-RU")} ₽` : null} />
                  {order.notes && (
                    <div className="col-span-full">
                      <p className="text-xs text-white/40">Комментарий клиента</p>
                      <p className="mt-0.5 text-sm text-white/85">{order.notes}</p>
                    </div>
                  )}
                  {order.selected_services && (
                    <div className="col-span-full">
                      <p className="text-xs text-white/40">Услуги</p>
                      <p className="mt-0.5 text-sm text-white/85">
                        {Array.isArray(order.selected_services) ? order.selected_services.join(", ") : String(order.selected_services)}
                      </p>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-xs text-white/25">
                  Создан: {new Date(order.created_at).toLocaleString("ru-RU")}
                  {order.updated_at && ` · Обновлён: ${new Date(order.updated_at).toLocaleString("ru-RU")}`}
                </p>
              </Card>

              {/* Chat */}
              <Card variant="solid" padding="none" radius="2xl">
                <div className="px-5 py-3 border-b border-white/8">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Чат с клиентом</h2>
                </div>
                <div className="h-72 overflow-y-auto p-4 space-y-2">
                  {messages.length === 0 && <p className="py-8 text-center text-xs text-white/30">Сообщений пока нет</p>}
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_id === adminId ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%]">
                        <span className={`block rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.sender_id === adminId ? "bg-purple-500/20 text-purple-100" : "bg-white/8 text-white/85"}`}>
                          {m.text}
                        </span>
                        <p className="mt-0.5 px-1 text-xs text-white/25">
                          {new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/8 p-3">
                  <Input variant="inline" className="flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Написать клиенту..." />
                  <button type="submit" disabled={!text.trim()} className="rounded-xl bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/30 disabled:opacity-40">→</button>
                </form>
              </Card>
            </div>

            {/* Status sidebar */}
            <div className="space-y-5">
              <Card variant="solid" padding="md">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Статус</h2>
                <div className={`mb-4 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold ${statusCfg.color}`}>
                  {statusCfg.label}
                </div>
                <div className="space-y-2">
                  <button disabled={statusSaving || order.status !== "new"} onClick={() => applyTransition("MARK_CONTACTED")}
                    className="w-full rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20 disabled:opacity-40">
                    📞 Связались
                  </button>
                  <button disabled={statusSaving || !["new", "contacted"].includes(order.status)} onClick={() => applyTransition("START_WORK")}
                    className="w-full rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-500/20 disabled:opacity-40">
                    🔨 Начать работу
                  </button>
                  <button disabled={statusSaving || !["in_progress", "contacted"].includes(order.status)} onClick={() => applyTransition("REQUEST_CLIENT_INPUT")}
                    className="w-full rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-300 transition hover:bg-orange-500/20 disabled:opacity-40">
                    ⏳ Запросить правки
                  </button>
                  <button disabled={statusSaving || !["in_progress", "waiting_client"].includes(order.status)} onClick={() => applyTransition("COMPLETE_ORDER")}
                    className="w-full rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300 transition hover:bg-green-500/20 disabled:opacity-40">
                    ✓ Завершить
                  </button>
                  <button disabled={statusSaving || ["completed", "cancelled"].includes(order.status)} onClick={() => applyTransition("CANCEL_ORDER")}
                    className="w-full rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-40">
                    ✕ Отменить
                  </button>
                </div>
              </Card>

              <Card variant="subtle" padding="md">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Системная информация</h2>
                <div className="space-y-2 text-xs text-white/35">
                  <p>ID: <span className="font-mono text-white/50">{order.id}</span></p>
                  <p>Шаблон: <span className="text-white/50">{order.template_id}</span></p>
                  {order.domain && <p>Домен: <span className="text-white/50">{order.domain}</span></p>}
                  {order.project_url && (
                    <p>URL: <a href={order.project_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate">{order.project_url}</a></p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── Секции ── */}
        {activeTab === "sections" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <h2 className="mb-2 text-sm font-bold">Редактор секций</h2>
              <p className="text-sm text-white/45 mb-4">
                Откройте конструктор шаблона чтобы редактировать содержимое секций, загружать фото и настраивать цвета.
              </p>
              <div className="flex flex-wrap gap-3">
                <Btn href={`/customize/${order.template_id}`} variant="primary" size="sm">
                  Открыть конструктор →
                </Btn>
                <Btn href={`/preview/${order.template_id}`} variant="outline" size="sm" external>
                  Предпросмотр ↗
                </Btn>
              </div>
            </div>

            {/* Mini preview */}
            <Card variant="solid" padding="none" radius="2xl">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Текущий вид шаблона</h2>
                <Btn href={`/preview/${order.template_id}`} variant="ghost" size="sm" external>Открыть ↗</Btn>
              </div>
              <div className="relative h-96 overflow-hidden rounded-b-2xl bg-black">
                <iframe
                  src={`/preview/${order.template_id}`}
                  className="absolute inset-0 h-full w-full origin-top-left border-none"
                  style={{ width: "200%", height: "200%", transform: "scale(0.5)", transformOrigin: "top left" }}
                  title="Template preview"
                />
              </div>
            </Card>

            {/* Section list */}
            <Card variant="solid" padding="md">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Доступные секции шаблона</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { name: "Главный экран", key: "hero", desc: "Заголовок, подзаголовок, CTA, фото" },
                  { name: "О компании", key: "about", desc: "Текст и обложка раздела" },
                  { name: "Услуги", key: "services", desc: "Список услуг" },
                  { name: "Галерея", key: "gallery", desc: "Фотографии работ" },
                  { name: "Калькулятор", key: "calculator", desc: "Расчёт стоимости" },
                  { name: "Подвал", key: "footer", desc: "Контакты и ссылки" },
                ].map((s) => (
                  <div key={s.key} className="rounded-xl border border-white/8 bg-white/4 p-3">
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                    <p className="mt-1 text-xs text-white/40">{s.desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── Предпросмотр ── */}
        {activeTab === "preview" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">Предпросмотр сайта</h2>
                <p className="text-sm text-white/40">Интерактивный просмотр шаблона клиента</p>
              </div>
              <div className="flex gap-2">
                <Btn href={`/customize/${order.template_id}`} variant="outline" size="sm">Редактор →</Btn>
                <Btn href={`/preview/${order.template_id}`} variant="primary" size="sm" external>Открыть в новой вкладке ↗</Btn>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <iframe
                src={`/preview/${order.template_id}`}
                className="h-[80vh] w-full border-none"
                title="Full preview"
              />
            </div>
          </div>
        )}

        {/* ── Бриф ── */}
        {activeTab === "brief" && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Client data */}
            <Card variant="solid" padding="md">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Данные клиента</h2>
              <div className="space-y-4">
                <InfoRow label="Имя" value={order.client_name} />
                <InfoRow label="Телефон" value={order.client_phone} />
                <InfoRow label="Telegram" value={order.client_telegram ? `@${order.client_telegram.replace("@", "")}` : null} />
                <InfoRow label="Email" value={order.client_email} />
                <InfoRow label="Шаблон" value={order.template_name ?? order.template_id} />
                <InfoRow label="Стоимость" value={order.total_price ? `${Number(order.total_price).toLocaleString("ru-RU")} ₽` : null} />
                {order.primary_color && (
                  <div>
                    <p className="text-xs text-white/40">Основной цвет</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full border border-white/10" style={{ background: order.primary_color }} />
                      <span className="font-mono text-sm text-white/60">{order.primary_color}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Client requirements */}
            <Card variant="solid" padding="md">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Пожелания клиента</h2>
              <div className="space-y-4">
                {order.notes ? (
                  <div className="rounded-xl border border-white/8 bg-white/4 p-4 text-sm leading-relaxed text-white/75">
                    {order.notes}
                  </div>
                ) : (
                  <p className="text-sm text-white/30">Пожелания не указаны</p>
                )}
                {order.selected_services && (
                  <div>
                    <p className="mb-2 text-xs text-white/40">Выбранные услуги</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(order.selected_services) ? order.selected_services : [order.selected_services]).map((s: string) => (
                        <span key={s} className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Admin notes */}
            <Card variant="solid" padding="md" className="lg:col-span-2">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Заметки разработчика</h2>
              <Textarea
                rows={6}
                placeholder="Внутренние заметки по проекту: договорённости, технические детали, ссылки..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <div className="mt-3">
                <Btn onClick={saveNotes} loading={notesSaving} variant="outline" size="sm">
                  {notesSaving ? "Сохраняю..." : "Сохранить заметки"}
                </Btn>
              </div>
            </Card>
          </div>
        )}

        {/* ── Деплой ── */}
        {activeTab === "deploy" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card variant="solid" padding="md">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Деплой и публикация</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-white/50">Доменное имя</label>
                  <Input
                    className="mt-1"
                    placeholder="example.ru"
                    value={deployDomain}
                    onChange={(e) => setDeployDomain(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-white/30">Домен клиента (без https://)</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-white/50">URL опубликованного сайта</label>
                  <Input
                    className="mt-1"
                    placeholder="https://example.ru"
                    value={deployUrl}
                    onChange={(e) => setDeployUrl(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-white/30">Полная ссылка после публикации</p>
                </div>
                <Btn onClick={saveDeploy} loading={deploySaving} variant="primary" size="sm">
                  {deploySaving ? "Сохраняю..." : "Сохранить"}
                </Btn>
              </div>
            </Card>

            <Card variant="solid" padding="md">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Статус публикации</h2>
              <div className="space-y-3">
                {[
                  { label: "Домен настроен", done: !!order.domain },
                  { label: "Сайт опубликован", done: !!order.project_url },
                  { label: "Заказ завершён", done: order.status === "completed" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${item.done ? "border-green-500/40 bg-green-500/15 text-green-400" : "border-white/15 bg-white/5 text-white/25"}`}>
                      {item.done ? "✓" : "·"}
                    </div>
                    <p className={`text-sm ${item.done ? "text-white/75" : "text-white/35"}`}>{item.label}</p>
                  </div>
                ))}
              </div>

              {order.project_url && (
                <div className="mt-5">
                  <p className="mb-2 text-xs text-white/40">Ссылка для клиента</p>
                  <a
                    href={order.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate rounded-xl border border-cyan-500/25 bg-cyan-500/8 px-4 py-2.5 text-sm text-cyan-400 hover:bg-cyan-500/15 transition"
                  >
                    {order.project_url} ↗
                  </a>
                </div>
              )}

              <div className="mt-5 space-y-2">
                <Btn href={`/customize/${order.template_id}`} variant="outline" size="sm" className="w-full">
                  Открыть конструктор →
                </Btn>
                {order.project_url && (
                  <Btn href={order.project_url} variant="secondary" size="sm" className="w-full" external>
                    Открыть сайт ↗
                  </Btn>
                )}
              </div>
            </Card>
          </div>
        )}

      </div>

      {/* Cancel dialog */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="mb-1 text-base font-bold">Отменить заказ</h3>
            <p className="mb-4 text-sm text-white/50">Укажите причину отмены — она будет сохранена в карточке заказа.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Причина отмены…"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-red-500/40 focus:ring-1 focus:ring-red-500/15"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => { setCancelOpen(false); setCancelReason(""); }}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
              >
                Назад
              </button>
              <button
                disabled={!cancelReason.trim() || cancelLoading}
                onClick={handleCancel}
                className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30 disabled:opacity-40"
              >
                {cancelLoading ? "Отмена…" : "Подтвердить отмену"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
