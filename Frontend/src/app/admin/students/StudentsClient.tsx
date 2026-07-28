"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  adminFetch,
  courseLabel,
  downloadCsv,
  type CourseOption,
  type Student,
} from "@/lib/admin";

export default function AdminStudentsPage() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [q, setQ] = useState("");
  const [courseId, setCourseId] = useState(
    searchParams.get("course_id") || ""
  );
  const [enrollmentStatus, setEnrollmentStatus] = useState(
    searchParams.get("enrollment_status") || "active"
  );
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (courseId) params.set("course_id", courseId);
      if (enrollmentStatus) params.set("enrollment_status", enrollmentStatus);
      if (q) params.set("q", q);

      const [st, c] = await Promise.all([
        adminFetch(`students?${params.toString()}`),
        adminFetch("courses"),
      ]);
      if (!st.ok) {
        setError(st.error || "Failed to load students");
        return;
      }
      setStudents(st.students || []);
      if (c.ok) setCourses(c.courses || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, [courseId, enrollmentStatus, q]);

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

  async function revokeEnrollment(id: string) {
    await adminFetch(`enrollments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "revoked" }),
    });
    await load();
  }

  function exportCsv() {
    const stamp = new Date().toISOString().slice(0, 10);
    const courseName =
      courseOptions.find((c) => c.id === courseId)?.name ||
      courseId ||
      "all-courses";
    const safeName = courseName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const rows: unknown[][] = [];
    for (const s of students) {
      const enrolls =
        s.enrollments.length > 0
          ? s.enrollments
          : [
              {
                id: "",
                course_id: "",
                status: "",
                enrolled_at: "",
                courses: { name: "" },
              },
            ];
      for (const e of enrolls) {
        rows.push([
          s.full_name,
          s.email,
          s.phone || "",
          s.institution || "",
          s.year || "",
          s.interest || "",
          courseLabel(e.courses),
          e.course_id,
          e.status,
          e.enrolled_at || "",
          s.created_at,
        ]);
      }
    }
    downloadCsv(
      `seedqura-students-${safeName}-${stamp}.csv`,
      [
        "Name",
        "Email",
        "Phone",
        "Institution",
        "Year",
        "Interest",
        "Course",
        "Course ID",
        "Enrollment Status",
        "Enrolled At",
        "Registered At",
      ],
      rows
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-text">
            Students
          </h1>
          <p className="mt-2 text-muted">
            {students.length} registered student
            {students.length === 1 ? "" : "s"}
            {courseId
              ? ` · ${courseOptions.find((c) => c.id === courseId)?.name || courseId}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-full bg-accent px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Export CSV
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          className="input-premium !py-2"
          placeholder="Search name / email / phone"
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
          value={enrollmentStatus}
          onChange={(e) => setEnrollmentStatus(e.target.value)}
        >
          <option value="">All enrollment statuses</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-black/5 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/5 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Institution</th>
              <th className="px-4 py-3 font-medium">Year / Interest</th>
              <th className="px-4 py-3 font-medium">Enrolled courses</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-text">
                    {s.full_name || "—"}
                  </div>
                  <div className="text-muted">{s.email || "—"}</div>
                </td>
                <td className="px-4 py-3 text-muted">{s.phone || "—"}</td>
                <td className="px-4 py-3 text-muted">{s.institution || "—"}</td>
                <td className="px-4 py-3 text-muted">
                  <div>{s.year || "—"}</div>
                  <div>{s.interest || ""}</div>
                </td>
                <td className="px-4 py-3">
                  <ul className="space-y-1">
                    {s.enrollments.map((e) => (
                      <li
                        key={e.id}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <span>
                          {courseLabel(e.courses)}{" "}
                          <span className="text-muted">({e.status})</span>
                        </span>
                        {e.status === "active" && (
                          <button
                            type="button"
                            className="text-xs text-red-600 hover:underline"
                            onClick={() => revokeEnrollment(e.id)}
                          >
                            Revoke
                          </button>
                        )}
                      </li>
                    ))}
                    {s.enrollments.length === 0 && (
                      <span className="text-muted">None</span>
                    )}
                  </ul>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-accent hover:underline"
                    onClick={() => setSelected(s)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-muted">
                  No registered students match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-medium text-text">
              {selected.full_name || "Student"}
            </h3>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Email", selected.email || "—"],
                ["Phone", selected.phone || "—"],
                ["Institution", selected.institution || "—"],
                ["Year", selected.year || "—"],
                ["Interest", selected.interest || "—"],
                [
                  "Registered",
                  new Date(selected.created_at).toLocaleString(),
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
            </dl>

            <h4 className="mt-6 text-xs font-medium uppercase tracking-widest text-muted">
              Enrollments
            </h4>
            <ul className="mt-2 space-y-2 text-sm">
              {selected.enrollments.map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl border border-black/5 px-3 py-2"
                >
                  <div className="font-medium">{courseLabel(e.courses)}</div>
                  <div className="text-muted capitalize">
                    {e.status}
                    {e.enrolled_at
                      ? ` · ${new Date(e.enrolled_at).toLocaleDateString()}`
                      : ""}
                  </div>
                </li>
              ))}
              {selected.enrollments.length === 0 && (
                <li className="text-muted">No enrollments</li>
              )}
            </ul>

            {selected.applications?.[0]?.statement && (
              <>
                <h4 className="mt-6 text-xs font-medium uppercase tracking-widest text-muted">
                  Statement
                </h4>
                <p className="mt-2 text-sm text-text/90">
                  {selected.applications[0].statement}
                </p>
              </>
            )}

            <button
              type="button"
              className="mt-6 text-sm text-muted hover:text-text"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
