import type { ComponentType } from "react";
import { About } from "@/sections/about/About";
import { Hero } from "@/sections/hero/Hero";
import { Stats } from "@/sections/stats/Stats";
import { TemplatesGallery } from "@/sections/templates/TemplatesGallery";
import type { PageSection, SectionType } from "@/types/section";

type SectionComponentMap = {
  [K in SectionType]: ComponentType<{ section: Extract<PageSection, { type: K }> }>;
};

/**
 * Registry keeps section contracts centralized and scalable.
 * Adding a new section means: define type + component + registry entry.
 * No growing switch/case chains in page files.
 */
export const sectionRegistry: SectionComponentMap = {
  hero: Hero,
  about: About,
  stats: Stats,
  "templates-gallery": TemplatesGallery,
};
