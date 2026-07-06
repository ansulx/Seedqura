import Image from "next/image";
import Link from "next/link";

export const LOGO_SRC = "/logo.png";
export const LOGO_ALT = "Resync";

type LogoProps = {
  href?: string;
  variant?: "header" | "footer" | "hero";
  className?: string;
  animate?: boolean;
};

const sizes = {
  header: "h-9 w-auto sm:h-10",
  footer: "h-12 w-auto",
  hero: "h-20 w-auto sm:h-24 md:h-28",
};

export function Logo({
  href,
  variant = "header",
  className = "",
  animate = false,
}: LogoProps) {
  const image = (
    <Image
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={variant === "hero" ? 280 : variant === "footer" ? 180 : 140}
      height={variant === "hero" ? 100 : variant === "footer" ? 64 : 48}
      className={`object-contain ${sizes[variant]} ${animate ? "animate-logo" : ""}`}
      priority={variant === "header" || variant === "hero"}
    />
  );

  if (href) {
    return (
      <Link href={href} className={`inline-flex shrink-0 items-center ${className}`}>
        {image}
      </Link>
    );
  }

  return <div className={`inline-flex shrink-0 items-center ${className}`}>{image}</div>;
}
