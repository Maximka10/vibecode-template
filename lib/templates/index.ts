import { baseStyle, defaultTheme } from "@/lib/theme/tokens";
import type { Template, TemplateStyle, ThemeTokens } from "@/types";
const themes: Record<string, Partial<ThemeTokens>> = {
 coffee:{primary:"#b7791f",secondary:"#fed7aa",accent:"#f97316",bgBase:"#1c120b",bgSurface:"#2a1810",gradientFrom:"#7c2d12",gradientVia:"#b45309",gradientTo:"#fed7aa",heroStyle:"orbs"},
 beauty:{primary:"#d946ef",secondary:"#f0abfc",accent:"#f5d0fe",bgBase:"#16051f",bgSurface:"#2e1040",gradientFrom:"#3b0764",gradientVia:"#c026d3",gradientTo:"#f5d0fe",heroStyle:"dots"},
 wash:{primary:"#22d3ee",secondary:"#67e8f9",accent:"#a5f3fc",bgBase:"#020617",bgSurface:"#082f49",gradientFrom:"#0369a1",gradientVia:"#22d3ee",gradientTo:"#a5f3fc",heroStyle:"geometric"},
 food:{primary:"#f59e0b",secondary:"#fde68a",accent:"#fb923c",bgBase:"#120b05",bgSurface:"#2b1608",gradientFrom:"#7f1d1d",gradientVia:"#b45309",gradientTo:"#fbbf24",heroStyle:"noise"},
 clean:{primary:"#34d399",secondary:"#a7f3d0",accent:"#10b981",bgBase:"#03120d",bgSurface:"#06351f",gradientFrom:"#065f46",gradientVia:"#34d399",gradientTo:"#bbf7d0",heroStyle:"lines"},
};
function tpl(id:string,name:string,category:string,description:string,theme:Partial<ThemeTokens>,style:Partial<TemplateStyle>,hero:string,sub:string):Template{const fullTheme={...defaultTheme,...theme}; const fullStyle={...baseStyle,...style}; return {id,name,category,description,thumbnail:`/templates/${id}.png`,theme:fullTheme,style:fullStyle,priceFrom:9900,deliveryDays:3,featured:true,tags:[category,"сайт за 3 дня","под ключ"],sections:[
{id:`${id}-hero`,type:"hero",content:{layout: style.heroTextAlign==="center"?"centered": id==="car-wash"?"minimal": id==="restaurant"?"cinematic":"split", badge:"Готовый сайт за 3 дня", headline:hero, subheadline:sub, cta:"Заказать от 9 900 ₽", secondaryCta:"Смотреть шаблон", accentWord:"premium"}},
{id:`${id}-stats`,type:"stats",content:{items:[{value:"3",suffix:" дня",label:"до запуска"},{value:"9900",prefix:"от ",suffix:" ₽",label:"стоимость"},{value:"0",suffix:" ₽",label:"предоплата"}]}},
{id:`${id}-about`,type:"about",content:{title:`Почему ${name.toLowerCase()} получает больше заявок`,text:"Упакуем преимущества, услуги, галерею и быстрый контакт в современный сайт без agency-снобизма."}},
{id:`${id}-gallery`,type:"gallery",content:{images:["Интерьер","Команда","Процесс","Результат"]}},
{id:`${id}-services`,type:"services",content:{title:"Что входит",items:["Лендинг-сайт","Онлайн-заявка","Галерея/портфолио","Домен + хостинг"]}},
{id:`${id}-hosting`,type:"hosting-service",content:{title:"Домен и хостинг под ключ",text:"Вы занимаетесь бизнесом — мы делаем техническое."}},
{id:`${id}-reviews`,type:"reviews",content:{title:"Отзывы",items:["Быстро запустили и помогли с текстами","Заявки пошли в первую неделю"]}},
{id:`${id}-calc`,type:"calculator",content:{title:"Калькулятор стоимости"}},
{id:`${id}-footer`,type:"footer",content:{brand:name}}
]};}
export const templates:Template[]=[
tpl("coffee-shop","Coffee Shop","Кофейня","Warm roastery шаблон для кофеен",themes.coffee,{radius:"round",galleryStyle:"masonry",heroDecor:"orbs"},"Кофейня, в которую хочется зайти с телефона","Меню, атмосфера и заявки на бронирование в одном premium-сайте."),
tpl("beauty-salon","Beauty Salon","Салон красоты","Velvet luxury шаблон для салонов",themes.beauty,{radius:"pill",statsLayout:"large",heroTextAlign:"center",heroDecor:"dots",ctaStyle:"pill"},"Салон красоты с ощущением люкса","Онлайн-запись, услуги мастеров и доверие с первого экрана."),
tpl("car-wash","Car Wash","Автомойка","Midnight neon шаблон для автомоек",themes.wash,{radius:"soft",galleryStyle:"grid",heroDecor:"geometric"},"Автомойка с неоновым вау-эффектом","Прайс, запись и понятный путь клиента до визита."),
tpl("restaurant","Restaurant","Ресторан","Cinematic amber шаблон для ресторанов",themes.food,{radius:"soft",galleryStyle:"film",heroDecor:"scanlines"},"Ресторанный сайт как трейлер вечера","Меню, бронь столов и горизонтальная film-галерея."),
tpl("cleaning","Cleaning","Клининг","Fresh mint шаблон для клининга",themes.clean,{radius:"round",galleryStyle:"grid",heroTextAlign:"center"},"Клининг, который выглядит надёжно","Пакеты услуг, калькулятор и заявки без лишних звонков.")];
export function getTemplateById(id:string){return templates.find(t=>t.id===id)??null}
