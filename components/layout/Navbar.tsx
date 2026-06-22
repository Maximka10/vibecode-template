"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [logged, setLogged] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`text-sm transition-colors ${
          active ? "text-white font-semibold" : "text-white/50 hover:text-white/85"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#030712]/90 shadow-[0_1px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:py-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-sm font-black tracking-tight text-white transition-opacity group-hover:opacity-80 sm:text-base">
            VIBECODE{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              STUDIO
            </span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-5 sm:gap-6">
          {navLink("/templates", "Шаблоны")}
          {isAdmin && navLink("/studio", "Studio")}

          {logged ? (
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all sm:px-5 sm:py-2 ${
                isAdmin
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_-6px_rgba(34,211,238,0.5)] hover:bg-cyan-500/20 hover:shadow-[0_0_30px_-6px_rgba(34,211,238,0.7)]"
                  : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isAdmin ? "⚡ Панель" : "Кабинет"}
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur transition-all hover:border-white/30 hover:bg-white/10 hover:text-white sm:px-5 sm:py-2"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
