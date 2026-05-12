"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/sections/hero/Hero";
import { About } from "@/sections/about/About";
import { Stats } from "@/sections/stats/Stats";
import { TemplatesGallery } from "@/sections/templates/TemplatesGallery";
import { Calculator } from "@/sections/calculator/Calculator";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-black text-white">
      <div className="noise" />

      <Navbar />
      <Hero />
      <div className="gradient-divider" />
      <About />
      <div className="gradient-divider" />
      <Stats />
      <div className="gradient-divider" />
      <TemplatesGallery />
      <div className="gradient-divider" />
      <Calculator />
      <Footer />
    </main>
  );
}