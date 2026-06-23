// Design themes — the "skin/layout" of a generated site. Colors always come
// from the client's brand (primary/secondary); a theme controls fonts, hero
// layout, background treatment, corner radius and glow strength so every
// template feels visually distinct while staying on-brand.

export type HeroVariant = "spotlight" | "split" | "aurora" | "editorial";
export type BgStyle = "aurora" | "grid" | "mesh" | "soft";

export type DesignTheme = {
  id: string;
  name: string;
  headingFont: string; // Google font family
  bodyFont: string;
  heroVariant: HeroVariant;
  bg: BgStyle;
  radius: number; // px
  glow: number; // 0..1 glow strength
  uppercaseHeads: boolean;
};

export const DESIGN_THEMES: DesignTheme[] = [
  { id: "aurora",    name: "Aurora",    headingFont: "Manrope",          bodyFont: "Inter",     heroVariant: "aurora",    bg: "aurora", radius: 24, glow: 0.95, uppercaseHeads: false },
  { id: "editorial", name: "Editorial", headingFont: "Playfair Display", bodyFont: "Inter",     heroVariant: "editorial", bg: "soft",   radius: 12, glow: 0.30, uppercaseHeads: false },
  { id: "neon",      name: "Neon",      headingFont: "Space Grotesk",    bodyFont: "Inter",     heroVariant: "spotlight", bg: "grid",   radius: 20, glow: 1.00, uppercaseHeads: true  },
  { id: "soft",      name: "Soft",      headingFont: "Nunito",           bodyFont: "Open Sans", heroVariant: "split",     bg: "mesh",   radius: 28, glow: 0.55, uppercaseHeads: false },
  { id: "bold",      name: "Bold",      headingFont: "Montserrat",       bodyFont: "Inter",     heroVariant: "spotlight", bg: "mesh",   radius: 16, glow: 0.75, uppercaseHeads: true  },
];

// css2 family specs (weights tuned per face)
const FONT_SPECS: Record<string, string> = {
  "Inter": "Inter:wght@400;500;600;700;800",
  "Manrope": "Manrope:wght@400;600;700;800",
  "Montserrat": "Montserrat:wght@400;600;700;900",
  "Open Sans": "Open+Sans:wght@400;600;700",
  "Playfair Display": "Playfair+Display:wght@500;600;700;800",
  "Space Grotesk": "Space+Grotesk:wght@400;500;600;700",
  "Nunito": "Nunito:wght@400;600;700;800",
  "Roboto": "Roboto:wght@400;500;700",
  "PT Sans": "PT+Sans:wght@400;700",
};

export function fontStack(family: string): string {
  return `"${family}", system-ui, -apple-system, sans-serif`;
}

export function googleFontsHref(families: string[]): string {
  const uniq = [...new Set(families.filter(Boolean))];
  const specs = uniq.map((f) => FONT_SPECS[f] ?? `${f.replace(/ /g, "+")}:wght@400;700`);
  return `https://fonts.googleapis.com/css2?${specs.map((s) => `family=${s}`).join("&")}&display=swap`;
}

export function resolveDesignTheme(override?: string | null, templateId?: string | null): DesignTheme {
  if (override) {
    const t = DESIGN_THEMES.find((d) => d.id === override);
    if (t) return t;
  }
  const key = templateId ?? "";
  if (!key) return DESIGN_THEMES[0];
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return DESIGN_THEMES[h % DESIGN_THEMES.length];
}
