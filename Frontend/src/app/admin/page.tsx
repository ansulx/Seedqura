"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch, type Stats } from "@/lib/admin";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await adminFetch("stats");
      if (!res.ok) {
        setError(res.error || "Failed to load stats");
        return;
      }
      setStats(res.stats);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    {
      label: "Applications",
      value: stats?.applications ?? "—",
      href: "/admin/applications",
      hint: "Review & manage applicants",
    },
    {
      label: "Paid / active",
      value: stats?.paid ?? "—",
      href: "/admin/applications?status=paid",
      hint: "Completed payments",
    },
    {
      label: "Students",
      value: stats?.students ?? "—",
      href: "/admin/students",
      hint: "Registered student accounts",
    },
    {
      label: "Active enrollments",
      value: stats?.activeEnrollments ?? "—",
      href: "/admin/students?enrollment_status=active",
      hint: "Current course seats",
    },
  ];

  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight text-text">Overview</h1>
      <p className="mt-2 text-muted">
        Snapshot of applications, payments, and student enrollments.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="glass-card block p-5 transition hover:-translate-y-0.5"
          >
            <p className="text-xs uppercase tracking-widest text-muted">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-medium text-text">{card.value}</p>
            <p className="mt-3 text-xs text-muted">{card.hint}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Students",
            body: "See who is registered, filter by course, and export CSV.",
            href: "/admin/students",
          },
          {
            title: "Applications",
            body: "Review pending payments, notes, and application status.",
            href: "/admin/applications",
          },
          {
            title: "Courses",
            body: "Check payable courses and pricing used for enrollments.",
            href: "/admin/courses",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-2xl border border-black/5 bg-white p-5 hover:border-accent/30"
          >
            <h2 className="text-lg font-medium text-text">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
            <span className="mt-4 inline-block text-sm text-accent">
              Open →
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
