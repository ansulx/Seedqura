import Link from "next/link";
import { Globe, Mail, Share2 } from "lucide-react";
import { getSiteData } from "@/lib/data";
import { Logo } from "@/components/ui/Logo";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Products", href: "#products" },
  { label: "Research", href: "#research" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  const site = getSiteData();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#050816] pt-20 pb-8">
      {/* Animated wave */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green/50 to-transparent" />
      <svg
        className="absolute top-0 w-full opacity-20"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,40 1440,30 L1440,0 L0,0 Z"
          fill="url(#waveGrad)"
        />
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo href="/" variant="footer" />
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Connecting Agriculture &amp; Healthcare through Artificial Intelligence.
            </p>
            <div className="mt-6 flex gap-3">
              {[Share2, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href={i === 2 ? `mailto:${site.email}` : site.social.linkedin || "#"}
                  className="flex h-10 w-10 items-center justify-center rounded-xl glass text-white/50 transition-colors hover:text-green"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-sub mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/60 hover:text-green transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sub mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              Products
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="/apply" className="hover:text-green transition-colors">
                  Resync Academy
                </Link>
              </li>
              <li>Research Pilots</li>
              <li>AI Platform</li>
              <li>Dataset Services</li>
            </ul>
          </div>

          <div>
            <h4 className="font-sub mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              Newsletter
            </h4>
            <p className="text-sm text-white/50">Stay updated on AI research and product launches.</p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-green/50"
              />
              <button
                type="button"
                className="rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">
            © {year} Resync. All Rights Reserved.
          </p>
          <p className="text-xs text-white/30">
            AgriTech · HealthTech · AI · Computer Vision · IoT
          </p>
        </div>
      </div>
    </footer>
  );
}
