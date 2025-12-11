import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckDnsRequest {
  deploymentId: string;
}

// Check Vercel domain status - is SSL ready?
async function checkVercelDomainStatus(
  domain: string, 
  projectId: string, 
  vercelToken: string
): Promise<{
  verified: boolean;
  sslReady: boolean;
  misconfigured: boolean;
  error?: string;
}> {
  console.log(`🔍 Checking Vercel status for ${domain}`);
  
  try {
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`,
      { headers: { 'Authorization': `Bearer ${vercelToken}` } }
    );
    
    if (!response.ok) {
      console.error('Vercel API error:', await response.text());
      return { verified: false, sslReady: false, misconfigured: true };
    }
    
    const data = await response.json();
    console.log(`Vercel domain status:`, JSON.stringify(data, null, 2));
    
    // verified = true means DNS is correct AND SSL is provisioned
    const isVerified = data.verified === true;
    const isMisconfigured = data.misconfigured === true;
    
    return {
      verified: isVerified,
      sslReady: isVerified, // Vercel provisions SSL when verified
      misconfigured: isMisconfigured,
    };
  } catch (error) {
    console.error('Error checking Vercel:', error);
    return { verified: false, sslReady: false, misconfigured: true };
  }
}

// DNS propagation check via Google DNS
async function checkDnsPropagation(domain: string): Promise<{
  aRecord: { found: boolean; value: string | null };
  pointingToVercel: boolean;
}> {
  console.log(`🔍 Checking DNS for ${domain}`);
  
  let aRecord: string | null = null;
  
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const data = await response.json();
    aRecord = data.Answer?.find((r: { type: number; data: string }) => r.type === 1)?.data || null;
    console.log(`A record: ${aRecord}`);
  } catch (e) {
    console.error('DNS check failed:', e);
  }
  
  // Vercel IPs
  const isVercelIp = aRecord && (
    aRecord === '76.76.21.21' ||
    aRecord.startsWith('76.76.') ||
    aRecord.startsWith('216.198.')
  );
  
  return {
    aRecord: { found: !!aRecord, value: aRecord },
    pointingToVercel: !!isVercelIp,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vercelToken = Deno.env.get('VERCEL_TOKEN');
    
    if (!vercelToken) {
      return new Response(
        JSON.stringify({ error: 'Vercel not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { deploymentId }: CheckDnsRequest = await req.json();

    // Get custom domain
    const { data: customDomain, error: domainError } = await supabaseAdmin
      .from('custom_domains')
      .select('*')
      .eq('deployment_id', deploymentId)
      .eq('user_id', user.id)
      .single();

    if (domainError || !customDomain) {
      return new Response(
        JSON.stringify({ error: 'Domain not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get deployment
    const { data: deployment } = await supabaseAdmin
      .from('deployments')
      .select('*')
      .eq('id', deploymentId)
      .single();

    if (!deployment) {
      return new Response(
        JSON.stringify({ error: 'Deployment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const domain = customDomain.domain;
    const vercelProjectName = deployment.vercel_project_name || `creali-${deployment.project_id.substring(0, 8)}`;

    // Get Vercel project ID
    const projectResponse = await fetch(`https://api.vercel.com/v9/projects/${vercelProjectName}`, {
      headers: { 'Authorization': `Bearer ${vercelToken}` },
    });

    if (!projectResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Vercel project not found. Please reconfigure domain.',
          verified: false,
          sslReady: false
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const project = await projectResponse.json();

    // Check DNS propagation
    const dnsStatus = await checkDnsPropagation(domain);

    // Check Vercel status (this tells us if SSL is ready)
    const vercelStatus = await checkVercelDomainStatus(domain, project.id, vercelToken);

    let message: string;
    let status: 'pending' | 'verifying' | 'verified';

    if (vercelStatus.sslReady) {
      message = '🎉 Domaine vérifié et HTTPS actif ! Votre site est en ligne.';
      status = 'verified';
    } else if (vercelStatus.verified) {
      message = '✅ DNS vérifié, SSL en cours de provisionnement (1-2 min)...';
      status = 'verifying';
    } else if (dnsStatus.pointingToVercel) {
      message = '⏳ DNS détecté, en attente de vérification Vercel...';
      status = 'verifying';
    } else if (dnsStatus.aRecord.found) {
      message = `⚠️ DNS configuré mais ne pointe pas vers Vercel. IP actuelle: ${dnsStatus.aRecord.value}`;
      status = 'pending';
    } else {
      message = '❌ DNS non configuré. Ajoutez l\'enregistrement A chez votre registrar.';
      status = 'pending';
    }

    // Update database
    await supabaseAdmin
      .from('custom_domains')
      .update({
        verification_status: status,
        dns_configured: dnsStatus.pointingToVercel,
        ssl_provisioned: vercelStatus.sslReady
      })
      .eq('id', customDomain.id);

    // If SSL ready, update deployment URL
    if (vercelStatus.sslReady) {
      await supabaseAdmin
        .from('deployments')
        .update({
          status: 'deployed',
          deployment_url: `https://${domain}`,
          ssl_status: 'active',
          deployment_type: 'custom_domain'
        })
        .eq('id', deploymentId);

      // Log success
      await supabaseAdmin.from('deployment_logs').insert({
        deployment_id: deploymentId,
        level: 'success',
        message: `🎉 ${domain} is live with HTTPS!`,
        metadata: { domain, sslReady: true }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: vercelStatus.verified,
        sslReady: vercelStatus.sslReady,
        dnsConfigured: dnsStatus.pointingToVercel,
        details: {
          aRecord: {
            found: dnsStatus.aRecord.found,
            value: dnsStatus.aRecord.value,
            pointingToVercel: dnsStatus.pointingToVercel,
            expected: '76.76.21.21'
          }
        },
        message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Check DNS error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'DNS check failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
