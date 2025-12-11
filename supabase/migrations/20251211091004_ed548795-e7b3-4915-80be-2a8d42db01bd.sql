-- Add vercel_project_name column to deployments table
ALTER TABLE public.deployments 
ADD COLUMN IF NOT EXISTS vercel_project_name text;