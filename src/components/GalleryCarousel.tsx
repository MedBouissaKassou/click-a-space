import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useIsMobile } from "@/hooks/use-mobile";

interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
}

function ImageCard({ img }: { img: GalleryImage }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-video">
        <img src={img.image_url} alt={img.title || "Réalisation"} className="w-full h-full object-cover" loading="lazy" />
      </div>
      {img.title && (
        <div className="p-4">
          <p className="font-semibold text-sm">{img.title}</p>
        </div>
      )}
    </div>
  );
}

export default function GalleryCarousel() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    supabase.from("gallery_images").select("*").order("display_order").then(({ data }) => {
      if (data) setImages(data as GalleryImage[]);
    });
  }, []);

  if (images.length === 0) {
    return (
      <section id="galerie" className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Portfolio</p>
          <h2 className="text-4xl font-bold mb-3">Nos Réalisations</h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
            Découvrez nos constructions et nos projets livrés
          </p>
          <p className="text-muted-foreground mt-8">Bientôt disponible</p>
        </div>
      </section>
    );
  }

  return (
    <section id="galerie" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Portfolio</p>
          <h2 className="text-4xl font-bold mb-3">Nos Réalisations</h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
            Découvrez nos constructions et nos projets livrés
          </p>
        </div>

        {/* Desktop: grid layout */}
        {!isMobile ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <ImageCard key={img.id} img={img} />
            ))}
          </div>
        ) : (
          /* Mobile: carousel */
          <Carousel opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]} className="w-full overflow-hidden">
            <CarouselContent className="-ml-4">
              {images.map((img) => (
                <CarouselItem key={img.id} className="pl-4 basis-[85%]">
                  <ImageCard img={img} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
