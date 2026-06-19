"use client";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";

type FileEntry = { name: string; url: string; size?: number; created_at?: string };
type FolderFiles = { logo: FileEntry[]; photos: FileEntry[]; documents: FileEntry[] };

type Category = "all" | "logo" | "photos" | "documents" | "other";

const CATEGORY_LABELS: Record<Category, string> = {
  all: "Все",
  logo: "Логотип",
  photos: "Фото",
  documents: "Документы",
  other: "Прочее",
};

function extractClientAssets(order: Record<string, unknown>): string[] {
  const opts = order.selected_options as Record<string, unknown> | null | undefined;
  if (!opts) return [];
  const urls: string[] = [];
  const sections = (opts.sections as Array<Record<string, unknown>> | undefined) ?? [];
  for (const s of sections) {
    const content = (s.content as Record<string, unknown> | undefined) ?? {};
    if (content.heroImage && typeof content.heroImage === "string") urls.push(content.heroImage);
    const images = content.images as string[] | undefined;
    if (Array.isArray(images)) urls.push(...images.filter((u) => typeof u === "string" && u));
    if (content.coverImage && typeof content.coverImage === "string") urls.push(content.coverImage);
  }
  return [...new Set(urls)].filter(Boolean);
}

const FOLDER_CONFIG = {
  logo: { label: "Логотип", accept: "image/*", hint: "PNG, SVG, WebP — до 5 MB" },
  photos: { label: "Фотографии", accept: "image/*", hint: "JPG, PNG, WebP — до 10 MB каждый" },
  documents: { label: "Документы", accept: ".pdf,.doc,.docx,.txt", hint: "PDF, DOC, TXT — до 20 MB" },
} as const;

type Folder = keyof typeof FOLDER_CONFIG;

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type FlatFile = FileEntry & { folder: Folder };

