"use client";

import { Container } from "@/components/layout/Container";
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
    <section className="section-shell section-spacing">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed sm:text-base" style={{ color: theme.colors.textMuted }}>
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {templateCards.map((tpl) => (
            <motion.div
              key={tpl.id}
              whileHover={{ y: -6 }}
              className="glass-panel group flex h-full flex-col overflow-hidden"
              style={{ borderRadius: theme.radius.card, border: `1px solid ${theme.colors.borderSubtle}`, boxShadow: theme.shadows.card }}
            >
              <div className="aspect-[16/10] overflow-hidden border-b" style={{ borderColor: theme.colors.borderSubtle }}>
                <img src={tpl.previewImage} alt={tpl.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>{tpl.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: theme.colors.textMuted }}>{tpl.description}</p>
                <Link href={`/customize/${tpl.id}`} className="mt-5">
                  <button className="w-full px-4 py-2.5 text-sm font-medium text-black transition hover:opacity-90" style={{ borderRadius: theme.radius.button, backgroundColor: theme.colors.textPrimary }}>
                    {ctaLabel}
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
