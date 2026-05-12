import { Fragment } from "react";
import { renderSection } from "@/lib/rendering/renderSection";
import type { PageSection } from "@/types/section";

type SectionRendererProps = {
  sections: Array<PageSection | null | undefined>;
};

function isRenderableSection(section: PageSection | null | undefined): section is PageSection {
  return Boolean(section?.id && section?.type && typeof section.enabled === "boolean");
}

/**
 * Data-driven rendering = UI is composed from structured data.
 * This makes it easier to reorder/enable/disable sections without editing page JSX,
 * and later allows AI systems to safely generate section arrays.
 */
export function SectionRenderer({ sections }: SectionRendererProps) {
  const validSections = sections.filter(isRenderableSection);

  return (
    <>
      {validSections.map((section, index) => (
        <Fragment key={section.id}>
          {renderSection(section)}
          {index < validSections.length - 1 ? <div className="gradient-divider" /> : null}
        </Fragment>
      ))}
    </>
  );
}
