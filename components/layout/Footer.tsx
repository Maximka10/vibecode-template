"use client";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-black/90 py-10 text-center text-white/50">
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <Link href="/templates" className="transition hover:text-white">Шаблоны</Link>
        <Link href="/auth/login" className="transition hover:text-white">Личный кабинет</Link>
      </div>
      <p className="mt-5 text-xs text-zinc-600">© {new Date().getFullYear()} Vibecode Studio. Все права защищены.</p>
    </footer>
  );
}
