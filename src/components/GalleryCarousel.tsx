import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
}

export default function GalleryCarousel() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    supabase.from("gallery_images").select("*").order("display_order").then(({ data }) => {
      if (data) setImages(data as GalleryImage[]);
    });
  }, []);

  if (images.length === 0) return null;

  return (
    <section id="galerie" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Nos Réalisations</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez nos constructions et nos projets livrés
          </p>
        </div>
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-4">
            {images.map((img) => (
              <CarouselItem key={img.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
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
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
