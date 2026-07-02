"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

type GlassCardProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
  glow?: "green" | "blue" | "cyan";
};

const glowColors = {
  green: "group-hover:shadow-green/20",
  blue: "group-hover:shadow-blue/20",
  cyan: "group-hover:shadow-cyan/20",
};

export function GlassCard({
  icon: Icon,
  title,
  description,
  children,
  className = "",
  glow = "green",
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group gradient-border glass relative overflow-hidden rounded-[24px] p-6 shadow-xl transition-shadow duration-500 hover:shadow-2xl ${glowColors[glow]} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green/5 via-transparent to-blue/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {Icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green/20 to-blue/20">
          <Icon className="h-7 w-7 text-green" />
        </div>
      )}
      <h3 className="font-heading text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{description}</p>
      {children}
    </motion.div>
  );
}
