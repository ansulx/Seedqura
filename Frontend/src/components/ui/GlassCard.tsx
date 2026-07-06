"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

type GlassCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function GlassCard({
  title,
  description,
  children,
  className = "",
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`glass-card p-8 ${className}`}
    >
      <h3 className="text-lg font-medium text-text">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      {children}
    </motion.div>
  );
}
