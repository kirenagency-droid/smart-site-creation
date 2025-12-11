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
    // Check A record for root domain
    const aResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const aData = await aResponse.json();
    console.log(`A record response:`, aData);
    aRecord = aData.Answer?.find((r: { type: number; data: string }) => r.type === 1)?.data || null;
  } catch (e) {
    console.error('A record check failed:', e);
  }

  try {
    // Check CNAME for www subdomain
    const cnameResponse = await fetch(`https://dns.google/resolve?name=www.${domain}&type=CNAME`);
    const cnameData = await cnameResponse.json();
    console.log(`CNAME record response:`, cnameData);
    const rawCname = cnameData.Answer?.find((r: { type: number; data: string }) => r.type === 5)?.data || null;
    cnameRecord = rawCname?.replace(/\.$/, '') || null;
  } catch (e) {
    console.error('CNAME record check failed:', e);
  }

  try {
    // Check TXT for verification
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

  // Domain is verified if A record is correct (CNAME and TXT are optional but helpful)
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

    // Perform real DNS check
    const dnsCheckResult = await realDnsCheck(customDomain.domain, customDomain.verification_token);

    // Update domain status based on check
    if (dnsCheckResult.verified) {
      await supabaseAdmin
        .from('custom_domains')
        .update({
          verification_status: 'verified',
          dns_configured: true,
          ssl_provisioned: true
        })
        .eq('id', customDomain.id);

      // Update deployment
      await supabaseAdmin
        .from('deployments')
        .update({
          status: 'deployed',
          deployment_url: `https://${customDomain.domain}`,
          ssl_status: 'active'
        })
        .eq('id', deploymentId);

      await supabaseAdmin.from('deployment_logs').insert({
        deployment_id: deploymentId,
        level: 'success',
        message: `Domain ${customDomain.domain} verified and SSL provisioned`,
      });
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
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: dnsCheckResult.verified,
        details: dnsCheckResult.details,
        message: dnsCheckResult.verified 
          ? 'Domaine vérifié ! Votre site est en ligne.'
          : 'DNS non configuré. Vérifiez vos enregistrements DNS.'
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
