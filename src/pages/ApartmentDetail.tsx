import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/apartments";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import blueprintImg from "@/assets/apartment-blueprint-default.jpg";
import interiorPlanImg from "@/assets/interior-plan-default.jpg";
import buildingSimImg from "@/assets/building-simulation-default.jpg";

interface Apartment {
  id: string;
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
}

const imageLabels = [
  { src: blueprintImg, label: "Plan technique" },
  { src: interiorPlanImg, label: "Plan intérieur aménagé" },
  { src: buildingSimImg, label: "Simulation 3D" },
];

export default function ApartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [apt, setApt] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data } = await supabase.from("apartments").select("*").eq("id", id).single();
      if (data) setApt(data as unknown as Apartment);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!apt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Appartement introuvable</h1>
          <Link to="/" className="text-gold hover:underline">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const statusClass =
    apt.status === "Disponible" ? "bg-available" :
    apt.status === "Réservé" ? "bg-reserved" : "bg-sold";

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link to="/#plan" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au plan
        </Link>

        <div className="flex flex-col md:flex-row gap-2 items-start md:items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-playfair">
            {apt.name} {apt.tranche ? `(${apt.tranche})` : ""}
          </h1>
          <span className={`${statusClass} text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full ml-0 md:ml-4`}>
            {apt.status}
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
          <div className="grid md:grid-cols-[340px_1fr]">
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between">
              <div>
                <div className="rounded-xl overflow-hidden mb-6 border border-border">
                  <img src={buildingSimImg} alt="Vue du bâtiment" className="w-full h-32 object-cover" />
                </div>
                <div className="space-y-3 mb-6">
                  {apt.bloc && <div className="flex justify-between items-center"><span className="text-muted-foreground text-sm">Bloc</span><span className="font-semibold">{apt.bloc}</span></div>}
                  {apt.niveau && <div className="flex justify-between items-center"><span className="text-muted-foreground text-sm">Niveau</span><span className="font-semibold">{apt.niveau}</span></div>}
                  {apt.rooms && <div className="flex justify-between items-center"><span className="text-muted-foreground text-sm">Pièces</span><span className="font-semibold">{apt.rooms} pièces</span></div>}
                </div>
                <div className="border-t border-border pt-4 space-y-3">
                  {apt.surface && <div className="flex justify-between items-center"><span className="text-muted-foreground text-sm">Surface Totale</span><span className="font-bold text-lg">{apt.surface} M2</span></div>}
                  {apt.prix && <div className="flex justify-between items-center"><span className="text-muted-foreground text-sm">Prix TTC</span><span className="font-bold text-lg text-gold">{formatPrice(apt.prix)}</span></div>}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Disponibilité</span>
                    <span className={`font-bold ${apt.status === "Disponible" ? "text-available" : apt.status === "Réservé" ? "text-reserved" : "text-sold"}`}>{apt.status}</span>
                  </div>
                </div>
              </div>
              {apt.status === "Disponible" && (
                <a href="#contact" className="block text-center mt-6 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Nous contacter
                </a>
              )}
            </div>

            <div className="p-4 md:p-6 flex flex-col">
              <div className="flex-1 bg-muted rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                <img src={imageLabels[activeImg].src} alt={imageLabels[activeImg].label} className="w-full h-full object-contain p-2" />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {imageLabels.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? "border-gold shadow-md" : "border-border hover:border-muted-foreground/40"}`}>
                    <div className="aspect-[4/3] bg-muted"><img src={img.src} alt={img.label} className="w-full h-full object-cover" /></div>
                    <p className="text-[11px] text-center py-1 font-medium text-muted-foreground">{img.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {apt.description && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{apt.description}</p>
            </div>
          )}
          {apt.features && apt.features.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-2 gap-3">
                {apt.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-available shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
