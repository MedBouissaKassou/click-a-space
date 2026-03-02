import { useParams, Link } from "react-router-dom";
import { getApartment, formatPrice } from "@/data/apartments";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, MapPin, Maximize, DoorOpen, CheckCircle2 } from "lucide-react";
import floorPlanImg from "@/assets/floor-plan.png";
import interiorPlanImg from "@/assets/interior-plan-default.jpg";
import buildingSimImg from "@/assets/building-simulation-default.jpg";
import { useState } from "react";

const imageLabels = [
  { src: floorPlanImg, label: "Plan de masse" },
  { src: interiorPlanImg, label: "Plan intérieur aménagé" },
  { src: buildingSimImg, label: "Simulation 3D" },
];

export default function ApartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const apt = getApartment(id || "");
  const [activeImg, setActiveImg] = useState(0);

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
    apt.status === "Disponible"
      ? "bg-available"
      : apt.status === "Réservé"
      ? "bg-reserved"
      : "bg-sold";

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link
          to="/#plan"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au plan
        </Link>

        <div className="flex flex-col md:flex-row gap-2 items-start md:items-center mb-6">
          <h1 className="text-4xl font-bold">{apt.name}</h1>
          <span className={`${statusClass} text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full ml-0 md:ml-4`}>
            {apt.status}
          </span>
        </div>

        {/* 3 Images Section */}
        <div className="mb-10">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="aspect-[16/9] w-full bg-muted flex items-center justify-center">
              <img
                src={imageLabels[activeImg].src}
                alt={imageLabels[activeImg].label}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {imageLabels.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`rounded-lg overflow-hidden border-2 transition-all ${
                  activeImg === i
                    ? "border-gold shadow-lg"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <div className="aspect-[4/3] bg-muted">
                  <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-center py-1.5 font-medium text-muted-foreground">{img.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">Emplacement</p>
                  <p className="font-medium">Bloc {apt.bloc} · {apt.niveau}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Maximize className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">Surface totale</p>
                  <p className="font-medium">{apt.surface} m²</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DoorOpen className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">Pièces</p>
                  <p className="font-medium">{apt.rooms} pièces</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-xs text-muted-foreground mb-1">Prix TTC</p>
              <p className="text-3xl font-bold text-gold">{formatPrice(apt.prix)}</p>
              <p className="text-xs text-muted-foreground mt-2">{apt.tranche} — Livraison fin 2026</p>
            </div>

            {apt.status === "Disponible" && (
              <a
                href="#contact"
                className="block text-center px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Nous contacter
              </a>
            )}
          </div>

          {/* Right content */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{apt.description}</p>
            </div>

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

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Situation</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Bloc</p>
                  <p className="font-medium">{apt.bloc}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Niveau</p>
                  <p className="font-medium">{apt.niveau}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tranche</p>
                  <p className="font-medium">{apt.tranche}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Disponibilité</p>
                  <p className={
                    apt.status === "Disponible" ? "font-medium text-available" :
                    apt.status === "Réservé" ? "font-medium text-reserved" :
                    "font-medium text-sold"
                  }>{apt.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
