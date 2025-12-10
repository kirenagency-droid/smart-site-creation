-- Drop problematic policies on project_shares that reference auth.users
DROP POLICY IF EXISTS "Users can see shares sent to them" ON public.project_shares;
DROP POLICY IF EXISTS "Users can update their share status" ON public.project_shares;

-- Drop duplicate SELECT policy on projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;

-- Create fixed policies for project_shares using auth.jwt() instead of auth.users
CREATE POLICY "Users can see shares sent to them" 
ON public.project_shares 
FOR SELECT 
USING (
  (shared_with_user_id = auth.uid()) OR 
  (shared_with_email = auth.jwt()->>'email')
);

CREATE POLICY "Users can update their share status" 
ON public.project_shares 
FOR UPDATE 
USING (
  (shared_with_user_id = auth.uid()) OR 
  (shared_with_email = auth.jwt()->>'email')
)
WITH CHECK (
  (shared_with_user_id = auth.uid()) OR 
  (shared_with_email = auth.jwt()->>'email')
);