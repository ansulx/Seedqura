"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { postJson } from "@/lib/api";
import type { Course } from "@/lib/courses";

const yearOptions = [
  "1st Year UG",
  "2nd Year UG",
  "3rd Year UG",
  "4th Year UG",
  "Postgraduate",
  "Graduate / Other",
];

const interestOptions = ["Agriculture AI", "Medical AI", "Both"];

type FormState = {
  name: string;
  email: string;
  phone: string;
  institution: string;
  year: string;
  portfolio: string;
  interest: string;
  statement: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type ApplyFormProps = {
  course: Course;
  payableCourses: Course[];
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (response: unknown) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function ApplyForm({ course: initialCourse, payableCourses }: ApplyFormProps) {
  const [courseId, setCourseId] = useState(initialCourse.id);
  const course = useMemo(
    () => payableCourses.find((c) => c.id === courseId) || initialCourse,
    [courseId, payableCourses, initialCourse]
  );

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    institution: "",
    year: "",
    portfolio: "",
    interest: "",
    statement: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<"paid" | "submitted" | null>(null);
  const [formError, setFormError] = useState("");
  const [applicationId, setApplicationId] = useState<string | null>(null);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email.";
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) {
      next.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (form.institution.trim().length < 2) {
      next.institution = "Institution is required.";
    }
    if (!form.year) next.year = "Please select your year/level.";
    if (!form.interest) next.interest = "Please select an interest area.";
    if (form.statement.trim().length < 10) {
      next.statement = "Please write at least 10 characters.";
    }
    if (form.statement.length > 500) {
      next.statement = "Statement must be 500 characters or less.";
    }
    if (form.portfolio.trim()) {
      try {
        new URL(form.portfolio);
      } catch {
        next.portfolio = "Please enter a valid URL.";
      }
    }
    return next;
  }

  async function startPayment(appId: string) {
    const orderRes = await fetch("/api/payments/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: appId }),
    });
    const order = await orderRes.json();
    if (!order.ok) {
      throw new Error(order.error || "Unable to start payment");
    }

    const ready = await loadRazorpayScript();
    if (!ready || !window.Razorpay) {
      throw new Error("Payment checkout failed to load. Please retry.");
    }

    if (!order.key) {
      // Gateway not configured — treat apply as saved; admin can follow up
      setSuccess("submitted");
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const rzp = new window.Razorpay!({
        key: order.key,
        amount: order.amount * 100,
        currency: order.currency || "INR",
        name: "Seedqura",
        description: order.courseName || course.name,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: "#2F7A5B" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verify = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                applicationId: appId,
                ...response,
              }),
            });
            const data = await verify.json();
            if (!data.ok) {
              reject(new Error(data.error || "Payment verification failed"));
              return;
            }
            setSuccess("paid");
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => {
            reject(new Error("Payment cancelled. You can retry below."));
          },
        },
      });
      rzp.open();
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      let appId = applicationId;
      if (!appId) {
        const res = await postJson("/api/apply", {
          ...form,
          course_id: course.id,
          portfolio: form.portfolio.trim() || null,
        });
        if (!res.ok) {
          setFormError(res.error || "Something went wrong. Please try again.");
          return;
        }
        appId = (res as { applicationId?: string }).applicationId || null;
        if (!appId) {
          setFormError("Application saved but payment could not start.");
          return;
        }
        setApplicationId(appId);
      }

      await startPayment(appId);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to complete application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success === "paid") {
    return (
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center text-accent">
        <h2 className="text-xl font-semibold">Payment received!</h2>
        <p className="mt-2 text-muted">
          Check your email for a link to set your password, then{" "}
          <a href="/login" className="underline hover:text-accent">
            log in
          </a>{" "}
          to access your student dashboard.
        </p>
      </div>
    );
  }

  if (success === "submitted") {
    return (
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center text-accent">
        <h2 className="text-xl font-semibold">Application saved</h2>
        <p className="mt-2 text-muted">
          Payment gateway is not configured yet. Our team will contact you at{" "}
          {form.email} to complete enrollment for {course.name}.
        </p>
      </div>
    );
  }

  const inputClass = "input-premium";
  const labelClass =
    "mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="rounded-xl border border-black/5 bg-white/50 p-4">
        <label htmlFor="apply-course" className={labelClass}>
          Course
        </label>
        <select
          id="apply-course"
          className={inputClass}
          value={course.id}
          onChange={(e) => {
            setCourseId(e.target.value);
            setApplicationId(null);
          }}
        >
          {payableCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.priceDisplay}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-muted">
          {course.duration} · {course.format}
        </p>
      </div>

      <div>
        <label htmlFor="apply-name" className={labelClass}>
          Full name
        </label>
        <input
          id="apply-name"
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="apply-email" className={labelClass}>
          Email
        </label>
        <input
          id="apply-email"
          type="email"
          className={inputClass}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="apply-phone" className={labelClass}>
          Phone
        </label>
        <input
          id="apply-phone"
          type="tel"
          className={inputClass}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="apply-institution" className={labelClass}>
          College / Institution
        </label>
        <input
          id="apply-institution"
          className={inputClass}
          value={form.institution}
          onChange={(e) => setForm({ ...form, institution: e.target.value })}
        />
        {errors.institution && (
          <p className="mt-1 text-sm text-red-600">{errors.institution}</p>
        )}
      </div>

      <div>
        <label htmlFor="apply-year" className={labelClass}>
          Year / Level
        </label>
        <select
          id="apply-year"
          className={inputClass}
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        >
          <option value="">Select year / level</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
      </div>

      <div>
        <label htmlFor="apply-portfolio" className={labelClass}>
          LinkedIn or GitHub <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="apply-portfolio"
          type="url"
          placeholder="https://"
          className={inputClass}
          value={form.portfolio}
          onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
        />
        {errors.portfolio && (
          <p className="mt-1 text-sm text-red-600">{errors.portfolio}</p>
        )}
      </div>

      <div>
        <label htmlFor="apply-interest" className={labelClass}>
          Interest area
        </label>
        <select
          id="apply-interest"
          className={inputClass}
          value={form.interest}
          onChange={(e) => setForm({ ...form, interest: e.target.value })}
        >
          <option value="">Select interest area</option>
          {interestOptions.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        {errors.interest && (
          <p className="mt-1 text-sm text-red-600">{errors.interest}</p>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="apply-statement" className={labelClass}>
            Why do you want to join?
          </label>
          <span className="text-xs text-muted">{form.statement.length}/500</span>
        </div>
        <textarea
          id="apply-statement"
          rows={5}
          maxLength={500}
          className={inputClass}
          value={form.statement}
          onChange={(e) => setForm({ ...form, statement: e.target.value })}
        />
        {errors.statement && (
          <p className="mt-1 text-sm text-red-600">{errors.statement}</p>
        )}
      </div>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <MagneticButton
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : applicationId ? (
          `Retry payment · ${course.priceDisplay}`
        ) : (
          `Apply & pay ${course.priceDisplay}`
        )}
      </MagneticButton>
    </form>
  );
}
