import { Card } from "@/components/ui/Card";
import { Message } from "@/components/chat/ChatWindow";

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  contacted: "Связались",
  in_progress: "В работе",
  waiting_client: "Ожидает клиента",
  completed: "Завершён",
  cancelled: "Отменён",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500",
  contacted: "bg-purple-500",
  in_progress: "bg-yellow-500",
  waiting_client: "bg-orange-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

function TimelineItem({
  dot,
  dotColor,
  title,
  subtitle,
  date,
  last,
}: {
  dot: string;
  dotColor: string;
  title: string;
  subtitle?: string;
  date: string;
  last?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${dotColor} text-sm`}>
          {dot}
        </div>
        {!last && <div className="mt-1 flex-1 w-px bg-white/10" />}
      </div>
      <div className={`pb-6 min-w-0 ${last ? "" : ""}`}>
        <p className="text-sm font-semibold">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-white/40">{subtitle}</p>}
        <p className="mt-1 text-xs text-white/25">{date}</p>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HistoryTab({ order, messages }: { order: Record<string, any>; messages: Message[] }) {
  const events = [
    {
      dot: "📋",
      dotColor: "bg-blue-500/20 border border-blue-500/30",
      title: "Заказ создан",
      subtitle: `Шаблон: ${order.template_name ?? order.template_id ?? "—"}`,
      date: new Date(order.created_at).toLocaleString("ru-RU"),
    },
  ];

  if (order.status !== "new") {
    events.push({
      dot: "↗",
      dotColor: `${STATUS_COLORS[order.status] ?? "bg-white"}/20 border border-${STATUS_COLORS[order.status] ?? "white"}/30`,
      title: `Статус: ${STATUS_LABELS[order.status] ?? order.status}`,
      subtitle: order.updated_at ? `Обновлён: ${new Date(order.updated_at).toLocaleString("ru-RU")}` : "",
      date: order.updated_at
        ? new Date(order.updated_at).toLocaleString("ru-RU")
        : new Date(order.created_at).toLocaleString("ru-RU"),
    });
  }

  if (order.cancel_reason) {
    events.push({
      dot: "✕",
      dotColor: "bg-red-500/20 border border-red-500/30",
      title: "Заказ отменён",
      subtitle: `Причина: ${order.cancel_reason}`,
      date: order.cancelled_at
        ? new Date(order.cancelled_at).toLocaleString("ru-RU")
        : new Date(order.updated_at ?? order.created_at).toLocaleString("ru-RU"),
    });
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Сообщений", value: messages.length },
          { label: "Статус", value: STATUS_LABELS[order.status] ?? order.status },
          { label: "Стоимость", value: order.total_price ? `${Number(order.total_price).toLocaleString("ru-RU")} ₽` : "—" },
          { label: "Шаблон", value: order.template_id ?? "—" },
        ].map((s) => (
          <Card key={s.label} variant="solid" padding="sm">
            <p className="text-lg font-bold truncate">{s.value}</p>
            <p className="mt-0.5 text-xs text-white/40">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <Card variant="solid" padding="md">
        <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/40">Хронология</h3>
        <div>
          {events.map((e, i) => (
            <TimelineItem key={i} {...e} last={i === events.length - 1} />
          ))}
        </div>
      </Card>

      {/* Messages preview */}
      {messages.length > 0 && (
        <Card variant="solid" padding="md">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
            Последние сообщения ({messages.length})
          </h3>
          <div className="space-y-2">
            {messages.slice(-5).map((m) => (
              <div key={m.id} className="flex items-start gap-3">
                <div className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${m.sender_id ? "bg-cyan-400" : "bg-white/30"}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm text-white/75">{m.text}</p>
                  <p className="text-xs text-white/25">{new Date(m.created_at).toLocaleString("ru-RU")}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
