"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [logged, setLogged] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setLogged(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      }
    });
  }, []);

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`transition-colors ${
          active
            ? "text-white"
            : "text-white/50 hover:text-white/80"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link
          href="/"
          className="text-sm font-black tracking-tight text-white transition hover:text-white/80"
        >
          VIBECODE STUDIO
        </Link>

        <div className="flex items-center gap-5 text-sm">
          {navLink("/templates", "Шаблоны")}
          {isAdmin && navLink("/studio", "Studio")}

          {logged ? (
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                isAdmin
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                  : "border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:text-white"
              }`}
            >
              {isAdmin ? "⚡ Панель" : "Кабинет"}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
