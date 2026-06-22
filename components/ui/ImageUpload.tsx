"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { uploadImage, deleteImage, pathFromUrl, isImageUrl } from "@/lib/supabase/storage";

interface CropState {
  x: number;
  y: number;
  w: number;
  h: number;
}

function CropEditor({
  src,
  aspectRatio,
  onConfirm,
  onCancel,
}: {
  src: string;
  aspectRatio?: number;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState<CropState>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const dragging = useRef<null | { type: "move" | "tl" | "tr" | "bl" | "br"; startX: number; startY: number; startCrop: CropState }>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      draw();
    };
    img.src = src;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Overlay
    const { x, y, w, h } = crop;
    const cx = x * canvas.width;
    const cy = y * canvas.height;
    const cw = w * canvas.width;
    const ch = h * canvas.height;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, cy);
    ctx.fillRect(0, cy, cx, ch);
    ctx.fillRect(cx + cw, cy, canvas.width - cx - cw, ch);
    ctx.fillRect(0, cy + ch, canvas.width, canvas.height - cy - ch);
    // Border
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw, ch);
    // Handles
    const hs = 8;
    ctx.fillStyle = "#22d3ee";
    for (const [hx, hy] of [[cx, cy], [cx + cw, cy], [cx, cy + ch], [cx + cw, cy + ch]]) {
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
    }
    // Rule of thirds
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(cx + cw * i / 3, cy); ctx.lineTo(cx + cw * i / 3, cy + ch); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + ch * i / 3); ctx.lineTo(cx + cw, cy + ch * i / 3); ctx.stroke();
    }
  }, [crop]);

  useEffect(() => { draw(); }, [draw]);

  function getRelPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function hitHandle(px: number, py: number, hx: number, hy: number) {
    return Math.abs(px - hx) < 0.03 && Math.abs(py - hy) < 0.03;
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const { x: px, y: py } = getRelPos(e);
    const { x, y, w, h } = crop;
    let type: "move" | "tl" | "tr" | "bl" | "br" = "move";
    if (hitHandle(px, py, x, y)) type = "tl";
    else if (hitHandle(px, py, x + w, y)) type = "tr";
    else if (hitHandle(px, py, x, y + h)) type = "bl";
    else if (hitHandle(px, py, x + w, y + h)) type = "br";
    else if (px < x || px > x + w || py < y || py > y + h) return;
    dragging.current = { type, startX: px, startY: py, startCrop: { ...crop } };
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!dragging.current) return;
    const { x: px, y: py } = getRelPos(e);
    const { type, startX, startY, startCrop: sc } = dragging.current;
    const dx = px - startX;
    const dy = py - startY;
    const MIN = 0.05;
    let { x, y, w, h } = sc;
    if (type === "move") {
      x = Math.max(0, Math.min(1 - w, sc.x + dx));
      y = Math.max(0, Math.min(1 - h, sc.y + dy));
    } else if (type === "tl") {
      x = Math.min(sc.x + sc.w - MIN, sc.x + dx);
      y = Math.min(sc.y + sc.h - MIN, sc.y + dy);
      w = sc.x + sc.w - x;
      h = sc.y + sc.h - y;
      x = Math.max(0, x); y = Math.max(0, y);
    } else if (type === "tr") {
      y = Math.min(sc.y + sc.h - MIN, sc.y + dy);
      w = Math.max(MIN, Math.min(1 - sc.x, sc.w + dx));
      h = sc.y + sc.h - y;
      y = Math.max(0, y);
    } else if (type === "bl") {
      x = Math.min(sc.x + sc.w - MIN, sc.x + dx);
      w = sc.x + sc.w - x;
      h = Math.max(MIN, Math.min(1 - sc.y, sc.h + dy));
      x = Math.max(0, x);
    } else if (type === "br") {
      w = Math.max(MIN, Math.min(1 - sc.x, sc.w + dx));
      h = Math.max(MIN, Math.min(1 - sc.y, sc.h + dy));
    }
    if (aspectRatio) {
      // Lock aspect on corner drags
      if (type !== "move") {
        const imgEl = imgRef.current;
        if (imgEl) {
          const imgAspect = imgEl.naturalWidth / imgEl.naturalHeight;
          const canvasEl = canvasRef.current!;
          const canvasAspect = canvasEl.width / canvasEl.height;
          const pixW = w * canvasEl.width;
          const pixH = h * canvasEl.height;
          const targetAspect = aspectRatio;
          if (pixW / pixH > targetAspect * canvasAspect / imgAspect) {
            h = w * canvasEl.width / (targetAspect * canvasEl.height);
          } else {
            w = h * targetAspect * canvasEl.height / canvasEl.width;
          }
        }
      }
    }
    setCrop({ x, y, w, h });
  }

  function onMouseUp() { dragging.current = null; }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img) return;
    const out = document.createElement("canvas");
    const { x, y, w, h } = crop;
    out.width = Math.round(img.naturalWidth * w);
    out.height = Math.round(img.naturalHeight * h);
    const ctx = out.getContext("2d")!;
    ctx.drawImage(img, img.naturalWidth * x, img.naturalHeight * y, out.width, out.height, 0, 0, out.width, out.height);
    out.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/jpeg", 0.92);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Кадрирование изображения</p>
          <button onClick={onCancel} className="rounded-full p-1 text-white/40 hover:text-white/70">✕</button>
        </div>
        <p className="text-xs text-white/40">Перетащите рамку или углы для выбора области</p>
        <div ref={containerRef} className="relative rounded-xl overflow-hidden bg-black">
          <canvas
            ref={canvasRef}
            width={640}
            height={400}
            className="w-full cursor-crosshair"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-white/60 hover:bg-white/5">
            Отмена
          </button>
          <button onClick={handleConfirm} className="rounded-lg bg-cyan-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-cyan-400">
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
  storagePath: string;
  label?: string;
  aspectClass?: string;
  compact?: boolean;
  enableCrop?: boolean;
  cropAspect?: number;
}

