"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { TemplatesGallerySection } from "@/types/section";
import { templates as fallbackTemplates } from "@/content/templates";

const fallbackContent: NonNullable<TemplatesGallerySection["content"]> = {
  title: "Выберите шаблон",
  subtitle: "Нажмите на шаблон, чтобы кастомизировать под ваш бизнес",
  ctaLabel: "Выбрать",
  templates: fallbackTemplates.map((tpl) => ({
    id: tpl.id,
    name: tpl.name,
    description: tpl.description,
    previewImage: tpl.previewImage,
  })),
};

type TemplatesGalleryProps = { section: TemplatesGallerySection };

export function TemplatesGallery({ section }: TemplatesGalleryProps) {
  const content = section.content ?? fallbackContent;
  const cards = content.templates.length > 0 ? content.templates : fallbackContent.templates;

  return (
    <section className="px-6 py-32 bg-black text-white">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold">{content.title}</h2>
        <p className="text-zinc-400 mt-2">{content.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {cards.map((tpl) => (
          <motion.div
            key={tpl.id}
            whileHover={{ scale: 1.03 }}
            className="group rounded-2xl border border-white/10 bg-white/5 p-4 cursor-pointer transition"
          >
            <img src={tpl.previewImage} className="rounded-xl mb-4" />
            <h3 className="font-semibold text-white">{tpl.name}</h3>
            <p className="text-zinc-400">{tpl.description}</p>
            <Link href={`/customize/${tpl.id}`}>
              <button className="mt-2 bg-white text-black px-4 py-2 rounded-2xl">{content.ctaLabel}</button>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
