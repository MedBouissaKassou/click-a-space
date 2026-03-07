import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/apartments";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import blueprintImg from "@/assets/apartment-blueprint-default.jpg";

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
  image_blueprint_url: string | null;
}

export default function ApartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [apt, setApt] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);

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

  const planImage = apt.image_blueprint_url || blueprintImg;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link to="/#plan" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au plan
        </Link>

        <div className="flex flex-col md:flex-row gap-2 items-start md:items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold font-playfair">
            {apt.name} {apt.tranche ? `(${apt.tranche})` : ""}
          </h1>
          <span className={`${statusClass} text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full ml-0 md:ml-4`}>
            {apt.status}
          </span>
        </div>

        {/* Single plan image */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <img
            src={planImage}
            alt={`Plan ${apt.name}`}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Compact info bar */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 flex flex-wrap gap-x-8 gap-y-3 items-center justify-between mb-6">
          {apt.bloc && (
            <div className="text-sm">
              <span className="text-muted-foreground">Bloc </span>
              <span className="font-semibold">{apt.bloc}</span>
            </div>
          )}
          {apt.niveau && (
            <div className="text-sm">
              <span className="text-muted-foreground">Niveau </span>
              <span className="font-semibold">{apt.niveau}</span>
            </div>
          )}
          {apt.rooms && (
            <div className="text-sm">
              <span className="text-muted-foreground">Pièces </span>
              <span className="font-semibold">{apt.rooms}</span>
            </div>
          )}
          {apt.surface && (
            <div className="text-sm">
              <span className="text-muted-foreground">Surface </span>
              <span className="font-bold">{apt.surface} m²</span>
            </div>
          )}
          {apt.prix && (
            <div className="text-sm">
              <span className="text-muted-foreground">Prix TTC </span>
              <span className="font-bold text-gold">{formatPrice(apt.prix)}</span>
            </div>
          )}
          <div className="text-sm">
            <span className="text-muted-foreground">Statut </span>
            <span className={`font-bold ${apt.status === "Disponible" ? "text-available" : apt.status === "Réservé" ? "text-reserved" : "text-sold"}`}>
              {apt.status}
            </span>
          </div>
          {apt.status === "Disponible" && (
            <a href="#contact" className="px-5 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              Nous contacter
            </a>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
