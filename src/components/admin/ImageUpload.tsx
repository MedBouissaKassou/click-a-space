import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/compressImage";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
}

export default function ImageUpload({ label, value, onChange, bucket = "apartment-images" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Compress image before upload (max 1400px, 80% quality JPEG)
      const compressed = await compressImage(file, 1400, 0.8);
      const path = `${crypto.randomUUID()}.jpg`;

      const { error } = await supabase.storage.from(bucket).upload(path, compressed, {
        contentType: "image/jpeg",
        cacheControl: "3600",
      });

      if (error) {
        toast.error("Erreur d'upload : " + error.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Image uploadée et optimisée");
    } catch (err) {
      toast.error("Erreur de compression");
    }

    setUploading(false);
  };

  const handleRemove = () => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={value} alt={label} className="w-full h-32 object-cover" />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-20 flex flex-col gap-1"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span className="text-xs">{uploading ? "Optimisation..." : "Choisir une image"}</span>
        </Button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}
