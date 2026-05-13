"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { getTheme } from "@/lib/themes/getTheme";
import type { StatsSection } from "@/types/section";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const fallbackStats = [
  { value: "50+", label: "созданных сайтов" },
  { value: "2 дня", label: "средний срок запуска" },
  { value: "100%", label: "адаптивность" },
  { value: "24/7", label: "поддержка и связь" },
];

type StatsProps = { section: StatsSection };

export function Stats({ section }: StatsProps) {
  const theme = getTheme();
  const stats = section.content?.items?.length ? section.content.items : fallbackStats;

  return (
    <section className="px-6 py-24">
      <Container>
        <motion.div
          className="grid gap-6 md:grid-cols-4 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.15 }}
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="p-8"
              style={{
                borderRadius: theme.radius.card,
                border: `1px solid ${theme.colors.borderSubtle}`,
                backgroundColor: theme.colors.surface,
              }}
            >
              <div className="text-5xl font-bold tracking-tight">{stat.value}</div>
              <p className="mt-4" style={{ color: theme.colors.textMuted }}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
