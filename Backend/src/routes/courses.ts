import { Router } from "express";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { COURSE_SELECT, type CourseRow } from "../lib/courseTypes.js";
import { mapCourseRow } from "../lib/courseMap.js";

export const coursesRouter = Router();

coursesRouter.get("/", async (_req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("courses")
      .select(COURSE_SELECT)
      .order("featured", { ascending: false })
      .order("name", { ascending: true });
    if (error) throw error;
    const courses = ((data ?? []) as CourseRow[]).map(mapCourseRow);
    return res.json({ ok: true, courses });
  } catch (err) {
    console.error("[courses]", err);
    return res.status(500).json({ ok: false, error: "Failed to load courses" });
  }
});

coursesRouter.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("courses")
      .select(COURSE_SELECT)
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, error: "Not found" });
    return res.json({ ok: true, course: mapCourseRow(data as CourseRow) });
  } catch (err) {
    console.error("[courses/:id]", err);
    return res.status(500).json({ ok: false, error: "Failed to load course" });
  }
});
