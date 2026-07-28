import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { TextureBackground } from "@/components/effects/TextureBackground";
import { fetchCourses, filterPayable } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Apply — Seedqura",
  description:
    "Apply and enroll in Seedqura courses — AI for agriculture and precision medicine.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ course?: string }>;
};

export default async function ApplyPage({ searchParams }: Props) {
  const params = await searchParams;
  const all = await fetchCourses();
  const payable = filterPayable(all);
  const requested = params.course
    ? all.find((c) => c.id === params.course)
    : undefined;
  const course =
    requested && typeof requested.price === "number" && requested.price > 0
      ? requested
      : payable[0];

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-muted">No payable courses are open right now.</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-full flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl glass-light px-4 py-3 sm:px-6">
          <Logo href="/" variant="header" />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted transition-colors hover:text-text"
            >
              Login
            </Link>
            <Link
              href="/products"
              className="text-sm text-muted transition-colors hover:text-text"
            >
              ← Courses
            </Link>
          </div>
        </div>
      </header>

      <main className="relative flex-1 pt-28 pb-20">
        <TextureBackground variant="hero" className="!h-[50vh]" />
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Enrollment
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-text md:text-5xl">
            Apply to {course.name}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            {course.description}
          </p>
          <p className="mt-4 text-base text-text">
            Fee: <span className="font-medium">{course.priceDisplay}</span>
          </p>
          <div className="glass-card mt-12 p-6 md:p-10">
            <ApplyForm course={course} payableCourses={payable} />
          </div>
        </div>
      </main>
    </div>
  );
}
