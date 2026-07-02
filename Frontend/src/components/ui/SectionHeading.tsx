import { ScrollReveal } from "@/components/motion/ScrollReveal";

type SectionHeadingProps = {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
};

export function SectionHeading({
  label,
  title,
  subtitle,
  align = "left",
  light = false,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";
  const titleColor = light ? "text-navy" : "text-white";
  const subColor = light ? "text-muted" : "text-white/60";

  return (
    <ScrollReveal className={`max-w-3xl ${alignClass}`}>
      {label && (
        <p className="font-sub mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-green">
          {label}
        </p>
      )}
      <h2 className={`font-heading text-3xl font-bold leading-tight md:text-5xl ${titleColor}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`font-sub mt-5 text-lg leading-relaxed ${subColor}`}>{subtitle}</p>
      )}
    </ScrollReveal>
  );
}
