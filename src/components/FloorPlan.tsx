import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/apartments";
import { useIsMobile } from "@/hooks/use-mobile";

interface Blueprint {
  id: string;
  name: string;
  floor_label: string;
  image_url: string;
}

interface Apartment {
  id: string;
  name: string;
  surface: number | null;
  prix: number | null;
  status: string;
  zone: { x: number; y: number; width: number; height: number } | null;
}

const dotColor = (status: string) => {
  switch (status) {
    case "Disponible": return "bg-available";
    case "Réservé": return "bg-reserved";
    case "Vendu": return "bg-sold";
    default: return "bg-muted-foreground";
  }
};

export default function FloorPlan() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [apartmentsByBp, setApartmentsByBp] = useState<Record<string, Apartment[]>>({});
  const [hovered, setHovered] = useState<Apartment | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialDismissed, setTutorialDismissed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Show tutorial when section scrolls into view
  useEffect(() => {
    if (tutorialDismissed || blueprints.length === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tutorialDismissed) {
          setShowTutorial(true);
          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            setShowTutorial(false);
            setTutorialDismissed(true);
          }, 5000);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [blueprints.length, tutorialDismissed]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("blueprints").select("*").order("display_order");
      if (data && data.length > 0) {
        setBlueprints(data as Blueprint[]);
        const { data: apts } = await supabase.from("apartments").select("id, name, surface, prix, status, zone, blueprint_id");
        if (apts) {
          const grouped: Record<string, Apartment[]> = {};
          for (const apt of apts as any[]) {
            if (!apt.blueprint_id) continue;
            if (!grouped[apt.blueprint_id]) grouped[apt.blueprint_id] = [];
            grouped[apt.blueprint_id].push(apt);
          }
          setApartmentsByBp(grouped);
        }
      }
    };
    load();
  }, []);

  if (blueprints.length === 0) return null;

  return (
    <section id="plan" ref={sectionRef} className="py-4 md:py-16 px-0 md:px-4">
      <div className="w-full px-1 md:max-w-6xl md:mx-auto md:px-0">
        <div className="text-center mb-6 md:mb-12">
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Explorez</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Plan Interactif</h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-3 rounded-full" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
            {isMobile
              ? "Appuyez sur un point coloré pour voir les détails"
              : "Cliquez sur un appartement pour découvrir ses détails"}
          </p>

          <div className="flex items-center justify-center gap-6 mt-6">
            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-available" /> Disponible
            </span>
            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-reserved" /> Réservé
            </span>
            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-sold" /> Vendu
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {blueprints.map((blueprint) => {
            const apartments = apartmentsByBp[blueprint.id] || [];
            return (
              <div className="relative inline-block w-full rounded-xl shadow-lg overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-card via-card to-accent/5 p-1 md:p-2">
                {/* Plan name overlay */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm px-4 py-2 border-b border-border">
                  <h3 className="font-semibold text-lg">{blueprint.name} — {blueprint.floor_label}</h3>
                </div>

                <img src={blueprint.image_url} alt={blueprint.name} className="w-full h-auto block rounded-lg" />

                {/* Tutorial overlay - only on first blueprint */}
                {showTutorial && blueprint.id === blueprints[0]?.id && (
                  <div
                    className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-lg animate-fade-in cursor-pointer"
                    onClick={() => { setShowTutorial(false); setTutorialDismissed(true); }}
                  >
                    <div className="flex flex-col items-center gap-3 text-white animate-bounce-gentle">
                      {isMobile ? (
                        <Hand className="w-12 h-12 text-accent drop-shadow-lg" />
                      ) : (
                        <MousePointerClick className="w-12 h-12 text-accent drop-shadow-lg" />
                      )}
                      <p className="text-base md:text-lg font-semibold text-center px-4 drop-shadow-lg">
                        {isMobile
                          ? "Appuyez sur un point pour voir les détails"
                          : "Cliquez sur un appartement pour voir les détails"}
                      </p>
                      <span className="text-xs text-white/70 mt-1">Touchez pour fermer</span>
                    </div>
                  </div>
                )}

                {apartments.filter((a) => a.zone).map((apt) => {
                  const zone = apt.zone!;
                  if (isMobile) {
                    // Mobile: show a colored dot at the center of the zone
                    return (
                      <button
                        key={apt.id}
                        className={`absolute z-20 w-4 h-4 rounded-full ${dotColor(apt.status)} border-2 border-white shadow-md animate-pulse`}
                        style={{
                          left: `${zone.x + zone.width / 2}%`,
                          top: `${zone.y + zone.height / 2}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        onClick={() => navigate(`/appartement/${apt.id}`)}
                      />
                    );
                  }
                  // Desktop: invisible clickable zone with hover tooltip
                  return (
                    <div
                      key={apt.id}
                      className="absolute cursor-pointer"
                      style={{
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        width: `${zone.width}%`,
                        height: `${zone.height}%`,
                      }}
                      onMouseEnter={(e) => {
                        setHovered(apt);
                        setTooltipPos({ x: e.clientX + 16, y: e.clientY - 10 });
                      }}
                      onMouseMove={(e) => setTooltipPos({ x: e.clientX + 16, y: e.clientY - 10 })}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => navigate(`/appartement/${apt.id}`)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {hovered && !isMobile && (
          <div
            className="fixed z-50 pointer-events-none bg-card border border-border rounded-lg shadow-xl px-4 py-3 min-w-[200px]"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <p className="font-semibold text-foreground">{hovered.name}</p>
            <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
              <p>Surface : {hovered.surface} m²</p>
              <p>Prix : {hovered.prix ? formatPrice(hovered.prix) : "—"}</p>
              <p>
                Statut :{" "}
                <span className={
                  hovered.status === "Disponible" ? "text-available font-medium" :
                  hovered.status === "Réservé" ? "text-reserved font-medium" : "text-sold font-medium"
                }>{hovered.status}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
