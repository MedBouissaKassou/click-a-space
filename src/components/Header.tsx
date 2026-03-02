import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-accent" />
          <span className="text-xl font-bold font-heading tracking-tight text-foreground">
            KO<span className="text-gold">NCEPT</span>
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="/#projet" className="hover:text-foreground transition-colors">Le Projet</a>
          <a href="/#plan" className="hover:text-foreground transition-colors">Plan</a>
          <a href="/#contact" className="hover:text-foreground transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  );
}
