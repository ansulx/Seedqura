import siteData from "../../data/site.json";
import teamData from "../../data/team.json";
import productsData from "../../data/products.json";
import coursesData from "../../data/courses.json";
import focusAreasData from "../../data/focus-areas.json";
import type { Course } from "./courses";

export type SiteData = typeof siteData;
export type TeamMember = (typeof teamData.members)[number];
export type Product = (typeof productsData.products)[number];
export type { Course };
export type FocusArea = (typeof focusAreasData.areas)[number];

export function getSiteData(): SiteData {
  return siteData;
}

export function getTeamMembers(): TeamMember[] {
  return teamData.members;
}

export function getProducts(): Product[] {
  return productsData.products;
}

/** @deprecated Prefer fetchCourses() — static JSON fallback only */
export function getCourses(): Course[] {
  return coursesData.courses as Course[];
}

/** @deprecated Prefer fetchCourseById() */
export function getCourseById(id: string): Course | undefined {
  return (coursesData.courses as Course[]).find((c) => c.id === id);
}

/** @deprecated Prefer filterPayable(await fetchCourses()) */
export function getPayableCourses(): Course[] {
  return (coursesData.courses as Course[]).filter(
    (c) => typeof c.price === "number" && c.price > 0
  );
}

export function getFocusAreas(): FocusArea[] {
  return focusAreasData.areas;
}
