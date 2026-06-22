"use client";
import { useRef, useState } from "react";
import { uploadImage, deleteImage, pathFromUrl, isImageUrl } from "@/lib/supabase/storage";

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
  storagePath: string;
  label?: string;
  aspectClass?: string;
  compact?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  storagePath,
  label = "Изображение",
  aspectClass = "aspect-video",
  compact = false,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Только изображения (JPG, PNG, WebP, GIF)");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("Максимальный размер: 25 МБ");
      return;
    }
    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${storagePath}/${Date.now()}.${ext}`;
    const { url, error: uploadError } = await uploadImage(file, filename);

    setUploading(false);
    if (uploadError) {
      setError(uploadError);
    } else {
      onChange(url);
    }
  }

  async function handleDelete() {
    if (!value) return;
    if (isImageUrl(value) && value.includes("supabase")) {
      const path = pathFromUrl(value);
      if (path) await deleteImage(path);
    }
    onChange(null);
  }

  const hasImage = value && isImageUrl(value);

  if (compact) {
    return (
      <div className="space-y-1.5">
        {label && <p className="text-xs text-white/50">{label}</p>}
        {hasImage ? (
          <div className="flex items-center gap-2">
            <img src={value!} alt="" className="h-10 w-16 rounded-lg object-cover" />
            <button
              onClick={handleDelete}
              className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20"
            >
              Удалить
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-dashed border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:border-white/40 disabled:opacity-50"
          >
            {uploading ? "Загружаю..." : "+ Загрузить"}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-white/50">{label}</p>}

      {hasImage ? (
        <div className={`relative ${aspectClass} rounded-xl overflow-hidden bg-black/20 group`}>
          <img src={value!} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition rounded-full bg-black/80 px-2.5 py-1 text-xs text-white hover:bg-red-600"
          >
            ✕ Удалить
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition rounded-full bg-black/80 px-2.5 py-1 text-xs text-white/80 hover:bg-white/20 disabled:opacity-50"
          >
            {uploading ? "Загружаю..." : "Заменить"}
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={`${aspectClass} rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition select-none ${
            dragging
              ? "border-white/60 bg-white/10"
              : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/8"
          }`}
        >
          {uploading ? (
            <>
              <div className="h-6 w-6 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
              <p className="mt-2 text-xs text-white/40">Загружаю...</p>
            </>
          ) : (
            <>
              <svg className="h-8 w-8 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-xs font-medium text-white/50">
                {dragging ? "Отпустите файл" : "Нажмите или перетащите"}
              </p>
              <p className="mt-0.5 text-xs text-white/25">JPG, PNG, WebP · до 25 МБ</p>
              <p className="mt-1 text-[10px] text-amber-400/60">* Добавление изображений оплачивается отдельно</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
