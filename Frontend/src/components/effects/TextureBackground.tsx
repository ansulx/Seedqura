import Image from "next/image";

type TextureBackgroundProps = {
  variant?: "hero" | "footer" | "divider";
  className?: string;
};

const variantStyles = {
  hero: "opacity-[0.12] blur-[2px] scale-110 object-[70%_30%]",
  footer: "opacity-[0.08] blur-[3px] scale-105 object-[80%_60%]",
  divider: "opacity-[0.06] blur-[4px] scale-100 object-center",
};

export function TextureBackground({
  variant = "hero",
  className = "",
}: TextureBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <Image
        src="/hero-texture.png"
        alt=""
        fill
        priority={variant === "hero"}
        className={`object-cover ${variantStyles[variant]}`}
        sizes="100vw"
      />
      {variant === "hero" && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505]" />
      )}
    </div>
  );
}
