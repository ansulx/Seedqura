import { getSiteData } from "@/lib/data";
import { Logo } from "@/components/ui/Logo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TextureBackground } from "@/components/effects/TextureBackground";

export function Hero() {
  const site = getSiteData();

  return (
    <section
      id="overview"
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-28 pb-32"
    >
      <TextureBackground variant="hero" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <Logo variant="hero" animate />

        <h1 className="mt-12 text-4xl font-medium leading-[1.15] tracking-tight text-text sm:text-5xl md:text-6xl">
          {site.tagline}
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted md:text-xl">
          {site.description}
        </p>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton href="/products" variant="primary">
            Explore
          </MagneticButton>
          <MagneticButton href="#contact" variant="secondary">
            Contact
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
