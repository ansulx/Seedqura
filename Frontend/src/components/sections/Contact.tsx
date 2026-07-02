"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { getSiteData } from "@/lib/data";

export function Contact() {
  const site = getSiteData();

  return (
    <section id="contact" className="section-dark relative py-24 md:py-32">
      <div className="noise-overlay absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Contact"
          title="Let's Build the Future Together"
          subtitle="Partner with us on research, pilots, or enterprise AI deployments."
          align="center"
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-5">
          <ScrollReveal className="lg:col-span-2 space-y-6">
            <div className="gradient-border glass overflow-hidden rounded-2xl">
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-green/10 to-blue/10">
                <div className="text-center">
                  <MapPin className="mx-auto h-8 w-8 text-green" />
                  <p className="mt-2 text-sm font-medium text-white">India · Global Operations</p>
                  <p className="text-xs text-white/40">Interactive map</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
                { icon: Phone, label: "Phone", value: site.phone },
                { icon: MapPin, label: "Location", value: site.location },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="glass flex items-start gap-4 rounded-2xl p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green/20">
                    <Icon className="h-5 w-5 text-green" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-white/40">{label}</p>
                    {href ? (
                      <a href={href} className="mt-1 block font-medium text-green hover:underline">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 font-medium text-white">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" className="lg:col-span-3">
            <div className="gradient-border glass rounded-[24px] p-6 md:p-8">
              <ContactForm />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
