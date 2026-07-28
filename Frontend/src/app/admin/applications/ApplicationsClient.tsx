"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  adminFetch,
  courseLabel,
  downloadCsv,
  type Application,
  type CourseOption,
} from "@/lib/admin";

export default function AdminApplicationsPage() {
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [courseId, setCourseId] = useState(
    searchParams.get("course_id") || ""
  );
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (courseId) params.set("course_id", courseId);
      if (q) params.set("q", q);

      const [a, c] = await Promise.all([
        adminFetch(`applications?${params.toString()}`),
        adminFetch("courses"),
      ]);
      if (!a.ok) {
        setError(a.error || "Failed to load applications");
        return;
      }
      setApplications(a.applications || []);
      if (c.ok) setCourses(c.courses || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [status, courseId, q]);

  useEffect(() => {
    load();
  }, [load]);

  const courseOptions = useMemo(
    () =>
      courses.length
        ? courses
        : [
            { id: "academy", name: "Seedqura Academy" },
            { id: "crop-vision", name: "Crop Vision with PyTorch" },
            { id: "clinical-ai", name: "Clinical AI Fundamentals" },
          ],
    [courses]
  );

  async function updateApplication(id: string, patch: Record<string, string>) {
    const res = await adminFetch(`applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      setError(res.error || "Update failed");
      return;
    }
    setSelected(null);
    await load();
  }

  function exportCsv() {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `seedqura-applications-${stamp}.csv`,
      [
        "Name",
        "Email",
        "Phone",
        "Institution",
        "Year",
        "Interest",
        "Course",
        "Course ID",
        "Status",
        "Applied At",
        "Statement",
        "Portfolio",
        "Admin Notes",
      ],
      applications.map((a) => [
        a.name,
        a.email,
        a.phone,
        a.institution || "",
        a.year || "",
        a.interest || "",
        courseLabel(a.courses),
        a.course_id,
        a.status,
        a.created_at,
        a.statement || "",
        a.portfolio || "",
        a.admin_notes || "",
      ])
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-text">
            Applications
          </h1>
          <p className="mt-2 text-muted">
            Review applicants, update status, and export filtered lists.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5"
        >
          Export CSV
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          className="input-premium !py-2"
          placeholder="Search name / email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input-premium !py-2"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="">All courses</option>
          {courseOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="input-premium !py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="payment_pending">Payment pending</option>
          <option value="paid">Paid</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-black/5 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/5 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Institution</th>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-text">{a.name}</div>
                  <div className="text-muted">{a.email}</div>
                </td>
                <td className="px-4 py-3 text-muted">{a.phone}</td>
                <td className="px-4 py-3 text-muted">{a.institution || "—"}</td>
                <td className="px-4 py-3">{courseLabel(a.courses)}</td>
                <td className="px-4 py-3 capitalize">
                  {a.status.replaceAll("_", " ")}
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(a.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-accent hover:underline"
                    onClick={() => {
                      setSelected(a);
                      setNotes(a.admin_notes || "");
                    }}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-muted">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-medium text-text">{selected.name}</h3>
            <p className="mt-1 text-sm text-muted">
              {selected.email} · {selected.phone}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Institution", selected.institution || "—"],
                ["Year", selected.year || "—"],
                ["Interest", selected.interest || "—"],
                ["Course", courseLabel(selected.courses)],
                ["Status", selected.status.replaceAll("_", " ")],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right capitalize">{value}</dd>
                </div>
              ))}
            </dl>
            {selected.statement && (
              <p className="mt-4 text-sm text-text/90">{selected.statement}</p>
            )}
            <label className="mt-4 block text-xs font-medium uppercase tracking-widest text-muted">
              Admin notes
            </label>
            <textarea
              className="input-premium mt-1"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full bg-accent px-4 py-2 text-sm text-white"
                onClick={() =>
                  updateApplication(selected.id, {
                    status: "active",
                    admin_notes: notes,
                  })
                }
              >
                Mark active
              </button>
              <button
                type="button"
                className="rounded-full bg-black/80 px-4 py-2 text-sm text-white"
                onClick={() =>
                  updateApplication(selected.id, {
                    status: "rejected",
                    admin_notes: notes,
                  })
                }
              >
                Reject
              </button>
              <button
                type="button"
                className="rounded-full border border-black/10 px-4 py-2 text-sm"
                onClick={() =>
                  updateApplication(selected.id, { admin_notes: notes })
                }
              >
                Save notes
              </button>
              <button
                type="button"
                className="ml-auto text-sm text-muted hover:text-text"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
