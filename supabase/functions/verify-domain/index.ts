import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyDomainRequest {
  deploymentId: string;
  domain: string;
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

    const { deploymentId, domain }: VerifyDomainRequest = await req.json();
    console.log(`Verify domain request: ${domain} for deployment ${deploymentId}`);

    // Check if user has Pro plan
    const { data: canUseCustom } = await supabaseAdmin.rpc('can_use_custom_domain', {
      user_uuid: user.id
    });

    if (!canUseCustom) {
      return new Response(
        JSON.stringify({ 
          error: 'Custom domains require a Pro subscription',
          requiresUpgrade: true 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check deployment ownership
    const { data: deployment, error: deploymentError } = await supabaseAdmin
      .from('deployments')
      .select('*')
      .eq('id', deploymentId)
      .eq('user_id', user.id)
      .single();

    if (deploymentError || !deployment) {
      return new Response(
        JSON.stringify({ error: 'Deployment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

    // Check for existing custom domain record
    const { data: existingDomain } = await supabaseAdmin
      .from('custom_domains')
      .select('*')
      .eq('deployment_id', deploymentId)
      .single();

    if (existingDomain) {
      // Update existing
      await supabaseAdmin
        .from('custom_domains')
        .update({
          domain,
          verification_token: verificationToken,
          verification_status: 'pending',
          dns_configured: false,
          ssl_provisioned: false,
          is_active: true,
          deactivation_reason: null
        })
        .eq('id', existingDomain.id);
    } else {
      // Create new
      await supabaseAdmin
        .from('custom_domains')
        .insert({
          deployment_id: deploymentId,
          user_id: user.id,
          domain,
          verification_token: verificationToken,
          verification_status: 'pending'
        });
    }

    // DNS instructions
    const dnsInstructions = {
      records: [
        {
          type: 'A',
          name: '@',
          value: '76.76.21.21', // Vercel's IP
          description: 'Point your root domain to our servers'
        },
        {
          type: 'CNAME', 
          name: 'www',
          value: 'cname.vercel-dns.com',
          description: 'Point www subdomain to our CDN'
        },
        {
          type: 'TXT',
          name: '_penflow-verify',
          value: `penflow-verify=${verificationToken}`,
          description: 'Verification record to prove domain ownership'
        }
      ],
      notes: [
        'DNS propagation can take up to 48 hours',
        'SSL certificate will be provisioned automatically once DNS is verified',
        'Your domain must point to our servers before going live'
      ]
    };

    // Log the domain setup
    await supabaseAdmin.from('deployment_logs').insert({
      deployment_id: deploymentId,
      level: 'info',
      message: `Custom domain ${domain} setup initiated`,
      metadata: { domain, verificationToken }
    });

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        verificationToken,
        dnsInstructions,
        message: 'Configurez les enregistrements DNS ci-dessous, puis cliquez sur Vérifier.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Verify domain error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Domain verification failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
