import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";

interface Setting { id: string; key: string; value: string; }

const settingLabels: Record<string, { label: string; type: "text" | "textarea" }> = {
  site_title: { label: "Titre du site", type: "text" },
  site_description: { label: "Description du site", type: "textarea" },
  hero_title: { label: "Titre du héros", type: "text" },
  hero_subtitle: { label: "Sous-titre du héros", type: "text" },
  contact_phone: { label: "Téléphone", type: "text" },
  contact_email: { label: "Email de contact", type: "text" },
  contact_address: { label: "Adresse", type: "text" },
  whatsapp_number: { label: "Numéro WhatsApp", type: "text" },
  facebook_url: { label: "Lien Facebook", type: "text" },
  instagram_url: { label: "Lien Instagram", type: "text" },
  footer_text: { label: "Texte du pied de page", type: "text" },
  google_maps_url: { label: "Lien Google Maps (localisation)", type: "text" },
  vision_title: { label: "Titre section Vision", type: "text" },
  vision_text: { label: "Texte section Vision", type: "textarea" },
  project_title: { label: "Titre section Projet", type: "text" },
};

const cardKeys = [
  { prefix: "card1", defaultTitle: "Architecture contemporaine" },
  { prefix: "card2", defaultTitle: "Emplacement stratégique" },
  { prefix: "card3", defaultTitle: "Emplacement" },
];

export default function SiteSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        setSettings(data as Setting[]);
        const v: Record<string, string> = {};
        (data as Setting[]).forEach((s) => (v[s.key] = s.value));
        setValues(v);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const promises = settings.map((s) =>
      supabase.from("site_settings").update({ value: values[s.key] || "" }).eq("id", s.id)
    );
    await Promise.all(promises);
    toast.success("Paramètres sauvegardés");
    setSaving(false);
  };

  const handleLogoChange = (url: string) => {
    setValues({ ...values, logo_url: url });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading">Paramètres du site</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Logo */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Logo du site</CardTitle></CardHeader>
          <CardContent>
            <ImageUpload
              label="Logo (utilisé dans le header et le footer)"
              value={values.logo_url || ""}
              onChange={handleLogoChange}
            />
          </CardContent>
        </Card>

        {/* Site Content */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Contenu du site</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settingLabels).filter(([k]) =>
              ["site_title", "site_description", "hero_title", "hero_subtitle", "vision_title", "vision_text", "project_title"].includes(k)
            ).map(([key, config]) => (
              <div key={key} className="space-y-1">
                <Label>{config.label}</Label>
                {config.type === "textarea" ? (
                  <Textarea value={values[key] || ""} onChange={(e) => setValues({ ...values, [key]: e.target.value })} />
                ) : (
                  <Input value={values[key] || ""} onChange={(e) => setValues({ ...values, [key]: e.target.value })} />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Cartes du projet</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {cardKeys.map(({ prefix, defaultTitle }) => (
              <div key={prefix} className="space-y-3 p-4 border border-border rounded-lg">
                <p className="font-medium text-sm text-muted-foreground">{defaultTitle}</p>
                <div className="space-y-1">
                  <Label>Titre</Label>
                  <Input
                    value={values[`${prefix}_title`] || ""}
                    onChange={(e) => setValues({ ...values, [`${prefix}_title`]: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea
                    value={values[`${prefix}_text`] || ""}
                    onChange={(e) => setValues({ ...values, [`${prefix}_text`]: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settingLabels).filter(([k]) => k.startsWith("contact_") || k === "whatsapp_number").map(([key, config]) => (
              <div key={key} className="space-y-1">
                <Label>{config.label}</Label>
                <Input value={values[key] || ""} onChange={(e) => setValues({ ...values, [key]: e.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Réseaux sociaux</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settingLabels).filter(([k]) => k === "facebook_url" || k === "instagram_url").map(([key, config]) => (
              <div key={key} className="space-y-1">
                <Label>{config.label}</Label>
                <Input value={values[key] || ""} onChange={(e) => setValues({ ...values, [key]: e.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Localisation</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Label>{settingLabels.google_maps_url.label}</Label>
              <Input value={values.google_maps_url || ""} onChange={(e) => setValues({ ...values, google_maps_url: e.target.value })} placeholder="https://maps.google.com/..." />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Pied de page</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Label>{settingLabels.footer_text.label}</Label>
              <Input value={values.footer_text || ""} onChange={(e) => setValues({ ...values, footer_text: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
