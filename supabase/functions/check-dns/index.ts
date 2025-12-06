import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckDnsRequest {
  deploymentId: string;
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

    // In production, you would actually check DNS records here
    // For now, we'll simulate the check
    const dnsCheckResult = await simulateDnsCheck(customDomain.domain, customDomain.verification_token);

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
        metadata: dnsCheckResult.details
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

async function simulateDnsCheck(domain: string, verificationToken: string): Promise<{
  verified: boolean;
  details: {
    aRecord: boolean;
    cnameRecord: boolean;
    txtRecord: boolean;
  }
}> {
  // In production, this would use DNS lookup APIs
  // For development, we simulate the check
  // You can use services like Cloudflare DNS API or Google DNS API
  
  console.log(`Simulating DNS check for ${domain} with token ${verificationToken}`);
  
  // Simulate: always return pending for now
  // In production, implement actual DNS lookups
  return {
    verified: false,
    details: {
      aRecord: false,
      cnameRecord: false,
      txtRecord: false
    }
  };
}
