import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Technology } from "@/components/sections/Technology";
import { Products } from "@/components/sections/Products";
import { Research } from "@/components/sections/Research";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Technology />
        <Products />
        <Research />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
