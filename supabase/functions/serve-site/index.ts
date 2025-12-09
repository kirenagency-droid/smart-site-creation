import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Expected path: /serve-site/subdomain or /serve-site/subdomain/page
    // Remove 'serve-site' from path
    const sitePath = pathParts.slice(1).join('/') || '';
    
    if (!sitePath) {
      return new Response('Site not found', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine file path - default to index.html
    let filePath = sitePath;
    if (!filePath.endsWith('.html') && !filePath.includes('.')) {
      filePath = `${sitePath}/index.html`;
    }

    console.log(`Serving site: ${filePath}`);

    // Download the file from storage
    const { data, error } = await supabase.storage
      .from('sites')
      .download(filePath);

    if (error || !data) {
      console.error('File not found:', error);
      return new Response('Site not found', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Get the HTML content
    const htmlContent = await data.text();

    // Return with proper HTML headers
    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      }
    });

  } catch (error) {
    console.error('Serve error:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
});
