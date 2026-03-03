
-- Create storage bucket for apartment images
INSERT INTO storage.buckets (id, name, public) VALUES ('apartment-images', 'apartment-images', true);

-- Allow public read access
CREATE POLICY "Public can view apartment images"
ON storage.objects FOR SELECT
USING (bucket_id = 'apartment-images');

-- Allow admins to upload
CREATE POLICY "Admins can upload apartment images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'apartment-images' AND public.is_admin(auth.uid()));

-- Allow admins to update
CREATE POLICY "Admins can update apartment images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'apartment-images' AND public.is_admin(auth.uid()));

-- Allow admins to delete
CREATE POLICY "Admins can delete apartment images"
ON storage.objects FOR DELETE
USING (bucket_id = 'apartment-images' AND public.is_admin(auth.uid()));
