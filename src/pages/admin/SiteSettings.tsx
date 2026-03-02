import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface Setting { id: string; key: string; value: string; }

const settingLabels: Record<string, { label: string; type: "text" | "textarea" }> = {
  site_title: { label: "Titre du site", type: "text" },
  site_description: { label: "Description du site", type: "textarea" },
  hero_title: { label: "Titre du héros", type: "text" },
  hero_subtitle: { label: "Sous-titre du héros", type: "text" },
  contact_phone: { label: "Téléphone", type: "text" },
  contact_email: { label: "Email de contact", type: "text" },
  contact_address: { label: "Adresse", type: "text" },
  footer_text: { label: "Texte du pied de page", type: "text" },
};

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading">Paramètres du site</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">Contenu du site</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settingLabels).filter(([k]) => !k.startsWith("contact_") && k !== "footer_text").map(([key, config]) => (
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

        <Card>
          <CardHeader><CardTitle className="text-lg">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settingLabels).filter(([k]) => k.startsWith("contact_")).map(([key, config]) => (
              <div key={key} className="space-y-1">
                <Label>{config.label}</Label>
                <Input value={values[key] || ""} onChange={(e) => setValues({ ...values, [key]: e.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>

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
