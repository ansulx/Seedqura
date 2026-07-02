"use client";

import { BookOpen, Database, FileText, FlaskConical, Code, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

const categories = [
  { icon: FileText, label: "Publications", count: 24 },
  { icon: Layers, label: "Datasets", count: 18 },
  { icon: FlaskConical, label: "Research", count: 32 },
  { icon: BookOpen, label: "Case Studies", count: 12 },
  { icon: Database, label: "Projects", count: 45 },
  { icon: Code, label: "Open Source", count: 8 },
];

const research = [
  { icon: FileText, year: "2025", title: "Crop Disease Detection via Multispectral CV", type: "Publication", venue: "IEEE CVPR Workshop" },
  { icon: FlaskConical, year: "2025", title: "Medical Imaging AI for Tertiary Hospitals", type: "Research", venue: "ICML Healthcare Track" },
  { icon: Layers, year: "2024", title: "Agricultural Remote Sensing Dataset v2", type: "Dataset", venue: "50K annotated images" },
  { icon: FileText, year: "2024", title: "IoT-Enabled Precision Irrigation Systems", type: "Publication", venue: "Nature Digital Agriculture" },
  { icon: FlaskConical, year: "2024", title: "Healthcare NLP for Clinical Pathways", type: "Research", venue: "NeurIPS ML4H" },
  { icon: Layers, year: "2023", title: "Drone Analytics Benchmark Suite", type: "Dataset", venue: "Open benchmark" },
];

const timeline = [
  { year: "2023", event: "Founded Resync research lab" },
  { year: "2024", event: "First hospital AI pilot deployed" },
  { year: "2024", event: "Agricultural dataset v2 released" },
  { year: "2025", event: "Resync Academy launched" },
  { year: "2026", event: "40+ institutional partners" },
];

export function Research() {
  return (
    <section id="research" className="section-light py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          light
          label="Research & Innovation"
          title="Premium Publication Center"
          subtitle="Research papers, datasets, case studies, and open-source contributions."
          align="center"
        />

        <div className="mt-12 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.label} delay={i * 0.05}>
              <motion.div whileHover={{ y: -4 }} className="glass-light rounded-2xl p-4 text-center">
                <cat.icon className="mx-auto h-5 w-5 text-green" />
                <p className="font-heading mt-2 text-xl font-bold text-navy">{cat.count}</p>
                <p className="text-xs text-muted">{cat.label}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="font-heading mb-6 text-xl font-bold text-navy">Latest Research</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {research.map((item, i) => (
                <ScrollReveal key={item.title} delay={i * 0.06}>
                  <motion.div whileHover={{ scale: 1.02 }} className="glass-light group rounded-2xl p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <item.icon className="h-5 w-5 text-green" />
                      <span className="rounded-full bg-green/10 px-2 py-0.5 text-xs font-medium text-emerald">{item.type}</span>
                    </div>
                    <p className="text-xs font-bold text-muted">{item.year} · {item.venue}</p>
                    <h4 className="font-heading mt-1 text-sm font-semibold text-navy group-hover:text-green transition-colors">{item.title}</h4>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading mb-6 text-xl font-bold text-navy">Innovation Timeline</h3>
            <div className="border-l-2 border-green/30 pl-6">
              {timeline.map((t, i) => (
                <motion.div
                  key={`${t.year}-${t.event}`}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pb-6 last:pb-0"
                >
                  <span className="absolute -left-[31px] h-3 w-3 rounded-full bg-green" />
                  <p className="text-xs font-bold text-green">{t.year}</p>
                  <p className="mt-1 text-sm text-muted">{t.event}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
