import { baseStyle, defaultTheme } from "@/lib/theme/tokens";
import type { Template, ThemeTokens } from "@/types";

// ── Adaptive palettes ─────────────────────────────────────────────────────────
// One universal template, switchable between a premium dark and a premium light
// look. The accent (primary/secondary/gradient) is brand-tunable; the rest is
// tuned for a luxury, high-contrast feel with real glow + gradients.

export const DARK_THEME: ThemeTokens = { ...defaultTheme };

export const LIGHT_THEME: ThemeTokens = {
  primary: "#7c3aed",
  secondary: "#06b6d4",
  accent: "#f59e0b",
  bgBase: "#f8fafc",
  bgSurface: "#ffffff",
  bgBorder: "#0f172a14",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  glowPrimary: "rgba(124,58,237,.18)",
  glowSecondary: "rgba(6,182,212,.16)",
  gradientFrom: "#7c3aed",
  gradientTo: "#06b6d4",
  heroStyle: "orbs",
};

export const UNIVERSAL_TEMPLATE_ID = "universal";

const universal: Template = {
  id: UNIVERSAL_TEMPLATE_ID,
  name: "Премиум",
  category: "Универсальный",
  description:
    "Один шаблон под любой бизнес: премиальный дизайн со свечением и градиентами, светлая и тёмная темы, все секции и полное редактирование.",
  thumbnail: `/templates/${UNIVERSAL_TEMPLATE_ID}.svg`,
  theme: { ...DARK_THEME },
  style: { ...baseStyle },
  priceFrom: 14900,
  deliveryDays: 3,
  featured: true,
  tags: ["универсальный", "премиум", "светлая и тёмная тема", "сайт под ключ"],
  sections: [
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-hero`,
      type: "hero",
      content: {
        layout: "split",
        badge: "Сайт под ключ за 3 дня",
        headline: "Сайт, который\nработает на вас",
        subheadline:
          "Премиальный дизайн, быстрая загрузка и удобная заявка. Подстроим под ваш бренд и запустим за 3 дня — с доменом и хостингом.",
        cta: "Оставить заявку",
        secondaryCta: "Смотреть пример",
        accentWord: "premium",
      },
    },
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-stats`,
      type: "stats",
      content: {
        items: [
          { value: "3", suffix: " дня", label: "запуск под ключ" },
          { value: "0", suffix: " ₽", label: "предоплата" },
          { value: "100", suffix: "%", label: "адаптив под мобильные" },
          { value: "12", suffix: " мес", label: "поддержка" },
        ],
      },
    },
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-about`,
      type: "about",
      content: {
        title: "Почему выбирают нас",
        text: "Мы делаем сайты, которые приносят клиентов — не просто красивые картинки.\n\nСовременный дизайн, молниеносная загрузка и удобная форма заявки с первого дня. Вы получаете готовый инструмент продаж, а не просто страницу в интернете.",
      },
    },
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-services`,
      type: "services",
      content: {
        title: "Что входит в стоимость",
        items: [
          "Премиальный лендинг под ваш бренд",
          "Адаптив под телефон, планшет и десктоп",
          "Форма заявки с уведомлением в Telegram",
          "Домен и хостинг на 1 год",
          "SSL-сертификат и базовое SEO",
          "Подключение аналитики (Яндекс.Метрика)",
        ],
      },
    },
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-pricing`,
      type: "pricing",
      content: {
        title: "Тарифы",
        plans: [
          { name: "Старт", price: "от 14 900 ₽", features: ["Лендинг под ключ", "Адаптив под мобильные", "Форма заявки", "Домен и хостинг на 1 год"] },
          { name: "Бизнес", price: "от 29 900 ₽", features: ["Всё из «Старт»", "До 6 секций", "Подключение Telegram", "Базовое SEO", "Приоритетная поддержка"] },
          { name: "Премиум", price: "от 49 900 ₽", features: ["Всё из «Бизнес»", "Индивидуальный дизайн", "Копирайтинг", "Интеграции", "Менеджер проекта"] },
        ],
      },
    },
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-gallery`,
      type: "gallery",
      content: {
        title: "Примеры работ",
        images: ["Главная страница", "Каталог услуг", "Блок отзывов", "Форма заявки"],
      },
    },
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-hosting`,
      type: "hosting-service",
      content: {
        title: "Домен, хостинг и запуск под ключ",
        text: "Зарегистрируем домен, настроим хостинг, подключим SSL и аналитику. Вы просто получаете рабочий сайт — без технических хлопот.",
      },
    },
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-reviews`,
      type: "reviews",
      content: {
        title: "Клиенты о нас",
        items: [
          { author: "Алексей М.", text: "Сайт запустили за 2 дня. Уже в первую неделю пошли заявки через форму." },
          { author: "Мария К.", text: "Помогли с текстами и фотографиями. Домен и хостинг подключили сами." },
          { author: "Игорь С.", text: "Наконец-то сайт, который не стыдно показать клиентам. Выглядит дорого." },
        ],
      },
    },
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-faq`,
      type: "faq",
      content: {
        title: "Частые вопросы",
        items: [
          { question: "Сколько занимает запуск?", answer: "Обычно 3 рабочих дня после согласования контента." },
          { question: "Нужна ли предоплата?", answer: "Нет. Оплата только после того, как вы приняли готовый сайт." },
          { question: "Домен и хостинг входят в стоимость?", answer: "Да — регистрация домена и хостинг на 1 год включены." },
        ],
      },
    },
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-calc`,
      type: "calculator",
      content: { title: "Рассчитайте стоимость" },
    },
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-contacts`,
      type: "contacts",
      content: { title: "Контакты", phone: "", email: "", telegram: "", address: "" },
    },
    {
      id: `${UNIVERSAL_TEMPLATE_ID}-footer`,
      type: "footer",
      content: { brand: "Ваш бренд" },
    },
  ],
};

export const templates: Template[] = [universal];

export function getTemplateById(id: string): Template | null {
  // Any legacy/unknown id resolves to the single universal template so old
  // links and saved orders keep working.
  return templates.find((t) => t.id === id) ?? universal;
}
