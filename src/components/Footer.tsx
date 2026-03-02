import { Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground py-16 px-4 mt-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5" />
            <span className="text-lg font-bold font-heading">OCEANA</span>
          </div>
          <p className="text-sm opacity-70">
            L'Univers Immobilier — Votre partenaire de confiance pour un investissement serein.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <p className="text-sm opacity-70">contact@oceana-immobilier.com</p>
          <p className="text-sm opacity-70 mt-1">+216 XX XXX XXX</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Adresse</h4>
          <p className="text-sm opacity-70">Tunis, Tunisie</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-primary-foreground/20 text-center text-xs opacity-50">
        © 2026 OCEANA. Tous droits réservés.
      </div>
    </footer>
  );
}
