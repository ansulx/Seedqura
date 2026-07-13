"use client";

import { motion } from "framer-motion";
import { getSiteData } from "@/lib/data";
import { Logo } from "@/components/ui/Logo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TextureBackground } from "@/components/effects/TextureBackground";
import { FloatingOrb } from "@/components/effects/FloatingOrb";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const site = getSiteData();

  return (
    <section
      id="overview"
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-28 pb-32"
      style={{ perspective: 1200 }}
    >
      <TextureBackground variant="hero" />
      <FloatingOrb className="z-[1] opacity-90" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, ease }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <Logo variant="hero" animate />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease }}
          className="mt-12 text-4xl font-medium leading-[1.15] tracking-tight text-text sm:text-5xl md:text-6xl"
        >
          {site.tagline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22, ease }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-muted md:text-xl"
        >
          {site.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34, ease }}
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
