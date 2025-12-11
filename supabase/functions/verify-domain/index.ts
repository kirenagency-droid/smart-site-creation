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

// Add domain to Vercel project - AUTOMATIC, user doesn't need Vercel access
async function addDomainToVercel(
  domain: string, 
  projectName: string, 
  vercelToken: string
): Promise<{ 
  success: boolean; 
  projectId?: string; 
  aRecordIp?: string;
  verificationRequired?: { type: string; domain: string; value: string }[];
  error?: string;
}> {
  console.log(`🔗 Adding domain ${domain} to Vercel project ${projectName} (AUTOMATIC)`);
  
  try {
    // 1. Get or create project
    let projectId: string;
    
    const projectResponse = await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
      headers: { 'Authorization': `Bearer ${vercelToken}` },
    });
    
    if (!projectResponse.ok) {
      // Create project if doesn't exist
      console.log(`Creating new Vercel project: ${projectName}`);
      const createResponse = await fetch('https://api.vercel.com/v9/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: projectName }),
      });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        return { success: false, error: `Failed to create project: ${errorData.error?.message}` };
      }
      
      const newProject = await createResponse.json();
      projectId = newProject.id;
    } else {
      const project = await projectResponse.json();
      projectId = project.id;
    }
    
    console.log(`✅ Using Vercel project: ${projectId}`);

    // 2. Check if domain is on another project and remove it
    try {
      const domainCheckResponse = await fetch(`https://api.vercel.com/v9/domains/${domain}`, {
        headers: { 'Authorization': `Bearer ${vercelToken}` },
      });
      
      if (domainCheckResponse.ok) {
        const domainData = await domainCheckResponse.json();
        if (domainData.projectId && domainData.projectId !== projectId) {
          console.log(`⚠️ Domain on old project ${domainData.projectId}, removing...`);
          await fetch(`https://api.vercel.com/v10/projects/${domainData.projectId}/domains/${domain}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${vercelToken}` },
          });
          console.log(`✅ Removed from old project`);
        }
      }
    } catch (e) {
      console.log('Domain not found on any project (good)');
    }

    // 3. Add domain to our project
    const addDomainResponse = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });
    
    const addDomainData = await addDomainResponse.json();
    console.log(`Add domain response:`, JSON.stringify(addDomainData, null, 2));

    // 409 = already exists (ok), or check for error
    if (!addDomainResponse.ok && addDomainResponse.status !== 409) {
      return { success: false, error: addDomainData.error?.message || 'Failed to add domain' };
    }

    // 4. Also add www subdomain as redirect
    try {
      await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: `www.${domain}`, redirect: domain }),
      });
      console.log(`✅ www.${domain} redirect configured`);
    } catch {
      console.log(`www subdomain setup skipped`);
    }

    // 5. Configure SSL redirect on the project (HTTP -> HTTPS)
    try {
      // Enable redirect to HTTPS for the domain
      const redirectResponse = await fetch(
        `https://api.vercel.com/v10/projects/${projectId}/domains/${domain}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ redirect: null, redirectStatusCode: null }),
        }
      );
      console.log(`✅ SSL redirect configuration attempted for ${domain}`);
    } catch (e) {
      console.log(`SSL redirect config skipped: ${e}`);
    }

    // 6. Get domain config to see what Vercel needs
    const configResponse = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/domains/${domain}`,
      { headers: { 'Authorization': `Bearer ${vercelToken}` } }
    );
    
    const configData = await configResponse.json();
    console.log(`Domain config:`, JSON.stringify(configData, null, 2));

    // Extract verification requirements if needed
    let verificationRequired: { type: string; domain: string; value: string }[] | undefined;
    if (!configData.verified && configData.verification?.length > 0) {
      verificationRequired = configData.verification;
    }

    return { 
      success: true, 
      projectId,
      aRecordIp: '76.76.21.21', // Vercel's standard IP
      verificationRequired,
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
    
    if (!vercelToken) {
      return new Response(
        JSON.stringify({ error: 'Vercel token not configured' }),
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
        JSON.stringify({ error: 'Invalid user session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { deploymentId, domain }: VerifyDomainRequest = await req.json();
    console.log(`=== AUTOMATIC DOMAIN SETUP: ${domain} ===`);

    // Check Pro plan
    const { data: canUseCustom } = await supabaseAdmin.rpc('can_use_custom_domain', {
      user_uuid: user.id
    });

    if (!canUseCustom) {
      return new Response(
        JSON.stringify({ error: 'Custom domains require Pro subscription', requiresUpgrade: true }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get deployment
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

    // Unique Vercel project per user project
    const vercelProjectName = `creali-${deployment.project_id.substring(0, 8)}`;

    // AUTOMATIC: Add domain to Vercel
    const vercelResult = await addDomainToVercel(domain, vercelProjectName, vercelToken);
    
    if (!vercelResult.success) {
      console.error(`❌ Failed to add domain to Vercel: ${vercelResult.error}`);
      return new Response(
        JSON.stringify({ error: `Configuration Vercel échouée: ${vercelResult.error}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Domain ${domain} added to Vercel automatically`);

    // Build DNS instructions
    const dnsInstructions = {
      records: [
        {
          type: 'A',
          name: '@',
          value: vercelResult.aRecordIp || '76.76.21.21',
          description: 'Enregistrement A - Pointez votre domaine vers Vercel'
        },
        {
          type: 'CNAME',
          name: 'www',
          value: 'cname.vercel-dns.com',
          description: 'Enregistrement CNAME pour www (optionnel)'
        }
      ],
      notes: [
        'Ajoutez ces enregistrements chez votre registrar (Namecheap, GoDaddy, etc.)',
        'La propagation peut prendre 5-60 minutes',
        'Le HTTPS sera activé automatiquement une fois le DNS vérifié'
      ]
    };

    // Add TXT verification if Vercel requires it
    if (vercelResult.verificationRequired?.length) {
      const txtRecord = vercelResult.verificationRequired[0];
      dnsInstructions.records.push({
        type: 'TXT',
        name: txtRecord.domain.replace(`.${domain}`, '') || '_vercel',
        value: txtRecord.value,
        description: 'Enregistrement TXT de vérification (requis pour SSL)'
      });
    }

    // Save to database
    const verificationToken = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

    const { data: existingDomain } = await supabaseAdmin
      .from('custom_domains')
      .select('*')
      .eq('deployment_id', deploymentId)
      .single();

    if (existingDomain) {
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

    // Update deployment
    await supabaseAdmin
      .from('deployments')
      .update({ 
        vercel_project_name: vercelProjectName,
        custom_domain: domain
      })
      .eq('id', deploymentId);

    // Log
    await supabaseAdmin.from('deployment_logs').insert({
      deployment_id: deploymentId,
      level: 'info',
      message: `✅ Domain ${domain} automatically configured on Vercel`,
      metadata: { domain, vercelProjectName, projectId: vercelResult.projectId }
    });

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        dnsInstructions,
        message: 'Domaine ajouté à Vercel automatiquement. Configurez les DNS ci-dessous puis cliquez Vérifier.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Verify domain error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Domain setup failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
