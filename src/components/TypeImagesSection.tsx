import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{label}</h2>
          <p className="text-muted-foreground mt-4">Bientôt disponible</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">{label}</h2>
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {images.slice(0, 4).map((img) => (
            <div key={img.id} className="overflow-hidden rounded-xl border border-border bg-card">
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
  );
}
