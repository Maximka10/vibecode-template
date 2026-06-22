"use client";
import { useEffect, useRef, useState } from "react";
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

type Message = { id: string; text: string; sender_id: string; is_read: boolean; created_at: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = Record<string, any>;
type Tab = "overview" | "development" | "preview" | "materials" | "telegram" | "export";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",    label: "Обзор",       icon: "◈" },
  { id: "development", label: "Разработка",  icon: "⚙" },
  { id: "preview",     label: "Превью",      icon: "▣" },
  { id: "materials",   label: "Материалы",   icon: "📎" },
  { id: "telegram",    label: "Telegram",    icon: "✉" },
  { id: "export",      label: "Экспорт",     icon: "↓" },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-white/10 text-white/60 border-white/10" };
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>;
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

/* ──────────────────────────── TAB: OVERVIEW ──────────────────────────── */
function TabOverview({
  order,
  statusSaving,
  applyTransition,
}: {
  order: Order;
  statusSaving: boolean;
  applyTransition: (action: string) => void;
}) {
  const STATUS_ORDER = ["new", "contacted", "in_progress", "waiting_client", "completed", "cancelled"];
  const STATUS_TO_ACTION: Partial<Record<string, string>> = {
    in_progress: "START_WORK",
    waiting_client: "REQUEST_CLIENT_INPUT",
    completed: "COMPLETE_ORDER",
    cancelled: "CANCEL_ORDER",
    contacted: "START_WORK",
  };
  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "bg-white/10 text-white/60 border-white/10" };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* Order info */}
        <Card variant="solid" padding="md">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Информация о заказе</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoRow label="Клиент" value={order.client_name} />
            <InfoRow label="Телефон" value={order.client_phone} />
            <InfoRow label="Telegram" value={order.client_telegram ? `@${order.client_telegram.replace("@", "")}` : null} />
            <InfoRow label="Email" value={order.client_email} />
            <InfoRow label="Стоимость" value={order.total_price ? `${Number(order.total_price).toLocaleString("ru-RU")} ₽` : null} />
            <InfoRow label="Шаблон" value={order.template_name ?? order.template_id} />
            {order.domain && <InfoRow label="Домен" value={order.domain} />}
            {order.notes && (
              <div className="col-span-full">
                <p className="text-xs text-white/40">Комментарий</p>
                <p className="mt-0.5 text-sm text-white/85">{order.notes}</p>
              </div>
            )}
            {order.selected_services && Array.isArray(order.selected_services) && order.selected_services.length > 0 && (
              <div className="col-span-full">
                <p className="text-xs text-white/40">Услуги</p>
                <p className="mt-0.5 text-sm text-white/85">{order.selected_services.join(", ")}</p>
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-white/25">
            Создан: {new Date(order.created_at).toLocaleString("ru-RU")}
            {order.updated_at && ` · Обновлён: ${new Date(order.updated_at).toLocaleString("ru-RU")}`}
          </p>
        </Card>

        {/* Quick actions */}
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Быстрые действия</h2>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={statusSaving || order.status === "in_progress"}
              onClick={() => applyTransition("START_WORK")}
              className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-500/20 disabled:opacity-40"
            >
              🔨 Начать работу
            </button>
            <button
              disabled={statusSaving || order.status === "waiting_client"}
              onClick={() => applyTransition("REQUEST_CLIENT_INPUT")}
              className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-300 transition hover:bg-orange-500/20 disabled:opacity-40"
            >
              ⏳ Запросить правки
            </button>
            <button
              disabled={statusSaving || order.status === "completed"}
              onClick={() => applyTransition("COMPLETE_ORDER")}
              className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300 transition hover:bg-green-500/20 disabled:opacity-40"
            >
              ✓ Завершить
            </button>
            <button
              disabled={statusSaving || order.status === "cancelled"}
              onClick={() => applyTransition("CANCEL_ORDER")}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
            >
              ✕ Отменить
            </button>
          </div>
        </Card>
      </div>

      {/* RIGHT: Status pipeline */}
      <div className="space-y-5">
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Статус</h2>
          <div className={`mb-4 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold ${statusCfg.color}`}>
            {statusCfg.label}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_ORDER.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const active = order.status === s;
              const action = STATUS_TO_ACTION[s];
              return (
                <button
                  key={s}
                  disabled={statusSaving || active || !action}
                  onClick={() => action && applyTransition(action)}
                  className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    active ? cfg.color : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </Card>

        <Card variant="subtle" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Системная информация</h2>
          <div className="space-y-2 text-xs text-white/35">
            <p>ID: <span className="font-mono text-white/50 break-all">{order.id}</span></p>
            {order.template_id && <p>Шаблон: <span className="text-white/50">{order.template_id}</span></p>}
            {order.user_id && <p>user_id: <span className="font-mono text-white/50 break-all">{order.user_id}</span></p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────────────────── TAB: DEVELOPMENT ──────────────────────────── */
function TabDevelopment({ order }: { order: Order }) {
  const [domain, setDomain] = useState<string>(order.domain ?? "");
  const [projectUrl, setProjectUrl] = useState<string>(order.project_url ?? "");
  const [notes, setNotes] = useState<string>(order.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("orders").update({ domain, project_url: projectUrl, notes }).eq("id", order.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Card variant="solid" padding="md">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Детали разработки</h2>
        <div className="space-y-4">
          <Input
            label="Домен клиента"
            placeholder="example.ru"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <Input
            label="URL готового проекта"
            placeholder="https://example.ru"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
          />
          <Textarea
            label="Внутренние заметки (не видно клиенту)"
            rows={4}
            placeholder="Технические детали, пожелания, договорённости..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Btn onClick={save} loading={saving} variant="primary" size="sm">
            {saved ? "✓ Сохранено" : "Сохранить"}
          </Btn>
        </div>
      </Card>

      <Card variant="solid" padding="md">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Редактор шаблона</h2>
        <p className="mb-3 text-sm text-white/50">
          Откройте конструктор для редактирования шаблона этого заказа.
        </p>
        <div className="flex flex-wrap gap-2">
          {order.template_id && (
            <>
              <Btn href={`/customize/${order.template_id}`} variant="primary" size="sm">
                Открыть конструктор →
              </Btn>
              <Btn href={`/preview/${order.template_id}`} variant="outline" size="sm" external>
                Превью ↗
              </Btn>
            </>
          )}
        </div>
      </Card>

      <Card variant="solid" padding="md">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Детали клиента</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Имя", order.client_name],
            ["Телефон", order.client_phone],
            ["Telegram", order.client_telegram ? `@${order.client_telegram.replace("@","")}` : null],
            ["Email", order.client_email],
            ["Стоимость", order.total_price ? `${Number(order.total_price).toLocaleString("ru-RU")} ₽` : null],
            ["Цвет", order.primary_color],
          ].map(([label, value]) =>
            value ? (
              <div key={label as string}>
                <p className="text-xs text-white/35">{label}</p>
                <p className="mt-0.5 text-white/80">{value}</p>
              </div>
            ) : null
          )}
        </div>
      </Card>
    </div>
  );
}

/* ──────────────────────────── TAB: PREVIEW ──────────────────────────── */
function TabPreview({ order }: { order: Order }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDevice("desktop")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${device === "desktop" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
        >
          Desktop
        </button>
        <button
          onClick={() => setDevice("mobile")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${device === "mobile" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
        >
          Mobile
        </button>
        {order.template_id && (
          <Btn href={`/preview/${order.template_id}`} variant="ghost" size="sm" external className="ml-auto">
            Открыть в новой вкладке ↗
          </Btn>
        )}
      </div>

      {order.template_id ? (
        <div className="flex justify-center bg-black/30 rounded-2xl p-4">
          <div className={device === "mobile" ? "rounded-[2.5rem] border-8 border-zinc-800 p-2" : "w-full"}>
            <iframe
              src={`/preview/${order.template_id}`}
              className="rounded-lg bg-white"
              style={{
                width: device === "mobile" ? 393 : "100%",
                height: device === "mobile" ? 700 : "75vh",
                border: "none",
              }}
              title="Template preview"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-12 text-center">
          <p className="text-white/40">Шаблон не привязан к заказу</p>
        </div>
      )}

      {order.project_url && (
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Сайт клиента</h2>
          <Btn href={order.project_url} variant="outline" size="sm" external>
            {order.project_url} ↗
          </Btn>
        </Card>
      )}
    </div>
  );
}

/* ──────────────────────────── TAB: MATERIALS ──────────────────────────── */
function TabMaterials({ order }: { order: Order }) {
  const [files, setFiles] = useState<{ name: string; url: string; size?: number; created_at?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.storage.from("uploads").list(`orders/${order.id}`, { limit: 100 });
      if (data) {
        const mapped = data.map((f) => ({
          name: f.name,
          url: supabase.storage.from("uploads").getPublicUrl(`orders/${order.id}/${f.name}`).data.publicUrl,
          size: f.metadata?.size,
          created_at: f.created_at ?? undefined,
        }));
        setFiles(mapped);
      }
      setLoading(false);
    }
    load();
  }, [order.id]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `orders/${order.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (!error) {
      const url = supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl;
      setFiles((prev) => [...prev, { name: file.name, url }]);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(name: string) {
    const supabase = createClient();
    await supabase.storage.from("uploads").remove([`orders/${order.id}/${name}`]);
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <Card variant="solid" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Материалы заказа</h2>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl border border-white/20 bg-white/8 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/12 disabled:opacity-50"
          >
            {uploading ? "Загружаю..." : "+ Загрузить файл"}
          </button>
        </div>
        <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />

        {loading ? (
          <p className="py-8 text-center text-xs text-white/30">Загружаю...</p>
        ) : files.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 py-12 text-center">
            <p className="text-sm text-white/40">Файлы не загружены</p>
            <p className="mt-1 text-xs text-white/25">Загрузите материалы: фото, видео, документы</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((f) => {
              const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.name);
              return (
                <div key={f.name} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  {isImage ? (
                    <img src={f.url} alt="" className="h-10 w-14 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-10 w-14 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-lg">📄</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{f.name}</p>
                    {f.size && <p className="text-xs text-white/35">{(f.size / 1024).toFixed(1)} KB</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-white/60 hover:text-white transition"
                    >
                      ↗
                    </a>
                    <button
                      onClick={() => handleDelete(f.name)}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {order.selected_options && (
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Настройки шаблона</h2>
          <pre className="overflow-auto rounded-xl bg-black/30 p-4 text-xs text-white/50 max-h-64">
            {JSON.stringify(order.selected_options, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}

/* ──────────────────────────── TAB: TELEGRAM ──────────────────────────── */
function TabTelegram({
  order,
  messages,
  adminId,
  text,
  setText,
  sendMessage,
}: {
  order: Order;
  messages: Message[];
  adminId: string;
  text: string;
  setText: (v: string) => void;
  sendMessage: (e: React.FormEvent) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const telegramHandle = order.client_telegram?.replace("@", "");

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px] max-w-4xl">
      <Card variant="solid" padding="none" radius="2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Чат с клиентом</h2>
          {telegramHandle && (
            <a
              href={`https://t.me/${telegramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-400 hover:bg-blue-500/20 transition"
            >
              @{telegramHandle} ↗
            </a>
          )}
        </div>

        <div className="h-[400px] overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && (
            <p className="py-12 text-center text-xs text-white/30">Сообщений пока нет</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_id === adminId ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                <span className={`block rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.sender_id === adminId ? "bg-purple-500/20 text-purple-100" : "bg-white/8 text-white/85"
                }`}>
                  {m.text}
                </span>
                <p className="mt-0.5 px-1 text-xs text-white/25">
                  {new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                  {!m.is_read && m.sender_id !== adminId && " · не прочитано"}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/8 p-3">
          <Input
            variant="inline"
            className="flex-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Написать клиенту..."
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="rounded-xl bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/30 disabled:opacity-40"
          >
            →
          </button>
        </form>
      </Card>

      <div className="space-y-4">
        <Card variant="solid" padding="md">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Контакты</h2>
          <div className="space-y-3 text-sm">
            {order.client_name && <div><p className="text-xs text-white/35">Имя</p><p className="text-white/80">{order.client_name}</p></div>}
            {order.client_phone && <div><p className="text-xs text-white/35">Телефон</p><p className="text-white/80">{order.client_phone}</p></div>}
            {telegramHandle && (
              <div>
                <p className="text-xs text-white/35">Telegram</p>
                <a href={`https://t.me/${telegramHandle}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  @{telegramHandle}
                </a>
              </div>
            )}
            {order.client_email && <div><p className="text-xs text-white/35">Email</p><p className="text-white/80">{order.client_email}</p></div>}
          </div>
        </Card>

        <Card variant="subtle" padding="md">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Статистика</h2>
          <div className="space-y-2 text-xs text-white/50">
            <p>Всего сообщений: <span className="text-white/80">{messages.length}</span></p>
            <p>
              Непрочитанных:{" "}
              <span className="text-orange-400">
                {messages.filter((m) => !m.is_read && m.sender_id !== adminId).length}
              </span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ──────────────────────────── TAB: EXPORT ──────────────────────────── */
function TabExport({ order }: { order: Order }) {
  function exportJson() {
    const blob = new Blob([JSON.stringify(order, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `order-${order.id.slice(0, 8)}.json`;
    a.click();
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Card variant="solid" padding="md">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Экспорт данных заказа</h2>
        <p className="mb-4 text-sm text-white/50">Скачайте данные заказа для архивирования или переноса.</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportJson}
            className="rounded-xl border border-white/20 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/12"
          >
            ↓ Скачать JSON
          </button>
          {order.template_id && (
            <Btn href={`/customize/${order.template_id}`} variant="outline" size="sm">
              Открыть в редакторе →
            </Btn>
          )}
        </div>
      </Card>

      <Card variant="subtle" padding="md">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">Данные заказа</h2>
        <pre className="overflow-auto rounded-xl bg-black/30 p-4 text-xs text-white/50 max-h-80">
          {JSON.stringify(
            {
              id: order.id,
              status: order.status,
              template_id: order.template_id,
              template_name: order.template_name,
              client_name: order.client_name,
              client_phone: order.client_phone,
              client_telegram: order.client_telegram,
              total_price: order.total_price,
              domain: order.domain,
              project_url: order.project_url,
              created_at: order.created_at,
            },
            null,
            2
          )}
        </pre>
      </Card>
    </div>
  );
}

/* ──────────────────────────── MAIN COMPONENT ──────────────────────────── */
export default function OrderWorkspace({
  order: initialOrder,
  initialMessages,
  adminId,
}: {
  order: Order;
  initialMessages: Message[];
  adminId: string;
}) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  // Mark unread as read on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.from("messages").update({ is_read: true }).eq("order_id", order.id).eq("is_read", false).then(() => null);
  }, [order.id]);

  // Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`workspace-${order.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `order_id=eq.${order.id}` }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
        if (msg.sender_id !== adminId) {
          supabase.from("messages").update({ is_read: true }).eq("id", msg.id).then(() => null);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [order.id, adminId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const supabase = createClient();
    const optimistic: Message = { id: crypto.randomUUID(), text: text.trim(), sender_id: adminId, is_read: true, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    await supabase.from("messages").insert({ order_id: order.id, sender_id: adminId, text: optimistic.text });
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
      alert("Ошибка соединения при смене статуса");
    } finally {
      setStatusSaving(false);
    }
  }

  const unreadCount = messages.filter((m) => !m.is_read && m.sender_id !== adminId).length;

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      {/* Topbar */}
      <div className="border-b border-white/8 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="truncate text-sm font-bold text-white/85">
              #{order.id.slice(0, 8)} · {order.template_name ?? order.template_id ?? "Заказ"}
            </h1>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CONFIG[order.status]?.color ?? "bg-white/10 text-white/60 border-white/10"}`}>
              {STATUS_CONFIG[order.status]?.label ?? order.status}
            </span>
          </div>
          <div className="flex gap-2 shrink-0">
            {order.template_id && (
              <>
                <Btn href={`/preview/${order.template_id}`} variant="ghost" size="sm" external>Превью ↗</Btn>
                <Btn href={`/customize/${order.template_id}`} variant="outline" size="sm">Редактор →</Btn>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/8 px-4 shrink-0 overflow-x-auto">
        <div className="flex gap-0.5 py-2 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                tab === t.id ? "bg-white/10 text-white" : "text-white/45 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {t.id === "telegram" && unreadCount > 0 && (
                <span className="ml-0.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {tab === "overview" && (
          <TabOverview order={order} statusSaving={statusSaving} applyTransition={applyTransition} />
        )}
        {tab === "development" && <TabDevelopment order={order} />}
        {tab === "preview" && <TabPreview order={order} />}
        {tab === "materials" && <TabMaterials order={order} />}
        {tab === "telegram" && (
          <TabTelegram
            order={order}
            messages={messages}
            adminId={adminId}
            text={text}
            setText={setText}
            sendMessage={sendMessage}
          />
        )}
        {tab === "export" && <TabExport order={order} />}
      </div>
    </main>
  );
}
