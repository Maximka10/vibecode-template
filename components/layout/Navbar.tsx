"use client";
import { useState } from "react";
import { getTheme } from "@/lib/themes/getTheme";
import { Container } from "@/components/layout/Container";

const links = ["Главная", "Услуги", "Примеры", "Контакты"];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const theme = getTheme();

  return (
    <header className="fixed top-0 z-50 w-full pt-4 sm:pt-6">
      <Container>
        <div
          className="glass-panel relative flex items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-6"
          style={{
            borderRadius: theme.radius.card,
          }}
        >
          <h2 className="text-xs font-semibold sm:text-sm" style={{ letterSpacing: theme.typography.brandTracking, color: theme.colors.textPrimary }}>
            VIBECODE
          </h2>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex" style={{ color: theme.colors.textMuted }}>
            {links.map((item) => (
              <a key={item} href="#" className="text-sm transition hover:text-white">
                {item}
              </a>
            ))}
          </nav>

          <button
            className="rounded-lg border px-3 py-2 text-sm lg:hidden"
            style={{ borderColor: theme.colors.borderSubtle, color: theme.colors.textPrimary }}
            onClick={() => setOpen(!open)}
            aria-label="Открыть меню"
          >
            ☰
          </button>

          <button
            className="hidden rounded-full border px-4 py-2 text-xs font-medium lg:block"
            style={{ borderColor: theme.colors.borderSubtle, color: theme.colors.textPrimary }}
          >
            Запросить демо
          </button>
        </div>

        {open ? (
          <div
            className="glass-panel mt-2 rounded-2xl p-3 lg:hidden"
            style={{
              borderColor: theme.colors.borderSubtle,
            }}
          >
            <nav className="flex flex-col gap-1">
              {links.map((item) => (
                <a key={item} href="#" className="rounded-lg px-3 py-2 text-sm text-zinc-100 transition hover:bg-white/5">
                  {item}
                </a>
              ))}
            </nav>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
