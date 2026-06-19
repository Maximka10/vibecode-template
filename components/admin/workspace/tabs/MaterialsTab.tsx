"use client";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";

type FileEntry = { name: string; url: string; size?: number; created_at?: string };
type FolderFiles = { logo: FileEntry[]; photos: FileEntry[]; documents: FileEntry[] };

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

export default function MaterialsTab({ orderId }: { orderId: string }) {
  const [files, setFiles] = useState<FolderFiles>({ logo: [], photos: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Folder | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  if (loading) return <p className="py-12 text-center text-sm text-white/30">Загрузка файлов…</p>;

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {(Object.keys(FOLDER_CONFIG) as Folder[]).map((folder) => {
        const cfg = FOLDER_CONFIG[folder];
        const folderFiles = files[folder] ?? [];
        const isUploading = uploading === folder;

        return (
          <Card key={folder} variant="solid" padding="md">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">{cfg.label}</h3>
                <p className="text-xs text-white/35">{cfg.hint}</p>
              </div>
              <div>
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
                  {isUploading ? "Загрузка…" : "Загрузить"}
                </Btn>
              </div>
            </div>

            {folderFiles.length === 0 ? (
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 py-8 text-center transition hover:border-white/30"
                onClick={() => inputRefs.current[folder]?.click()}
              >
                <p className="text-sm text-white/30">Нет файлов</p>
                <p className="mt-1 text-xs text-white/20">Нажмите чтобы загрузить</p>
              </div>
            ) : (
              <div className="space-y-2">
                {folderFiles.map((f) => {
                  const path = `${orderId}/${folder}/${f.name}`;
                  const isDeletingThis = deleting === path;
                  return (
                    <div key={f.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-2">
                      <div className="min-w-0 flex items-center gap-3">
                        {folder !== "documents" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.url} alt={f.name} className="h-10 w-10 rounded-lg object-cover bg-white/10 shrink-0" />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/8 text-lg">📄</div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white/80">{f.name}</p>
                          {f.size && <p className="text-xs text-white/30">{formatSize(f.size)}</p>}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">
                          Открыть
                        </a>
                        <button
                          disabled={isDeletingThis}
                          onClick={() => handleDelete(folder, f.name)}
                          className="text-xs text-red-400/60 hover:text-red-400 disabled:opacity-40"
                        >
                          {isDeletingThis ? "…" : "Удалить"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
