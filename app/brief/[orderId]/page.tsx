"use client";

import { useState, useEffect, useRef } from "react";
import { use } from "react";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15";
const labelCls = "block text-xs text-white/50 mb-1.5 font-medium";

type BriefForm = {
  company_name: string;
  company_description: string;
  phone: string;
  email: string;
  telegram: string;
  whatsapp: string;
  address: string;
  working_hours: string;
  domain_name: string;
  contact_link: string;
};

type UploadedFile = { name: string; path: string };

export default function BriefPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [form, setForm] = useState<BriefForm>({
    company_name: "",
    company_description: "",
    phone: "",
    email: "",
    telegram: "",
    whatsapp: "",
    address: "",
    working_hours: "",
    domain_name: "",
    contact_link: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing uploaded files on mount
  useEffect(() => {
    fetch(`/api/brief-public/${orderId}/files`)
      .then((r) => r.json())
      .then((json: { ok: boolean; files?: { name: string; path: string }[] }) => {
        if (json.ok && json.files) {
          setUploadedFiles(json.files);
        }
      })
      .catch(() => {});
  }, [orderId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setSaveError(null);

    try {
      const res = await fetch(`/api/brief-public/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json() as { ok: boolean; error?: string };
      if (json.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setSaveError(json.error ?? "Ошибка сохранения");
      }
    } catch {
      setSaveError("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);

      try {
        const res = await fetch(`/api/brief-public/${orderId}/upload`, {
          method: "POST",
          body: fd,
        });
        const json = await res.json() as { ok: boolean; path?: string; error?: string };
        if (json.ok && json.path) {
          setUploadedFiles((prev) => [...prev, { name: file.name, path: json.path! }]);
        } else {
          setUploadError(json.error ?? "Ошибка загрузки");
        }
      } catch {
        setUploadError("Ошибка соединения при загрузке");
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Заполнить бриф</h1>
          <p className="mt-1 text-sm text-white/40">
            Заявка #{orderId.slice(0, 8)} · Заполните информацию о вашем проекте
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Company */}
          <div className="space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">
              Компания
            </h2>
          </div>
          <div>
            <label className={labelCls}>Название компании</label>
            <input
              type="text"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              placeholder="ООО «Ромашка»"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Описание компании</label>
            <textarea
              name="company_description"
              value={form.company_description}
              onChange={handleChange}
              rows={3}
              placeholder="Чем занимается ваша компания..."
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>Адрес</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="г. Москва, ул. Пушкина, д. 1"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Режим работы</label>
            <textarea
              name="working_hours"
              value={form.working_hours}
              onChange={handleChange}
              rows={2}
              placeholder="Пн-Пт: 9:00–18:00, Сб-Вс: выходной"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Contacts */}
          <div className="space-y-1 pt-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">
              Контакты
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Телефон</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+7 999 000 00 00"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="hello@company.ru"
                className={inputCls}
              />
            </div>
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
          <div>
            <label className={labelCls}>Ссылка для связи (соцсеть, мессенджер)</label>
            <input
              type="text"
              name="contact_link"
              value={form.contact_link}
              onChange={handleChange}
              placeholder="https://vk.com/company"
              className={inputCls}
            />
          </div>

          {/* Project */}
          <div className="space-y-1 pt-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">
              Проект
            </h2>
          </div>
          <div>
            <label className={labelCls}>Домен (если есть)</label>
            <input
              type="text"
              name="domain_name"
              value={form.domain_name}
              onChange={handleChange}
              placeholder="company.ru"
              className={inputCls}
            />
          </div>

          {saveError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {saveError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {saving ? "Сохранение…" : "Сохранить бриф"}
            </button>
            {saved && <span className="text-sm text-green-400">Сохранено ✓</span>}
          </div>
        </form>

        {/* File upload section */}
        <div className="space-y-4 border-t border-white/8 pt-8">
          <div>
            <h2 className="text-lg font-bold">Загрузить материалы</h2>
            <p className="text-sm text-white/40 mt-1">
              Логотипы, фотографии, документы — любые файлы для сайта
            </p>
          </div>

          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-white/15 p-8 text-center transition hover:border-white/30">
            <div className="text-3xl">📁</div>
            <div>
              <p className="text-sm font-semibold">
                {uploading ? "Загрузка…" : "Нажмите для выбора файлов"}
              </p>
              <p className="text-xs text-white/30 mt-1">
                Изображения, PDF, документы
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {uploadError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {uploadError}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/40 font-semibold uppercase tracking-widest">
                Загружено
              </p>
              {uploadedFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-2.5"
                >
                  <span className="text-green-400">✓</span>
                  <span className="text-sm text-white/70 truncate">{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
