"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
};

const ADMIN_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Обзор",
    items: [
      { href: "/admin", label: "CRM", icon: "◈", exact: true },
      { href: "/studio", label: "Studio", icon: "⚡", exact: true },
    ],
  },
  {
    title: "Заказы",
    items: [
      { href: "/admin/orders", label: "Все заказы", icon: "≡" },
      { href: "/admin", label: "Статусы", icon: "◎", exact: true },
    ],
  },
  {
    title: "Шаблоны",
    items: [
      { href: "/templates", label: "Шаблоны", icon: "▣" },
    ],
  },
  {
    title: "Система",
    items: [
      { href: "/admin/diagnostics", label: "Диагностика", icon: "⊙" },
    ],
  },
];

const CLIENT_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Кабинет",
    items: [
      { href: "/dashboard", label: "Мои заказы", icon: "◈", exact: true },
      { href: "/templates", label: "Новый сайт", icon: "＋" },
    ],
  },
];

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
        active
          ? "bg-white/10 text-white font-semibold"
          : "text-white/45 hover:bg-white/6 hover:text-white/80"
      }`}
    >
      <span className="w-4 text-center text-xs">{item.icon}</span>
      {item.label}
    </Link>
  );
}

export default function AppSidebar({
  isAdmin,
  userEmail,
}: {
  isAdmin: boolean;
  userEmail: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sections = isAdmin ? ADMIN_SECTIONS : CLIENT_SECTIONS;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="block">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            {isAdmin ? "Admin" : "Studio"}
          </p>
          <p className="mt-0.5 text-base font-black text-white">VIBECODE</p>
        </Link>
      </div>

      <div className="mx-3 h-px bg-white/6" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/25">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.href + item.label}
                  item={item}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mx-3 h-px bg-white/6" />
      <div className="p-3 space-y-1">
        <div className="rounded-xl px-3 py-2">
          <p className="text-xs text-white/30 truncate">{userEmail}</p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/40 transition hover:bg-white/6 hover:text-white/70"
          >
            Выйти →
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-white/6 bg-slate-950 lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile topbar */}
      <div className="flex items-center justify-between border-b border-white/6 bg-slate-950 px-4 py-3 lg:hidden">
        <Link href={isAdmin ? "/admin" : "/dashboard"}>
          <span className="text-sm font-black text-white">VIBECODE</span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "≡"}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-full w-56 border-r border-white/6 bg-slate-950 lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
