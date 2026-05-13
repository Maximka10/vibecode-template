"use client";

import { templates } from "@/content/templates";
import { motion } from "framer-motion";
import Link from "next/link";
import { getTheme } from "@/lib/themes/getTheme";
import type { TemplatesGallerySection } from "@/types/section";

type TemplatesGalleryProps = { section: TemplatesGallerySection };

export function TemplatesGallery({ section }: TemplatesGalleryProps) {
  const theme = getTheme();
  const content = section.content;
  const templateCards = content?.templates?.length ? content.templates : templates;
  const title = content?.title ?? "Выберите шаблон";
  const subtitle = content?.subtitle ?? "Нажмите на шаблон, чтобы кастомизировать под ваш бизнес";
  const ctaLabel = content?.ctaLabel ?? "Выбрать";

  return (
    <section className="px-6 py-32 bg-black text-white">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold">{title}</h2>
        <p className="mt-2" style={{ color: theme.colors.textMuted }}>
          {subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {templateCards.map((tpl) => (
          <motion.div
            key={tpl.id}
            whileHover={{ scale: 1.03 }}
            className="group p-4 cursor-pointer transition"
            style={{
              borderRadius: theme.radius.card,
              border: `1px solid ${theme.colors.borderSubtle}`,
              backgroundColor: theme.colors.surface,
              boxShadow: theme.shadows.card,
            }}
          >
            <img src={tpl.previewImage} className="rounded-xl mb-4" />
            <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>{tpl.name}</h3>
            <p style={{ color: theme.colors.textMuted }}>{tpl.description}</p>
            <Link href={`/customize/${tpl.id}`}>
              <button className="mt-2 px-4 py-2 text-black" style={{ borderRadius: theme.radius.button, backgroundColor: theme.colors.textPrimary }}>
                {ctaLabel}
              </button>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
