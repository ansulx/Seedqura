import Link from "next/link";
import { getSiteData } from "@/lib/data";
import { Logo } from "@/components/ui/Logo";
import { TextureBackground } from "@/components/effects/TextureBackground";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "Technology", href: "#technology" },
  { label: "Products", href: "#products" },
  { label: "Research", href: "#research" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  const site = getSiteData();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] pt-24 pb-10">
      <TextureBackground variant="footer" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Logo href="/" variant="footer" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              {site.tagline}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Navigation
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-text"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-accent transition-colors">
                  {site.email}
                </a>
              </li>
              <li>{site.location}</li>
              <li>
                <Link href="/apply" className="hover:text-accent transition-colors">
                  Apply to Academy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/[0.06] pt-8">
          <p className="text-center text-sm text-muted">
            © {year} {site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
