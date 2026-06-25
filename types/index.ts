export interface ThemeTokens {
  primary: string; secondary: string; accent: string;
  bgBase: string; bgSurface: string; bgBorder: string;
  textPrimary: string; textSecondary: string; textMuted: string;
  glowPrimary: string; glowSecondary: string;
  gradientFrom: string; gradientVia?: string; gradientTo: string;
  heroStyle?: "orbs" | "lines" | "dots" | "noise" | "geometric";
}

export interface TemplateStyle {
  radius: "sharp" | "soft" | "round" | "pill";
  cardElevation: "flat" | "raised" | "floating";
  sectionSpacing: "tight" | "normal" | "airy";
  contentDensity: "dense" | "balanced" | "spacious";
  headingWeight: "bold" | "black" | "ultrablack";
  headingStyle: "normal" | "italic" | "uppercase";
  motionIntensity: "subtle" | "moderate" | "expressive";
  heroDecor: "orbs" | "lines" | "geometric" | "dots" | "scanlines";
  heroTextAlign: "left" | "center";
  sectionDivider: "none" | "line" | "gradient" | "glow";
  ctaStyle: "solid" | "glow" | "outline" | "pill";
  statsLayout: "cards" | "inline" | "large";
  galleryStyle: "masonry" | "grid" | "film";
}

export type SectionType = "hero"|"stats"|"about"|"gallery"|"services"|"pricing"|"faq"|"contacts"|"hosting-service"|"templates-gallery"|"calculator"|"footer"|"reviews";
export interface Section { id: string; type: SectionType; content: Record<string, unknown>; enabled?: boolean }
export interface Template { id: string; name: string; category: string; description: string; thumbnail: string; theme: ThemeTokens; style: TemplateStyle; sections: Section[]; tags?: string[]; featured?: boolean; priceFrom?: number; deliveryDays?: number; }
export type Role = "admin" | "client";
