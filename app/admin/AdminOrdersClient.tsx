'use client'

import { useState } from 'react'

type Order = {
  id: string
  template_name: string
  total_price: number | null
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

export default function AdminOrdersClient({
  orders: initialOrders,
  telegramBotUsername,
}: {
  orders: Order[]
  telegramBotUsername: string
}) {
  const [orders, setOrders] = useState(initialOrders)
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(orderId: string, status: string) {
    setLoading(orderId)
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
    }
    setLoading(null)
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Заявки</h1>
          <div className="flex items-center gap-2 text-sm">
            {telegramBotUsername ? (
              <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Telegram бот подключён
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-zinc-600 bg-zinc-800 px-3 py-1 text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                Telegram бот не настроен
              </span>
            )}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            Заявок пока нет
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const next = NEXT_STATUS[order.status]
              const isLoading = loading === order.id
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{order.template_name}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        #{order.id.slice(0, 8)}
                        {' · '}
                        {new Date(order.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {order.total_price
                          ? ` · ${order.total_price.toLocaleString('ru-RU')} ₽`
                          : ''}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status] ?? ''}`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {next && (
                      <button
                        onClick={() => updateStatus(order.id, next)}
                        disabled={isLoading}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-100 disabled:opacity-50"
                      >
                        {isLoading ? '...' : `→ ${STATUS_LABELS[next]}`}
                      </button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'done' && (
                      <button
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        disabled={isLoading}
                        className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        Отменить
                      </button>
                    )}
                    {telegramBotUsername && (
                      <a
                        href={`https://t.me/${telegramBotUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
                      >
                        Написать клиенту
                      </a>
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
