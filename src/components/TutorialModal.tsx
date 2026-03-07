import { useState, useEffect } from "react";
import { X, MousePointerClick, Hand, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TutorialModal() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const dismissed = sessionStorage.getItem("tutorial_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("tutorial_dismissed", "true");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center">
            {isMobile ? (
              <Hand className="w-8 h-8 text-accent animate-bounce-gentle" />
            ) : (
              <MousePointerClick className="w-8 h-8 text-accent animate-bounce-gentle" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">Comment explorer les plans ?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isMobile
                ? "Appuyez sur les points colorés sur le plan pour voir les détails de chaque appartement."
                : "Survolez les zones du plan interactif et cliquez pour découvrir les détails de chaque appartement."}
            </p>
          </div>

          {/* Legend */}
          <div className="w-full bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Légende</p>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-available" />
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-reserved" />
              <span className="text-sm">Réservé</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-sold" />
              <span className="text-sm">Vendu</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full mt-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Compris, explorer le plan
          </button>
        </div>
      </div>
    </div>
  );
}
