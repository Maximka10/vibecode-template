// ============================================================
// CANONICAL TYPE DEFINITIONS FOR VIBECODE STUDIO
// Single source of truth — import from here, not from sub-files
// ============================================================

// --- Theme ---

/** Token-based theme used by the preview/template renderer (lib/registry) */
export interface ThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  bgBase: string;
  bgSurface: string;
  bgBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  glowPrimary: string;
  glowSecondary: string;
  gradientFrom: string;
  gradientVia?: string;
  gradientTo: string;
  heroStyle?: "orbs" | "lines" | "dots" | "noise" | "geometric";
}

/** Theme colors used by section components (lib/themes) */
export interface TemplateTheme {
  primary: string;
  secondary: string;
  accent: string;
  bgBase: string;
  bgSurface: string;
  bgBorder: string;
  text: string;
  textMuted: string;
  gradient?: string;
  heroStyle?: string;
}

// --- Style ---

/** Full style options used by template renderer */
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
  [key: string]: string | undefined;
}

// --- Sections ---

export type SectionType =
  | "hero"
  | "stats"
  | "about"
  | "gallery"
  | "services"
  | "hosting-service"
  | "templates-gallery"
  | "calculator"
  | "footer"
  | "reviews";

/** Section used by the template renderer (lib/registry) */
export interface Section {
  id: string;
  type: SectionType;
  content: Record<string, unknown>;
}

/** Canonical forward-facing page section (data-driven CMS/AI model) */
export interface PageSection {
  id: string;
  type: string;
  visible: boolean;
  order: number;
  data: Record<string, unknown>;
}

// --- Templates ---

/** Full template used by the renderer and customize flow */
export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  theme: ThemeTokens;
  style: TemplateStyle;
  sections: Section[];
  tags?: string[];
  featured?: boolean;
  priceFrom?: number;
  deliveryDays?: number;
}

/** Canonical forward-facing SiteTemplate contract (for CRM/CMS) */
export interface SiteTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  deliveryDays: number;
  tags: string[];
  theme: TemplateTheme;
  sections: PageSection[];
}

// --- Auth ---

export type Role = "admin" | "client";
