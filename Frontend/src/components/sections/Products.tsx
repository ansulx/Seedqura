"use client";

import { Check, Laptop, Monitor, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { getProducts } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

const devices = [
  { icon: Monitor, label: "Desktop" },
  { icon: Laptop, label: "Laptop" },
  { icon: Smartphone, label: "Mobile" },
];

export function Products() {
  const products = getProducts();

  return (
    <section id="products" className="section-dark relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Products"
          title="Innovative Solutions Built for Impact"
          subtitle="Research mentorship and deployment tools — accessible across every device."
          align="center"
        />

        <div className="mt-10 flex justify-center gap-6">
          {devices.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-white/40">
              <Icon className="h-6 w-6" />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {products.map((product, i) => (
            <ScrollReveal key={product.id} delay={i * 0.15}>
              <motion.div
                whileHover={{ y: -8 }}
                className="gradient-border glass group relative overflow-hidden rounded-[24px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green/5 via-transparent to-blue/5 opacity-0 transition-opacity group-hover:opacity-100" />

                {/* Device mockup frame */}
                <div className="border-b border-white/10 bg-gradient-to-b from-white/10 to-transparent p-6 pb-0">
                  <div className="mx-auto max-w-sm overflow-hidden rounded-t-xl border border-b-0 border-white/20 bg-[#071A2B] shadow-2xl">
                    <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                      <span className="h-2 w-2 rounded-full bg-red-400/80" />
                      <span className="h-2 w-2 rounded-full bg-yellow-400/80" />
                      <span className="h-2 w-2 rounded-full bg-green/80" />
                    </div>
                    <div className="flex aspect-video items-center justify-center">
                      <span className="font-heading text-sm text-white/30">{product.name} Preview</span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h3 className="font-heading text-2xl font-bold text-white">{product.name}</h3>
                    {product.status && (
                      <span className="rounded-full bg-green/20 px-3 py-1 text-xs font-semibold text-green">
                        {product.status}
                      </span>
                    )}
                  </div>
                  <p className="text-white/60">{product.description}</p>
                  {product.features.length > 0 && (
                    <ul className="mt-5 space-y-2">
                      {product.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                          <Check className="h-4 w-4 text-green" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-6">
                    <MagneticButton href={product.cta.href} variant={product.featured ? "primary" : "ghost"}>
                      {product.cta.label}
                    </MagneticButton>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
