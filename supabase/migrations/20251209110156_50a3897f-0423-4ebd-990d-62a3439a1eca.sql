-- Create public storage bucket for hosted sites
INSERT INTO storage.buckets (id, name, public)
VALUES ('sites', 'sites', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read files from the sites bucket (public sites)
CREATE POLICY "Public sites are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'sites');

-- Allow authenticated users to upload their own sites
CREATE POLICY "Users can upload their own sites"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sites' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own sites
CREATE POLICY "Users can update their own sites"
ON storage.objects FOR UPDATE
USING (bucket_id = 'sites' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own sites
CREATE POLICY "Users can delete their own sites"
ON storage.objects FOR DELETE
USING (bucket_id = 'sites' AND auth.role() = 'authenticated');