import { buildSharedSections } from "@/content/sectionPresets";

// Inline types for the content-layer template model (used by sectionPresets only)
type TemplateService = {
  title: string;
  description: string;
};

type TemplateContent = {
  heroTitle: string;
  heroSubtitle: string;
  services: TemplateService[];
};

type ContentTemplate = {
  sections: ReturnType<typeof buildSharedSections>;
  id: string;
  name: string;
  description: string;
  previewImage: string;
  content: TemplateContent;
};

const templateSeed: Array<Omit<ContentTemplate, "sections">> = [
  {
    id: "coffee-shop",
    name: "Кофейня",
    description: "Для небольших кафе и кофейн с меню и заказами",
    previewImage: "/templates/coffee-shop.png",
    content: {
      heroTitle: "CoffeeTime — свежий кофе каждый день",
      heroSubtitle: "Онлайн-меню и доставка",
      services: [
        { title: "Меню онлайн", description: "Красивый каталог напитков" },
        { title: "Заказ столика", description: "Форма бронирования" },
        { title: "Доставка", description: "Онлайн оплата и курьер" },
      ],
    },
  },
  {
    id: "car-wash",
    name: "Автомойка",
    description: "Для автомоек с онлайн-записью и прайсом",
    previewImage: "/templates/car-wash.png",
    content: {
      heroTitle: "AutoClean — блестящая мойка",
      heroSubtitle: "Быстро, качественно и удобно",
      services: [
        { title: "Онлайн запись", description: "Выберите время для автомобиля" },
        { title: "Прайс услуг", description: "Все цены на одной странице" },
      ],
    },
  },
  {
    id: "barber-shop",
    name: "Барбершоп",
    description: "Для салонов с записью и галереей стрижек",
    previewImage: "/templates/barber-shop.png",
    content: {
      heroTitle: "BarberPro — стильная стрижка",
      heroSubtitle: "Запись онлайн и лучшие мастера",
      services: [
        { title: "Запись онлайн", description: "Выберите мастера и время" },
        { title: "Галерея стрижек", description: "Примеры работ мастеров" },
      ],
    },
  },
];

/**
 * Templates behave like data models: structure + section payload.
 * This allows CMS, AI generation, drag-and-drop editors, and live previews.
 */
export const templates: ContentTemplate[] = templateSeed.map((template) => ({
  ...template,
  sections: buildSharedSections(templateSeed),
}));
