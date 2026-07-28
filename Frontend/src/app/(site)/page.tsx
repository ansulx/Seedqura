import { Hero } from "@/components/sections/Hero";
import { Technology } from "@/components/sections/Technology";
import { ProductsPreview } from "@/components/sections/ProductsPage";
import { Contact } from "@/components/sections/Contact";
import { fetchCourses } from "@/lib/courses";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await fetchCourses();
  return (
    <>
      <Hero />
      <Technology />
      <ProductsPreview initialCourses={courses} />
      <Contact />
    </>
  );
}
