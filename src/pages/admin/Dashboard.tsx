import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Map, Eye } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ blueprints: 0, apartments: 0, available: 0 });

  useEffect(() => {
    const load = async () => {
      const [{ count: bCount }, { count: aCount }, { count: avCount }] = await Promise.all([
        supabase.from("blueprints").select("*", { count: "exact", head: true }),
        supabase.from("apartments").select("*", { count: "exact", head: true }),
        supabase.from("apartments").select("*", { count: "exact", head: true }).eq("status", "Disponible"),
      ]);
      setStats({ blueprints: bCount ?? 0, apartments: aCount ?? 0, available: avCount ?? 0 });
    };
    load();
  }, []);

  const cards = [
    { title: "Plans", value: stats.blueprints, icon: Map, color: "text-accent" },
    { title: "Appartements", value: stats.apartments, icon: Building2, color: "text-foreground" },
    { title: "Disponibles", value: stats.available, icon: Eye, color: "text-available" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-6">Tableau de bord</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
