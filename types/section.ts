export type SectionType = "hero" | "about" | "stats" | "templates-gallery";

export type HeroSectionContent = {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  meta: string[];
};

export type AboutServiceContent = {
  title: string;
  description: string;
};

export type AboutSectionContent = {
  badge: string;
  title: string;
  description: string;
  services: AboutServiceContent[];
};

export type StatItemContent = {
  value: string;
  label: string;
};

export type StatsSectionContent = {
  items: StatItemContent[];
};

export type TemplatesGalleryContent = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  templates: Array<{ id: string; name: string; description: string; previewImage: string }>;
};

export type SectionContentMap = {
  hero: HeroSectionContent;
  about: AboutSectionContent;
  stats: StatsSectionContent;
  "templates-gallery": TemplatesGalleryContent;
};

export type BaseSection<TType extends SectionType> = {
  id: string;
  type: TType;
  enabled: boolean;
  /**
   * Templates are now true data models: each section carries content payload.
   * This is what future CMS + AI flows can generate/edit safely.
   */
  content?: SectionContentMap[TType];
};

export type HeroSection = BaseSection<"hero">;
export type AboutSection = BaseSection<"about">;
export type StatsSection = BaseSection<"stats">;
export type TemplatesGallerySection = BaseSection<"templates-gallery">;

export type PageSection = HeroSection | AboutSection | StatsSection | TemplatesGallerySection;
