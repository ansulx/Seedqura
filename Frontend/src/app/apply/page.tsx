import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ApplyForm } from "@/components/forms/ApplyForm";

export const metadata: Metadata = {
  title: "Apply — Resync Academy",
  description:
    "Apply to Resync Academy — a research mentorship program in AI for agriculture and healthcare.",
};

export default function ApplyPage() {
  return (
    <>
      <Header homeHref="/" />
      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <p className="font-sub mb-3 text-xs font-semibold uppercase tracking-widest text-green">
            Resync Academy
          </p>
          <h1 className="font-heading text-3xl font-bold text-white md:text-5xl">
            Apply to Resync Academy
          </h1>
          <p className="font-sub mt-4 text-lg text-white/60">
            Join our research mentorship program in AI for agriculture and healthcare.
          </p>
          <div className="gradient-border glass mt-10 rounded-[24px] p-6 md:p-8">
            <ApplyForm />
          </div>
          <Link
            href="/"
            className="mt-6 inline-flex items-center text-sm font-medium text-green hover:text-emerald transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
