"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "vibecode-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* localStorage unavailable (e.g. inside sandboxed iframe) — stay hidden */
    }
  }, []);

  function decide(value: "accepted" | "rejected") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: new Date().toISOString() }));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-white/12 bg-slate-900/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:p-5">
        <div className="flex-1 text-sm leading-relaxed text-white/65">
          <span className="mr-1.5">🍪</span>
          Мы используем файлы cookie для корректной работы сайта и аналитики. Продолжая
          пользоваться сайтом, вы соглашаетесь с{" "}
          <Link href="/legal/privacy" className="text-cyan-400 underline-offset-2 hover:underline">
            политикой конфиденциальности
          </Link>
          .
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => decide("rejected")}
            className="rounded-xl border border-white/12 px-4 py-2 text-sm font-medium text-white/55 transition hover:bg-white/5 hover:text-white/80"
          >
            Только необходимые
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
