"use client";
export default function ClientChat({orderId}:{orderId:string}){return <details className="mt-6 rounded-2xl border border-white/10 p-4"><summary>Чат по заказу {orderId}</summary><div className="mt-4 text-white/60">Realtime-канал chat-{orderId}; сообщения будут появляться здесь.</div></details>}
