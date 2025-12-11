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
    txtRecord: { found: boolean; value: string | null; expected: string };
  };
}

// Add domain to Vercel project
async function addDomainToVercel(domain: string, projectName: string, vercelToken: string): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log(`🔗 Adding domain ${domain} to Vercel project ${projectName}`);
  
  try {
    // First, get the project to find its ID
    const projectResponse = await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
      },
    });
    
    if (!projectResponse.ok) {
      const error = await projectResponse.json();
      console.error('Failed to get Vercel project:', error);
      return { success: false, error: `Project not found: ${error.error?.message || 'Unknown error'}` };
    }
    
    const project = await projectResponse.json();
    console.log(`Found Vercel project: ${project.id}`);
    
    // Add domain to the project
    const domainResponse = await fetch(`https://api.vercel.com/v10/projects/${project.id}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: domain,
      }),
    });
    
    const domainData = await domainResponse.json();
    
    if (!domainResponse.ok) {
      // Check if domain already exists (409 conflict)
      if (domainResponse.status === 409) {
        console.log(`Domain ${domain} already configured on Vercel`);
        return { success: true };
      }
      console.error('Failed to add domain to Vercel:', domainData);
      return { success: false, error: domainData.error?.message || 'Failed to add domain' };
    }
    
    console.log(`✅ Domain ${domain} successfully added to Vercel project`);
    
    // Also add www subdomain
    try {
      await fetch(`https://api.vercel.com/v10/projects/${project.id}/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `www.${domain}`,
          redirect: domain, // Redirect www to root
        }),
      });
      console.log(`✅ www.${domain} redirect configured`);
    } catch (e) {
      console.log(`Note: www subdomain setup skipped (may already exist)`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Vercel API error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Real DNS check using Google DNS API
async function realDnsCheck(domain: string, verificationToken: string): Promise<DnsCheckResult> {
  const expectedA = '76.76.21.21';
  const expectedCNAME = 'cname.vercel-dns.com';
  const expectedTXT = `penflow-verify=${verificationToken}`;

  console.log(`🔍 Checking DNS for ${domain} with token ${verificationToken}`);

  let aRecord: string | null = null;
  let cnameRecord: string | null = null;
  let txtRecord: string | null = null;

  try {
    const aResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const aData = await aResponse.json();
    console.log(`A record response:`, aData);
    aRecord = aData.Answer?.find((r: { type: number; data: string }) => r.type === 1)?.data || null;
  } catch (e) {
    console.error('A record check failed:', e);
  }

  try {
    const cnameResponse = await fetch(`https://dns.google/resolve?name=www.${domain}&type=CNAME`);
    const cnameData = await cnameResponse.json();
    console.log(`CNAME record response:`, cnameData);
    const rawCname = cnameData.Answer?.find((r: { type: number; data: string }) => r.type === 5)?.data || null;
    cnameRecord = rawCname?.replace(/\.$/, '') || null;
  } catch (e) {
    console.error('CNAME record check failed:', e);
  }

  try {
    const txtResponse = await fetch(`https://dns.google/resolve?name=_penflow-verify.${domain}&type=TXT`);
    const txtData = await txtResponse.json();
    console.log(`TXT record response:`, txtData);
    txtRecord = txtData.Answer?.find((r: { type: number; data: string }) => r.type === 16)?.data?.replace(/"/g, '') || null;
  } catch (e) {
    console.error('TXT record check failed:', e);
  }

  const aOk = aRecord === expectedA;
  const cnameOk = cnameRecord === expectedCNAME || (cnameRecord?.includes('vercel') ?? false);
  const txtOk = txtRecord?.includes(verificationToken) ?? false;

  const verified = aOk;

  console.log(`DNS Check Results for ${domain}:`);
  console.log(`  A: ${aRecord} (expected: ${expectedA}) - ${aOk ? '✅' : '❌'}`);
  console.log(`  CNAME: ${cnameRecord} (expected: ${expectedCNAME}) - ${cnameOk ? '✅' : '❌'}`);
  console.log(`  TXT: ${txtRecord} (expected: ${expectedTXT}) - ${txtOk ? '✅' : '❌'}`);
  console.log(`  Verified: ${verified}`);

  return {
    verified,
    details: {
      aRecord: { found: aOk, value: aRecord, expected: expectedA },
      cnameRecord: { found: cnameOk, value: cnameRecord, expected: expectedCNAME },
      txtRecord: { found: txtOk, value: txtRecord, expected: expectedTXT }
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
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

    // Get deployment and project info for Vercel
    const { data: deployment } = await supabaseAdmin
      .from('deployments')
      .select('*, projects(name)')
      .eq('id', deploymentId)
      .single();

    // Perform real DNS check
    const dnsCheckResult = await realDnsCheck(customDomain.domain, customDomain.verification_token);

    // Update domain status based on check
    if (dnsCheckResult.verified) {
      // Try to add domain to Vercel
      const vercelToken = Deno.env.get('VERCEL_TOKEN');
      let vercelConfigured = false;
      let vercelError: string | null = null;

      if (vercelToken && deployment) {
        // Use stored vercel_project_name or derive from project_id
        const vercelProjectName = deployment.vercel_project_name 
          || `creali-${deployment.project_id.substring(0, 8)}`;
        
        console.log(`Using Vercel project: ${vercelProjectName} for domain ${customDomain.domain}`);
        
        const vercelResult = await addDomainToVercel(customDomain.domain, vercelProjectName, vercelToken);
        vercelConfigured = vercelResult.success;
        vercelError = vercelResult.error || null;
        
        await supabaseAdmin.from('deployment_logs').insert({
          deployment_id: deploymentId,
          level: vercelConfigured ? 'success' : 'warning',
          message: vercelConfigured 
            ? `Domain ${customDomain.domain} configured on Vercel` 
            : `Vercel domain config: ${vercelError}`,
        });
      }

      await supabaseAdmin
        .from('custom_domains')
        .update({
          verification_status: 'verified',
          dns_configured: true,
          ssl_provisioned: vercelConfigured
        })
        .eq('id', customDomain.id);

      // Update deployment
      await supabaseAdmin
        .from('deployments')
        .update({
          status: 'deployed',
          deployment_url: `https://${customDomain.domain}`,
          ssl_status: vercelConfigured ? 'active' : 'pending'
        })
        .eq('id', deploymentId);

      await supabaseAdmin.from('deployment_logs').insert({
        deployment_id: deploymentId,
        level: 'success',
        message: `Domain ${customDomain.domain} verified${vercelConfigured ? ' and configured on Vercel' : ''}`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          vercelConfigured,
          details: dnsCheckResult.details,
          message: vercelConfigured 
            ? '🎉 Domaine vérifié et configuré ! Votre site est en ligne.'
            : 'Domaine vérifié ! Configuration Vercel en cours...'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      await supabaseAdmin.from('deployment_logs').insert({
        deployment_id: deploymentId,
        level: 'warning',
        message: `DNS verification pending for ${customDomain.domain}`,
        metadata: {
          aRecord: dnsCheckResult.details.aRecord.found,
          cnameRecord: dnsCheckResult.details.cnameRecord.found,
          txtRecord: dnsCheckResult.details.txtRecord.found
        }
      });

      return new Response(
        JSON.stringify({
          success: true,
          verified: false,
          details: dnsCheckResult.details,
          message: 'DNS non configuré. Vérifiez vos enregistrements DNS.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    console.error('Check DNS error:', error);
    const errorMessage = error instanceof Error ? error.message : 'DNS check failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
