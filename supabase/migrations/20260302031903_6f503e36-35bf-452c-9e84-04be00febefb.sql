
-- Gallery images table for the carousel
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery images" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Admins can insert gallery images" ON public.gallery_images FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update gallery images" ON public.gallery_images FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete gallery images" ON public.gallery_images FOR DELETE USING (is_admin(auth.uid()));

-- Storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

CREATE POLICY "Public can view gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Admins can upload gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Admins can delete gallery" ON storage.objects FOR DELETE USING (bucket_id = 'gallery');

-- Trigger for updated_at
CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
