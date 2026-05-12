import { buildSharedSections } from "@/content/sectionPresets";
import { templates } from "@/content/templates";
import type { PageSection } from "@/types/section";

export const homeTemplate: { sections: PageSection[] } = {
  sections: buildSharedSections(templates),
};
