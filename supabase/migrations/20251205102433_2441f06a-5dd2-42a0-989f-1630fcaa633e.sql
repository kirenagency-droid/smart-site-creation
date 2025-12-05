-- Create project_versions table for storing version history
CREATE TABLE public.project_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  html_content TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_project_versions_project_id ON public.project_versions(project_id);
CREATE INDEX idx_project_versions_created_at ON public.project_versions(project_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access versions of their own projects
CREATE POLICY "Users can view versions of own projects"
ON public.project_versions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = project_versions.project_id
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can insert versions to own projects"
ON public.project_versions
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = project_versions.project_id
  AND projects.user_id = auth.uid()
));