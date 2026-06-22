type PageSectionProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "4xl" | "5xl" | "6xl" | "7xl";
  py?: "sm" | "md" | "lg";
  border?: boolean;
  dimmed?: boolean;
};

const PY = { sm: "py-12", md: "py-16", lg: "py-20 sm:py-24" };
const MAX = {
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

export function PageSection({
  children,
  className = "",
  maxWidth = "5xl",
  py = "lg",
  border,
  dimmed,
}: PageSectionProps) {
  return (
    <section
      className={`${border ? "border-t border-white/5" : ""} ${dimmed ? "bg-slate-900/25" : ""} ${className}`}
    >
      <div className={`mx-auto ${MAX[maxWidth]} px-4 sm:px-6 ${PY[py]}`}>
        {children}
      </div>
    </section>
  );
}
