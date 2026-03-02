import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Blueprint { id: string; name: string; floor_label: string; image_url: string; }
interface Apartment {
  id: string; name: string; blueprint_id: string | null; status: string;
  zone: { x: number; y: number; width: number; height: number } | null;
}

type Zone = { x: number; y: number; width: number; height: number };

export default function ZoneEditor() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBp, setSelectedBp] = useState<string>("");
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<Zone | null>(null);
  const [newZoneDialog, setNewZoneDialog] = useState(false);
  const [newZone, setNewZone] = useState<Zone | null>(null);
  const [newAptForm, setNewAptForm] = useState({ name: "", status: "Disponible" });
  const containerRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data: bData } = await supabase.from("blueprints").select("*").order("display_order");
    if (bData) {
      setBlueprints(bData as Blueprint[]);
      if (bData.length > 0 && !selectedBp) setSelectedBp(bData[0].id);
    }
  };

  const loadApartments = async () => {
    if (!selectedBp) return;
    const { data } = await supabase.from("apartments").select("id, name, blueprint_id, status, zone").eq("blueprint_id", selectedBp).order("display_order");
    if (data) setApartments(data as unknown as Apartment[]);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (selectedBp) loadApartments(); }, [selectedBp]);

  const getRelativePos = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getRelativePos(e);
    setStartPos(pos);
    setDrawing(true);
    setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !startPos) return;
    const pos = getRelativePos(e);
    setCurrentRect({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
    });
  };

  const handleMouseUp = () => {
    if (!drawing || !currentRect) return;
    setDrawing(false);
    setStartPos(null);

    if (currentRect.width < 1 || currentRect.height < 1) {
      setCurrentRect(null);
      return;
    }

    const zone = {
      x: Math.round(currentRect.x * 100) / 100,
      y: Math.round(currentRect.y * 100) / 100,
      width: Math.round(currentRect.width * 100) / 100,
      height: Math.round(currentRect.height * 100) / 100,
    };

    setNewZone(zone);
    setCurrentRect(null);
    setNewZoneDialog(true);
  };

  const handleCreateZoneApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone || !selectedBp) return;

    const { error } = await supabase.from("apartments").insert({
      name: newAptForm.name,
      status: newAptForm.status,
      blueprint_id: selectedBp,
      zone: newZone,
    });

    if (error) toast.error(error.message);
    else toast.success(`"${newAptForm.name}" créé et placé sur le plan`);

    setNewZoneDialog(false);
    setNewZone(null);
    setNewAptForm({ name: "", status: "Disponible" });
    loadApartments();
  };

  const clearZone = async (aptId: string) => {
    await supabase.from("apartments").update({ zone: null }).eq("id", aptId);
    toast.success("Zone supprimée");
    loadApartments();
  };

  const blueprint = blueprints.find((b) => b.id === selectedBp);
  const statusColor = (s: string) => s === "Disponible" ? "hsl(145, 50%, 42%)" : s === "Réservé" ? "hsl(38, 80%, 55%)" : "hsl(0, 60%, 50%)";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/apartments">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold font-heading">Éditeur de zones</h1>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="space-y-1">
          <label className="text-sm font-medium">Plan</label>
          <Select value={selectedBp} onValueChange={setSelectedBp}>
            <SelectTrigger className="w-[240px]"><SelectValue placeholder="Choisir un plan" /></SelectTrigger>
            <SelectContent>
              {blueprints.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name} — {b.floor_label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        Dessinez un rectangle sur le plan pour créer automatiquement un nouvel élément (appartement, garage, etc.) lié à ce plan.
      </p>

      {blueprint ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div
            ref={containerRef}
            className="relative select-none cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <img src={blueprint.image_url} alt={blueprint.name} className="w-full h-auto block" draggable={false} />

            {apartments.filter((a) => a.zone).map((a) => (
              <div
                key={a.id}
                className="absolute border-2 flex items-center justify-center group"
                style={{
                  left: `${a.zone!.x}%`, top: `${a.zone!.y}%`,
                  width: `${a.zone!.width}%`, height: `${a.zone!.height}%`,
                  borderColor: statusColor(a.status),
                  backgroundColor: statusColor(a.status).replace(")", ", 0.2)").replace("hsl(", "hsla("),
                }}
              >
                <span className="text-[10px] font-bold text-foreground bg-card/80 px-1 rounded">{a.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); clearZone(a.id); }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {currentRect && (
              <div
                className="absolute border-2 border-accent border-dashed bg-accent/20 pointer-events-none"
                style={{
                  left: `${currentRect.x}%`, top: `${currentRect.y}%`,
                  width: `${currentRect.width}%`, height: `${currentRect.height}%`,
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-12">Ajoutez d'abord un plan dans la section "Plans & Étages"</p>
      )}

      {/* Zone apartments list */}
      {apartments.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Éléments sur ce plan</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {apartments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-2 rounded-lg border border-border text-sm">
                <div>
                  <span className="font-medium">{a.name}</span>
                  <span className={`ml-2 text-xs ${a.zone ? "text-available" : "text-muted-foreground"}`}>
                    {a.zone ? "Zone définie" : "Pas de zone"}
                  </span>
                </div>
                {a.zone && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => clearZone(a.id)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog to create apartment from drawn zone */}
      <Dialog open={newZoneDialog} onOpenChange={setNewZoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel élément sur le plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateZoneApartment} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input required value={newAptForm.name} onChange={(e) => setNewAptForm({ ...newAptForm, name: e.target.value })} placeholder="Appt A1, Garage G1, ..." />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={newAptForm.status} onValueChange={(v) => setNewAptForm({ ...newAptForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Réservé">Réservé</SelectItem>
                  <SelectItem value="Vendu">Vendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">Vous pourrez compléter les détails (prix, surface, description) dans la section Appartements.</p>
            <Button type="submit" className="w-full">Créer et placer</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
