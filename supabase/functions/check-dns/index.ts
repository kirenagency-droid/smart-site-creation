import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckDnsRequest {
  deploymentId: string;
}

// Check Vercel domain status INCLUDING SSL certificate status
async function getVercelDomainStatus(
  domain: string, 
  projectId: string, 
  vercelToken: string
): Promise<{
  verified: boolean;
  misconfigured: boolean;
  sslState: string | null;
  sslReady: boolean;
  error?: string;
}> {
  console.log(`🔍 Checking Vercel status for ${domain}`);
  
  try {
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`,
      { headers: { 'Authorization': `Bearer ${vercelToken}` } }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vercel API error:', errorData);
      return { verified: false, misconfigured: true, sslState: null, sslReady: false, error: errorData.error?.message };
    }
    
    const data = await response.json();
    console.log(`Vercel domain status:`, JSON.stringify(data, null, 2));
    
    // Check SSL certificate state from Vercel API
    // sslCert can be: null, { state: 'pending' }, { state: 'issued' }, { state: 'failed' }
    const sslState = data.sslCert?.state || null;
    const sslReady = sslState === 'issued';
    
    console.log(`🔒 SSL State from Vercel: ${sslState}, Ready: ${sslReady}`);
    
    return {
      verified: data.verified === true,
      misconfigured: data.misconfigured === true,
      sslState,
      sslReady,
    };
  } catch (error) {
    console.error('Error checking Vercel:', error);
    return { verified: false, misconfigured: true, sslState: null, sslReady: false };
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

// Force SSL provisioning by removing and re-adding domain + www
async function forceSSLProvisioning(
  domain: string,
  projectId: string,
  vercelToken: string
): Promise<boolean> {
  console.log(`🔄 Forcing SSL re-provisioning for ${domain} on project ${projectId}`);
  
  try {
    // Step 1: Remove domain
    console.log(`🗑️ Step 1: Removing domain ${domain}...`);
    const removeResponse = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/domains/${domain}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${vercelToken}` },
      }
    );
    
    console.log(`🗑️ DELETE response status: ${removeResponse.status}`);
    
    if (!removeResponse.ok && removeResponse.status !== 404) {
      const errorBody = await removeResponse.text();
      console.error(`❌ DELETE failed: ${removeResponse.status} - ${errorBody}`);
      // Continue anyway - domain might not exist or be in weird state
    } else {
      console.log(`✅ Domain removed (or didn't exist)`);
    }
    
    // Step 2: Wait longer for Vercel to process
    console.log(`⏳ Waiting 5 seconds for Vercel to process...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 3: Re-add root domain (ALWAYS try, even if DELETE failed)
    console.log(`➕ Step 2: Re-adding root domain ${domain}...`);
    const addResponse = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/domains`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain }),
      }
    );
    
    console.log(`➕ POST root domain response status: ${addResponse.status}`);
    
    if (!addResponse.ok && addResponse.status !== 409) {
      const errorBody = await addResponse.text();
      console.error(`❌ POST root domain failed: ${addResponse.status} - ${errorBody}`);
    } else {
      console.log(`✅ Root domain added/exists (status ${addResponse.status})`);
    }
    
    // Step 4: Add www subdomain with redirect
    console.log(`➕ Step 3: Adding www.${domain} with redirect...`);
    const wwwResponse = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/domains`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: `www.${domain}`, redirect: domain }),
      }
    );
    
    console.log(`➕ POST www domain response status: ${wwwResponse.status}`);
    
    if (!wwwResponse.ok && wwwResponse.status !== 409) {
      const errorBody = await wwwResponse.text();
      console.error(`❌ POST www domain failed: ${wwwResponse.status} - ${errorBody}`);
    } else {
      console.log(`✅ www.${domain} added/exists with redirect`);
    }
    
    // Step 5: Verify domain was added and check SSL state
    console.log(`🔍 Step 4: Verifying domain configuration...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const verifyResponse = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`,
      { headers: { 'Authorization': `Bearer ${vercelToken}` } }
    );
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log(`📋 Final domain state:`, JSON.stringify({
        verified: verifyData.verified,
        sslCert: verifyData.sslCert,
      }));
      console.log(`✅ SSL provisioning triggered successfully`);
      return true;
    } else {
      console.error(`❌ Could not verify domain after re-adding`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Force SSL error:', error);
    return false;
  }
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

    // Check Vercel verification AND SSL status via API (the real source of truth)
    const vercelStatus = await getVercelDomainStatus(domain, project.id, vercelToken);

    // SSL is ready ONLY if Vercel API says sslCert.state === 'issued'
    const sslReady = vercelStatus.sslReady;

    let message: string;
    let status: 'pending' | 'verifying' | 'verified';

    if (sslReady) {
      message = '🎉 Domaine vérifié et HTTPS actif ! Votre site est en ligne avec un certificat SSL valide.';
      status = 'verified';
    } else if (vercelStatus.verified && dnsStatus.pointingToVercel) {
      if (vercelStatus.sslState === 'pending') {
        message = '⏳ DNS vérifié, certificat SSL en cours de provisionnement par Vercel (peut prendre 2-10 min)...';
      } else if (vercelStatus.sslState === 'failed') {
        message = '❌ Le certificat SSL a échoué. Cliquez Vérifier pour réessayer.';
        // Try to force re-provisioning
        await forceSSLProvisioning(domain, project.id, vercelToken);
      } else if (vercelStatus.sslState === null) {
        // SSL never requested - force provisioning now
        message = '⏳ Domaine vérifié, démarrage du provisionnement SSL...';
        console.log(`🔄 SSL state is null, forcing provisioning for ${domain}`);
        await forceSSLProvisioning(domain, project.id, vercelToken);
      } else {
        message = '⏳ DNS vérifié, en attente du certificat SSL...';
      }
      status = 'verifying';
    } else if (dnsStatus.pointingToVercel) {
      message = '⏳ DNS détecté, en attente de vérification Vercel...';
      status = 'verifying';
    } else if (dnsStatus.aRecord.found) {
      message = `⚠️ DNS configuré mais ne pointe pas vers Vercel. IP actuelle: ${dnsStatus.aRecord.value}. Attendue: 76.76.21.21`;
      status = 'pending';
    } else {
      message = '❌ DNS non configuré. Ajoutez l\'enregistrement A: @ → 76.76.21.21';
      status = 'pending';
    }

    // Update database - SSL ready only when Vercel confirms 'issued'
    await supabaseAdmin
      .from('custom_domains')
      .update({
        verification_status: status,
        dns_configured: dnsStatus.pointingToVercel,
        ssl_provisioned: sslReady
      })
      .eq('id', customDomain.id);

    // If SSL ready, update deployment URL
    if (sslReady) {
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
        message: `🎉 ${domain} is live with HTTPS! SSL certificate issued by Vercel.`,
        metadata: { domain, sslReady: true, sslState: vercelStatus.sslState }
      });
    } else {
      // Log status
      await supabaseAdmin.from('deployment_logs').insert({
        deployment_id: deploymentId,
        level: 'info',
        message: `DNS: ${status}, SSL state: ${vercelStatus.sslState || 'none'}`,
        metadata: { 
          domain, 
          dnsPointingToVercel: dnsStatus.pointingToVercel,
          vercelVerified: vercelStatus.verified,
          sslState: vercelStatus.sslState,
          sslReady 
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: vercelStatus.verified,
        sslReady,
        sslState: vercelStatus.sslState,
        dnsConfigured: dnsStatus.pointingToVercel,
        details: {
          aRecord: {
            found: dnsStatus.aRecord.found,
            value: dnsStatus.aRecord.value,
            pointingToVercel: dnsStatus.pointingToVercel,
            expected: '76.76.21.21'
          },
          ssl: {
            state: vercelStatus.sslState,
            ready: sslReady
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