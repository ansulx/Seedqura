"use client";

import { motion } from "framer-motion";
import { getSiteData } from "@/lib/data";
import { Logo } from "@/components/ui/Logo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TextureBackground } from "@/components/effects/TextureBackground";

export function Hero() {
  const site = getSiteData();

  return (
    <section
      id="overview"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-24 pb-32"
    >
      <TextureBackground variant="hero" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Logo variant="hero" animate />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 text-3xl font-medium leading-[1.2] tracking-tight text-text sm:text-4xl md:text-5xl lg:text-[3.25rem]"
        >
          {site.tagline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg"
        >
          {site.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton href="#products" variant="primary">
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
