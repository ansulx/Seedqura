"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/courses", label: "Courses" },
] as const;

function navActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg,#f6f5f2)]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-6">
            <Logo href="/" variant="header" />
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => {
                const active = navActive(pathname, item.href, "exact" in item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                      active
                        ? "bg-accent text-white"
                        : "text-muted hover:bg-black/5 hover:text-text"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium uppercase tracking-widest text-accent sm:inline">
              Admin
            </span>
            <button
              type="button"
              onClick={signOut}
              className="text-sm text-muted hover:text-text"
            >
              Sign out
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-black/5 px-4 py-2 md:hidden">
          {NAV.map((item) => {
            const active = navActive(pathname, item.href, "exact" in item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                  active
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-black/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
