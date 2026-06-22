"use client";
import Link from "next/link";
import { type ButtonHTMLAttributes } from "react";

const VARIANTS = {
  primary: "bg-white text-black hover:bg-white/90",
  secondary: "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20",
  ghost: "text-white/55 hover:text-white hover:bg-white/6",
  outline: "border border-white/20 bg-white/5 text-white/65 hover:border-white/40 hover:text-white",
};

const SIZES = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-sm",
};

type BtnProps = {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
  href?: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Btn({
  variant = "primary",
  size = "md",
  loading,
  href,
  external,
  className = "",
  children,
  disabled,
  ...props
}: BtnProps) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = loading ? (
    <>
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      {children}
    </>
  ) : (
    children
  );

  if (href) {
    if (external || href.startsWith("http") || href.startsWith("//")) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }
    return <Link href={href} className={cls}>{content}</Link>;
  }

  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
