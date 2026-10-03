"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useInView } from "motion/react";

/** Keep content visible; animate only when its section first enters the viewport. */
export function ScrollReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.1 });
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={visible && !reducedMotion ? { y: [12, 0] } : { y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
