"use client";

import { useEffect, useState } from "react";
import { Menu, Moon, Search } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MobileNav } from "./MobileNav";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Platform", href: "#platform" },
  { label: "Products", href: "#products" },
  { label: "Research", href: "#research" },
  { label: "Contact", href: "#contact" },
];

type HeaderProps = {
  homeHref?: string;
};

export function Header({ homeHref = "/" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logoHref = homeHref;
  const anchorPrefix = homeHref === "/" ? "/" : "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300 sm:px-6 ${
          scrolled
            ? "border-slate-200/80 bg-white/95 shadow-lg shadow-black/10 backdrop-blur-xl"
            : "border-white/60 bg-white/90 shadow-md shadow-black/5 backdrop-blur-xl"
        }`}
      >
        <Logo href={logoHref} variant="header" />

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={`${anchorPrefix}${link.href}`}
              className="rounded-xl px-3 py-2 text-sm font-medium text-[#071A2B]/75 transition-colors hover:bg-[#071A2B]/5 hover:text-[#071A2B]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#071A2B]/50 transition-colors hover:bg-[#071A2B]/5 hover:text-[#071A2B]"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#071A2B]/50 transition-colors hover:bg-[#071A2B]/5 hover:text-[#071A2B]"
            aria-label="Toggle theme"
          >
            <Moon className="h-4 w-4" />
          </button>
          <MagneticButton
            href={`${anchorPrefix}#contact`}
            variant="primary"
            className="!min-h-10 !px-5 !py-2 !text-xs"
          >
            Request Demo
          </MagneticButton>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-[#071A2B]" />
        </button>
      </div>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={navLinks}
        anchorPrefix={anchorPrefix}
      />
    </header>
  );
}