export default function ImageUpload({
  value,
  onChange,
  storagePath,
  label = "Изображение",
  aspectClass = "aspect-video",
  compact = false,
  enableCrop = false,
  cropAspect,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ name: string; type: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadBlob(blob: Blob, filename: string) {
    setUploading(true);
    setError(null);
    const file = new File([blob], filename, { type: blob.type });
    const { url, error: uploadError } = await uploadImage(file, filename);
    setUploading(false);
    if (uploadError) setError(uploadError);
    else onChange(url);
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Только изображения (JPG, PNG, WebP, GIF)");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("Максимальный размер: 25 МБ");
      return;
    }
    setError(null);

    if (enableCrop) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropSrc(e.target?.result as string);
        setPendingFile({ name: file.name, type: file.type });
      };
      reader.readAsDataURL(file);
      return;
    }

    await doUpload(file);
  }

  async function doUpload(file: File) {
    setUploading(true);
    setError(null);
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${storagePath}/${Date.now()}.${ext}`;
    const { url, error: uploadError } = await uploadImage(file, filename);
    setUploading(false);
    if (uploadError) setError(uploadError);
    else onChange(url);
  }

  async function handleCropConfirm(blob: Blob) {
    const ext = pendingFile?.name.split(".").pop() ?? "jpg";
    const filename = `${storagePath}/${Date.now()}.${ext}`;
    setCropSrc(null);
    setPendingFile(null);
    await uploadBlob(blob, filename);
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
        {cropSrc && (
          <CropEditor
            src={cropSrc}
            aspectRatio={cropAspect}
            onConfirm={handleCropConfirm}
            onCancel={() => { setCropSrc(null); setPendingFile(null); }}
          />
        )}
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
      {cropSrc && (
        <CropEditor
          src={cropSrc}
          aspectRatio={cropAspect}
          onConfirm={handleCropConfirm}
          onCancel={() => { setCropSrc(null); setPendingFile(null); }}
        />
      )}
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
            {uploading ? "Загружаю..." : enableCrop ? "Заменить / Кадрировать" : "Заменить"}
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
              {enableCrop && <p className="mt-0.5 text-[10px] text-cyan-400/60">✂ Кадрирование после загрузки</p>}
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
