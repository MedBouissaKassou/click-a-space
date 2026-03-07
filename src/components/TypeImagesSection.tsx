import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

interface TypeImage {
  id: string;
  title: string | null;
  image_url: string;
}

interface TypeImagesSectionProps {
  category: "s1" | "s2";
  label: string;
}

export default function TypeImagesSection({ category, label }: TypeImagesSectionProps) {
  const [images, setImages] = useState<TypeImage[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("type_images")
      .select("id, title, image_url")
      .eq("category", category)
      .order("display_order")
      .then(({ data }) => {
        if (data) setImages(data as TypeImage[]);
      });
  }, [category]);

  if (images.length === 0) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Appartements</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{label}</h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          <p className="text-muted-foreground mt-4">Bientôt disponible</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Appartements</p>
            <h2 className="text-3xl md:text-4xl font-bold">{label}</h2>
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {images.slice(0, 4).map((img) => (
              <div
                key={img.id}
                className="overflow-hidden rounded-xl border border-border bg-card cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setLightbox(img.image_url)}
              >
                <div className="aspect-[4/3]">
                  <img
                    src={img.image_url}
                    alt={img.title || label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {img.title && (
                  <div className="p-3 text-center">
                    <p className="font-semibold text-sm">{img.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-sm text-foreground rounded-full p-2 hover:bg-background transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightbox}
            alt={label}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
