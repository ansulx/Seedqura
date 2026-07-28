export type CourseRow = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string | null;
  level: string | null;
  duration: string | null;
  format: string | null;
  price_inr: number | null;
  currency: string;
  price_display: string | null;
  status: string;
  featured: boolean;
  features: unknown;
  created_at?: string;
};

export const COURSE_SELECT =
  "id, name, tagline, description, category, level, duration, format, price_inr, currency, price_display, status, featured, features, created_at";
