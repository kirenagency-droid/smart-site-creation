-- Create project_shares table for sharing projects between users
CREATE TABLE public.project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, shared_with_email)
);

-- Enable RLS
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Project owners can manage shares
CREATE POLICY "Owners can manage project shares"
ON public.project_shares
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy: Users can see shares sent to them
CREATE POLICY "Users can see shares sent to them"
ON public.project_shares
FOR SELECT
TO authenticated
USING (
  shared_with_user_id = auth.uid() 
  OR shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy: Users can update shares sent to them (accept/decline)
CREATE POLICY "Users can update their share status"
ON public.project_shares
FOR UPDATE
TO authenticated
USING (
  shared_with_user_id = auth.uid() 
  OR shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  shared_with_user_id = auth.uid() 
  OR shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Add RLS policy for projects to allow shared users to view
CREATE POLICY "Users can view shared projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.project_shares ps
    WHERE ps.project_id = projects.id
    AND ps.status = 'accepted'
    AND (ps.shared_with_user_id = auth.uid() OR ps.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);

-- Trigger to update shared_with_user_id when a user with that email signs up
CREATE OR REPLACE FUNCTION public.link_shared_projects()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.project_shares
  SET shared_with_user_id = NEW.id, updated_at = now()
  WHERE shared_with_email = NEW.email AND shared_with_user_id IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_link_shares
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_shared_projects();