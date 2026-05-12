import type { PageSection, TemplatesGalleryContent } from "@/types/section";

type TemplateCard = { id: string; name: string; description: string; previewImage: string };

export function buildSharedSections(templateCards: TemplateCard[]): PageSection[] {
  const galleryContent: TemplatesGalleryContent = {
    title: "Выберите шаблон",
    subtitle: "Нажмите на шаблон, чтобы кастомизировать под ваш бизнес",
    ctaLabel: "Выбрать",
    templates: templateCards.map((tpl) => ({
      id: tpl.id,
      name: tpl.name,
      description: tpl.description,
      previewImage: tpl.previewImage,
    })),
  };

  return [
    {
      id: "hero-main",
      type: "hero",
      enabled: true,
      content: {
        badge: "VIBECODE STUDIO",
        title: "Современные сайты\nдля малого бизнеса",
        subtitle:
          "Быстрые, современные и доступные сайты для кофеен, автомоек, салонов, ресторанов и локальных брендов.",
        primaryCta: "Рассчитать стоимость",
        secondaryCta: "Примеры работ",
        meta: ["от 15 000 ₽", "срок от 2 дней", "Telegram / WhatsApp"],
      },
    },
    {
      id: "about-main",
      type: "about",
      enabled: true,
      content: {
        badge: "ПОЧЕМУ МЫ",
        title: "Сайты, которые продают",
        description:
          "Мы создаём сайты, которые выглядят дорого, работают быстро и помогают вашему бизнесу выделяться среди конкурентов.",
        services: [
          { title: "Быстрый запуск", description: "От идеи до рабочего сайта за 2-5 дней" },
          { title: "Поддержка", description: "Помогаем после запуска и вносим правки" },
          { title: "Современный дизайн", description: "Трендовый внешний вид и адаптивность" },
        ],
      },
    },
    {
      id: "stats-main",
      type: "stats",
      enabled: true,
      content: {
        items: [
          { value: "50+", label: "созданных сайтов" },
          { value: "2 дня", label: "средний срок запуска" },
          { value: "100%", label: "адаптивность" },
          { value: "24/7", label: "поддержка и связь" },
        ],
      },
    },
    {
      id: "templates-main",
      type: "templates-gallery",
      enabled: true,
      content: galleryContent,
    },
  ];
}
