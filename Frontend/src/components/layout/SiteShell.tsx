"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/motion/PageTransition";

const pageLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Research", href: "/research" },
];

type SiteShellProps = {
  children: React.ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const contactHref =
    pathname === "/" ? "#contact" : "/#contact";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6">
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 sm:px-6 ${
            scrolled ? "glass-light shadow-lg" : "bg-transparent"
          }`}
        >
          <Logo href="/" variant="header" />

          <nav className="hidden items-center gap-1 lg:flex">
            {pageLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <MagneticButton
              href="/apply"
              variant="secondary"
              className="!min-h-10 !px-5 !py-2 !text-xs"
            >
              Apply
            </MagneticButton>
            <MagneticButton
              href={contactHref}
              variant="primary"
              className="!min-h-10 !px-5 !py-2 !text-xs"
            >
              Contact
            </MagneticButton>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl glass-light lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X className="h-5 w-5 text-text" />
            ) : (
              <Menu className="h-5 w-5 text-text" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="mx-auto mt-2 max-w-6xl rounded-2xl glass-light p-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {pageLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-4 py-3 text-sm ${
                      isActive ? "bg-white/60 text-text" : "text-muted hover:text-text"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-2 flex flex-col gap-2 px-2">
                <MagneticButton href="/apply" variant="secondary" className="w-full">
                  Apply
                </MagneticButton>
                <MagneticButton href={contactHref} variant="primary" className="w-full">
                  Contact
                </MagneticButton>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>

      <Footer />
    </>
  );
}
