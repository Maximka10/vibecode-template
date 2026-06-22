import { baseStyle, defaultTheme } from "@/lib/theme/tokens";
import type { Template, TemplateStyle, ThemeTokens } from "@/types";

const themes: Record<string, Partial<ThemeTokens>> = {
  coffee: {
    primary: "#d97706",
    secondary: "#fde68a",
    accent: "#f59e0b",
    bgBase: "#faf6f1",
    bgSurface: "#ffffff",
    bgBorder: "#e8d5c0",
    textPrimary: "#1c1410",
    textSecondary: "#6b4f3a",
    gradientFrom: "#92400e",
    gradientTo: "#d97706",
    heroStyle: "orbs",
  },
  beauty: {
    primary: "#be185d",
    secondary: "#fce7f3",
    accent: "#db2777",
    bgBase: "#fdf4f7",
    bgSurface: "#ffffff",
    bgBorder: "#fbcfe8",
    textPrimary: "#1a0510",
    textSecondary: "#831843",
    gradientFrom: "#9d174d",
    gradientTo: "#f472b6",
    heroStyle: "dots",
  },
  barber: {
    primary: "#eab308",
    secondary: "#fef08a",
    accent: "#ca8a04",
    bgBase: "#0a0a0a",
    bgSurface: "#141414",
    bgBorder: "#2a2a2a",
    textPrimary: "#f5f5f5",
    textSecondary: "#a3a3a3",
    gradientFrom: "#1c1400",
    gradientTo: "#ca8a04",
    heroStyle: "noise",
  },
  wash: {
    primary: "#0ea5e9",
    secondary: "#e0f2fe",
    accent: "#38bdf8",
    bgBase: "#020d18",
    bgSurface: "#041525",
    bgBorder: "#0c2d45",
    textPrimary: "#f0f9ff",
    textSecondary: "#7dd3fc",
    gradientFrom: "#075985",
    gradientTo: "#0ea5e9",
    heroStyle: "geometric",
  },
  restaurant: {
    primary: "#b45309",
    secondary: "#fef3c7",
    accent: "#d97706",
    bgBase: "#fdf8f0",
    bgSurface: "#ffffff",
    bgBorder: "#f0e0c0",
    textPrimary: "#1c1008",
    textSecondary: "#78350f",
    gradientFrom: "#78350f",
    gradientTo: "#f59e0b",
    heroStyle: "lines",
  },
};

function tpl(
  id: string,
  name: string,
  category: string,
  description: string,
  theme: Partial<ThemeTokens>,
  style: Partial<TemplateStyle>,
  heroHeadline: string,
  heroSub: string,
  services: string[],
  priceFrom: number,
  galleryImages?: string[],
  heroImage?: string
): Template {
  const fullTheme = { ...defaultTheme, ...theme };
  const fullStyle = { ...baseStyle, ...style };

  return {
    id,
    name,
    category,
    description,
    thumbnail: `/templates/${id}.svg`,
    theme: fullTheme,
    style: fullStyle,
    priceFrom,
    deliveryDays: 3,
    featured: true,
    tags: [category, "сайт под ключ", "домен и хостинг"],
    sections: [
      {
        id: `${id}-hero`,
        type: "hero",
        content: {
          layout: style.heroTextAlign === "center" ? "centered" : "split",
          badge: `${category} · Сайт за 3 дня`,
          headline: heroHeadline,
          subheadline: heroSub,
          cta: `Заказать от ${priceFrom.toLocaleString("ru-RU")} ₽`,
          secondaryCta: "Смотреть пример",
          accentWord: "premium",
          ...(heroImage ? { heroImage } : {}),
        },
      },
      {
        id: `${id}-stats`,
        type: "stats",
        content: {
          items: [
            { value: "3", suffix: " дня", label: "срок запуска" },
            { value: priceFrom.toLocaleString("ru-RU"), prefix: "от ", suffix: " ₽", label: "под ключ" },
            { value: "0", suffix: " ₽", label: "предоплата" },
            { value: "12", suffix: " мес", label: "поддержка" },
          ],
        },
      },
      {
        id: `${id}-about`,
        type: "about",
        content: {
          title: `Почему ${name} выбирает нас`,
          text: "Мы делаем сайты, которые приносят клиентов — не просто красивые картинки. Современный дизайн, быстрая загрузка и удобная форма заявки с первого дня.",
        },
      },
      {
        id: `${id}-services`,
        type: "services",
        content: {
          title: "Что входит в стоимость",
          items: services,
        },
      },
      {
        id: `${id}-gallery`,
        type: "gallery",
        content: {
          title: "Наши работы",
          images: galleryImages ?? ["Интерьер", "Команда", "Процесс", "Результат"],
        },
      },
      {
        id: `${id}-hosting`,
        type: "hosting-service",
        content: {
          title: "Домен, хостинг и запуск под ключ",
          text: "Зарегистрируем домен, настроим хостинг, подключим SSL и аналитику. Вы просто получаете рабочий сайт — без технических хлопот.",
        },
      },
      {
        id: `${id}-reviews`,
        type: "reviews",
        content: {
          title: "Клиенты о нас",
          items: [
            "Сайт запустили за 2 дня. Уже в первую неделю пошли заявки через форму.",
            "Помогли с текстами и фотографиями. Домен и хостинг подключили сами.",
            "Наконец-то сайт, который не стыдно показать клиентам.",
          ],
        },
      },
      {
        id: `${id}-calc`,
        type: "calculator",
        content: { title: "Рассчитайте стоимость" },
      },
      {
        id: `${id}-footer`,
        type: "footer",
        content: { brand: name },
      },
    ],
  };
}

