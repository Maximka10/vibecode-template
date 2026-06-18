import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { templates } from "@/lib/templates";
import { SectionRenderer } from "@/lib/registry";
export default function HomePage(){const t=templates[0]; return <main><Navbar/><section className="px-4 py-16 text-center"><p className="text-sm text-cyan-200">Premium SaaS для малого бизнеса</p><h1 className="mx-auto mt-4 max-w-4xl text-3xl sm:text-4xl md:text-5xl font-black">Готовый сайт за 3 дня без предоплат — от <span className="whitespace-nowrap">9 900 ₽</span></h1><p className="mx-auto mt-5 max-w-2xl text-white/70">Кофейни, рестораны, салоны красоты, автомойки и клининг. Вы выбираете шаблон — мы делаем техническое.</p><Link className="mt-7 inline-flex rounded-full bg-white px-6 py-3 font-bold text-black" href="/templates">Выбрать шаблон</Link></section><SectionRenderer template={t}/></main>}
