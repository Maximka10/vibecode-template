export type SectionType =
  | "hero"
  | "about"
  | "stats"
  | "services"
  | "gallery"
  | "reviews"
  | "faq"
  | "pricing"
  | "hosting-service"
  | "calculator"
  | "cta"
  | "contacts"
  | "map"
  | "footer";

export type SectionContent = {
  // hero
  title?: string;
  subtitle?: string;
  cta_text?: string;
  // about
  text?: string;
  image_url?: string;
  // services / gallery / faq / reviews / pricing
  items?: unknown[];
  // contacts
  phone?: string;
  email?: string;
  telegram?: string;
  address?: string;
  working_hours?: string;
  // map
  embed_url?: string;
  // footer
  company_name?: string;
  links?: string[];
  // generic
  [key: string]: unknown;
};

export type SiteSection = {
  id: string;
  type: SectionType;
  enabled: boolean;
  content: SectionContent;
};

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: "Главный экран",
  about: "О нас",
  stats: "Цифры / статистика",
  services: "Услуги",
  gallery: "Галерея",
  reviews: "Отзывы",
  faq: "FAQ",
  pricing: "Цены",
  "hosting-service": "Домен и хостинг",
  calculator: "Калькулятор / заявка",
  cta: "Призыв к действию",
  contacts: "Контакты",
  map: "Карта",
  footer: "Подвал",
};

export const ALL_SECTION_TYPES: SectionType[] = [
  "hero", "about", "stats", "services", "gallery", "reviews",
  "faq", "pricing", "hosting-service", "calculator", "cta", "contacts", "map", "footer",
];
