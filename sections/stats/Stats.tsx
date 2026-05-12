"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const stats = [
  { value: "50+", label: "созданных сайтов" },
  { value: "2 дня", label: "средний срок запуска" },
  { value: "100%", label: "адаптивность" },
  { value: "24/7", label: "поддержка и связь" },
];

export function Stats() {
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
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
              <div className="text-5xl font-bold tracking-tight">{stat.value}</div>
              <p className="mt-4 text-zinc-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}