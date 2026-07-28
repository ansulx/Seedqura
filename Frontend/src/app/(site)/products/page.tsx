import type { Metadata } from "next";
import { CourseCatalog, ProductsHero } from "@/components/sections/ProductsPage";
import { fetchCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Products — Seedqura",
  description:
    "Courses and programs in AI for agriculture and precision medicine — mentorship, self-paced learning, and enterprise pilots.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const courses = await fetchCourses();
  return (
    <>
      <ProductsHero />
      <CourseCatalog initialCourses={courses} />
    </>
  );
}
