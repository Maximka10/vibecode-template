import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

const VARIANTS = {
  default:
    "border border-white/12 bg-white/8 px-4 py-3 focus:border-cyan-500/60 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20",
  inline:
    "border border-white/10 bg-white/6 px-3 py-1.5 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/15",
};

const BASE = "w-full rounded-xl text-sm text-white placeholder-white/30 outline-none transition";

type InputProps = {
  label?: string;
  error?: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function Input({
  label,
  error,
  variant = "default",
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-white/55">{label}</label>
      )}
      <input className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

type TextareaProps = {
  label?: string;
  error?: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

export function Textarea({
  label,
  error,
  variant = "default",
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-white/55">{label}</label>
      )}
      <textarea
        className={`${BASE} ${VARIANTS[variant]} resize-none ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