function categorize(file: FlatFile): Category {
  if (file.folder === "logo" || file.name.toLowerCase().includes("logo")) return "logo";
  if (file.folder === "photos") return "photos";
  if (file.folder === "documents") return "documents";
  return "other";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MaterialsTab({ orderId, order }: { orderId: string; order?: Record<string, any> }) {
  const clientAssets = order ? extractClientAssets(order) : [];
  const [files, setFiles] = useState<FolderFiles>({ logo: [], photos: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Folder | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);
  const inputRefs = useRef<Record<Folder, HTMLInputElement | null>>({ logo: null, photos: null, documents: null });

  async function loadFiles() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/files`);
      const data = await res.json();
      if (data.ok) setFiles(data.files);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadFiles(); }, [orderId]);

  async function handleUpload(folder: Folder, fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(folder);
    setError(null);
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const res = await fetch(`/api/orders/${orderId}/files/upload`, { method: "POST", body: formData });
        const result = await res.json();
        if (!result.ok) { setError(result.error ?? "Ошибка загрузки"); return; }
      }
      await loadFiles();
    } finally {
      setUploading(null);
      if (inputRefs.current[folder]) inputRefs.current[folder]!.value = "";
    }
  }

  async function handleDelete(folder: Folder, fileName: string) {
    const path = `${orderId}/${folder}/${fileName}`;
    setDeleting(path);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/files`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const result = await res.json();
      if (result.ok) await loadFiles();
      else setError(result.error ?? "Ошибка удаления");
    } finally {
      setDeleting(null);
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    setDeletingBulk(true);
    setError(null);
    try {
      for (const key of Array.from(selected)) {
        const slashIdx = key.indexOf("/");
        const folder = key.slice(0, slashIdx) as Folder;
        const fileName = key.slice(slashIdx + 1);
        const path = `${orderId}/${folder}/${fileName}`;
        const res = await fetch(`/api/orders/${orderId}/files`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        const result = await res.json();
        if (!result.ok) { setError(result.error ?? "Ошибка удаления"); break; }
      }
      setSelected(new Set());
      await loadFiles();
    } finally {
      setDeletingBulk(false);
    }
  }

  function toggleSelect(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const allFiles: FlatFile[] = [
    ...files.logo.map((f) => ({ ...f, folder: "logo" as Folder })),
    ...files.photos.map((f) => ({ ...f, folder: "photos" as Folder })),
    ...files.documents.map((f) => ({ ...f, folder: "documents" as Folder })),
  ];

  const filteredFiles = category === "all"
    ? allFiles
    : allFiles.filter((f) => categorize(f) === category);

  const isImage = (f: FlatFile) => f.folder !== "documents";

  if (loading) return <p className="py-12 text-center text-sm text-white/30">Загрузка файлов…</p>;

  return (
    <div className="space-y-5">
      {clientAssets.length > 0 && (
        <Card variant="solid" padding="md">
          <h3 className="mb-3 text-sm font-semibold">Материалы от клиента</h3>
          <p className="mb-3 text-xs text-white/35">Изображения, загруженные клиентом в конструкторе</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {clientAssets.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-xl bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="w-full aspect-video object-cover rounded-lg transition group-hover:opacity-80"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute("hidden"); }}
                />
                <div hidden className="flex aspect-video w-full items-center justify-center text-2xl text-white/20">🖼</div>
              </a>
            ))}
          </div>
        </Card>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/8" />
        <p className="text-xs font-semibold uppercase tracking-widest text-white/25">Загруженные файлы</p>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Upload buttons + bulk delete */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(FOLDER_CONFIG) as Folder[]).map((folder) => {
          const cfg = FOLDER_CONFIG[folder];
          const isUploading = uploading === folder;
          return (
            <div key={folder}>
              <input
                ref={(el) => { inputRefs.current[folder] = el; }}
                type="file"
                accept={cfg.accept}
                multiple={folder !== "logo"}
                className="hidden"
                onChange={(e) => handleUpload(folder, e.target.files)}
              />
              <Btn
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => inputRefs.current[folder]?.click()}
                loading={isUploading}
              >
                {isUploading ? `Загрузка…` : `+ ${cfg.label}`}
              </Btn>
            </div>
          );
        })}
        {selected.size > 0 && (
          <div className="ml-auto">
            <Btn
              variant="outline"
              size="sm"
              disabled={deletingBulk}
              loading={deletingBulk}
              onClick={handleBulkDelete}
            >
              Удалить выбранные ({selected.size})
            </Btn>
          </div>
        )}
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "logo", "photos", "documents", "other"] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              category === cat
                ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
                : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Files grid or empty state */}
      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 opacity-30">
            <rect x="4" y="6" width="32" height="40" rx="3" stroke="white" strokeWidth="2" fill="none" />
            <path d="M24 6V18H36" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="42" cy="40" r="10" fill="none" stroke="white" strokeWidth="2" />
            <path d="M42 35V40M42 40V45M42 40H37M42 40H47" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-base font-semibold text-white/40">Нет файлов</p>
          <p className="mt-1 text-sm text-white/25">Загрузите материалы для работы над проектом</p>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            {(Object.keys(FOLDER_CONFIG) as Folder[]).map((folder) => (
              <Btn
                key={folder}
                variant="outline"
                size="sm"
                onClick={() => inputRefs.current[folder]?.click()}
              >
                + {FOLDER_CONFIG[folder].label}
              </Btn>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredFiles.map((f) => {
            const key = `${f.folder}/${f.name}`;
            const path = `${orderId}/${f.folder}/${f.name}`;
            const isDeletingThis = deleting === path;
            const isChecked = selected.has(key);
            return (
              <div
                key={key}
                className={`group relative rounded-xl border transition ${isChecked ? "border-cyan-500/50 bg-cyan-500/8" : "border-white/8 bg-white/4"}`}
              >
                {/* Checkbox */}
                <div
                  className={`absolute left-2 top-2 z-10 transition-opacity ${isChecked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  <button
                    onClick={() => toggleSelect(key)}
                    className={`flex h-5 w-5 items-center justify-center rounded border text-xs font-bold transition ${
                      isChecked
                        ? "border-cyan-400 bg-cyan-500 text-white"
                        : "border-white/30 bg-black/50 text-white/50 hover:border-white/60"
                    }`}
                  >
                    {isChecked ? "✓" : ""}
                  </button>
                </div>

                <a href={f.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-t-xl">
                  {isImage(f) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.url}
                      alt={f.name}
                      className="w-full aspect-video object-cover rounded-t-xl transition group-hover:opacity-85"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='68'%3E%3Crect width='120' height='68' fill='%23ffffff08'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%23ffffff20'%3E🖼%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="flex w-full aspect-video items-center justify-center rounded-t-xl bg-white/6 text-3xl">📄</div>
                  )}
                </a>

                <div className="px-3 py-2">
                  <p className="truncate text-xs font-medium text-white/70">{f.name}</p>
                  {f.size && <p className="text-xs text-white/30">{formatSize(f.size)}</p>}
                  <div className="mt-1.5 flex items-center gap-2">
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400/70 hover:text-cyan-400">
                      Открыть
                    </a>
                    <button
                      disabled={isDeletingThis}
                      onClick={() => handleDelete(f.folder, f.name)}
                      className="text-xs text-red-400/50 hover:text-red-400 disabled:opacity-40"
                    >
                      {isDeletingThis ? "…" : "Удалить"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
