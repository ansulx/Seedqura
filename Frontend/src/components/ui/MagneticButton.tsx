"use client";

import { type ReactNode } from "react";

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "secondary";
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
  const base = `btn-premium ${variant === "primary" ? "btn-primary" : "btn-secondary"} disabled:cursor-not-allowed disabled:opacity-50 ${className}`;

  if (href) {
    return (
      <a href={href} className={base}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={base}
    >
      {children}
    </button>
  );
}
