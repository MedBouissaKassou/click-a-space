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

const iconMap: Record<string, React.ReactNode> = {
  building: <Building className="w-6 h-6 text-gold" />,
  mappin: <MapPin className="w-6 h-6 text-gold" />,
  tree: <TreePine className="w-6 h-6 text-gold" />,
};

export default function Index() {
  const [s, setS] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: { key: string; value: string }) => (map[r.key] = r.value));
        setS(map);
      }
    };
    load();
  }, []);

  const cards = [
    { icon: iconMap[s.card1_icon || "building"] || iconMap.building, title: s.card1_title || "Architecture contemporaine", text: s.card1_text || "", showMap: false },
    { icon: iconMap[s.card2_icon || "mappin"] || iconMap.mappin, title: s.card2_title || "Emplacement stratégique", text: s.card2_text || "", showMap: true },
    { icon: iconMap[s.card3_icon || "tree"] || iconMap.tree, title: s.card3_title || "Emplacement", text: s.card3_text || "", showMap: false },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />

      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">
            {s.vision_title || "Notre vision"}
          </p>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {s.vision_text || "Bienvenue dans un espace où le luxe rencontre le confort."}
          </p>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>
      </section>

      <section id="projet" className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">{s.project_title || "Projet en cours"}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {cards.map((card, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  {card.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-muted-foreground text-sm">{card.text}</p>
                {card.showMap && s.google_maps_url && (
                  <Button asChild size="sm" className="mt-4">
                    <a href={s.google_maps_url} target="_blank" rel="noopener noreferrer">
                      <MapPin className="w-4 h-4 mr-2" />
                      Voir localisation
                    </a>
                  </Button>
                )}
              </div>
            ))}
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
