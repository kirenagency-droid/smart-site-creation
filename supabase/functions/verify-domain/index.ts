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

interface VercelDnsConfig {
  aRecord?: { name: string; value: string };
  cnameRecord?: { name: string; value: string };
  txtVerification?: { name: string; value: string };
}

// Get Vercel project ID from name
async function getVercelProjectId(projectName: string, vercelToken: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
      headers: { 'Authorization': `Bearer ${vercelToken}` },
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.id || null;
  } catch {
    return null;
  }
}

// Add domain to Vercel and get the real DNS requirements
async function addDomainToVercelAndGetConfig(
  domain: string, 
  projectName: string, 
  vercelToken: string
): Promise<{ success: boolean; projectId?: string; dnsConfig?: VercelDnsConfig; error?: string }> {
  console.log(`🔗 Adding domain ${domain} to Vercel project ${projectName}`);
  
  try {
    // Get project ID
    const projectId = await getVercelProjectId(projectName, vercelToken);
    if (!projectId) {
      return { success: false, error: `Project ${projectName} not found` };
    }
    console.log(`Found Vercel project: ${projectId}`);

    // Try to add domain
    const domainResponse = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });
    
    const domainData = await domainResponse.json();
    console.log(`Vercel add domain response:`, JSON.stringify(domainData, null, 2));

    // Handle 409 conflict - domain might already exist
    if (domainResponse.status === 409) {
      console.log(`Domain ${domain} already exists, checking configuration...`);
    } else if (!domainResponse.ok && domainResponse.status !== 409) {
      return { success: false, error: domainData.error?.message || 'Failed to add domain' };
    }

    // Now get the domain configuration to see what Vercel requires
    const configResponse = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`,
      { headers: { 'Authorization': `Bearer ${vercelToken}` } }
    );
    
    const configData = await configResponse.json();
    console.log(`Vercel domain config:`, JSON.stringify(configData, null, 2));

    // Extract the real DNS requirements from Vercel
    const dnsConfig: VercelDnsConfig = {};

    // Check if Vercel provides specific configuration
    if (configData.verification) {
      // Vercel needs verification record
      const verification = configData.verification[0];
      if (verification) {
        dnsConfig.txtVerification = {
          name: verification.domain || `_vercel.${domain}`,
          value: verification.value,
        };
      }
    }

    // Get recommended A record value - check if Vercel provides it
    // Vercel uses 76.76.21.21 as default, but sometimes assigns different IPs
    if (configData.apexName === domain) {
      // It's an apex domain, needs A record
      // Get the intended target from Vercel's response
      dnsConfig.aRecord = {
        name: '@',
        value: '76.76.21.21', // Default Vercel IP
      };
    }

    // For www subdomain
    dnsConfig.cnameRecord = {
      name: 'www',
      value: 'cname.vercel-dns.com',
    };

    // Also add www subdomain as redirect
    try {
      await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `www.${domain}`,
          redirect: domain,
        }),
      });
      console.log(`✅ www.${domain} redirect configured`);
    } catch {
      console.log(`Note: www subdomain setup skipped`);
    }

    // Check if domain needs special verification (misconfigured DNS)
    if (configData.verified === false && configData.verification?.length > 0) {
      console.log(`⚠️ Domain needs verification via: ${configData.verification[0].type}`);
    }

    return { 
      success: true, 
      projectId,
      dnsConfig,
    };
  } catch (error) {
    console.error('Vercel API error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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

    // Check deployment ownership and get project info
    const { data: deployment, error: deploymentError } = await supabaseAdmin
      .from('deployments')
      .select('*, projects(name)')
      .eq('id', deploymentId)
      .eq('user_id', user.id)
      .single();

    if (deploymentError || !deployment) {
      return new Response(
        JSON.stringify({ error: 'Deployment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate verification token for our system
    const verificationToken = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

    // Derive Vercel project name
    const vercelProjectName = deployment.vercel_project_name 
      || `creali-${deployment.project_id.substring(0, 8)}`;

    // Default DNS instructions (fallback)
    let dnsInstructions = {
      records: [
        {
          type: 'A',
          name: '@',
          value: '76.76.21.21',
          description: 'Enregistrement A pour le domaine racine'
        },
        {
          type: 'CNAME', 
          name: 'www',
          value: 'cname.vercel-dns.com',
          description: 'Enregistrement CNAME pour le sous-domaine www'
        }
      ],
      notes: [
        'La propagation DNS peut prendre jusqu\'à 48 heures',
        'Le certificat SSL sera provisionné automatiquement une fois le DNS vérifié'
      ]
    };

    // If Vercel token is available, add domain and get real config
    let vercelProjectId: string | undefined;
    
    if (vercelToken) {
      console.log(`Adding domain to Vercel project ${vercelProjectName}...`);
      const vercelResult = await addDomainToVercelAndGetConfig(domain, vercelProjectName, vercelToken);
      
      if (vercelResult.success && vercelResult.dnsConfig) {
        vercelProjectId = vercelResult.projectId;
        
        // Build DNS instructions from Vercel's actual requirements
        const records = [];
        
        if (vercelResult.dnsConfig.aRecord) {
          records.push({
            type: 'A',
            name: vercelResult.dnsConfig.aRecord.name,
            value: vercelResult.dnsConfig.aRecord.value,
            description: 'Enregistrement A pour le domaine racine (Vercel)'
          });
        }
        
        if (vercelResult.dnsConfig.cnameRecord) {
          records.push({
            type: 'CNAME',
            name: vercelResult.dnsConfig.cnameRecord.name,
            value: vercelResult.dnsConfig.cnameRecord.value,
            description: 'Enregistrement CNAME pour www (Vercel)'
          });
        }
        
        // Add Vercel TXT verification if needed
        if (vercelResult.dnsConfig.txtVerification) {
          records.push({
            type: 'TXT',
            name: vercelResult.dnsConfig.txtVerification.name,
            value: vercelResult.dnsConfig.txtVerification.value,
            description: 'Enregistrement TXT de vérification Vercel (requis pour SSL)'
          });
        }
        
        if (records.length > 0) {
          dnsInstructions.records = records;
        }
        
        console.log(`✅ Domain ${domain} added to Vercel, DNS config retrieved`);
      } else {
        console.log(`⚠️ Vercel config failed: ${vercelResult.error}, using defaults`);
      }
    }

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

    // Update deployment with Vercel project info if available
    if (vercelProjectId) {
      await supabaseAdmin
        .from('deployments')
        .update({ vercel_project_name: vercelProjectName })
        .eq('id', deploymentId);
    }

    // Log the domain setup
    await supabaseAdmin.from('deployment_logs').insert({
      deployment_id: deploymentId,
      level: 'info',
      message: `Custom domain ${domain} setup initiated`,
      metadata: { 
        domain, 
        verificationToken,
        vercelProjectName,
        vercelProjectId 
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        verificationToken,
        vercelProjectId,
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
