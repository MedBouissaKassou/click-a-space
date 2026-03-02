import { Link } from "react-router-dom";
import { Building2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-accent" />
          <span className="text-xl font-bold font-heading tracking-tight text-foreground">
            OCE<span className="text-gold">ANA</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="/#projet" className="hover:text-foreground transition-colors">Le Projet</a>
            <a href="/#galerie" className="hover:text-foreground transition-colors">Galerie</a>
            <a href="/#plan" className="hover:text-foreground transition-colors">Plan</a>
            <a href="/#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
