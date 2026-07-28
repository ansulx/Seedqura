"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { createClient } from "@/lib/supabase/client";

type StudentData = {
  profile: {
    full_name: string;
    email?: string;
    phone?: string;
    institution?: string;
    role: string;
  } | null;
  enrollments: Array<{
    id: string;
    status: string;
    enrolled_at: string;
    course_id: string;
    courses:
      | { id: string; name: string; tagline?: string; duration?: string; format?: string; price_display?: string }
      | Array<{ id: string; name: string }>;
  }>;
  applications: Array<{
    id: string;
    status: string;
    created_at: string;
    course_id: string;
    courses: { id: string; name: string; price_display?: string } | Array<unknown>;
  }>;
};

function courseName(c: unknown): string {
  if (!c) return "Course";
  if (Array.isArray(c)) return (c[0] as { name?: string })?.name || "Course";
  return (c as { name?: string }).name || "Course";
}

export default function StudentDashboard() {
  const router = useRouter();
  const [data, setData] = useState<StudentData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login?next=/student");
          return;
        }
        const res = await fetch("/api/student/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = await res.json();
        if (!json.ok) {
          if (!cancelled) setError(json.error || "Failed to load");
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Unable to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg,#f6f5f2)]">
      <header className="border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo href="/" variant="header" />
          <div className="flex items-center gap-3">
            <Link href="/products" className="text-sm text-muted hover:text-text">
              Courses
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="text-sm text-muted hover:text-text"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-medium tracking-tight text-text">
          Student dashboard
        </h1>
        {loading && <p className="mt-6 text-muted">Loading...</p>}
        {error && <p className="mt-6 text-red-600">{error}</p>}

        {data && (
          <>
            <p className="mt-3 text-muted">
              Welcome{data.profile?.full_name ? `, ${data.profile.full_name}` : ""}.
            </p>

            <section className="mt-10">
              <h2 className="text-lg font-medium text-text">Your enrollments</h2>
              {data.enrollments.length === 0 ? (
                <div className="glass-card mt-4 p-6">
                  <p className="text-muted">No active enrollments yet.</p>
                  <MagneticButton href="/apply" variant="primary" className="mt-4">
                    Browse courses & apply
                  </MagneticButton>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {data.enrollments.map((e) => (
                    <div key={e.id} className="glass-card p-5">
                      <p className="text-xs uppercase tracking-widest text-accent">
                        {e.status}
                      </p>
                      <h3 className="mt-2 text-xl font-medium text-text">
                        {courseName(e.courses)}
                      </h3>
                      <p className="mt-2 text-sm text-muted">
                        Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-12">
              <h2 className="text-lg font-medium text-text">Applications</h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-black/5 bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-black/5 text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Course</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.applications.map((a) => (
                      <tr key={a.id} className="border-b border-black/5 last:border-0">
                        <td className="px-4 py-3">{courseName(a.courses)}</td>
                        <td className="px-4 py-3 capitalize">{a.status.replace("_", " ")}</td>
                        <td className="px-4 py-3 text-muted">
                          {new Date(a.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {data.applications.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-muted">
                          No applications yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
