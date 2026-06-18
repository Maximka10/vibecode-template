"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-black">Вход / регистрация</h1>
        {sent ? (
          <p className="mt-4 text-white/70">
            Письмо отправлено на <strong>{email}</strong>. Проверьте почту и перейдите по ссылке.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="mt-3 text-white/70">
              Введите email — получите ссылку для входа.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-6 w-full rounded-xl p-3 text-black"
              placeholder="email@example.com"
            />
            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full rounded-full bg-white px-5 py-3 font-bold text-black disabled:opacity-50"
            >
              {loading ? "Отправка..." : "Войти по ссылке"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
