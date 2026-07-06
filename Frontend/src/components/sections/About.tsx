"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { TextureBackground } from "@/components/effects/TextureBackground";

const principles = [
  {
    title: "Research-first",
    description:
      "Rigorous, publication-oriented work backed by evidence — not marketing claims.",
  },
  {
    title: "Dual vertical",
    description:
      "Intelligent systems for agriculture and precision medicine, built with equal depth.",
  },
  {
    title: "Deployment-ready",
    description:
      "From lab to field to hospital — prototypes designed for real-world integration.",
  },
];

export function About() {
  return (
    <section id="about" className="section-padding relative">
      <div className="section-divider mb-24">
        <TextureBackground variant="divider" className="!absolute !inset-0 !h-full" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="About"
          title="Building intelligent systems for the real world"
          subtitle="Resync is a research-focused technology company applying AI to agriculture and precision medicine — combining machine learning, computer vision, and domain expertise."
          align="center"
        />

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {principles.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <GlassCard title={item.title} description={item.description} />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-20">
          <div className="glass-card mx-auto max-w-3xl p-10 text-center md:p-14">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent">
              Mission
            </p>
            <p className="mt-6 text-xl leading-relaxed text-text md:text-2xl">
              To develop intelligent, evidence-based AI that improves outcomes in
              agriculture and healthcare through research and engineering excellence.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
