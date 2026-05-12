"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { homeTemplate } from "@/content/homeTemplate";
import { SectionRenderer } from "@/lib/rendering/SectionRenderer";
import { Calculator } from "@/sections/calculator/Calculator";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-black text-white">
      <div className="noise" />

      <Navbar />
      <SectionRenderer sections={homeTemplate.sections} />
      <div className="gradient-divider" />
      <Calculator />
      <Footer />
    </main>
  );
}
