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
    <div className={`glass-card p-8 ${className}`}>
      <h3 className="text-lg font-medium text-text">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      {children}
    </div>
  );
}
