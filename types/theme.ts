export type ThemeColors = {
  background: string;
  surface: string;
  surfaceStrong: string;
  textPrimary: string;
  textMuted: string;
  borderSubtle: string;
  primary: string;
  accent: string;
};

export type ThemeGradients = {
  divider: string;
  heroGlowCenter: string;
  heroGlowLeft: string;
  heroGlowRight: string;
};

export type ThemeGlow = {
  centerSize: string;
  sideSize: string;
  blur: string;
};

export type ThemeRadius = {
  button: string;
  card: string;
  panel: string;
};

export type ThemeTypography = {
  brandTracking: string;
  sectionLabelTracking: string;
};

export type ThemeSpacing = {
  sectionX: string;
  sectionY: string;
};

export type ThemeShadows = {
  card: string;
};

export type Theme = {
  id: string;
  colors: ThemeColors;
  gradients: ThemeGradients;
  glow: ThemeGlow;
  radius: ThemeRadius;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
};
