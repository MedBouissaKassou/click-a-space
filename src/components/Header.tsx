import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import ContactDialog from "./ContactDialog";
import logo from "@/assets/univers-immobilier-logo.png";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="L'Univers Immobilier" className="h-14 w-auto dark:bg-white dark:rounded-md dark:px-2 dark:py-1" />
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="/#projet" className="hover:text-foreground transition-colors">Projet en cours</a>
            <a href="/#plan" className="hover:text-foreground transition-colors">Plan</a>
            <ContactDialog>
              <button className="hover:text-foreground transition-colors">Contact</button>
            </ContactDialog>
          </nav>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
