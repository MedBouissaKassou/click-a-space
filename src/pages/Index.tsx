import Header from "@/components/Header";
import Hero from "@/components/Hero";
import GalleryCarousel from "@/components/GalleryCarousel";
import FloorPlan from "@/components/FloorPlan";
import TypeImagesSection from "@/components/TypeImagesSection";
import Footer from "@/components/Footer";

import { Building, MapPin, TreePine } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function Index() {
  const [mapsUrl, setMapsUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "google_maps_url")
        .maybeSingle();
      if (data?.value) setMapsUrl(data.value);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />

      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Notre vision</p>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Bienvenue dans un espace où le luxe rencontre le confort.</p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>
      </section>

      <section id="projet" className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Projet en cours</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Architecture contemporaine</h3>
              <p className="text-muted-foreground text-sm">Design contemporain avec matériaux nobles et finitions soignées.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Emplacement stratégique</h3>
              <p className="text-muted-foreground text-sm">Emplacement stratégique à la Soukra et facilement accessible. Près de la municipalité de la Soukra, British School, le parc d'animation de la Soukra.</p>
              {mapsUrl && (
                <Button asChild size="sm" className="mt-4">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="w-4 h-4 mr-2" />
                    Voir localisation
                  </a>
                </Button>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <TreePine className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Emplacement</h3>
              <p className="text-muted-foreground text-sm">Projet noyé dans la verdure</p>
            </div>
          </div>
        </div>
      </section>

      <TypeImagesSection category="s1" label="S+1" />
      <TypeImagesSection category="s2" label="S+2" />
      <div className="py-2 md:py-0" />
      <FloorPlan />
      <GalleryCarousel />
      <Footer />
    </div>
  );
}
