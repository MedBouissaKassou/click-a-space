import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/apartments";
import { X } from "lucide-react";
import blueprintImg from "@/assets/apartment-blueprint-default.jpg";

interface Apartment {
  id: string;
  name: string;
  bloc: string | null;
  niveau: string | null;
  tranche: string | null;
  surface: number | null;
  prix: number | null;
  rooms: number | null;
  status: string;
  description: string | null;
  features: string[];
  image_blueprint_url: string | null;
}

interface Props {
  apartmentId: string | null;
  onClose: () => void;
}

export default function ApartmentPanel({ apartmentId, onClose }: Props) {
  const [apt, setApt] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apartmentId) {
      setApt(null);
      return;
    }
    setLoading(true);
    supabase
      .from("apartments")
      .select("*")
      .eq("id", apartmentId)
      .single()
      .then(({ data }) => {
        if (data) setApt(data as unknown as Apartment);
        setLoading(false);
      });
  }, [apartmentId]);

  if (!apartmentId) return null;

  const statusClass =
    apt?.status === "Disponible" ? "bg-available" :
    apt?.status === "Réservé" ? "bg-reserved" : "bg-sold";

  const planImage = apt?.image_blueprint_url || blueprintImg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg md:max-w-3xl h-full md:h-auto md:max-h-[90vh] md:rounded-2xl bg-background border-l md:border border-border shadow-2xl animate-slide-in-right flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !apt ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="p-4 pt-12 flex flex-col min-h-0 flex-1">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3 flex-shrink-0">
              <h2 className="text-xl font-bold font-heading">
                {apt.name} {apt.tranche ? `(${apt.tranche})` : ""}
              </h2>
              <span className={`${statusClass} text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full`}>
                {apt.status}
              </span>
            </div>

            {/* Plan image - takes available space but constrained */}
            <div className="bg-card border border-border rounded-xl overflow-hidden mb-3 min-h-0 flex-1 flex items-center justify-center">
              <img
                src={planImage}
                alt={`Plan ${apt.name}`}
                className="w-full h-full object-contain max-h-[45vh]"
              />
            </div>

            {/* Info grid - compact */}
            <div className="bg-card border border-border rounded-xl p-3 grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3 flex-shrink-0">
              {apt.bloc && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Bloc </span>
                  <span className="font-semibold">{apt.bloc}</span>
                </div>
              )}
              {apt.niveau && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Niveau </span>
                  <span className="font-semibold">{apt.niveau}</span>
                </div>
              )}
              {apt.rooms && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Pièces </span>
                  <span className="font-semibold">{apt.rooms}</span>
                </div>
              )}
              {apt.surface && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Surface </span>
                  <span className="font-bold">{apt.surface} m²</span>
                </div>
              )}
              {apt.prix && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Prix TTC </span>
                  <span className="font-bold text-gold">{formatPrice(apt.prix)}</span>
                </div>
              )}
              <div className="text-xs">
                <span className="text-muted-foreground">Statut </span>
                <span className={`font-bold ${apt.status === "Disponible" ? "text-available" : apt.status === "Réservé" ? "text-reserved" : "text-sold"}`}>
                  {apt.status}
                </span>
              </div>
            </div>

            {apt.status === "Disponible" && (
              <a
                href="#contact"
                onClick={onClose}
                className="block w-full text-center px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex-shrink-0"
              >
                Nous contacter
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
