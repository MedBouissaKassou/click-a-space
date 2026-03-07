import { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import tutorialGif from "@/assets/tutorial-hand.gif";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-3 md:p-6">
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* GIF preview */}
        <div className="w-full overflow-hidden rounded-t-2xl bg-muted/30">
          <img
            src={tutorialGif}
            alt="Tutorial - cliquez sur une zone du plan"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Content */}
        <div className="p-5 md:p-8 flex flex-col items-center text-center gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">Comment explorer les plans ?</h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              {isMobile
                ? "Appuyez sur les points colorés sur le plan pour voir les détails de chaque appartement."
                : "Survolez les zones du plan interactif et cliquez pour découvrir les détails de chaque appartement."}
            </p>
          </div>

          {/* Legend */}
          <div className="w-full bg-muted/50 rounded-xl p-4 flex flex-wrap justify-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-available" />
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-reserved" />
              <span className="text-sm">Réservé</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sold" />
              <span className="text-sm">Vendu</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full mt-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <MapPin className="w-4 h-4" />
            Compris, explorer le plan
          </button>
        </div>
      </div>
    </div>
  );
}
