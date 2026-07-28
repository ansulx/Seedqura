import { Router } from "express";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { sendApplicationNotification } from "../lib/mail.js";

export const applyRouter = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;
const validYears = [
  "1st Year UG",
  "2nd Year UG",
  "3rd Year UG",
  "4th Year UG",
  "Postgraduate",
  "Graduate / Other",
];
const validInterests = ["Agriculture AI", "Medical AI", "Both"];

applyRouter.post("/", async (req, res) => {
  const {
    name,
    email,
    phone,
    institution,
    year,
    portfolio,
    interest,
    statement,
    course_id: courseId,
  } = req.body ?? {};
  const fields: string[] = [];

  if (!courseId || typeof courseId !== "string") fields.push("course_id");
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    fields.push("name");
  }
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    fields.push("email");
  }
  if (
    !phone ||
    typeof phone !== "string" ||
    !phoneRegex.test(phone.replace(/\s/g, ""))
  ) {
    fields.push("phone");
  }
  if (!institution || typeof institution !== "string" || institution.trim().length < 2) {
    fields.push("institution");
  }
  if (!year || !validYears.includes(year)) fields.push("year");
  if (!interest || !validInterests.includes(interest)) fields.push("interest");
  if (!statement || typeof statement !== "string" || statement.trim().length < 10) {
    fields.push("statement");
  }
  if (statement && statement.length > 500) fields.push("statement");
  if (portfolio && typeof portfolio === "string" && portfolio.trim()) {
    try {
      new URL(portfolio);
    } catch {
      fields.push("portfolio");
    }
  }

  if (fields.length > 0) {
    return res.status(400).json({
      ok: false,
      error: "Validation failed",
      fields,
    });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, name, price_inr, price_display, currency, status")
      .eq("id", courseId)
      .maybeSingle();

    if (courseError) throw courseError;
    if (!course) {
      return res.status(400).json({
        ok: false,
        error: "Invalid course",
        fields: ["course_id"],
      });
    }
    if (course.price_inr == null || course.price_inr <= 0) {
      return res.status(400).json({
        ok: false,
        error: "This course is not open for paid enrollment",
        fields: ["course_id"],
      });
    }

    const { data: application, error } = await supabase
      .from("applications")
      .insert({
        course_id: course.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\s/g, ""),
        institution: institution.trim(),
        year,
        interest,
        statement: statement.trim(),
        portfolio: portfolio?.trim() || null,
        status: "payment_pending",
      })
      .select("id, course_id, status, email, name")
      .single();

    if (error) throw error;

    try {
      await sendApplicationNotification({
        name: application.name,
        email: application.email,
        phone: phone.replace(/\s/g, ""),
        courseName: course.name,
        institution: institution.trim(),
      });
    } catch (mailErr) {
      console.warn("[apply] notify mail failed:", mailErr);
    }

    return res.status(200).json({
      ok: true,
      message: "Application received",
      applicationId: application.id,
      course: {
        id: course.id,
        name: course.name,
        priceInr: course.price_inr,
        priceDisplay: course.price_display,
        currency: course.currency,
      },
    });
  } catch (err) {
    console.error("[apply]", err);
    return res.status(500).json({
      ok: false,
      error: "Unable to save application. Please try again.",
    });
  }
});
