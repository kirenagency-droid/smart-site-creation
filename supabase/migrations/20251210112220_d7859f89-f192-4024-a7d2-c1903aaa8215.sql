-- Drop overly permissive RLS policies on generated_sites
DROP POLICY IF EXISTS "Anyone can create sites" ON public.generated_sites;
DROP POLICY IF EXISTS "Anyone can read sites" ON public.generated_sites;

-- Create restrictive policies requiring authentication
CREATE POLICY "Authenticated users can create sites"
ON public.generated_sites
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can read sites"
ON public.generated_sites
FOR SELECT
TO authenticated
USING (true);