"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { aboutContent } from "@/content/about";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export function About() {
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
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-zinc-500">
            {aboutContent.badge}
          </p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {aboutContent.title}
          </h2>
          <p className="mt-6 text-lg text-zinc-400">
            {aboutContent.description}
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
          {aboutContent.services.map((service) => (
            <motion.div
              key={service.title}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <ServiceCard
                title={service.title}
                description={service.description}
              />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}