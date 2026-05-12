import { templates } from "@/content/templates";
import type { Template } from "@/types/template";

/**
 * Single place for template lookup logic so route components stay focused on UI.
 */
export function getTemplateById(templateId: string): Template | undefined {
  return templates.find((template) => template.id === templateId);
}
