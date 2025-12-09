import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Expected path: /serve-site/subdomain
    const subdomain = pathParts[1] || '';
    
    if (!subdomain) {
      return new Response('Site not found', { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const filePath = `${subdomain}/index.html`;
    console.log(`Serving site: ${filePath}`);

    // Download the file from storage
    const { data, error } = await supabase.storage
      .from('sites')
      .download(filePath);

    if (error || !data) {
      console.error('File not found:', error);
      return new Response('Site not found', { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    // Get the HTML content
    const htmlContent = await data.text();

    // Return as a data URL redirect - this bypasses Content-Type issues
    const base64Html = btoa(unescape(encodeURIComponent(htmlContent)));
    const redirectHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=data:text/html;base64,${base64Html}">
  <script>window.location.href="data:text/html;base64,${base64Html}";</script>
</head>
<body>Redirection...</body>
</html>`;

    return new Response(redirectHtml, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      }
    });

  } catch (error) {
    console.error('Serve error:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }
});
