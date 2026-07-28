import { Router, type Request, type Response, type NextFunction } from "express";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { COURSE_SELECT, type CourseRow } from "../lib/courseTypes.js";
import {
  formatPriceDisplay,
  mapCourseRow,
  slugifyCourseId,
} from "../lib/courseMap.js";

export const adminRouter = Router();

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  const token = header.slice(7);
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ ok: false, error: "Invalid session" });
    }
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile || profile.role !== "admin") {
      return res.status(403).json({ ok: false, error: "Admin access required" });
    }
    (req as Request & { adminUserId?: string }).adminUserId = data.user.id;
    next();
  } catch (err) {
    console.error("[admin auth]", err);
    return res.status(500).json({ ok: false, error: "Auth check failed" });
  }
}

adminRouter.use(requireAdmin);

adminRouter.get("/stats", async (_req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const [{ count: applications }, { count: paid }, { count: students }, { count: active }] =
      await Promise.all([
        supabase.from("applications").select("*", { count: "exact", head: true }),
        supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .in("status", ["paid", "active"]),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "student"),
        supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
      ]);

    return res.json({
      ok: true,
      stats: {
        applications: applications ?? 0,
        paid: paid ?? 0,
        students: students ?? 0,
        activeEnrollments: active ?? 0,
      },
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    return res.status(500).json({ ok: false, error: "Failed to load stats" });
  }
});

