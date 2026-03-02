
-- Create admin role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Blueprints (floor plans)
CREATE TABLE public.blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  floor_label TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;

-- Apartments
CREATE TABLE public.apartments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID REFERENCES public.blueprints(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bloc TEXT,
  niveau TEXT,
  tranche TEXT,
  surface NUMERIC,
  prix NUMERIC,
  rooms INT,
  status TEXT NOT NULL DEFAULT 'Disponible' CHECK (status IN ('Disponible', 'Réservé', 'Vendu')),
  description TEXT,
  features TEXT[] DEFAULT '{}',
  -- Zone rectangle as JSON: {x, y, width, height} in percentage
  zone JSONB,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;

-- Site settings (editable texts, contact info)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Storage bucket for blueprint images
INSERT INTO storage.buckets (id, name, public) VALUES ('blueprints', 'blueprints', true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blueprints_updated_at BEFORE UPDATE ON public.blueprints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_apartments_updated_at BEFORE UPDATE ON public.apartments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS POLICIES

-- user_roles: only admins can read, no direct insert/update/delete
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "No direct insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "No direct update" ON public.user_roles FOR UPDATE TO authenticated USING (false);
CREATE POLICY "No direct delete" ON public.user_roles FOR DELETE TO authenticated USING (false);

-- profiles: users see own, admins see all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- blueprints: public read, admin write
CREATE POLICY "Public can view blueprints" ON public.blueprints FOR SELECT USING (true);
CREATE POLICY "Admins can insert blueprints" ON public.blueprints FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update blueprints" ON public.blueprints FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete blueprints" ON public.blueprints FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- apartments: public read, admin write
CREATE POLICY "Public can view apartments" ON public.apartments FOR SELECT USING (true);
CREATE POLICY "Admins can insert apartments" ON public.apartments FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update apartments" ON public.apartments FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete apartments" ON public.apartments FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- site_settings: public read, admin write
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete site settings" ON public.site_settings FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Storage policies for blueprints bucket
CREATE POLICY "Public can view blueprint images" ON storage.objects FOR SELECT USING (bucket_id = 'blueprints');
CREATE POLICY "Admins can upload blueprint images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blueprints' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can update blueprint images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blueprints' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete blueprint images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blueprints' AND public.is_admin(auth.uid()));

-- Seed default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_title', 'Résidence Les Jardins'),
  ('site_description', 'Programme immobilier de standing au cœur de la ville'),
  ('hero_title', 'Votre Futur Chez-Vous'),
  ('hero_subtitle', 'Découvrez notre programme immobilier d''exception'),
  ('contact_phone', '+216 71 000 000'),
  ('contact_email', 'contact@residence-jardins.tn'),
  ('contact_address', 'Avenue Habib Bourguiba, Tunis'),
  ('footer_text', '© 2025 Résidence Les Jardins. Tous droits réservés.');
