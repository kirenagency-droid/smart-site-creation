import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckDnsRequest {
  deploymentId: string;
}

interface DnsCheckResult {
  verified: boolean;
  details: {
    aRecord: { found: boolean; value: string | null; expected: string };
    cnameRecord: { found: boolean; value: string | null; expected: string };
  };
}

// Get Vercel domain configuration and verification status
async function getVercelDomainStatus(
  domain: string, 
  projectId: string, 
  vercelToken: string
): Promise<{
  verified: boolean;
  sslReady: boolean;
  misconfigured: boolean;
  verification?: { type: string; domain: string; value: string }[];
  configuredValue?: string;
  error?: string;
}> {
  console.log(`🔍 Checking Vercel domain status for ${domain} on project ${projectId}`);
  
  try {
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`,
      { headers: { 'Authorization': `Bearer ${vercelToken}` } }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to get domain status:', errorData);
      return { verified: false, sslReady: false, misconfigured: true, error: errorData.error?.message };
    }
    
    const data = await response.json();
    console.log(`Vercel domain config for ${domain}:`, JSON.stringify(data, null, 2));
    
    const isVerified = data.verified === true;
    const sslReady = isVerified;
    const isMisconfigured = data.misconfigured === true;
    
    // Extract verification requirements if not verified
    let verificationRequirements: { type: string; domain: string; value: string }[] | undefined;
    
    if (!isVerified && data.verification?.length > 0) {
      verificationRequirements = data.verification.map((v: { type: string; domain: string; value: string }) => ({
        type: v.type,
        domain: v.domain,
        value: v.value,
      }));
      console.log(`Vercel requires verification:`, verificationRequirements);
    }
    
    return {
      verified: isVerified,
      sslReady,
      misconfigured: isMisconfigured,
      verification: verificationRequirements,
      configuredValue: data.configuredBy || undefined,
    };
  } catch (error) {
    console.error('Error checking Vercel domain:', error);
    return { verified: false, sslReady: false, misconfigured: true, error: error instanceof Error ? error.message : 'Unknown' };
  }
}

// Add domain to Vercel if not already added
async function ensureDomainOnVercel(
  domain: string, 
  projectName: string, 
  vercelToken: string
): Promise<{ success: boolean; projectId?: string; error?: string }> {
  console.log(`🔗 Ensuring domain ${domain} is on Vercel project ${projectName}`);
  
  try {
    // Get project
    const projectResponse = await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
      headers: { 'Authorization': `Bearer ${vercelToken}` },
    });
    
    if (!projectResponse.ok) {
      return { success: false, error: 'Project not found' };
    }
    
    const project = await projectResponse.json();
    console.log(`Found Vercel project: ${project.id}`);
    
    // Check if domain exists on project
    const domainsResponse = await fetch(`https://api.vercel.com/v10/projects/${project.id}/domains`, {
      headers: { 'Authorization': `Bearer ${vercelToken}` },
    });
    
    if (domainsResponse.ok) {
      const domainsData = await domainsResponse.json();
      const existingDomain = domainsData.domains?.find((d: { name: string }) => d.name === domain);
      
      if (existingDomain) {
        console.log(`✅ Domain ${domain} already on project`);
        return { success: true, projectId: project.id };
      }
    }
    
    // Try to add domain
    const addResponse = await fetch(`https://api.vercel.com/v10/projects/${project.id}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });
    
    if (addResponse.ok || addResponse.status === 409) {
      console.log(`✅ Domain ${domain} configured on project`);
      return { success: true, projectId: project.id };
    }
    
    const errorData = await addResponse.json();
    return { success: false, error: errorData.error?.message };
  } catch (error) {
    console.error('Vercel API error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown' };
  }
}

// Real DNS check using Google DNS API - checks actual propagation
async function checkDnsPropagation(domain: string): Promise<{
  aRecord: { found: boolean; value: string | null };
  cnameRecord: { found: boolean; value: string | null };
}> {
  console.log(`🔍 Checking DNS propagation for ${domain}`);
  
  let aRecord: string | null = null;
  let cnameRecord: string | null = null;
  
  // Check A record
  try {
    const aResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const aData = await aResponse.json();
    console.log(`A record response:`, JSON.stringify(aData));
    aRecord = aData.Answer?.find((r: { type: number; data: string }) => r.type === 1)?.data || null;
  } catch (e) {
    console.error('A record check failed:', e);
  }
  
  // Check CNAME for www
  try {
    const cnameResponse = await fetch(`https://dns.google/resolve?name=www.${domain}&type=CNAME`);
    const cnameData = await cnameResponse.json();
    console.log(`CNAME record response:`, JSON.stringify(cnameData));
    const rawCname = cnameData.Answer?.find((r: { type: number; data: string }) => r.type === 5)?.data || null;
    cnameRecord = rawCname?.replace(/\.$/, '') || null;
  } catch (e) {
    console.error('CNAME record check failed:', e);
  }
  
  // Vercel accepts various A record IPs - check if it's a Vercel IP
  const isVercelARecord = aRecord && (
    aRecord === '76.76.21.21' || 
    aRecord.startsWith('76.76.') || 
    aRecord.startsWith('216.198.')
  );
  
  // Vercel accepts various CNAME values
  const isVercelCname = cnameRecord && cnameRecord.includes('vercel');
  
  console.log(`DNS Results - A: ${aRecord} (Vercel: ${isVercelARecord}), CNAME: ${cnameRecord} (Vercel: ${isVercelCname})`);
  
  return {
    aRecord: { found: !!isVercelARecord, value: aRecord },
    cnameRecord: { found: !!isVercelCname, value: cnameRecord },
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
        JSON.stringify({ error: 'Invalid user session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { deploymentId }: CheckDnsRequest = await req.json();

    // Get custom domain record
    const { data: customDomain, error: domainError } = await supabaseAdmin
      .from('custom_domains')
      .select('*')
      .eq('deployment_id', deploymentId)
      .eq('user_id', user.id)
      .single();

    if (domainError || !customDomain) {
      return new Response(
        JSON.stringify({ error: 'Custom domain not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get deployment info
    const { data: deployment } = await supabaseAdmin
      .from('deployments')
      .select('*, projects(name)')
      .eq('id', deploymentId)
      .single();

    const domain = customDomain.domain;
    
    // Check DNS propagation
    const dnsStatus = await checkDnsPropagation(domain);
    
    // Prepare response data
    let verified = false;
    let sslReady = false;
    let vercelVerification: { type: string; domain: string; value: string }[] | undefined;
    let message = 'DNS non configuré. Configurez les enregistrements et réessayez.';

    // If DNS looks configured, check with Vercel
    if (vercelToken && deployment) {
      const vercelProjectName = deployment.vercel_project_name 
        || `creali-${deployment.project_id.substring(0, 8)}`;
      
      // Ensure domain is on Vercel
      const ensureResult = await ensureDomainOnVercel(domain, vercelProjectName, vercelToken);
      
      if (ensureResult.success && ensureResult.projectId) {
        // Check Vercel's verification status
        const vercelStatus = await getVercelDomainStatus(domain, ensureResult.projectId, vercelToken);
        
        verified = vercelStatus.verified;
        sslReady = vercelStatus.sslReady;
        vercelVerification = vercelStatus.verification;
        
        if (sslReady) {
          message = '🎉 Domaine vérifié et HTTPS actif ! Votre site est en ligne.';
        } else if (verified) {
          message = '✅ Domaine vérifié, SSL en cours de provisionnement...';
        } else if (vercelVerification?.length) {
          message = '⚠️ Vercel nécessite une vérification TXT supplémentaire pour le SSL.';
        } else if (vercelStatus.misconfigured) {
          message = 'DNS détecté mais mal configuré. Vérifiez vos enregistrements.';
        }
        
        // Log result
        await supabaseAdmin.from('deployment_logs').insert({
          deployment_id: deploymentId,
          level: sslReady ? 'success' : verified ? 'info' : 'warning',
          message: `DNS check: verified=${verified}, sslReady=${sslReady}`,
          metadata: { 
            dnsStatus, 
            vercelVerified: verified,
            sslReady,
            hasVercelVerification: !!vercelVerification?.length
          }
        });
      }
    } else {
      // No Vercel token - just check if DNS points to Vercel
      verified = dnsStatus.aRecord.found || dnsStatus.cnameRecord.found;
      if (verified) {
        message = 'DNS configuré, vérification en cours...';
      }
    }

    // Update database
    await supabaseAdmin
      .from('custom_domains')
      .update({
        verification_status: sslReady ? 'verified' : verified ? 'verifying' : 'pending',
        dns_configured: dnsStatus.aRecord.found || dnsStatus.cnameRecord.found,
        ssl_provisioned: sslReady
      })
      .eq('id', customDomain.id);

    if (sslReady) {
      await supabaseAdmin
        .from('deployments')
        .update({
          status: 'deployed',
          deployment_url: `https://${domain}`,
          ssl_status: 'active'
        })
        .eq('id', deploymentId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified,
        sslReady,
        details: {
          aRecord: { 
            found: dnsStatus.aRecord.found, 
            value: dnsStatus.aRecord.value, 
            expected: 'Vercel IP (76.76.x.x or 216.198.x.x)' 
          },
          cnameRecord: { 
            found: dnsStatus.cnameRecord.found, 
            value: dnsStatus.cnameRecord.value, 
            expected: '*.vercel-dns.com' 
          },
        },
        vercelVerification,
        message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Check DNS error:', error);
    const errorMessage = error instanceof Error ? error.message : 'DNS check failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
