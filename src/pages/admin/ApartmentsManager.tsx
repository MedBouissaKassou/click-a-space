import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Apartment {
  id: string;
  blueprint_id: string | null;
  name: string;
  bloc: string | null;
  niveau: string | null;
  tranche: string | null;
  surface: number | null;
  prix: number | null;
  rooms: number | null;
  status: string;
  description: string | null;
  features: string[];
  zone: { x: number; y: number; width: number; height: number } | null;
}

interface Blueprint {
  id: string;
  name: string;
  floor_label: string;
}

const emptyForm = {
  name: "", bloc: "", niveau: "", tranche: "", surface: "", prix: "", rooms: "",
  status: "Disponible", description: "", features: "", blueprint_id: "",
};

export default function ApartmentsManager() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Apartment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    const [{ data: aData }, { data: bData }] = await Promise.all([
      supabase.from("apartments").select("*").order("display_order"),
      supabase.from("blueprints").select("id, name, floor_label").order("display_order"),
    ]);
    if (aData) setApartments(aData as unknown as Apartment[]);
    if (bData) setBlueprints(bData as Blueprint[]);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      bloc: form.bloc || null,
      niveau: form.niveau || null,
      tranche: form.tranche || null,
      surface: form.surface ? parseFloat(form.surface) : null,
      prix: form.prix ? parseFloat(form.prix) : null,
      rooms: form.rooms ? parseInt(form.rooms) : null,
      status: form.status,
      description: form.description || null,
      features: form.features ? form.features.split(",").map((f) => f.trim()).filter(Boolean) : [],
      blueprint_id: form.blueprint_id || null,
    };

    if (editing) {
      const { error } = await supabase.from("apartments").update(payload).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Appartement mis à jour");
    } else {
      const { error } = await supabase.from("apartments").insert(payload);
      if (error) toast.error(error.message); else toast.success("Appartement ajouté");
    }

    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setLoading(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet appartement ?")) return;
    await supabase.from("apartments").delete().eq("id", id);
    toast.success("Supprimé");
    load();
  };

  const openEdit = (a: Apartment) => {
    setEditing(a);
    setForm({
      name: a.name, bloc: a.bloc || "", niveau: a.niveau || "", tranche: a.tranche || "",
      surface: a.surface?.toString() || "", prix: a.prix?.toString() || "", rooms: a.rooms?.toString() || "",
      status: a.status, description: a.description || "", features: a.features?.join(", ") || "",
      blueprint_id: a.blueprint_id || "",
    });
    setOpen(true);
  };

  const formatPrice = (p: number | null) => p ? new Intl.NumberFormat("fr-FR").format(p) + " DT" : "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading">Appartements</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/zone-editor")}>
            <MapPin className="w-4 h-4 mr-2" /> Éditeur de zones
          </Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(emptyForm); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Ajouter</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier" : "Nouvel appartement"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Nom *</Label>
                    <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="A11" />
                  </div>
                  <div className="space-y-1">
                    <Label>Plan associé</Label>
                    <Select value={form.blueprint_id} onValueChange={(v) => setForm({ ...form, blueprint_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {blueprints.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name} — {b.floor_label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Bloc</Label>
                    <Input value={form.bloc} onChange={(e) => setForm({ ...form, bloc: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Niveau</Label>
                    <Input value={form.niveau} onChange={(e) => setForm({ ...form, niveau: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Tranche</Label>
                    <Input value={form.tranche} onChange={(e) => setForm({ ...form, tranche: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Surface (m²)</Label>
                    <Input type="number" value={form.surface} onChange={(e) => setForm({ ...form, surface: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Prix (DT)</Label>
                    <Input type="number" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Pièces</Label>
                    <Input type="number" value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponible">Disponible</SelectItem>
                      <SelectItem value="Réservé">Réservé</SelectItem>
                      <SelectItem value="Vendu">Vendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Caractéristiques (séparées par des virgules)</Label>
                  <Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Terrasse, Parking, ..." />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "En cours..." : editing ? "Mettre à jour" : "Ajouter"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Bloc</TableHead>
              <TableHead>Surface</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apartments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>{a.bloc || "—"}</TableCell>
                <TableCell>{a.surface ? `${a.surface} m²` : "—"}</TableCell>
                <TableCell>{formatPrice(a.prix)}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    a.status === "Disponible" ? "bg-available/20 text-available" :
                    a.status === "Réservé" ? "bg-reserved/20 text-reserved" : "bg-sold/20 text-sold"
                  }`}>{a.status}</span>
                </TableCell>
                <TableCell>
                  {a.zone ? <span className="text-xs text-available">✓ Définie</span> : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Edit2 className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {apartments.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun appartement</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
