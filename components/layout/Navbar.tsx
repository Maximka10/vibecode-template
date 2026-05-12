"use client";
import { useState } from "react";
import { getTheme } from "@/lib/themes/getTheme";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const theme = getTheme();

  return (
    <header className="fixed top-0 z-50 w-full px-6 pt-6">
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 backdrop-blur-xl"
        style={{
          borderRadius: theme.radius.card,
          border: `1px solid ${theme.colors.borderSubtle}`,
          backgroundColor: theme.colors.surface,
        }}
      >
        <h2 className="text-sm font-semibold" style={{ letterSpacing: theme.typography.brandTracking, color: theme.colors.textPrimary }}>
          VIBECODE
        </h2>
        <nav className="hidden md:flex gap-8 text-sm" style={{ color: theme.colors.textMuted }}>
          <a href="#">Главная</a>
          <a href="#">Услуги</a>
          <a href="#">Примеры</a>
          <a href="#">Контакты</a>
        </nav>
        <button
          className="md:hidden p-2"
          style={{ borderRadius: theme.radius.panel, border: `1px solid ${theme.colors.borderSubtle}`, color: theme.colors.textPrimary }}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 w-full border-t md:hidden" style={{ backgroundColor: "rgba(0,0,0,0.9)", borderColor: theme.colors.borderSubtle }}>
          <nav className="flex flex-col p-4 gap-4">
            <a href="#" style={{ color: theme.colors.textPrimary }}>Главная</a>
            <a href="#" style={{ color: theme.colors.textPrimary }}>Услуги</a>
            <a href="#" style={{ color: theme.colors.textPrimary }}>Примеры</a>
            <a href="#" style={{ color: theme.colors.textPrimary }}>Контакты</a>
          </nav>
        </div>
      )}
    </header>
  );
}
