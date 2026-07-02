"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  parallax?: boolean;
};

const offsets = {
  up: { y: 48, x: 0 },
  down: { y: -48, x: 0 },
  left: { x: 48, y: 0 },
  right: { x: -48, y: 0 },
};

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  parallax = false,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const offset = offsets[direction];
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={parallax ? { y: parallaxY } : undefined}
      initial={{ opacity: 0, x: offset.x, y: offset.y, scale: 0.96, filter: "blur(6px)" }}
      animate={
        inView
          ? { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }
          : {}
      }
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
