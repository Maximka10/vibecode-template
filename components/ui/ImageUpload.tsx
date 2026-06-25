"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { uploadImage, deleteImage, pathFromUrl, isImageUrl } from "@/lib/supabase/storage";

interface CropState {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Adjust {
  brightness: number; // %
  contrast: number;   // %
  saturate: number;   // %
  sepia: number;      // %
  grayscale: number;  // %
  hueRotate: number;  // deg
  glow: number;       // 0..0.6 bloom intensity
}

const NEUTRAL: Adjust = { brightness: 100, contrast: 100, saturate: 100, sepia: 0, grayscale: 0, hueRotate: 0, glow: 0 };

const FILTER_PRESETS: { label: string; adj: Adjust }[] = [
  { label: "Оригинал", adj: { ...NEUTRAL } },
  { label: "Яркий",    adj: { ...NEUTRAL, brightness: 106, contrast: 114, saturate: 135 } },
  { label: "Свечение", adj: { ...NEUTRAL, brightness: 104, saturate: 116, glow: 0.38 } },
  { label: "Тёплый",   adj: { ...NEUTRAL, brightness: 104, saturate: 118, sepia: 28 } },
  { label: "Холодный", adj: { ...NEUTRAL, brightness: 101, contrast: 108, saturate: 92, hueRotate: 330 } },
  { label: "Винтаж",   adj: { ...NEUTRAL, brightness: 102, contrast: 95, saturate: 108, sepia: 45 } },
  { label: "Ч/Б",      adj: { ...NEUTRAL, grayscale: 100, contrast: 112 } },
];

function filterString(a: Adjust): string {
  return `brightness(${a.brightness}%) contrast(${a.contrast}%) saturate(${a.saturate}%) sepia(${a.sepia}%) grayscale(${a.grayscale}%) hue-rotate(${a.hueRotate}deg)`;
}

const ASPECT_PRESETS = [
  { label: "Свободно", value: 0 },
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:5", value: 16 / 5 },
  { label: "3:4", value: 3 / 4 },
];

export function CropEditor({
  src,
  aspectRatio: initialAspect,
  onConfirm,
  onCancel,
  onChangeFile,
}: {
  src: string;
  aspectRatio?: number;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
  onChangeFile?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<CropState>({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
  const [lockedAspect, setLockedAspect] = useState<number>(initialAspect ?? 0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  // The canvas is sized to the image's aspect ratio (contain-fit into a fixed
  // box) so the picture is never stretched and always fits the editor window.
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({ w: 600, h: 400 });
  const [adjust, setAdjust] = useState<Adjust>({ ...NEUTRAL });
  const [activePreset, setActivePreset] = useState("Оригинал");
  const dragging = useRef<null | { type: "move" | "tl" | "tr" | "bl" | "br"; startX: number; startY: number; startCrop: CropState }>(null);

  // Paint `img` (source rect → dest rect) with the current adjustments + glow.
  const paint = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement,
    sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) => {
    ctx.save();
    ctx.filter = filterString(adjust);
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    if (adjust.glow > 0) {
      // Bloom: a blurred, brighter copy added on top.
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = adjust.glow;
      ctx.filter = `${filterString(adjust)} blur(6px) brightness(150%)`;
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    ctx.restore();
  }, [adjust]);

  function setPreset(p: { label: string; adj: Adjust }) {
    setActivePreset(p.label);
    setAdjust({ ...p.adj });
  }
  function patchAdjust(patch: Partial<Adjust>) {
    setActivePreset("Свой");
    setAdjust((a) => ({ ...a, ...patch }));
  }

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      // Fit the image into a fixed 600×400 box, preserving aspect ratio.
      const BOX_W = 600, BOX_H = 400;
      const a = img.naturalWidth / img.naturalHeight || 1;
      let w = BOX_W, h = w / a;
      if (h > BOX_H) { h = BOX_H; w = h * a; }
      setCanvasSize({ w: Math.round(w), h: Math.round(h) });
      setImgLoaded(true);
    };
    img.src = src;
  }, [src]);

  // Set initial crop to match locked aspect
  useEffect(() => {
    if (!imgLoaded || !imgRef.current) return;
    if (lockedAspect > 0) {
      const img = imgRef.current;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      if (lockedAspect > imgAspect) {
        const h = imgAspect / lockedAspect * 0.9;
        setCrop({ x: 0.05, y: (1 - h) / 2, w: 0.9, h });
      } else {
        const w = lockedAspect / imgAspect * 0.9;
        setCrop({ x: (1 - w) / 2, y: 0.05, w, h: 0.9 });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedAspect, imgLoaded]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paint(ctx, img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height);
    const { x, y, w, h } = crop;
    const cx = x * canvas.width, cy = y * canvas.height;
    const cw = w * canvas.width, ch = h * canvas.height;
    // Dim outside
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, cy);
    ctx.fillRect(0, cy, cx, ch);
    ctx.fillRect(cx + cw, cy, canvas.width - cx - cw, ch);
    ctx.fillRect(0, cy + ch, canvas.width, canvas.height - cy - ch);
    // Crop border
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw, ch);
    // Corner handles (larger, easier to grab)
    const hs = 10;
    ctx.fillStyle = "#22d3ee";
    for (const [hx, hy] of [[cx, cy], [cx + cw, cy], [cx, cy + ch], [cx + cw, cy + ch]] as [number,number][]) {
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
    }
    // Rule of thirds
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(cx + cw * i / 3, cy); ctx.lineTo(cx + cw * i / 3, cy + ch); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + ch * i / 3); ctx.lineTo(cx + cw, cy + ch * i / 3); ctx.stroke();
    }
    // Update preview
    drawPreview();
  }, [crop, paint]); // eslint-disable-line react-hooks/exhaustive-deps

  const drawPreview = useCallback(() => {
    const pc = previewCanvasRef.current;
    const img = imgRef.current;
    if (!pc || !img) return;
    const ctx = pc.getContext("2d")!;
    const { x, y, w, h } = crop;
    ctx.clearRect(0, 0, pc.width, pc.height);
    paint(ctx, img, img.naturalWidth * x, img.naturalHeight * y, img.naturalWidth * w, img.naturalHeight * h, 0, 0, pc.width, pc.height);
  }, [crop, paint]);

  useEffect(() => { if (imgLoaded) draw(); }, [draw, imgLoaded]);

  function getRelPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  }

  function hitHandle(px: number, py: number, hx: number, hy: number) {
    return Math.abs(px - hx) < 0.04 && Math.abs(py - hy) < 0.04;
  }

  function applyAspect(nx: number, ny: number, nw: number, nh: number): { x: number; y: number; w: number; h: number } {
    if (!lockedAspect) return { x: nx, y: ny, w: nw, h: nh };
    const canvas = canvasRef.current!;
    const cAspect = canvas.width / canvas.height;
    const pixW = nw * canvas.width;
    const pixH = nh * canvas.height;
    const targetAspect = lockedAspect / cAspect;
    if (pixW / pixH > targetAspect) {
      const newH = nw / targetAspect;
      return { x: nx, y: ny, w: nw, h: Math.min(newH, 1 - ny) };
    } else {
      const newW = nh * targetAspect;
      return { x: nx, y: ny, w: Math.min(newW, 1 - nx), h: nh };
    }
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
    const dx = px - startX, dy = py - startY;
    const MIN = 0.05;
    let x = sc.x, y = sc.y, w = sc.w, h = sc.h;
    if (type === "move") {
      x = Math.max(0, Math.min(1 - w, sc.x + dx));
      y = Math.max(0, Math.min(1 - h, sc.y + dy));
    } else if (type === "tl") {
      x = Math.max(0, Math.min(sc.x + sc.w - MIN, sc.x + dx));
      y = Math.max(0, Math.min(sc.y + sc.h - MIN, sc.y + dy));
      w = sc.x + sc.w - x; h = sc.y + sc.h - y;
    } else if (type === "tr") {
      y = Math.max(0, Math.min(sc.y + sc.h - MIN, sc.y + dy));
      w = Math.max(MIN, Math.min(1 - sc.x, sc.w + dx));
      h = sc.y + sc.h - y;
    } else if (type === "bl") {
      x = Math.max(0, Math.min(sc.x + sc.w - MIN, sc.x + dx));
      w = sc.x + sc.w - x;
      h = Math.max(MIN, Math.min(1 - sc.y, sc.h + dy));
    } else if (type === "br") {
      w = Math.max(MIN, Math.min(1 - sc.x, sc.w + dx));
      h = Math.max(MIN, Math.min(1 - sc.y, sc.h + dy));
    }
    const applied = type !== "move" ? applyAspect(x, y, w, h) : { x, y, w, h };
    setCrop(applied);
  }

  function onMouseUp() { dragging.current = null; }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img) return;
    const out = document.createElement("canvas");
    const { x, y, w, h } = crop;
    out.width = Math.max(1, Math.round(img.naturalWidth * w));
    out.height = Math.max(1, Math.round(img.naturalHeight * h));
    // Bake the crop AND the effects into the exported image.
    paint(out.getContext("2d")!, img, img.naturalWidth * x, img.naturalHeight * y, img.naturalWidth * w, img.naturalHeight * h, 0, 0, out.width, out.height);
    out.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/jpeg", 0.92);
  }

  const cropPx = naturalSize ? {
    w: Math.round(naturalSize.w * crop.w),
    h: Math.round(naturalSize.h * crop.h),
  } : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3">
      <div className="flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <p className="text-sm font-bold text-white">✂ Редактор изображения</p>
          <div className="flex items-center gap-2">
            {onChangeFile && (
              <button onClick={onChangeFile} className="rounded-lg border border-white/15 px-3 py-1 text-xs text-white/50 hover:text-white/80 transition">
                Выбрать другой файл
              </button>
            )}
            <button onClick={onCancel} className="rounded-full p-1 text-white/40 hover:text-white/70">✕</button>
          </div>
        </div>

        {/* Aspect presets */}
        <div className="flex flex-wrap gap-1.5 px-4">
          <span className="text-xs text-white/30 self-center mr-1">Пропорции:</span>
          {ASPECT_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setLockedAspect(p.value)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${lockedAspect === p.value ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300" : "border-white/10 text-white/40 hover:text-white/70"}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Filter presets */}
        <div className="flex flex-wrap gap-1.5 px-4">
          <span className="text-xs text-white/30 self-center mr-1">Эффекты:</span>
          {FILTER_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPreset(p)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${activePreset === p.label ? "border-fuchsia-500/50 bg-fuchsia-500/15 text-fuchsia-300" : "border-white/10 text-white/40 hover:text-white/70"}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Adjustment sliders */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-4 sm:grid-cols-4">
          {([
            ["Яркость", "brightness", 50, 150],
            ["Контраст", "contrast", 50, 150],
            ["Насыщенность", "saturate", 0, 200],
            ["Свечение", "glow", 0, 60],
          ] as [string, keyof Adjust, number, number][]).map(([label, key, min, max]) => {
            const isGlow = key === "glow";
            const val = isGlow ? Math.round(adjust.glow * 100) : adjust[key];
            return (
              <label key={key} className="flex flex-col gap-0.5">
                <span className="flex justify-between text-[10px] text-white/40">
                  <span>{label}</span><span className="font-mono">{val}{isGlow ? "" : "%"}</span>
                </span>
                <input
                  type="range" min={min} max={max} value={val}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    patchAdjust(isGlow ? { glow: n / 100 } : ({ [key]: n } as Partial<Adjust>));
                  }}
                  className="h-1 w-full cursor-pointer accent-fuchsia-500"
                />
              </label>
            );
          })}
        </div>

        {/* Main area: canvas + preview */}
        <div className="flex gap-3 px-4 overflow-y-auto" style={{ maxHeight: "calc(95vh - 220px)" }}>
          {/* Main canvas — fixed box, image centred and never stretched */}
          <div className="flex flex-1 items-center justify-center rounded-xl bg-black/60 min-h-0" style={{ height: 400 }}>
            {!imgLoaded && <div className="flex items-center justify-center text-white/30 text-sm">Загрузка…</div>}
            <canvas
              ref={canvasRef}
              width={canvasSize.w}
              height={canvasSize.h}
              style={{ width: canvasSize.w, height: canvasSize.h, maxWidth: "100%", maxHeight: "100%" }}
              className={`cursor-crosshair ${imgLoaded ? "" : "hidden"}`}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
          </div>
          {/* Preview panel */}
          <div className="w-32 shrink-0 flex flex-col gap-2">
            <p className="text-xs text-white/40">Результат</p>
            <div className="rounded-lg overflow-hidden bg-black border border-white/10">
              <canvas ref={previewCanvasRef} width={128} height={96} className="w-full" />
            </div>
            {cropPx && (
              <p className="text-[10px] text-white/30 font-mono">{cropPx.w}×{cropPx.h}px</p>
            )}
            <button
              onClick={() => { setCrop({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 }); setPreset(FILTER_PRESETS[0]); }}
              className="text-xs text-white/30 hover:text-white/60 text-left mt-1"
            >
              ↺ Сбросить
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-4 pb-4">
          <p className="text-xs text-white/30">Перетащите рамку или потяните за углы</p>
          <div className="flex gap-2">
            <button onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 hover:bg-white/5 transition">
              Отмена
            </button>
            <button onClick={handleConfirm} className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-bold text-white hover:bg-cyan-400 transition">
              Применить кадрирование
            </button>
          </div>
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
            onChangeFile={() => { setCropSrc(null); setPendingFile(null); inputRef.current?.click(); }}
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
          onChangeFile={() => { setCropSrc(null); setPendingFile(null); inputRef.current?.click(); }}
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
