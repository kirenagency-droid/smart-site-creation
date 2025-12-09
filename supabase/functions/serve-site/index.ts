import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Page HTML pour les sites désactivés
const getDeactivatedPage = (reason: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site désactivé - Creali</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 3rem;
      max-width: 500px;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 2rem;
    }
    .icon svg {
      width: 40px;
      height: 40px;
      color: #ef4444;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    p {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .reason {
      background: rgba(255, 255, 255, 0.05);
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.5);
    }
    .btn {
      display: inline-block;
      padding: 0.875rem 2rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
    }
    .logo {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      font-weight: 700;
      color: rgba(255, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h1>Site désactivé</h1>
    <p>Ce site a été temporairement désactivé car l'abonnement Creali associé n'est plus actif.</p>
    <div class="reason">Raison : ${reason}</div>
    <a href="https://creali.dev/pricing" class="btn">Réactiver mon site</a>
  </div>
  <div class="logo">Powered by Creali</div>
</body>
</html>
`;

// Page 404
const get404Page = () => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site introuvable - Creali</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 3rem;
      max-width: 500px;
    }
    h1 {
      font-size: 6rem;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
    }
    h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 2rem;
    }
    .btn {
      display: inline-block;
      padding: 0.875rem 2rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <h2>Site introuvable</h2>
    <p>Ce site n'existe pas ou n'est plus disponible.</p>
    <a href="https://creali.dev" class="btn">Créer mon site avec Creali</a>
  </div>
</body>
</html>
`;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const host = req.headers.get('host') || '';
    
    console.log(`Serve request: host=${host}, path=${url.pathname}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let htmlContent: string | null = null;
    let siteIdentifier: string | null = null;

    // Check if it's a custom domain or subdomain
    const isCustomDomain = !host.includes('creali.dev') && 
                           !host.includes('supabase.co') && 
                           !host.includes('localhost');

    if (isCustomDomain) {
      // Custom domain request
      console.log(`Custom domain detected: ${host}`);
      
      // Look up the domain in custom_domains table
      const { data: domainData, error: domainError } = await supabase
        .from('custom_domains')
        .select('*, deployments(*)')
        .eq('domain', host)
        .maybeSingle();

      if (domainError) {
        console.error('Domain lookup error:', domainError);
        return new Response(get404Page(), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      if (!domainData) {
        // Try with www prefix removed/added
        const altHost = host.startsWith('www.') ? host.slice(4) : `www.${host}`;
        const { data: altDomainData } = await supabase
          .from('custom_domains')
          .select('*, deployments(*)')
          .eq('domain', altHost)
          .maybeSingle();

        if (!altDomainData) {
          console.log(`Domain not found: ${host}`);
          return new Response(get404Page(), { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
          });
        }
        
        // Use the alternate domain data
        Object.assign(domainData || {}, altDomainData);
      }

      // Check if domain is active
      if (!domainData.is_active) {
        const reason = domainData.deactivation_reason === 'subscription_expired' 
          ? 'Abonnement Creali expiré ou annulé'
          : domainData.deactivation_reason || 'Domaine désactivé';
        
        console.log(`Domain inactive: ${host}, reason: ${reason}`);
        return new Response(getDeactivatedPage(reason), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      // Check subscription status
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', domainData.user_id)
        .maybeSingle();

      const isSubscriptionActive = subscription && 
        subscription.plan !== 'free' && 
        subscription.status === 'active';

      if (!isSubscriptionActive) {
        console.log(`Subscription not active for domain: ${host}`);
        
        // Deactivate the domain
        await supabase
          .from('custom_domains')
          .update({
            is_active: false,
            deactivation_reason: 'subscription_expired'
          })
          .eq('id', domainData.id);

        return new Response(getDeactivatedPage('Abonnement Creali expiré ou annulé'), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      // Get the project HTML
      if (domainData.deployments) {
        const { data: project } = await supabase
          .from('projects')
          .select('current_html')
          .eq('id', domainData.deployments.project_id)
          .single();

        if (project?.current_html) {
          htmlContent = project.current_html;
          siteIdentifier = domainData.domain;
        }
      }

    } else {
      // Subdomain request (existing logic)
      const pathParts = url.pathname.split('/').filter(Boolean);
      const subdomain = pathParts[1] || '';
      
      if (!subdomain) {
        return new Response(get404Page(), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      siteIdentifier = subdomain;

      // Try to fetch from storage first (for Vercel deployed sites)
      const filePath = `${subdomain}/index.html`;
      console.log(`Fetching site from storage: ${filePath}`);

      const { data: storageData, error: storageError } = await supabase.storage
        .from('sites')
        .download(filePath);

      if (!storageError && storageData) {
        htmlContent = await storageData.text();
      } else {
        // Fallback: fetch from deployments table
        const { data: deployment } = await supabase
          .from('deployments')
          .select('project_id')
          .eq('subdomain', subdomain)
          .maybeSingle();

        if (deployment?.project_id) {
          const { data: project } = await supabase
            .from('projects')
            .select('current_html')
            .eq('id', deployment.project_id)
            .single();

          if (project?.current_html) {
            htmlContent = project.current_html;
          }
        }
      }
    }

    if (!htmlContent) {
      console.log(`Site content not found for: ${siteIdentifier}`);
      return new Response(get404Page(), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    console.log(`Serving site: ${siteIdentifier}`);

    return new Response(htmlContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      }
    });

  } catch (error) {
    console.error('Serve error:', error);
    return new Response(get404Page(), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
});
