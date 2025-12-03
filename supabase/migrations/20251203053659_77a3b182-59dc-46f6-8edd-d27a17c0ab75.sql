-- Table pour stocker les sites générés
CREATE TABLE public.generated_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_description TEXT NOT NULL,
  business_type TEXT,
  site_name TEXT,
  generated_html TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pas de RLS car les sites sont publics pour la démo
ALTER TABLE public.generated_sites ENABLE ROW LEVEL SECURITY;

-- Politique publique pour lecture
CREATE POLICY "Anyone can read sites" 
ON public.generated_sites 
FOR SELECT 
USING (true);

-- Politique publique pour création (démo)
CREATE POLICY "Anyone can create sites" 
ON public.generated_sites 
FOR INSERT 
WITH CHECK (true);