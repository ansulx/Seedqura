import type { CourseRow } from "./courseTypes.js";

export type PublicCourse = {
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

export function mapCourseRow(row: CourseRow): PublicCourse {
  const price =
    typeof row.price_inr === "number" && Number.isFinite(row.price_inr)
      ? row.price_inr
      : null;
  const payable = price != null && price > 0;
  const features = Array.isArray(row.features)
    ? row.features.map(String)
    : [];

  let ctaLabel = "Learn more";
  let ctaHref = "/#contact";
  if (payable) {
    ctaLabel =
      (row.category || "").toLowerCase() === "program" ? "Apply Now" : "Enroll Now";
    ctaHref = `/apply?course=${row.id}`;
  } else if (
    /coming soon/i.test(row.status || "") ||
    /coming soon/i.test(row.price_display || "")
  ) {
    ctaLabel = "Coming Soon";
    ctaHref = "/#contact";
  } else if (/inquiry|custom|by inquiry/i.test(row.status || "")) {
    ctaLabel = "Inquire";
    ctaHref = "/#contact";
  }

  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || "",
    description: row.description || "",
    category: row.category || "Course",
    level: row.level || "",
    duration: row.duration || "",
    format: row.format || "",
    price,
    currency: row.currency || "INR",
    priceDisplay: row.price_display || (price != null ? `₹${price.toLocaleString("en-IN")}` : "—"),
    status: row.status || "Open",
    featured: Boolean(row.featured),
    features,
    cta: { label: ctaLabel, href: ctaHref },
  };
}

export function slugifyCourseId(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function formatPriceDisplay(priceInr: number | null | undefined) {
  if (priceInr == null || !Number.isFinite(priceInr) || priceInr <= 0) {
    return "Coming soon";
  }
  return `₹${Math.round(priceInr).toLocaleString("en-IN")}`;
}
