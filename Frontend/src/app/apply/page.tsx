import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { TextureBackground } from "@/components/effects/TextureBackground";

export const metadata: Metadata = {
  title: "Apply — Resync Academy",
  description:
    "Apply to Resync Academy — a research mentorship program in AI for agriculture and precision medicine.",
};

export default function ApplyPage() {
  return (
    <>
      <Header homeHref="/" />
      <main className="relative flex-1 pt-28 pb-20">
        <TextureBackground variant="hero" className="!h-[60vh]" />
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Resync Academy
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-text md:text-5xl">
            Apply to Resync Academy
          </h1>
          <p className="mt-4 text-lg text-muted">
            Join our research mentorship program in AI for agriculture and precision medicine.
          </p>
          <div className="glass-card mt-10 p-6 md:p-10">
            <ApplyForm />
          </div>
          <Link
            href="/"
            className="mt-6 inline-flex items-center text-sm text-muted transition-colors hover:text-accent"
          >
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
