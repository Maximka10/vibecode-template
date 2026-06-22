const VARIANTS = {
  glass: "border border-white/10 bg-white/5 backdrop-blur-xl",
  solid: "border border-white/8 bg-white/4",
  subtle: "border border-white/6 bg-white/3",
};

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-8",
};

type CardProps = {
  variant?: keyof typeof VARIANTS;
  padding?: keyof typeof PADDING;
  hover?: boolean;
  radius?: "xl" | "2xl" | "3xl";
  className?: string;
  children: React.ReactNode;
};

export function Card({
  variant = "solid",
  padding = "md",
  hover,
  radius = "2xl",
  className = "",
  children,
}: CardProps) {
  return (
    <div
      className={`rounded-${radius} ${VARIANTS[variant]} ${PADDING[padding]} ${
        hover ? "transition hover:border-white/20 hover:bg-white/8" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
