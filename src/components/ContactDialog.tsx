import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";

interface ContactDialogProps {
  children: React.ReactNode;
}

export default function ContactDialog({ children }: ContactDialogProps) {
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["contact_phone", "whatsapp_number"])
      .then(({ data }) => {
        data?.forEach((s: { key: string; value: string }) => {
          if (s.key === "contact_phone") setPhone(s.value);
          if (s.key === "whatsapp_number") setWhatsapp(s.value);
        });
      });
  }, []);

  const cleanNumber = (n: string) => n.replace(/\s+/g, "").replace(/^\+/, "");

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nous contacter</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          {phone && (
            <Button asChild variant="outline" className="justify-start gap-3 h-14">
              <a href={`tel:${phone}`}>
                <Phone className="w-5 h-5 text-accent" />
                <div className="text-left">
                  <p className="text-sm font-medium">Appeler</p>
                  <p className="text-xs text-muted-foreground">{phone}</p>
                </div>
              </a>
            </Button>
          )}
          {whatsapp && (
            <Button asChild variant="outline" className="justify-start gap-3 h-14">
              <a
                href={`https://wa.me/${cleanNumber(whatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 text-accent" />
                <div className="text-left">
                  <p className="text-sm font-medium">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">{whatsapp}</p>
                </div>
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
