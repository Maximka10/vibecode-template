"use client";
import { motion } from "framer-motion";

type ButtonProps = { children: React.ReactNode; onClick?: () => void };

export function Button({ children, onClick }: ButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-2xl bg-white px-6 py-3 font-medium text-black transition"
    >
      {children}
    </motion.button>
  );
}