"use client";

import { motion, useReducedMotion } from "framer-motion";
import { getSiteData } from "@/lib/data";
import { Logo } from "@/components/ui/Logo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TextureBackground } from "@/components/effects/TextureBackground";

export function Hero() {
  const site = getSiteData();
  const reduceMotion = useReducedMotion();

  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 } as const,
        animate: { opacity: 1, y: 0 } as const,
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section
      id="overview"
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-28 pb-32"
    >
      <TextureBackground variant="hero" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <motion.div {...motionProps}>
          <Logo variant="hero" animate />
        </motion.div>

        <motion.h1
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 24 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
              })}
          className="mt-12 text-4xl font-medium leading-[1.15] tracking-tight text-text sm:text-5xl md:text-6xl"
        >
          {site.tagline}
        </motion.h1>

        <motion.p
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 24 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
              })}
          className="mt-8 max-w-xl text-lg leading-relaxed text-muted md:text-xl"
        >
          {site.description}
        </motion.p>

        <motion.div
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] },
              })}
          className="mt-14 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton href="/products" variant="primary">
            Explore
          </MagneticButton>
          <MagneticButton href="#contact" variant="secondary">
            Contact
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
