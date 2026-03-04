import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

interface HeroImage {
  id: string;
  image_url: string;
  title: string | null;
  display_order: number;
}

export default function HeroImagesManager() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("hero_images").select("*").order("display_order");
    if (data) setImages(data as HeroImage[]);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("hero-images").upload(path, file);
    if (error) { toast.error("Erreur: " + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("hero-images").getPublicUrl(path);
    await supabase.from("hero_images").insert({ image_url: data.publicUrl, display_order: images.length });
    toast.success("Image ajoutée");
    setUploading(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("hero_images").delete().eq("id", id);
    toast.success("Image supprimée");
    load();
  };

  const handleTitleChange = async (id: string, title: string) => {
    await supabase.from("hero_images").update({ title }).eq("id", id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading">Images du carrousel</h1>
        <Button disabled={uploading} onClick={() => document.getElementById("hero-upload")?.click()}>
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Ajouter
        </Button>
        <input id="hero-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {images.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Upload className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Aucune image. L'image par défaut sera utilisée.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img) => (
          <Card key={img.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img src={img.image_url} alt={img.title || "Hero"} className="w-full h-full object-cover" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleDelete(img.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <CardContent className="p-3">
              <Label className="text-xs">Titre (optionnel)</Label>
              <Input
                defaultValue={img.title || ""}
                placeholder="Description..."
                className="mt-1"
                onBlur={(e) => handleTitleChange(img.id, e.target.value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
