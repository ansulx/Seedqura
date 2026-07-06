"use client";

import { ContactForm } from "@/components/forms/ContactForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { getSiteData } from "@/lib/data";

export function Contact() {
  const site = getSiteData();

  return (
    <section id="contact" className="section-padding relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Contact"
          title="Let's collaborate"
          subtitle="Research partnerships, pilot programs, or Academy inquiries — we'd like to hear from you."
          align="center"
        />

        <div className="mt-20 grid gap-12 lg:grid-cols-5">
          <ScrollReveal className="lg:col-span-2 space-y-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Email
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-2 block text-lg text-text transition-colors hover:text-accent"
              >
                {site.email}
              </a>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                Location
              </p>
              <p className="mt-2 text-lg text-text">{site.location}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" className="lg:col-span-3">
            <div className="glass-card p-6 md:p-10">
              <ContactForm />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
