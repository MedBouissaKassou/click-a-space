import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  display_order: number;
}

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [form, setForm] = useState({ title: "", display_order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("gallery_images").select("*").order("display_order");
    if (data) setImages(data as GalleryImage[]);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = editing?.image_url || "";

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
      if (uploadError) { toast.error("Erreur upload: " + uploadError.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    if (!imageUrl) { toast.error("Image requise"); setLoading(false); return; }

    if (editing) {
      const { error } = await supabase.from("gallery_images").update({
        title: form.title || null, image_url: imageUrl, display_order: form.display_order,
      }).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Image mise à jour");
    } else {
      const { error } = await supabase.from("gallery_images").insert({
        title: form.title || null, image_url: imageUrl, display_order: form.display_order,
      });
      if (error) toast.error(error.message); else toast.success("Image ajoutée");
    }

    setOpen(false);
    setEditing(null);
    setFile(null);
    setForm({ title: "", display_order: 0 });
    setLoading(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette image ?")) return;
    await supabase.from("gallery_images").delete().eq("id", id);
    toast.success("Image supprimée");
    load();
  };

  const openEdit = (img: GalleryImage) => {
    setEditing(img);
    setForm({ title: img.title || "", display_order: img.display_order });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading">Galerie d'images</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ title: "", display_order: 0 }); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Ajouter une image</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier l'image" : "Nouvelle image"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Titre (optionnel)</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Vue extérieure" />
              </div>
              <div className="space-y-2">
                <Label>Ordre d'affichage</Label>
                <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Image {editing && "(laisser vide pour garder l'existante)"}</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "En cours..." : editing ? "Mettre à jour" : "Ajouter"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img) => (
          <Card key={img.id}>
            <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
              <img src={img.image_url} alt={img.title || "Gallery"} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{img.title || "Sans titre"}</h3>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(img)}>
                  <Edit2 className="w-3 h-3 mr-1" /> Modifier
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(img.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {images.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-12">Aucune image ajoutée</p>
        )}
      </div>
    </div>
  );
}
