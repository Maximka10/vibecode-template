import type { PageSection } from "@/types/section";

export type TemplateService = {
  title: string;
  description: string;
};

export type TemplateContent = {
  heroTitle: string;
  heroSubtitle: string;
  services: TemplateService[];
};

export type Template = {
  sections: PageSection[];
  id: string;
  name: string;
  description: string;
  previewImage: string;
  content: TemplateContent;
};

export type CustomizationState = {
  businessName: string;
  subtitle: string;
  services: TemplateService[];
  telegramUsername: string;
};