adminRouter.get("/applications", async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const status = typeof req.query.status === "string" ? req.query.status : null;
    const courseId =
      typeof req.query.course_id === "string" ? req.query.course_id : null;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    let query = supabase
      .from("applications")
      .select(
        "id, name, email, phone, institution, year, interest, statement, portfolio, status, course_id, user_id, admin_notes, created_at, courses(id, name, price_inr, price_display), payments(id, amount, status, razorpay_order_id, razorpay_payment_id, created_at)"
      )
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (courseId) query = query.eq("course_id", courseId);
    if (q) {
      query = query.or(
        `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
      );
    }

    const { data, error } = await query.limit(200);
    if (error) throw error;
    return res.json({ ok: true, applications: data ?? [] });
  } catch (err) {
    console.error("[admin/applications]", err);
    return res.status(500).json({ ok: false, error: "Failed to load applications" });
  }
});

adminRouter.get("/applications/:id", async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("applications")
      .select(
        "*, courses(id, name, price_inr, price_display), payments(*), enrollments(*)"
      )
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, error: "Not found" });
    return res.json({ ok: true, application: data });
  } catch (err) {
    console.error("[admin/applications/:id]", err);
    return res.status(500).json({ ok: false, error: "Failed to load application" });
  }
});

adminRouter.patch("/applications/:id", async (req, res) => {
  const { status, admin_notes } = req.body ?? {};
  const allowed = ["payment_pending", "paid", "active", "rejected", "refunded"];
  if (status && !allowed.includes(status)) {
    return res.status(400).json({ ok: false, error: "Invalid status" });
  }

  try {
    const supabase = getSupabaseAdmin();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof status === "string") updates.status = status;
    if (typeof admin_notes === "string") updates.admin_notes = admin_notes;

    const { data, error } = await supabase
      .from("applications")
      .update(updates)
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw error;

    if (status === "rejected" || status === "refunded") {
      await supabase
        .from("enrollments")
        .update({ status: "revoked" })
        .eq("application_id", req.params.id)
        .eq("status", "active");
    }

    return res.json({ ok: true, application: data });
  } catch (err) {
    console.error("[admin/applications patch]", err);
    return res.status(500).json({ ok: false, error: "Failed to update application" });
  }
});

adminRouter.get("/courses", async (_req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("courses")
      .select(COURSE_SELECT)
      .order("name", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as CourseRow[];
    return res.json({
      ok: true,
      courses: rows.map((row) => ({
        ...mapCourseRow(row),
        price_inr: row.price_inr,
        price_display: row.price_display,
        created_at: row.created_at,
      })),
    });
  } catch (err) {
    console.error("[admin/courses]", err);
    return res.status(500).json({ ok: false, error: "Failed to load courses" });
  }
});

function parseCourseBody(body: Record<string, unknown>, forCreate: boolean) {
  const errors: string[] = [];
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length < 2) errors.push("name");

  let id =
    typeof body.id === "string" ? slugifyCourseId(body.id) : "";
  if (forCreate) {
    if (!id && name) id = slugifyCourseId(name);
    if (!id) errors.push("id");
  }

  const priceRaw = body.price_inr ?? body.price;
  let price_inr: number | null = null;
  if (priceRaw === null || priceRaw === "" || priceRaw === undefined) {
    price_inr = null;
  } else {
    const n = Number(priceRaw);
    if (!Number.isFinite(n) || n < 0) errors.push("price_inr");
    else price_inr = Math.round(n);
  }

  const featuresRaw = body.features;
  let features: string[] = [];
  if (Array.isArray(featuresRaw)) {
    features = featuresRaw.map(String).map((s) => s.trim()).filter(Boolean);
  } else if (typeof featuresRaw === "string") {
    features = featuresRaw
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const status =
    typeof body.status === "string" && body.status.trim()
      ? body.status.trim()
      : price_inr && price_inr > 0
        ? "Open"
        : "Coming Soon";

  const price_display =
    typeof body.price_display === "string" && body.price_display.trim()
      ? body.price_display.trim()
      : typeof body.priceDisplay === "string" && body.priceDisplay.trim()
        ? body.priceDisplay.trim()
        : formatPriceDisplay(price_inr);

  const payload = {
    ...(forCreate ? { id } : {}),
    name,
    tagline: typeof body.tagline === "string" ? body.tagline.trim() : "",
    description:
      typeof body.description === "string" ? body.description.trim() : "",
    category:
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : "Course",
    level: typeof body.level === "string" ? body.level.trim() : "",
    duration: typeof body.duration === "string" ? body.duration.trim() : "",
    format: typeof body.format === "string" ? body.format.trim() : "",
    price_inr,
    currency:
      typeof body.currency === "string" && body.currency.trim()
        ? body.currency.trim()
        : "INR",
    price_display,
    status,
    featured: Boolean(body.featured),
    features,
  };

  return { errors, payload, id };
}

adminRouter.post("/courses", async (req, res) => {
  try {
    const { errors, payload } = parseCourseBody(req.body ?? {}, true);
    if (errors.length) {
      return res.status(400).json({
        ok: false,
        error: "Validation failed",
        fields: errors,
      });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("courses")
      .insert(payload)
      .select(COURSE_SELECT)
      .single();
    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          ok: false,
          error: "A course with this id already exists",
        });
      }
      throw error;
    }
    const row = data as CourseRow;
    return res.status(201).json({
      ok: true,
      course: {
        ...mapCourseRow(row),
        price_inr: row.price_inr,
        price_display: row.price_display,
      },
    });
  } catch (err) {
    console.error("[admin/courses create]", err);
    return res.status(500).json({ ok: false, error: "Failed to create course" });
  }
});

adminRouter.patch("/courses/:id", async (req, res) => {
  try {
    const body = req.body ?? {};
    const updates: Record<string, unknown> = {};

    if (typeof body.name === "string") {
      if (body.name.trim().length < 2) {
        return res.status(400).json({ ok: false, error: "Invalid name", fields: ["name"] });
      }
      updates.name = body.name.trim();
    }
    for (const key of [
      "tagline",
      "description",
      "category",
      "level",
      "duration",
      "format",
      "currency",
      "status",
    ] as const) {
      if (typeof body[key] === "string") updates[key] = body[key].trim();
    }
    if ("featured" in body) updates.featured = Boolean(body.featured);
    if ("price_inr" in body || "price" in body) {
      const priceRaw = body.price_inr ?? body.price;
      if (priceRaw === null || priceRaw === "") updates.price_inr = null;
      else {
        const n = Number(priceRaw);
        if (!Number.isFinite(n) || n < 0) {
          return res.status(400).json({ ok: false, error: "Invalid price", fields: ["price_inr"] });
        }
        updates.price_inr = Math.round(n);
      }
    }
    if (typeof body.price_display === "string" || typeof body.priceDisplay === "string") {
      updates.price_display =
        (body.price_display || body.priceDisplay || "").toString().trim() ||
        formatPriceDisplay(updates.price_inr as number | null | undefined);
    } else if ("price_inr" in updates) {
      updates.price_display = formatPriceDisplay(
        updates.price_inr as number | null
      );
    }
    if ("features" in body) {
      const featuresRaw = body.features;
      if (Array.isArray(featuresRaw)) {
        updates.features = featuresRaw.map(String).map((s) => s.trim()).filter(Boolean);
      } else if (typeof featuresRaw === "string") {
        updates.features = featuresRaw
          .split(/\n|,/)
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ ok: false, error: "No fields to update" });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", req.params.id)
      .select(COURSE_SELECT)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, error: "Course not found" });
    const row = data as CourseRow;
    return res.json({
      ok: true,
      course: {
        ...mapCourseRow(row),
        price_inr: row.price_inr,
        price_display: row.price_display,
      },
    });
  } catch (err) {
    console.error("[admin/courses patch]", err);
    return res.status(500).json({ ok: false, error: "Failed to update course" });
  }
});

adminRouter.delete("/courses/:id", async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const id = req.params.id;

    const [{ count: appCount }, { count: enrollCount }] = await Promise.all([
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("course_id", id),
      supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", id),
    ]);

    if ((appCount ?? 0) > 0 || (enrollCount ?? 0) > 0) {
      return res.status(409).json({
        ok: false,
        error:
          "Cannot delete this course while applications or enrollments exist. Remove or reassign them first, or mark the course Coming Soon instead.",
      });
    }

    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    console.error("[admin/courses delete]", err);
    return res.status(500).json({ ok: false, error: "Failed to delete course" });
  }
});

adminRouter.get("/students", async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const courseId =
      typeof req.query.course_id === "string" ? req.query.course_id : null;
    const enrollmentStatus =
      typeof req.query.enrollment_status === "string"
        ? req.query.enrollment_status
        : null;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, institution, role, created_at")
      .eq("role", "student")
      .order("created_at", { ascending: false });
    if (error) throw error;

    let ids = (profiles ?? []).map((p) => p.id);

    // Resolve emails from Auth
    const emailById = new Map<string, string>();
    if (ids.length) {
      const { data: listed } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });
      for (const u of listed?.users ?? []) {
        if (u.email) emailById.set(u.id, u.email);
      }
    }

    let enrollQuery = supabase
      .from("enrollments")
      .select(
        "id, user_id, course_id, status, enrolled_at, application_id, courses(id, name, price_display)"
      );
    if (ids.length) enrollQuery = enrollQuery.in("user_id", ids);
    if (courseId) enrollQuery = enrollQuery.eq("course_id", courseId);
    if (enrollmentStatus) enrollQuery = enrollQuery.eq("status", enrollmentStatus);

    const { data: enrollments, error: enrollError } = ids.length
      ? await enrollQuery
      : { data: [] as never[], error: null };
    if (enrollError) throw enrollError;

    // When filtering by course, only keep students who have a matching enrollment
    if (courseId || enrollmentStatus) {
      const allowed = new Set((enrollments ?? []).map((e) => e.user_id));
      ids = ids.filter((id) => allowed.has(id));
    }

    const { data: applications } = ids.length
      ? await supabase
          .from("applications")
          .select(
            "id, user_id, course_id, name, email, phone, institution, year, interest, statement, portfolio, status, created_at, courses(id, name)"
          )
          .in("user_id", ids)
          .order("created_at", { ascending: false })
      : { data: [] };

    let students = (profiles ?? [])
      .filter((p) => ids.includes(p.id))
      .map((p) => {
        const apps = (applications ?? []).filter((a) => a.user_id === p.id);
        const primary = apps[0];
        return {
          id: p.id,
          full_name: p.full_name || primary?.name || "",
          email: emailById.get(p.id) || primary?.email || "",
          phone: p.phone || primary?.phone || "",
          institution: p.institution || primary?.institution || "",
          year: primary?.year || "",
          interest: primary?.interest || "",
          created_at: p.created_at,
          enrollments: (enrollments ?? []).filter((e) => e.user_id === p.id),
          applications: apps,
        };
      });

    if (q) {
      const needle = q.toLowerCase();
      students = students.filter(
        (s) =>
          s.full_name.toLowerCase().includes(needle) ||
          s.email.toLowerCase().includes(needle) ||
          s.phone.toLowerCase().includes(needle) ||
          s.institution.toLowerCase().includes(needle)
      );
    }

    return res.json({ ok: true, students });
  } catch (err) {
    console.error("[admin/students]", err);
    return res.status(500).json({ ok: false, error: "Failed to load students" });
  }
});

adminRouter.patch("/enrollments/:id", async (req, res) => {
  const { status } = req.body ?? {};
  if (!["active", "revoked", "completed"].includes(status)) {
    return res.status(400).json({ ok: false, error: "Invalid enrollment status" });
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("enrollments")
      .update({ status })
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw error;
    return res.json({ ok: true, enrollment: data });
  } catch (err) {
    console.error("[admin/enrollments]", err);
    return res.status(500).json({ ok: false, error: "Failed to update enrollment" });
  }
});
