import type { Theme } from "@/types/theme";

export const defaultTheme: Theme = {
  id: "vibecode-default",
  colors: {
    background: "#000000",
    surface: "rgba(255,255,255,0.05)",
    surfaceStrong: "rgba(255,255,255,0.10)",
    textPrimary: "#ffffff",
    textMuted: "#a1a1aa",
    borderSubtle: "rgba(255,255,255,0.10)",
    primary: "#8b5cf6",
    accent: "#3b82f6",
  },
  gradients: {
    divider: "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
    heroGlowCenter: "rgba(255,255,255,0.10)",
    heroGlowLeft: "rgba(139,92,246,0.20)",
    heroGlowRight: "rgba(59,130,246,0.20)",
  },
  glow: {
    centerSize: "500px",
    sideSize: "18rem",
    blur: "64px",
  },
  radius: {
    button: "1rem",
    card: "1.5rem",
    panel: "1rem",
  },
  typography: {
    brandTracking: "0.3em",
    sectionLabelTracking: "0.3em",
  },
  spacing: {
    sectionX: "1.5rem",
    sectionY: "8rem",
  },
  shadows: {
    card: "0 10px 30px rgba(0,0,0,0.35)",
  },
};
