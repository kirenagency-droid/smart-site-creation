-- Drop the problematic policy that references auth.users
DROP POLICY IF EXISTS "Users can view projects shared with them" ON public.projects;

-- Recreate the policy without referencing auth.users
CREATE POLICY "Users can view projects shared with them" 
ON public.projects 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.project_shares 
    WHERE project_shares.project_id = projects.id 
    AND project_shares.shared_with_user_id = auth.uid()
    AND project_shares.status = 'accepted'
  )
);