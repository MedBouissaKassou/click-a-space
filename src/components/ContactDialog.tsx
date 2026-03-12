import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface ContactDialogProps {
  children: React.ReactNode;
}

export default function ContactDialog({ children }: ContactDialogProps) {
  const settings = useSiteSettings();
  const phone = settings.contact_phone || "";
  const whatsapp = settings.whatsapp_number || "";

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
