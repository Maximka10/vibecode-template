"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const projects = [
  { title: "Кофейня", category: "Landing Page" },
  { title: "Автомойка", category: "Business Website" },
  { title: "Барбершоп", category: "Premium Landing" },
];

export function Portfolio() {
  return (
    <section className="px-6 py-32">
      <Container>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-zinc-500">ПОРТФОЛИО</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Примеры будущих сайтов</h2>
          <p className="mt-6 text-lg text-zinc-400">
            Современные интерфейсы для локального бизнеса, созданные с упором на стиль, скорость и конверсию.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-6 md:grid-cols-3"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.2 }}
        >
          {projects.map((project) => (
            <motion.div
              key={project.title}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            >
              <div className="relative h-80 overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 transition duration-500 group-hover:opacity-100" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-6 py-4 backdrop-blur-xl">
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">{project.category}</p>
                    <h3 className="mt-2 text-2xl font-bold">{project.title}</h3>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}