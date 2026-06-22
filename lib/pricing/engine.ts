import type { Template } from "@/types";

export type PriceItem = {
  label: string;
  price: number;
};

export type PriceBreakdown = {
  items: PriceItem[];
  total: number;
};

function isUploaded(v: unknown): boolean {
  if (typeof v !== "string" || !v) return false;
  return v.startsWith("http") || v.startsWith("/");
}

export function calcPrice(template: Template): PriceBreakdown {
  const items: PriceItem[] = [
    { label: `Шаблон «${template.name}»`, price: template.priceFrom ?? 13900 },
  ];

  const hero = template.sections.find((s) => s.type === "hero");
  if (isUploaded(hero?.content?.heroImage)) {
    items.push({ label: "Фото для главного экрана", price: 1500 });
  }

  const about = template.sections.find((s) => s.type === "about");
  if (isUploaded(about?.content?.coverImage)) {
    items.push({ label: "Фото для раздела «О нас»", price: 500 });
  }

  const gallery = template.sections.find((s) => s.type === "gallery");
  const images = (gallery?.content?.images as string[] | undefined) ?? [];
  const uploadedCount = images.filter(isUploaded).length;
  if (uploadedCount > 0) {
    items.push({
      label: `Галерея (${uploadedCount} фото)`,
      price: Math.min(uploadedCount * 500, 2500),
    });
  }

  return { items, total: items.reduce((s, i) => s + i.price, 0) };
}
