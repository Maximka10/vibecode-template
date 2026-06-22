"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { getTheme } from "@/lib/themes/getTheme";
import type { AboutSection } from "@/types/section";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const fallbackContent: NonNullable<AboutSection["content"]> = {
  badge: "ПОЧЕМУ МЫ",
  title: "Сайты, которые продают",
  description: "Мы создаём сайты, которые выглядят дорого, работают быстро и помогают вашему бизнесу выделяться среди конкурентов.",
  services: [
    { title: "Быстрый запуск", description: "От идеи до рабочего сайта за 2-5 дней" },
    { title: "Поддержка", description: "Помогаем после запуска и вносим правки" },
    { title: "Современный дизайн", description: "Трендовый внешний вид и адаптивность" },
  ],
};

type AboutProps = { section: AboutSection };

export function About({ section }: AboutProps) {
  const theme = getTheme();
  const content = section.content ?? fallbackContent;
  const services = content.services.length > 0 ? content.services : fallbackContent.services;

  return (
    <section className="section-shell section-spacing">
      <Container>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-4 text-sm uppercase tracking-[0.3em]" style={{ color: theme.colors.textMuted }}>{content.badge}</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{content.title}</h2>
          <p className="mt-5 text-base leading-relaxed sm:text-lg" style={{ color: theme.colors.textMuted }}>{content.description}</p>
        </motion.div>

        <motion.div
          className="mt-14 grid gap-5 md:grid-cols-3"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.2 }}
        >
          {services.map((service) => (
            <motion.div key={service.title} whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }}>
              <ServiceCard title={service.title} description={service.description} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
