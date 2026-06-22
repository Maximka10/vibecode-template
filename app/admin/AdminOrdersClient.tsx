'use client'

import { useState } from 'react'

type Order = {
  id: string
  template_name: string
  total_price: number
  status: string
  created_at: string
  notes: string | null
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая',
  inprogress: 'В работе',
  done: 'Готово',
  cancelled: 'Отменена',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  inprogress: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  done: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const NEXT_STATUS: Record<string, string | null> = {
  new: 'inprogress',
  inprogress: 'done',
  done: null,
  cancelled: null,
}

const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

export default function AdminOrdersClient({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [loading, setLoading] = useState<string | null>(null)

  async function moveToNext(orderId: string, nextStatus: string) {
    setLoading(orderId)
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o))
    }
    setLoading(null)
  }

  async function cancel(orderId: string) {
    setLoading(orderId)
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'cancelled' } : o))
    }
    setLoading(null)
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Заявки</h1>
          {botUsername ? (
            <span className="text-xs rounded-full border border-green-500/30 bg-green-500/10 text-green-300 px-3 py-1">
              Telegram бот подключён
            </span>
          ) : (
            <span className="text-xs rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-400 px-3 py-1">
              Telegram бот не настроен
            </span>
          )}
        </div>
        {orders.length === 0 ? (
          <p className="text-zinc-400">Заявок пока нет</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const next = NEXT_STATUS[order.status]
              return (
                <div key={order.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{order.template_name}</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString('ru-RU')}
                        {order.total_price ? ` · ${order.total_price.toLocaleString('ru-RU')} ₽` : ''}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status] ?? ''}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {next && (
                      <button
                        onClick={() => moveToNext(order.id, next)}
                        disabled={loading === order.id}
                        className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-zinc-100 transition disabled:opacity-50"
                      >
                        {loading === order.id ? '...' : `→ ${STATUS_LABELS[next]}`}
                      </button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'done' && (
                      <button
                        onClick={() => cancel(order.id)}
                        disabled={loading === order.id}
                        className="rounded-xl border border-red-500/30 text-red-400 px-4 py-2 text-sm hover:bg-red-500/10 transition disabled:opacity-50"
                      >
                        Отменить
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
