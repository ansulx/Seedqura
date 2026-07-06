"use client";

import { Check } from "lucide-react";
import { getProducts } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Products() {
  const products = getProducts();

  return (
    <section id="products" className="section-padding">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Products"
          title="What we build"
          subtitle="Research mentorship today. Deployment tools tomorrow."
          align="center"
        />

        <div className="mt-20 grid gap-8 lg:grid-cols-2">
          {products.map((product, i) => (
            <ScrollReveal key={product.id} delay={i * 0.12}>
              <div className="glass-card flex h-full flex-col p-8 md:p-10">
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="text-2xl font-medium text-text">{product.name}</h3>
                  {product.status && (
                    <span className="rounded-full border border-accent/30 px-3 py-1 text-xs text-accent">
                      {product.status}
                    </span>
                  )}
                </div>

                <p className="text-muted leading-relaxed">{product.description}</p>

                {product.features.length > 0 && (
                  <ul className="mt-8 space-y-3">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-text/80">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-8">
                  <MagneticButton
                    href={product.cta.href}
                    variant={product.featured ? "primary" : "secondary"}
                  >
                    {product.cta.label}
                  </MagneticButton>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
