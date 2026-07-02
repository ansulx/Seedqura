import Image from "next/image";
import Link from "next/link";

export const LOGO_SRC = "/resync-logo.png";
export const LOGO_ALT = "Resync — AI Agriculture & Digital Healthcare";

type LogoProps = {
  href?: string;
  variant?: "header" | "footer";
  className?: string;
};

export function Logo({ href, variant = "header", className = "" }: LogoProps) {
  const image = (
    <Image
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={variant === "header" ? 140 : 180}
      height={variant === "header" ? 48 : 64}
      className={
        variant === "header"
          ? "h-10 w-auto object-contain sm:h-11"
          : "h-14 w-auto object-contain sm:h-16"
      }
      priority={variant === "header"}
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
