"use client";
import { motion } from "framer-motion";
import { getTheme } from "@/lib/themes/getTheme";

type ButtonProps = { children: React.ReactNode; onClick?: () => void };

export function Button({ children, onClick }: ButtonProps) {
  const theme = getTheme();

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="relative px-6 py-3 font-medium text-black transition"
      style={{
        borderRadius: theme.radius.button,
        backgroundColor: theme.colors.textPrimary,
      }}
    >
      {children}
    </motion.button>
  );
}
