'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    if (!supabase) {
      setError('Supabase не настроен. Добавьте env переменные.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold mb-3">Проверьте почту</h1>
          <p className="text-zinc-400">Мы отправили ссылку для входа на <strong>{email}</strong></p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Вход</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white text-black font-semibold py-3 hover:bg-zinc-100 transition disabled:opacity-50"
          >
            {loading ? 'Отправляем...' : 'Получить ссылку для входа'}
          </button>
        </form>
      </div>
    </main>
  )
}
