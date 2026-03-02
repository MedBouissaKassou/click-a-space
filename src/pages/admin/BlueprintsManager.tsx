import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface Blueprint {
  id: string;
  name: string;
  floor_label: string;
  image_url: string;
  display_order: number;
}

export default function BlueprintsManager() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Blueprint | null>(null);
  const [form, setForm] = useState({ name: "", floor_label: "", display_order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("blueprints").select("*").order("display_order");
    if (data) setBlueprints(data as Blueprint[]);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = editing?.image_url || "";

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("blueprints").upload(path, file);
      if (uploadError) { toast.error("Erreur upload: " + uploadError.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("blueprints").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    if (!imageUrl) { toast.error("Image requise"); setLoading(false); return; }

    if (editing) {
      const { error } = await supabase.from("blueprints").update({
        name: form.name, floor_label: form.floor_label, image_url: imageUrl, display_order: form.display_order,
      }).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Plan mis à jour");
    } else {
      const { error } = await supabase.from("blueprints").insert({
        name: form.name, floor_label: form.floor_label, image_url: imageUrl, display_order: form.display_order,
      });
      if (error) toast.error(error.message); else toast.success("Plan ajouté");
    }

    setOpen(false);
    setEditing(null);
    setFile(null);
    setForm({ name: "", floor_label: "", display_order: 0 });
    setLoading(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce plan et tous ses appartements ?")) return;
    await supabase.from("blueprints").delete().eq("id", id);
    toast.success("Plan supprimé");
    load();
  };

  const openEdit = (b: Blueprint) => {
    setEditing(b);
    setForm({ name: b.name, floor_label: b.floor_label, display_order: b.display_order });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading">Plans & Étages</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ name: "", floor_label: "", display_order: 0 }); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Ajouter un plan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier le plan" : "Nouveau plan"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Plan 1er étage" />
              </div>
              <div className="space-y-2">
                <Label>Étage</Label>
                <Input required value={form.floor_label} onChange={(e) => setForm({ ...form, floor_label: e.target.value })} placeholder="1er étage" />
              </div>
              <div className="space-y-2">
                <Label>Ordre d'affichage</Label>
                <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Image du plan {editing && "(laisser vide pour garder l'existante)"}</Label>
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
        {blueprints.map((b) => (
          <Card key={b.id}>
            <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
              <img src={b.image_url} alt={b.name} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{b.name}</h3>
              <p className="text-sm text-muted-foreground">{b.floor_label}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(b)}>
                  <Edit2 className="w-3 h-3 mr-1" /> Modifier
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(b.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {blueprints.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-12">Aucun plan ajouté</p>
        )}
      </div>
    </div>
  );
}
