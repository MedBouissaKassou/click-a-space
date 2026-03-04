import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-building.jpg";

interface HeroImage {
  id: string;
  image_url: string;
}

export default function Hero() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase
      .from("hero_images")
      .select("id, image_url")
      .order("display_order")
      .then(({ data }) => {
        if (data && data.length > 0) setImages(data as HeroImage[]);
      });
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const bgImages = images.length > 0 ? images.map((i) => i.image_url) : [heroImg];

  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
      {/* Carousel images */}
      {bgImages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt="Résidence OCEANA"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 pb-16">
        {/* Catchy highlights */}
        <div className="flex flex-wrap gap-3 mb-5">
          <span className="bg-accent text-accent-foreground text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-lg">
            Facilité de paiements jusqu'en 2028
          </span>
          <span className="bg-accent text-accent-foreground text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-lg">
            A partir de 245 MD TTC
          </span>
        </div>

        <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">
          Résidence de standing
        </p>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
          Résidence OCEANA
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Découvrez nos appartements de standing allant de 65 à 115 m², livrés clé en main avec des finitions haut de gamme.
        </p>
        <a
          href="#plan"
          className="inline-block mt-6 px-8 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Explorer le plan
        </a>
      </div>

      {/* Carousel dots */}
      {bgImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {bgImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? "bg-accent scale-125" : "bg-accent/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
