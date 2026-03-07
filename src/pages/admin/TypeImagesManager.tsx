import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface TypeImage {
  id: string;
  category: string;
  title: string | null;
  image_url: string;
  display_order: number;
}

export default function TypeImagesManager() {
  const [images, setImages] = useState<TypeImage[]>([]);
  const [tab, setTab] = useState("s1");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TypeImage | null>(null);
  const [form, setForm] = useState({ title: "", display_order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("type_images").select("*").order("display_order");
    if (data) setImages(data as TypeImage[]);
  };

  useEffect(() => { load(); }, []);

  const filtered = images.filter((i) => i.category === tab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = editing?.image_url || "";

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("type-images").upload(path, file);
      if (uploadError) { toast.error("Erreur upload: " + uploadError.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("type-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    if (!imageUrl) { toast.error("Image requise"); setLoading(false); return; }

    if (editing) {
      const { error } = await supabase.from("type_images").update({
        title: form.title || null, image_url: imageUrl, display_order: form.display_order,
      }).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Image mise à jour");
    } else {
      const { error } = await supabase.from("type_images").insert({
        category: tab, title: form.title || null, image_url: imageUrl, display_order: form.display_order,
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
    await supabase.from("type_images").delete().eq("id", id);
    toast.success("Image supprimée");
    load();
  };

  const openEdit = (img: TypeImage) => {
    setEditing(img);
    setForm({ title: img.title || "", display_order: img.display_order });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading">Images S+1 / S+2</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ title: "", display_order: 0 }); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Ajouter une image</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier l'image" : `Nouvelle image ${tab.toUpperCase()}`}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Titre (optionnel)</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Appartement type" />
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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="s1">S+1</TabsTrigger>
          <TabsTrigger value="s2">S+2</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((img) => (
              <Card key={img.id}>
                <div className="aspect-[4/3] bg-muted overflow-hidden rounded-t-lg">
                  <img src={img.image_url} alt={img.title || "Type"} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm">{img.title || "Sans titre"}</h3>
                  <div className="flex gap-2 mt-2">
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
            {filtered.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-12">Aucune image ajoutée pour {tab.toUpperCase()}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
