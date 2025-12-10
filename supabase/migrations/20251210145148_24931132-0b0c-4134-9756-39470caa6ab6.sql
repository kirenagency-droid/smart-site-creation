-- Drop the problematic policies that reference auth.users
DROP POLICY IF EXISTS "Users can view shared projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects shared with them" ON public.projects;

-- Create a fixed policy that uses auth.jwt() instead of querying auth.users
CREATE POLICY "Users can view own and shared projects" 
ON public.projects 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM project_shares ps
    WHERE ps.project_id = projects.id 
    AND ps.status = 'accepted'
    AND (
      ps.shared_with_user_id = auth.uid() OR 
      ps.shared_with_email = auth.jwt()->>'email'
    )
  ))
);