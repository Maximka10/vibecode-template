"use client";

import { useState } from "react";

export default function OrderPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    telegram: "",
    whatsapp: "",
    company: "",
    service: "",
    budget: "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderId: string; botUsername: string | null } | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Пожалуйста, заполните Имя и Телефон.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lead-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json() as { ok: boolean; orderId?: string; botUsername?: string | null; error?: string };
      if (!json.ok) {
        setError(json.error ?? "Ошибка отправки");
      } else {
        setSuccess({ orderId: json.orderId!, botUsername: json.botUsername ?? null });
      }
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    const botLink = success.botUsername
      ? `https://t.me/${success.botUsername}?start=${success.orderId}`
      : null;
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold">Спасибо. Мы получили заявку.</h1>
          <p className="text-white/60 text-sm">
            Мы свяжемся с вами в ближайшее время. Номер заявки:{" "}
            <span className="text-white font-mono">{success.orderId.slice(0, 8)}</span>
          </p>
          {botLink && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 space-y-3">
              <p className="text-sm text-cyan-300 font-semibold">
                Привяжите Telegram для отслеживания заказа
              </p>
              <p className="text-xs text-white/50">
                Вы будете получать уведомления о статусе напрямую в Telegram.
              </p>
              <a
                href={botLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-400"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.69 7.96c-.13.58-.47.72-.96.45l-2.65-1.95-1.28 1.23c-.14.14-.26.26-.53.26l.19-2.72 4.93-4.46c.21-.19-.05-.29-.33-.1l-6.1 3.84-2.63-.82c-.57-.18-.58-.57.12-.84l10.27-3.96c.47-.18.89.11.66.11z"/>
                </svg>
                Привязать Telegram → t.me/{success.botUsername}
              </a>
            </div>
          )}
        </div>
      </main>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15";
  const labelCls = "block text-xs text-white/50 mb-1.5 font-medium";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-lg px-4 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Оставить заявку</h1>
          <p className="text-white/50 text-sm">
            Расскажите о вашем проекте — мы свяжемся с вами в течение часа.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>
                Имя <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Иван Петров"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Телефон <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+7 999 000 00 00"
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Telegram</label>
              <input
                type="text"
                name="telegram"
                value={form.telegram}
                onChange={handleChange}
                placeholder="@username"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="+7 999 000 00 00"
                className={inputCls}
              />
            </div>
          </div>

          {/* Company + Service */}
          <div>
            <label className={labelCls}>Компания / Бренд</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="ООО «Ромашка»"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Что нужно сделать?</label>
            <input
              type="text"
              name="service"
              value={form.service}
              onChange={handleChange}
              placeholder="Лендинг, интернет-магазин, корпоративный сайт..."
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Бюджет</label>
            <input
              type="text"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              placeholder="от 30 000 ₽"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Комментарий</label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              rows={4}
              placeholder="Расскажите подробнее о проекте..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Отправляем…" : "Отправить заявку"}
          </button>

          <p className="text-center text-xs text-white/30">
            Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
          </p>
        </form>
      </div>
    </main>
  );
}
