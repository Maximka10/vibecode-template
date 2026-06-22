"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { calculatorContent } from "@/content/calculator";
import { Btn } from "@/components/ui/Btn";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export function Calculator() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (name: string) => {
    if (selected.includes(name)) {
      setSelected(selected.filter((n) => n !== name));
    } else {
      setSelected([...selected, name]);
    }
  };

  const total = selected.reduce((sum, name) => {
    const option = calculatorContent.options.find((o) => o.name === name);
    return sum + (option ? option.price : 0);
  }, 0);

  const handleSubmit = () => {
    const telegramUsername = "Maxvol2"; // вставь свой username
    const message = encodeURIComponent(
      `Новая заявка с сайта:\n- ${selected.join("\n- ")}\nИтого: ${total} ₽`
    );
    const url = `https://t.me/${botUsername}?text=${message}`;
    window.open(url, "_blank");
  };

  return (
    <section className="px-6 py-32 bg-black text-white">
      <Container>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl text-center mx-auto"
        >
          <h2 className="text-4xl font-bold sm:text-5xl mb-4">{calculatorContent.title}</h2>
          <p className="text-zinc-400 mb-10">{calculatorContent.description}</p>

          <div className="grid gap-4 md:grid-cols-2">
            {calculatorContent.options.map((option) => (
              <motion.div
                key={option.name}
                onClick={() => toggleOption(option.name)}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                  selected.includes(option.name) ? "border-white bg-white/10" : "border-white/10"
                }`}
              >
                <h3 className="font-semibold">{option.name}</h3>
                <p className="text-zinc-400">{option.price > 0 ? option.price + " ₽" : "Бесплатно"}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-xl font-bold">Итого: {total.toLocaleString()} ₽</div>

          <div className="mt-6">
            <Btn onClick={handleSubmit}>Оставить заявку</Btn>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}