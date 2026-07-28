export type Course = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  format: string;
  price: number | null;
  currency: string;
  priceDisplay: string;
  status: string;
  featured: boolean;
  features: string[];
  cta: { label: string; href: string };
};

/** Server-side fetch of live courses from the API (Supabase-backed). */
export async function fetchCourses(): Promise<Course[]> {
  const api = process.env.API_URL || "http://localhost:3001";
  try {
    const res = await fetch(`${api}/api/courses`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.courses || []) as Course[];
  } catch {
    return [];
  }
}

export async function fetchCourseById(id: string): Promise<Course | undefined> {
  const courses = await fetchCourses();
  return courses.find((c) => c.id === id);
}

export function filterPayable(courses: Course[]): Course[] {
  return courses.filter((c) => typeof c.price === "number" && c.price > 0);
}

/** Browser-side fetch via Next proxy. */
export async function fetchCoursesClient(): Promise<Course[]> {
  try {
    const res = await fetch("/api/courses", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.courses || []) as Course[];
  } catch {
    return [];
  }
}
