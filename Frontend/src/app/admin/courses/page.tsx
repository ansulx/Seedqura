"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin";

type AdminCourse = {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  category?: string;
  level?: string;
  duration?: string;
  format?: string;
  price?: number | null;
  price_inr?: number | null;
  currency?: string;
  priceDisplay?: string;
  price_display?: string | null;
  status?: string;
  featured?: boolean;
  features?: string[];
};

const emptyForm = {
  id: "",
  name: "",
  tagline: "",
  description: "",
  category: "Course",
  level: "Intermediate",
  duration: "",
  format: "",
  price_inr: "",
  currency: "INR",
  price_display: "",
  status: "Open",
  featured: false,
  features: "",
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch("courses");
      if (!res.ok) {
        setError(res.error || "Failed to load courses");
        return;
      }
      setCourses(res.courses || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(c: AdminCourse) {
    setEditingId(c.id);
    setForm({
      id: c.id,
      name: c.name || "",
      tagline: c.tagline || "",
      description: c.description || "",
      category: c.category || "Course",
      level: c.level || "",
      duration: c.duration || "",
      format: c.format || "",
      price_inr:
        c.price_inr != null
          ? String(c.price_inr)
          : c.price != null
            ? String(c.price)
            : "",
      currency: c.currency || "INR",
      price_display: c.price_display || c.priceDisplay || "",
      status: c.status || "Open",
      featured: Boolean(c.featured),
      features: (c.features || []).join("\n"),
    });
    setShowForm(true);
  }

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      id: form.id.trim() || undefined,
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      category: form.category,
      level: form.level.trim(),
      duration: form.duration.trim(),
      format: form.format.trim(),
      price_inr: form.price_inr === "" ? null : Number(form.price_inr),
      currency: form.currency,
      price_display: form.price_display.trim() || undefined,
      status: form.status.trim(),
      featured: form.featured,
      features: form.features,
    };

    try {
      const res = editingId
        ? await adminFetch(`courses/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await adminFetch("courses", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        setError(res.error || "Save failed");
        setSaving(false);
        return;
      }
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCourse(id: string, name: string) {
    if (
      !confirm(
        `Delete “${name}”? This only works if no applications or enrollments exist.`
      )
    ) {
      return;
    }
    const res = await adminFetch(`courses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(res.error || "Delete failed");
      return;
    }
    await load();
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-text">
            Courses
          </h1>
          <p className="mt-2 text-muted">
            Add, edit, or remove courses. Changes appear on the public site and
            apply flow immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-accent px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Add course
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {courses.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-black/5 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium text-text">{c.name}</h2>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted">
                  {c.id}
                  {c.featured ? " · Featured" : ""}
                </p>
              </div>
              <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-muted">
                {c.status || "—"}
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-muted">
              {c.tagline || c.description || "—"}
            </p>
            <p className="mt-4 text-2xl font-medium text-text">
              {c.priceDisplay ||
                c.price_display ||
                (c.price_inr != null ? `₹${c.price_inr}` : "—")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                className="text-accent hover:underline"
                onClick={() => openEdit(c)}
              >
                Edit
              </button>
              <Link
                href={`/admin/students?course_id=${c.id}`}
                className="text-accent hover:underline"
              >
                Students
              </Link>
              <Link
                href={`/admin/applications?course_id=${c.id}`}
                className="text-accent hover:underline"
              >
                Applications
              </Link>
              <button
                type="button"
                className="text-red-600 hover:underline"
                onClick={() => deleteCourse(c.id, c.name)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && !error && (
          <p className="text-muted">No courses yet. Add your first course.</p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <form
            onSubmit={saveCourse}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-xl font-medium text-text">
              {editingId ? "Edit course" : "Add course"}
            </h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {!editingId && (
                <label className="block text-sm sm:col-span-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-muted">
                    Course ID (slug)
                  </span>
                  <input
                    className="input-premium mt-1"
                    value={form.id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, id: e.target.value }))
                    }
                    placeholder="auto from name if empty"
                  />
                </label>
              )}
              <label className="block text-sm sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Name
                </span>
                <input
                  className="input-premium mt-1"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Tagline
                </span>
                <input
                  className="input-premium mt-1"
                  value={form.tagline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tagline: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Description
                </span>
                <textarea
                  className="input-premium mt-1"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Category
                </span>
                <select
                  className="input-premium mt-1"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  <option>Program</option>
                  <option>Course</option>
                  <option>Partnership</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Level
                </span>
                <input
                  className="input-premium mt-1"
                  value={form.level}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, level: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Duration
                </span>
                <input
                  className="input-premium mt-1"
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: e.target.value }))
                  }
                  placeholder="6 weeks"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Format
                </span>
                <input
                  className="input-premium mt-1"
                  value={form.format}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, format: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Price (INR)
                </span>
                <input
                  className="input-premium mt-1"
                  type="number"
                  min={0}
                  value={form.price_inr}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price_inr: e.target.value }))
                  }
                  placeholder="Leave empty = not payable"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Price display
                </span>
                <input
                  className="input-premium mt-1"
                  value={form.price_display}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price_display: e.target.value }))
                  }
                  placeholder="Auto from price if empty"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Status
                </span>
                <input
                  className="input-premium mt-1"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                  placeholder="Open / Coming Soon / Now Enrolling"
                />
              </label>
              <label className="mt-6 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, featured: e.target.checked }))
                  }
                />
                Featured on homepage
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Features (one per line)
                </span>
                <textarea
                  className="input-premium mt-1"
                  rows={4}
                  value={form.features}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, features: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-accent px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Create course"}
              </button>
              <button
                type="button"
                className="rounded-full border border-black/10 px-4 py-2 text-sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
