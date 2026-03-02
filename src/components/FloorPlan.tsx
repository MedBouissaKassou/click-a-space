import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/apartments";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const statusColor = (status: string) => {
  switch (status) {
    case "Disponible": return "rgba(34, 160, 90, 0.35)";
    case "Réservé": return "rgba(210, 160, 40, 0.35)";
    case "Vendu": return "rgba(200, 50, 50, 0.35)";
    default: return "rgba(100,100,100,0.2)";
  }
};

const statusBorder = (status: string) => {
  switch (status) {
    case "Disponible": return "rgba(34, 160, 90, 0.8)";
    case "Réservé": return "rgba(210, 160, 40, 0.8)";
    case "Vendu": return "rgba(200, 50, 50, 0.8)";
    default: return "rgba(100,100,100,0.5)";
  }
};

export default function FloorPlan() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBp, setSelectedBp] = useState<string>("");
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [hovered, setHovered] = useState<Apartment | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("blueprints").select("*").order("display_order");
      if (data && data.length > 0) {
        setBlueprints(data as Blueprint[]);
        setSelectedBp(data[0].id);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedBp) return;
    const load = async () => {
      const { data } = await supabase.from("apartments").select("id, name, surface, prix, status, zone").eq("blueprint_id", selectedBp);
      if (data) setApartments(data as unknown as Apartment[]);
    };
    load();
  }, [selectedBp]);

  const blueprint = blueprints.find((b) => b.id === selectedBp);

  if (blueprints.length === 0) return null;

  return (
    <section id="plan" className="py-4 md:py-16 px-0 md:px-4">
      <div className="w-full px-1 md:max-w-6xl md:mx-auto md:px-0">
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Plan Interactif</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cliquez sur un appartement pour découvrir ses détails
          </p>

          {blueprints.length > 1 && (
            <div className="flex justify-center mt-6">
              <Select value={selectedBp} onValueChange={setSelectedBp}>
                <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {blueprints.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name} — {b.floor_label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

        {blueprint && (
          <div className="relative inline-block w-full bg-card rounded-xl shadow-lg overflow-hidden border border-border">
            <img src={blueprint.image_url} alt={blueprint.name} className="w-full h-auto block" />

            {/* Zones as divs */}
            {apartments.filter((a) => a.zone).map((apt) => (
              <div
                key={apt.id}
                className="absolute cursor-pointer transition-all duration-200"
                style={{
                  left: `${apt.zone!.x}%`,
                  top: `${apt.zone!.y}%`,
                  width: `${apt.zone!.width}%`,
                  height: `${apt.zone!.height}%`,
                  backgroundColor: hovered?.id === apt.id ? statusBorder(apt.status) : statusColor(apt.status),
                  border: `2px solid ${statusBorder(apt.status)}`,
                }}
                onMouseEnter={(e) => {
                  setHovered(apt);
                  setTooltipPos({ x: e.clientX + 16, y: e.clientY - 10 });
                }}
                onMouseMove={(e) => setTooltipPos({ x: e.clientX + 16, y: e.clientY - 10 })}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(`/appartement/${apt.id}`)}
              />
            ))}

            {hovered && (
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
        )}
      </div>
    </section>
  );
}
