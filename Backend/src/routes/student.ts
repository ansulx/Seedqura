import { Router } from "express";
import { getSupabaseAdmin } from "../lib/supabase.js";

export const studentRouter = Router();

async function requireStudent(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(header.slice(7));
    if (error || !data.user) {
      return res.status(401).json({ ok: false, error: "Invalid session" });
    }
    (req as import("express").Request & { userId?: string }).userId = data.user.id;
    next();
  } catch (err) {
    console.error("[student auth]", err);
    return res.status(500).json({ ok: false, error: "Auth check failed" });
  }
}

studentRouter.use(requireStudent);

studentRouter.get("/me", async (req, res) => {
  const userId = (req as import("express").Request & { userId?: string }).userId!;
  try {
    const supabase = getSupabaseAdmin();
    const [{ data: profile }, { data: enrollments }, { data: applications }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("enrollments")
          .select("id, status, enrolled_at, course_id, courses(id, name, tagline, duration, format, price_display)")
          .eq("user_id", userId)
          .order("enrolled_at", { ascending: false }),
        supabase
          .from("applications")
          .select("id, status, course_id, created_at, courses(id, name, price_display)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);

    return res.json({
      ok: true,
      profile,
      enrollments: enrollments ?? [],
      applications: applications ?? [],
    });
  } catch (err) {
    console.error("[student/me]", err);
    return res.status(500).json({ ok: false, error: "Failed to load student data" });
  }
});
