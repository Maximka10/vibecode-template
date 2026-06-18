"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [logged, setLogged] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 12); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => { supabase.auth.getUser().then(async ({ data }) => { if (data.user) { setLogged(true); const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single(); setIsAdmin(profile?.role === "admin"); } }); }, []);
  return <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/10 bg-[#030712]/80 shadow-[0_10px_40px_-24px_rgba(103,232,249,.5)] backdrop-blur-xl" : "bg-transparent"}`}><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"><Link href="/" className="group flex items-center gap-2 font-black tracking-tight"><span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 via-violet-300 to-amber-200 text-black shadow-[0_0_34px_-10px_rgba(103,232,249,.9)] transition group-hover:scale-105">V</span><span>VIBECODE</span></Link><div className="flex items-center gap-2 text-sm sm:gap-4"><Link className="relative text-white/75 transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all hover:text-white hover:after:w-full" href="/templates">Шаблоны</Link>{isAdmin && <Link className="relative text-white/75 transition hover:text-white" href="/studio">⚡ Studio</Link>}{logged ? <Link className="secondary-cta rounded-full px-3 py-2 font-bold text-white sm:px-4" href={isAdmin ? "/admin" : "/dashboard"}>{isAdmin ? "Админ" : "Кабинет"}</Link> : <Link className="primary-cta rounded-full px-4 py-2 font-black text-black" href="/auth/login">Войти</Link>}</div></div></nav>;
}
