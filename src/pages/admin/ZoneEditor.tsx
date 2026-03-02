import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
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
  const [selectedApt, setSelectedApt] = useState<string>("");
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<Zone | null>(null);
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
    if (!selectedApt) { toast.error("Sélectionnez d'abord un appartement"); return; }
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

  const handleMouseUp = async () => {
    if (!drawing || !currentRect || !selectedApt) return;
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

    const { error } = await supabase.from("apartments").update({ zone }).eq("id", selectedApt);
    if (error) toast.error(error.message);
    else toast.success("Zone enregistrée");
    setCurrentRect(null);
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

        <div className="space-y-1">
          <label className="text-sm font-medium">Appartement à placer</label>
          <Select value={selectedApt} onValueChange={setSelectedApt}>
            <SelectTrigger className="w-[240px]"><SelectValue placeholder="Choisir un appartement" /></SelectTrigger>
            <SelectContent>
              {apartments.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name} {a.zone ? "✓" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        Sélectionnez un appartement puis dessinez un rectangle sur le plan pour définir sa zone cliquable.
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

            {/* Existing zones */}
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

            {/* Drawing preview */}
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

      {/* Apartments list */}
      {apartments.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Appartements sur ce plan</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {apartments.map((a) => (
              <div key={a.id} className={`flex items-center justify-between p-2 rounded-lg border text-sm ${
                selectedApt === a.id ? "border-accent bg-accent/5" : "border-border"
              }`}>
                <button className="flex-1 text-left" onClick={() => setSelectedApt(a.id)}>
                  <span className="font-medium">{a.name}</span>
                  <span className={`ml-2 text-xs ${a.zone ? "text-available" : "text-muted-foreground"}`}>
                    {a.zone ? "Zone définie" : "Pas de zone"}
                  </span>
                </button>
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
    </div>
  );
}
