"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

const timeline = [
  { year: "2022", title: "Founded", desc: "Resync began with a vision to bridge agriculture and healthcare through AI." },
  { year: "2023", title: "Research Labs", desc: "Launched computer vision and remote sensing research initiatives." },
  { year: "2024", title: "Pilot Programs", desc: "Deployed AI pilots with hospitals and agricultural institutes." },
  { year: "2025", title: "Resync Academy", desc: "Mentorship program training next-generation AI researchers." },
  { year: "2026", title: "Global Scale", desc: "Expanding partnerships across India and international markets." },
];

const values = [
  { title: "Innovation", desc: "Pushing boundaries of AI for real-world impact." },
  { title: "Integrity", desc: "Evidence-based, ethical, and transparent research." },
  { title: "Impact", desc: "Solutions that improve lives and food security." },
];

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(value / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className="font-heading text-4xl font-bold text-green md:text-5xl">
      {count}
      {suffix}
    </span>
  );
}

export function About() {
  return (
    <section id="about" className="section-light relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          light
          label="About Resync"
          title="Building the Future of Intelligent Systems"
          subtitle="We combine machine learning, computer vision, and domain expertise to solve humanity's greatest challenges in farming and medicine."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { val: 100, suffix: "+", label: "Projects" },
            { val: 95, suffix: "%", label: "Model Accuracy" },
            { val: 50, suffix: "+", label: "Partners" },
          ].map((stat) => (
            <ScrollReveal key={stat.label}>
              <div className="glass-light rounded-[24px] p-8 text-center">
                <Counter value={stat.val} suffix={stat.suffix} />
                <p className="font-sub mt-2 text-sm font-medium text-muted">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <h3 className="font-heading mb-8 text-2xl font-bold text-navy">Our Journey</h3>
            <div className="relative space-y-0 border-l-2 border-green/30 pl-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pb-10 last:pb-0"
                >
                  <span className="absolute -left-[41px] flex h-5 w-5 items-center justify-center rounded-full bg-green shadow-lg shadow-green/30">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                  <p className="font-sub text-xs font-bold uppercase tracking-widest text-green">
                    {item.year}
                  </p>
                  <h4 className="font-heading mt-1 text-lg font-semibold text-navy">{item.title}</h4>
                  <p className="mt-1 text-sm text-muted">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="gradient-border glass-light rounded-[24px] p-8">
              <h3 className="font-heading mb-4 text-2xl font-bold text-navy">Mission</h3>
              <p className="text-muted leading-relaxed">
                To build intelligent AI-powered solutions that improve agricultural productivity,
                food security, and healthcare through data-driven technologies.
              </p>
              <h3 className="font-heading mb-4 mt-8 text-2xl font-bold text-navy">Vision</h3>
              <p className="text-muted leading-relaxed">
                To become the trusted AI partner for governments, hospitals, universities, and
                agritech companies worldwide.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {values.map((v) => (
                  <div key={v.title} className="rounded-2xl bg-white/80 p-4">
                    <p className="font-heading text-sm font-semibold text-navy">{v.title}</p>
                    <p className="mt-1 text-xs text-muted">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
