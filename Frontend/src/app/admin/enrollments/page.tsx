"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { AdminShell } from "@/components/admin/AdminShell";

type Enrollment = {
  id: string;
  status: string;
  payment_status: string;
  course?: { id: string; name: string } | null;
  profile?: { id: string; full_name: string; email: string | null } | null;
};

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const data = await apiFetch("/admin/enrollments");
    setEnrollments(data.enrollments || []);
  }

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed")
    );
  }, []);

  async function setStatus(id: string, status: string) {
    await apiFetch(`/admin/enrollments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <AdminShell title="Enrollments">
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-[var(--glass-border)] bg-white/40">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--glass-border)] text-muted">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-b border-[var(--glass-border)]">
                <td className="px-4 py-3">
                  <div>{e.profile?.full_name || "—"}</div>
                  <div className="text-xs text-muted">{e.profile?.email}</div>
                </td>
                <td className="px-4 py-3">{e.course?.name}</td>
                <td className="px-4 py-3">{e.status}</td>
                <td className="px-4 py-3">{e.payment_status}</td>
                <td className="px-4 py-3 space-x-3">
                  <button
                    type="button"
                    className="text-accent"
                    onClick={() => setStatus(e.id, "active")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => setStatus(e.id, "rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
