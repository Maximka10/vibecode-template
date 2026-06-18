import type { PageSection, TemplatesGalleryContent } from "@/types/section";

type TemplateCard = { id: string; name: string; description: string; previewImage?: string };

export function buildSharedSections(templateCards: TemplateCard[]): PageSection[] {
  const galleryContent: TemplatesGalleryContent = {
    title: "Готовые шаблоны для вашего бизнеса",
    subtitle: "Выберите шаблон — мы адаптируем его под ваш бренд и запустим за 3 дня",
    ctaLabel: "Выбрать и настроить",
    templates: templateCards.map((tpl) => ({
      id: tpl.id,
      name: tpl.name,
      description: tpl.description,
      previewImage: tpl.previewImage ?? `/templates/${tpl.id}.jpg`,
    })),
  };

  return [
    {
      id: "hero-main",
      type: "hero",
      enabled: true,
      content: {
        badge: "VIBECODE STUDIO · Москва",
        title: "Готовый сайт за 3 дня\nот 13 900 ₽",
        subtitle:
          "Делаем современные сайты для кофеен, барбершопов, салонов красоты, автомоек и ресторанов. Домен, хостинг и Telegram-заявки включены.",
        primaryCta: "Выбрать шаблон",
        secondaryCta: "Как это работает",
        meta: ["от 13 900 ₽", "срок 3 дня", "0 ₽ предоплата"],
      },
    },
    {
      id: "stats-main",
      type: "stats",
      enabled: true,
      content: {
        items: [
          { value: "50+", label: "сайтов запущено" },
          { value: "3 дня", label: "средний срок" },
          { value: "0 ₽", label: "предоплата" },
          { value: "12 мес", label: "поддержка" },
        ],
      },
    },
    {
      id: "about-main",
      type: "about",
      enabled: true,
      content: {
        badge: "КАК МЫ РАБОТАЕМ",
        title: "Сайт, который приносит заявки",
        description:
          "Мы не просто делаем красивые сайты — мы упаковываем ваш бизнес так, чтобы клиенты доверяли с первого экрана и оставляли заявки.",
        services: [
          {
            title: "Выбираете шаблон",
            description: "Кофейня, салон, автомойка, ресторан или барбершоп — выбираете готовый дизайн",
          },
          {
            title: "Мы адаптируем",
            description: "Вносим ваши тексты, фото, услуги и цены. Подключаем домен и хостинг",
          },
          {
            title: "Запуск за 3 дня",
            description: "Сайт работает, заявки идут в Telegram. Поддержка 12 месяцев включена",
          },
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
