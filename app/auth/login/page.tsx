"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Btn } from "@/components/ui/Btn";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 text-white">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-600/5 blur-[80px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-600/5 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="text-xl font-black tracking-tight text-white">VIBECODE STUDIO</span>
          </Link>
          <p className="mt-2 text-sm text-white/40">Сайты для малого бизнеса</p>
        </div>

        <Card variant="glass" padding="lg" radius="3xl">
          {sent ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
                <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Проверьте почту</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Мы отправили ссылку для входа на{" "}
                <span className="font-semibold text-white/85">{email}</span>.
                Перейдите по ней — и вы окажетесь в личном кабинете.
              </p>
              <p className="mt-5 text-xs text-white/35">
                Не пришло? Проверьте папку «Спам» или{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-cyan-400 underline underline-offset-2 transition hover:text-cyan-300"
                >
                  попробуйте ещё раз
                </button>
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-white">Войти в кабинет</h1>
                <p className="mt-2 text-sm text-white/55">
                  Введите email — получите ссылку для входа без пароля.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="auth-email"
                  type="email"
                  required
                  label="Email адрес"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />

                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <Btn
                  type="submit"
                  loading={loading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {loading ? "Отправка..." : "Получить ссылку для входа →"}
                </Btn>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-xs text-white/30">без пароля · безопасно</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <p className="mt-5 text-center text-xs text-white/35">
                Нет аккаунта?{" "}
                <span className="text-white/55">Просто введите email — мы создадим его автоматически.</span>
              </p>
            </>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-white/25">
          <Link href="/" className="transition hover:text-white/50">← На главную</Link>
        </p>
      </div>
    </main>
  );
}
