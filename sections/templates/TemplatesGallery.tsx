"use client";

import { templates } from "@/content/templates";
import { motion } from "framer-motion";
import Link from "next/link";

export function TemplatesGallery() {
  return (
    <section className="px-6 py-32 bg-black text-white">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold">Выберите шаблон</h2>
        <p className="text-zinc-400 mt-2">Нажмите на шаблон, чтобы кастомизировать под ваш бизнес</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {templates.map((tpl) => (
          <motion.div
            key={tpl.id}
            whileHover={{ scale: 1.03 }}
            className="group rounded-2xl border border-white/10 bg-white/5 p-4 cursor-pointer transition"
          >
            <img src={tpl.previewImage} className="rounded-xl mb-4" />
            <h3 className="font-semibold text-white">{tpl.name}</h3>
            <p className="text-zinc-400">{tpl.description}</p>
            <Link href={`/customize/${tpl.id}`}>
              <button className="mt-2 bg-white text-black px-4 py-2 rounded-2xl">Выбрать</button>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}