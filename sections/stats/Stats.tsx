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
    <section className="section-shell section-spacing">
      <Container>
        <motion.div
          className="glass-panel rounded-3xl p-4 sm:p-6"
          style={{ borderColor: theme.colors.borderSubtle, backgroundColor: "rgba(20, 20, 28, 0.5)", boxShadow: theme.shadows.card }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border p-6 text-center"
                style={{ borderColor: theme.colors.borderSubtle, backgroundColor: "rgba(16,16,25,0.75)" }}
              >
                <div className="text-3xl font-semibold tracking-tight sm:text-4xl">{stat.value}</div>
                <p className="mt-3 text-sm" style={{ color: theme.colors.textMuted }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
