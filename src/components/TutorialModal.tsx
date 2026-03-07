import { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import tutorialBlueprint from "@/assets/tutorial-blueprint.png";
import handPointer from "@/assets/hand-pointer.png";

const TUTORIAL_KEY = "tutorial_dismissed_v2";

export default function TutorialModal() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const dismissed = localStorage.getItem(TUTORIAL_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(TUTORIAL_KEY, "true");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-3 md:p-6">
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content - ABOVE the image */}
        <div className="p-5 md:p-8 flex flex-col items-center text-center gap-3">
          <h3 className="text-xl md:text-2xl font-bold">Comment explorer les plans ?</h3>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-md">
            {isMobile
              ? "Appuyez sur une zone colorée du plan pour voir les détails de chaque appartement."
              : "Cliquez sur une zone du plan interactif pour découvrir les détails de chaque appartement."}
          </p>

          {/* Legend */}
          <div className="w-full bg-muted/50 rounded-xl p-3 flex flex-wrap justify-center gap-4 md:gap-6">
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
        </div>

        {/* Blueprint image with animated hand */}
        <div className="relative w-full overflow-hidden bg-muted/20 mx-auto">
          <img
            src={tutorialBlueprint}
            alt="Plan interactif"
            className="w-full h-auto object-contain"
          />
          {/* Animated tapping hand icon - centered on CO3 zone */}
          <div
            className="absolute pointer-events-none animate-tutorial-tap"
            style={{ top: "18%", left: "52%" }}
          >
            <Hand className="w-10 h-10 md:w-14 md:h-14 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" fill="white" fillOpacity={0.15} />
          </div>
          {/* Ripple effect at fingertip position */}
          <div
            className="absolute w-6 h-6 md:w-10 md:h-10 rounded-full border-2 border-white pointer-events-none animate-tutorial-ripple"
            style={{ top: "28%", left: "56%", transform: "translate(-50%, -50%)" }}
          />
          <div
            className="absolute w-3 h-3 md:w-5 md:h-5 rounded-full bg-white/40 pointer-events-none animate-tutorial-ripple"
            style={{ top: "28%", left: "56%", transform: "translate(-50%, -50%)", animationDelay: "0.15s" }}
          />
        </div>

        {/* CTA button */}
        <div className="p-5 md:p-8 pt-4">
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <MapPin className="w-4 h-4" />
            Compris, explorer le plan
          </button>
        </div>
      </div>
    </div>
  );
}
