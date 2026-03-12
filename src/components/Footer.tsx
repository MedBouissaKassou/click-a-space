import ContactDialog from "./ContactDialog";
import { Button } from "./ui/button";
import defaultLogo from "@/assets/univers-immobilier-logo.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Footer() {
  const settings = useSiteSettings();

  const logoUrl = settings.logo_url || defaultLogo;
  const whatsappClean = (settings.whatsapp_number || "").replace(/\s+/g, "").replace(/^\+/, "");

  return (
    <footer id="contact" className="bg-primary text-primary-foreground py-16 px-4 mt-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={logoUrl} alt="Logo" className="h-16 w-auto" loading="lazy" />
          </div>
          <p className="text-sm opacity-70">
            {settings.footer_text || "L'Univers Immobilier — Votre partenaire de confiance pour un investissement serein."}
          </p>
          <div className="flex items-center gap-3 mt-4">
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
            )}
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            )}
            {whatsappClean && (
              <a href={`https://wa.me/${whatsappClean}`} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <p className="text-sm opacity-70">{settings.contact_email || "contact@oceana-immobilier.com"}</p>
          <p className="text-sm opacity-70 mt-1">{settings.contact_phone || "+216 XX XXX XXX"}</p>
          <ContactDialog>
            <Button variant="secondary" size="sm" className="mt-3">
              Nous contacter
            </Button>
          </ContactDialog>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Localisation</h4>
          <p className="text-sm opacity-70 mb-3">{settings.contact_address || "Tunis, Tunisie"}</p>
          <div className="rounded-lg overflow-hidden border border-primary-foreground/20">
            <iframe
              title="Localisation"
              src={
                settings.google_maps_url?.includes("/embed")
                  ? settings.google_maps_url
                  : `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(settings.contact_address || "Rue du parc, Soukra, Tunisie")}`
              }
              width="100%"
              height="180"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-primary-foreground/20 text-center text-xs opacity-50">
        © 2026 OCEANA. Tous droits réservés.
      </div>
    </footer>
  );
}
