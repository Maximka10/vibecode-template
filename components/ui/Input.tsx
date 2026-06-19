import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

const BASE =
  "w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-500/60 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20";

type InputProps = {
  label?: string;
  error?: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-white/55">{label}</label>
      )}
      <input className={`${BASE} ${className}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

type TextareaProps = {
  label?: string;
  error?: string;
  className?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-white/55">{label}</label>
      )}
      <textarea className={`${BASE} resize-none ${className}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
