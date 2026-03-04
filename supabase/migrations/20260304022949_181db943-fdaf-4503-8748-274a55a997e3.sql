
-- Create hero_images table for carousel
CREATE TABLE public.hero_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view hero images" ON public.hero_images FOR SELECT USING (true);
CREATE POLICY "Admins can insert hero images" ON public.hero_images FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update hero images" ON public.hero_images FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete hero images" ON public.hero_images FOR DELETE USING (is_admin(auth.uid()));

CREATE TRIGGER update_hero_images_updated_at BEFORE UPDATE ON public.hero_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add site settings for social/contact
INSERT INTO public.site_settings (key, value) VALUES
  ('whatsapp_number', '+216 XX XXX XXX'),
  ('facebook_url', 'https://facebook.com/oceana'),
  ('instagram_url', 'https://instagram.com/oceana')
ON CONFLICT DO NOTHING;

-- Create hero-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-images', 'hero-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public can view hero images storage" ON storage.objects FOR SELECT USING (bucket_id = 'hero-images');
CREATE POLICY "Admins can upload hero images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hero-images' AND is_admin(auth.uid()));
CREATE POLICY "Admins can update hero images storage" ON storage.objects FOR UPDATE USING (bucket_id = 'hero-images' AND is_admin(auth.uid()));
CREATE POLICY "Admins can delete hero images storage" ON storage.objects FOR DELETE USING (bucket_id = 'hero-images' AND is_admin(auth.uid()));
