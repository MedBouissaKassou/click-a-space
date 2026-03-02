import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apartments, formatPrice, type Apartment } from "@/data/apartments";
import floorPlanImg from "@/assets/floor-plan.png";

const statusColor = (status: Apartment["status"]) => {
  switch (status) {
    case "Disponible":
      return "rgba(34, 160, 90, 0.35)";
    case "Réservé":
      return "rgba(210, 160, 40, 0.35)";
    case "Vendu":
      return "rgba(200, 50, 50, 0.35)";
  }
};

const statusBorder = (status: Apartment["status"]) => {
  switch (status) {
    case "Disponible":
      return "rgba(34, 160, 90, 0.8)";
    case "Réservé":
      return "rgba(210, 160, 40, 0.8)";
    case "Vendu":
      return "rgba(200, 50, 50, 0.8)";
  }
};

export default function FloorPlan() {
  const [hovered, setHovered] = useState<Apartment | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX + 16, y: e.clientY - 10 });
  };

  return (
    <section id="plan" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Plan du 1er Étage</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cliquez sur un appartement pour découvrir ses détails
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

        <div className="relative inline-block w-full bg-card rounded-xl shadow-lg overflow-hidden border border-border">
          <img
            src={floorPlanImg}
            alt="Plan 1er étage"
            className="w-full h-auto block"
          />
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
          >
            {apartments.map((apt) => (
              <polygon
                key={apt.id}
                points={apt.polygon}
                fill={hovered?.id === apt.id ? statusBorder(apt.status) : statusColor(apt.status)}
                stroke={statusBorder(apt.status)}
                strokeWidth="0.3"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHovered(apt)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(`/appartement/${apt.id}`)}
              />
            ))}
          </svg>

          {hovered && (
            <div
              className="fixed z-50 pointer-events-none bg-card border border-border rounded-lg shadow-xl px-4 py-3 min-w-[200px]"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
            >
              <p className="font-semibold text-foreground">{hovered.name}</p>
              <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                <p>Surface : {hovered.surface} m²</p>
                <p>Prix : {formatPrice(hovered.prix)}</p>
                <p>
                  Statut :{" "}
                  <span
                    className={
                      hovered.status === "Disponible"
                        ? "text-available font-medium"
                        : hovered.status === "Réservé"
                        ? "text-reserved font-medium"
                        : "text-sold font-medium"
                    }
                  >
                    {hovered.status}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
