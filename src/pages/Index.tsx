import Header from "@/components/Header";
import Hero from "@/components/Hero";
import GalleryCarousel from "@/components/GalleryCarousel";
import FloorPlan from "@/components/FloorPlan";
import TypeImagesSection from "@/components/TypeImagesSection";
import Footer from "@/components/Footer";

import { Building, Ruler, ShieldCheck } from "lucide-react";

const features = [
  { icon: Building, title: "Architecture moderne", desc: "Design contemporain avec matériaux nobles et finitions soignées." },
  { icon: Ruler, title: "65 à 115 m²", desc: "Des surfaces adaptées à tous les besoins, du couple à la grande famille." },
  { icon: ShieldCheck, title: "Livraison garantie", desc: "Tranches livrables entre 2025 et fin 2026 avec garanties constructeur." },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      

      <section id="projet" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Notre vision</p>
            <h2 className="text-3xl md:text-4xl font-bold">Projet en cours</h2>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="py-4 md:py-0" />
      <TypeImagesSection category="s1" label="S+1" />
      <div className="py-1 md:py-0" />
      <TypeImagesSection category="s2" label="S+2" />
      <div className="py-4 md:py-0" />
      <FloorPlan />
      <GalleryCarousel />
      <Footer />
    </div>
  );
}
