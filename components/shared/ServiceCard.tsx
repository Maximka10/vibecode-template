"use client";

import { motion } from "framer-motion";

type ServiceCardProps = {
  title: string;
  description: string;
};

export function ServiceCard({
  title,
  description,
}: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.3,
      }}
      className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10"
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl transition group-hover:scale-110">
        ✦
      </div>

      <h3 className="text-2xl font-semibold">
        {title}
      </h3>

      <p className="mt-4 leading-relaxed text-zinc-400">
        {description}
      </p>
    </motion.div>
  );
}