import { defaultTheme } from "@/lib/themes/defaultTheme";
import type { Theme } from "@/types/theme";

/**
 * Centralized theme access point.
 * Later we can switch by template/tenant/user preference without changing UI components.
 */
export function getTheme(): Theme {
  return defaultTheme;
}
