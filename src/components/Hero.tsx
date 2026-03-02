import heroImg from "@/assets/hero-building.jpg";

export default function Hero() {
  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
      <img
        src={heroImg}
        alt="Résidence OCEANA"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 pb-16">
        <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">
          Résidence de standing
        </p>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
          Résidence OCEANA
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Découvrez nos appartements de standing allant de 65 à 115 m², livrés clé en main avec des finitions haut de gamme.
        </p>
        <a
          href="#plan"
          className="inline-block mt-6 px-8 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Explorer le plan
        </a>
      </div>
    </section>
  );
}