export const templates: Template[] = [
  tpl(
    "coffee-shop",
    "Кофейня",
    "Кофейня",
    "Тёплый уютный шаблон для кофеен, кафе и кондитерских",
    themes.coffee,
    { radius: "round", galleryStyle: "masonry", heroTextAlign: "left" },
    "Кофейня, в которую хочется вернуться",
    "Меню, атмосфера и онлайн-бронирование. Запустим за 3 дня — с доменом и хостингом.",
    [
      "Лендинг с меню и ценами",
      "Онлайн-бронирование стола",
      "Галерея интерьера и блюд",
      "Форма заявки с Telegram-уведомлением",
      "Домен и хостинг на 1 год",
      "Подключение Яндекс.Метрики",
    ],
    14900,
    ["Уютный интерьер", "Свежий кофе", "Авторские напитки", "Наша команда", "Утренние завтраки", "Летняя терраса"]
  ),
  tpl(
    "beauty-salon",
    "Салон красоты",
    "Красота",
    "Премиум-шаблон для салонов красоты и спа",
    themes.beauty,
    { radius: "pill", statsLayout: "large", heroTextAlign: "center", ctaStyle: "pill" },
    "Салон красоты, который вызывает доверие",
    "Услуги мастеров, онлайн-запись и отзывы. Премиум-сайт за 3 дня.",
    [
      "Лендинг с услугами и ценами",
      "Онлайн-запись к мастеру",
      "Портфолио работ",
      "Блок с командой мастеров",
      "Форма заявки с Telegram-уведомлением",
      "Домен и хостинг на 1 год",
    ],
    16900,
    ["Стрижки и укладки", "Уходовые процедуры", "Маникюр и педикюр", "Команда мастеров", "Свадебные образы", "До и после"]
  ),
  tpl(
    "barber-shop",
    "Барбершоп",
    "Барбершоп",
    "Брутальный тёмный шаблон для барбершопов",
    themes.barber,
    { radius: "soft", galleryStyle: "grid", heroTextAlign: "left" },
    "Барбершоп с характером",
    "Запись онлайн, галерея стрижек, команда мастеров. Запуск за 3 дня.",
    [
      "Лендинг с прайсом услуг",
      "Онлайн-запись к барберу",
      "Галерея стрижек и бород",
      "Страница команды",
      "Форма заявки с Telegram-уведомлением",
      "Домен и хостинг на 1 год",
    ],
    14900,
    ["Классические стрижки", "Работы мастеров", "Брадобрейское искусство", "Коррекция бороды", "До и после", "Наши барберы"]
  ),
  tpl(
    "car-wash",
    "Автомойка",
    "Автомойка",
    "Технологичный тёмный шаблон для автомоек",
    themes.wash,
    { radius: "soft", galleryStyle: "grid" },
    "Автомойка с современным сайтом",
    "Прайс, онлайн-запись и фотогалерея. Неоновый дизайн за 3 дня.",
    [
      "Лендинг с прайсом",
      "Онлайн-запись",
      "Галерея работ",
      "Блок с преимуществами",
      "Форма заявки с Telegram-уведомлением",
      "Домен и хостинг на 1 год",
    ],
    13900,
    ["Детейлинг кузова", "Химчистка салона", "Полировка", "Нанопокрытие", "Результат до/после", "Наше оборудование"]
  ),
  tpl(
    "restaurant",
    "Ресторан",
    "Ресторан",
    "Кинематографичный шаблон для ресторанов",
    themes.restaurant,
    { radius: "soft", galleryStyle: "film" },
    "Ресторан, который хочется посетить",
    "Меню, бронирование столов и film-галерея. Сайт как трейлер вечера.",
    [
      "Лендинг с меню",
      "Бронирование столика онлайн",
      "Film-галерея блюд и интерьера",
      "Страница акций и событий",
      "Форма заявки с Telegram-уведомлением",
      "Домен и хостинг на 1 год",
    ],
    17900,
    ["Фирменные блюда", "Интерьер зала", "Кухня шефа", "Авторские коктейли", "Банкеты и события", "Летняя веранда"]
  ),
];

export function getTemplateById(id: string): Template | null {
  return templates.find((t) => t.id === id) ?? null;
}
