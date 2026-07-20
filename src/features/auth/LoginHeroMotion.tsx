"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

export function LoginHeroMotion({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
