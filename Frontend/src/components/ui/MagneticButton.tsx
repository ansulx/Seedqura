"use client";

import { motion } from "framer-motion";
import { type ReactNode, useRef } from "react";

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function MagneticButton({
  children,
  href,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  const variants = {
    primary:
      "bg-gradient-to-r from-green to-emerald text-white shadow-lg shadow-green/25 hover:shadow-green/40",
    secondary:
      "glass border-white/20 text-white hover:bg-white/10",
    ghost: "border border-white/20 text-white/90 hover:border-green/50 hover:text-green",
  };

  const base = `relative inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-8 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`;

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const inner = (
    <motion.span whileTap={{ scale: 0.97 }} className="relative z-10 flex items-center gap-2">
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        className={base}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={base}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {inner}
    </button>
  );
}
