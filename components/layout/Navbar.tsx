"use client";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 z-50 w-full px-6 pt-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
        <h2 className="text-sm font-semibold tracking-[0.3em] text-white">VIBECODE</h2>
        <nav className="hidden md:flex gap-8 text-sm text-zinc-300">
          <a href="#">Главная</a>
          <a href="#">Услуги</a>
          <a href="#">Примеры</a>
          <a href="#">Контакты</a>
        </nav>
        <button className="md:hidden border border-zinc-500 p-2 rounded-lg" onClick={() => setOpen(!open)}>☰</button>
      </div>
      {open && (
        <div className="absolute top-full left-0 w-full bg-black/90 border-t border-white/10 md:hidden">
          <nav className="flex flex-col p-4 gap-4">
            <a href="#" className="text-white">Главная</a>
            <a href="#" className="text-white">Услуги</a>
            <a href="#" className="text-white">Примеры</a>
            <a href="#" className="text-white">Контакты</a>
          </nav>
        </div>
      )}
    </header>
  );
}