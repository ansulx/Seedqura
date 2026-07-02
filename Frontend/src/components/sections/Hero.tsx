"use client";

import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedWords } from "@/components/motion/AnimatedWords";
import { HeroGlobe } from "@/components/hero/HeroGlobe";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Hero() {
  return (
    <section
      id="overview"
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-20"
    >
      <div className="noise-overlay absolute inset-0" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-sub mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium uppercase tracking-widest text-green"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
            AgriTech · HealthTech · AI
          </motion.p>

          <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            <AnimatedWords text="Where AI Meets" />
            <br />
            <AnimatedWords text="Agriculture & Healthcare" highlightFrom={0} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-sub mt-6 max-w-xl text-lg leading-relaxed text-white/60 md:text-xl"
          >
            Resync is building intelligent technologies that transform agriculture and
            healthcare using Artificial Intelligence, Computer Vision, IoT, Remote Sensing,
            and Advanced Analytics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <MagneticButton href="#products" variant="primary">
              Explore Solutions
            </MagneticButton>
            <MagneticButton href="#contact" variant="secondary">
              Request Demo
            </MagneticButton>
            <MagneticButton href="#workflow" variant="ghost">
              <Play className="h-4 w-4" />
              Watch Video
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroGlobe />
        </motion.div>
      </div>
    </section>
  );
}
