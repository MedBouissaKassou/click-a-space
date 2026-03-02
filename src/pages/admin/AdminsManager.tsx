import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

interface Admin {
  user_id: string;
  profiles: { email: string; full_name: string } | null;
}

export default function AdminsManager() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const load = async () => {
    const { data } = await supabase.functions.invoke("manage-admin", {
      body: { action: "list" },
    });
    if (data?.admins) setAdmins(data.admins);
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("manage-admin", {
      body: { action: "invite", email: email.trim() },
    });
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Erreur");
    } else {
      toast.success("Administrateur ajouté");
      setEmail("");
      load();
    }
    setLoading(false);
  };

  const handleRemove = async (adminEmail: string) => {
    if (!confirm(`Retirer les droits admin de ${adminEmail} ?`)) return;
    const { data, error } = await supabase.functions.invoke("manage-admin", {
      body: { action: "remove", email: adminEmail },
    });
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Erreur");
    } else {
      toast.success("Droits retirés");
      load();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-6">Administrateurs</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Inviter un administrateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="flex-1">
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email de l'utilisateur (doit avoir un compte)" />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "..." : "Inviter"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            L'utilisateur doit d'abord créer un compte via la page de connexion admin.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" /> Liste des administrateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((a) => (
                <TableRow key={a.user_id}>
                  <TableCell>{a.profiles?.email || "—"}</TableCell>
                  <TableCell>{a.profiles?.full_name || "—"}</TableCell>
                  <TableCell>
                    {a.user_id !== user?.id && (
                      <Button size="icon" variant="ghost" onClick={() => handleRemove(a.profiles?.email || "")}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">Aucun administrateur</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
