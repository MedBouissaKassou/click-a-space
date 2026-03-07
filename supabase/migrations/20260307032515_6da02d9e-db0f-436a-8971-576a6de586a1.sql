
CREATE TABLE public.type_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('s1', 's2')),
  title text,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.type_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view type images" ON public.type_images FOR SELECT USING (true);
CREATE POLICY "Admins can insert type images" ON public.type_images FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update type images" ON public.type_images FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete type images" ON public.type_images FOR DELETE USING (is_admin(auth.uid()));

CREATE TRIGGER update_type_images_updated_at BEFORE UPDATE ON public.type_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('type-images', 'type-images', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public can view type images storage" ON storage.objects FOR SELECT USING (bucket_id = 'type-images');
CREATE POLICY "Admins can upload type images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'type-images');
CREATE POLICY "Admins can delete type images storage" ON storage.objects FOR DELETE USING (bucket_id = 'type-images');
