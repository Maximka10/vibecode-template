"use client";
export default function AdminChat({orderId,unread}:{orderId:string;unread:number}){return <details className="mt-6 rounded-2xl border border-white/10 p-4"><summary>Чат {orderId} · непрочитано: {unread}</summary><div className="mt-4 text-white/60">Realtime-канал admin-chat-{orderId}.</div></details>}
