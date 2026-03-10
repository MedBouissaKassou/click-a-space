import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmplacementSection() {
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
    <section className="py-12 md:py-16 px-4 bg-muted/50">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-6 h-6 text-gold" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Emplacement stratégique</h2>
        <p className="text-muted-foreground mb-2">
          Emplacement stratégique à la Soukra et facilement accessible.
        </p>
        <p className="text-muted-foreground mb-6">
          Près de la municipalité de la Soukra, British School, le parc d'animation de la Soukra.
        </p>
        {mapsUrl && (
          <Button asChild>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <MapPin className="w-4 h-4 mr-2" />
              Voir localisation
            </a>
          </Button>
        )}
      </div>
    </section>
  );
}
