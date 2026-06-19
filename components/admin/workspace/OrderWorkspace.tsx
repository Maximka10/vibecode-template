"use client";
import { useState } from "react";
import { Btn } from "@/components/ui/Btn";
import { Message } from "@/components/chat/ChatWindow";
import OverviewTab from "./tabs/OverviewTab";
import ChatTab from "./tabs/ChatTab";
import MaterialsTab from "./tabs/MaterialsTab";
import DevelopmentTab from "./tabs/DevelopmentTab";
import PreviewTab from "./tabs/PreviewTab";
import HistoryTab from "./tabs/HistoryTab";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  contacted: { label: "Связались", color: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  in_progress: { label: "В работе", color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
  waiting_client: { label: "Ожидает клиента", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  completed: { label: "Готово", color: "bg-green-500/15 text-green-300 border-green-500/30" },
  cancelled: { label: "Отменена", color: "bg-red-500/15 text-red-300 border-red-500/30" },
};

const TABS = [
  { id: "overview", label: "Обзор" },
  { id: "chat", label: "Чат" },
  { id: "materials", label: "Материалы" },
  { id: "development", label: "Разработка" },
  { id: "preview", label: "Предпросмотр" },
  { id: "history", label: "История" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function OrderWorkspace({
  order,
  initialMessages,
  adminId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: Record<string, any>;
  initialMessages: Message[];
  adminId: string;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "bg-white/10 text-white/60 border-white/10" };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Topbar */}
      <div className="border-b border-white/8 px-4 py-3 sticky top-0 z-20 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <Btn href="/admin/orders" variant="ghost" size="sm">← Заказы</Btn>
            <span className="text-white/20">/</span>
            <h1 className="truncate text-sm font-bold text-white/85">
              #{order.id.slice(0, 8)} · {order.template_name ?? order.template_id ?? "Заказ"}
            </h1>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
          <div className="flex shrink-0 gap-2">
            <Btn href={`/preview/${order.template_id}`} variant="ghost" size="sm" external>Превью ↗</Btn>
            <Btn href={`/customize/${order.template_id}`} variant="outline" size="sm">Редактор →</Btn>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/8 px-4">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "border-cyan-400 text-white"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        {activeTab === "overview" && <OverviewTab order={order} />}
        {activeTab === "chat" && (
          <ChatTab orderId={order.id} adminId={adminId} initialMessages={initialMessages} />
        )}
        {activeTab === "materials" && <MaterialsTab orderId={order.id} order={order} />}
        {activeTab === "development" && <DevelopmentTab orderId={order.id} />}
        {activeTab === "preview" && <PreviewTab orderId={order.id} />}
        {activeTab === "history" && <HistoryTab order={order} messages={initialMessages} />}
      </div>
    </main>
  );
}
