import type { JSX } from "react";
import { sectionRegistry } from "@/lib/rendering/sectionRegistry";
import type { PageSection } from "@/types/section";

/**
 * Renders one section from data.
 * Unknown/disabled/malformed sections are ignored so bad CMS/AI payloads don't crash UI.
 */
export function renderSection(section: PageSection): JSX.Element | null {
  if (!section.enabled || !section.type || !section.id) {
    return null;
  }

  const SectionComponent = sectionRegistry[section.type];
  if (!SectionComponent) {
    return null;
  }

  return <SectionComponent section={section as never} />;
}
