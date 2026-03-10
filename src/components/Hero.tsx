import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-building.jpg";

interface HeroImage {
  id: string;
  image_url: string;
}

export default function Hero() {
  const [images, setImages] = useState<HeroImage[] | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase
      .from("hero_images")
      .select("id, image_url")
      .order("display_order")
      .then(({ data }) => {
        setImages(data && data.length > 0 ? (data as HeroImage[]) : []);
      });
  }, []);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  const bgImages = images === null ? [] : images.length > 0 ? images.map((i) => i.image_url) : [heroImg];

  return (
    <section className="relative h-[85vh] min-h-[620px] md:h-[70vh] md:min-h-[500px] flex items-end overflow-hidden">
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

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 pb-4 md:pb-16 mt-auto pt-16 md:pt-20">
        <p className="text-gold text-xs md:text-sm font-semibold tracking-widest uppercase mb-2 md:mb-3 bg-background/70 backdrop-blur-sm inline-block px-3 py-1 rounded">
          Résidence de standing
        </p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-2 md:mb-4">
          Résidence OCEANA
        </h1>
        <p className="text-black dark:text-white text-base md:text-lg max-w-xl">
          Découvrez nos appartements de standing allant de 65 à 115 m², livrés clé en main avec des finitions haut de gamme.
        </p>

        {/* Badges - inline on mobile, absolute on desktop */}
        <div className="flex flex-col gap-1.5 md:gap-2 mt-3 md:absolute md:bottom-8 md:right-8 md:mt-0 md:items-end md:z-10">
          <div className="relative group animate-badge-slide-in">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent via-gold to-accent rounded-lg blur-sm opacity-75 animate-glow" />
            <span className="relative block bg-navy text-white text-xs sm:text-sm md:text-base font-bold px-3 py-1.5 md:px-6 md:py-3 rounded-lg shadow-2xl tracking-wide">
              💳 Facilité de paiements jusqu'en 2028
            </span>
          </div>
          <div className="relative group animate-badge-slide-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-accent via-gold to-accent rounded-lg blur-sm opacity-75 animate-glow" style={{ animationDelay: '1s' }} />
            <span className="relative block bg-navy text-white text-xs sm:text-sm md:text-base font-bold px-3 py-1.5 md:px-6 md:py-3 rounded-lg shadow-2xl tracking-wide">
              🏷️ A partir de 245 MD TTC
            </span>
          </div>
        </div>

        <a
          href="#plan"
          className="inline-block mt-3 md:mt-6 px-6 py-2.5 md:px-8 md:py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm md:text-base"
        >
          Explorer le plan
        </a>
      </div>

      {bgImages.length > 1 && (
        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
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
