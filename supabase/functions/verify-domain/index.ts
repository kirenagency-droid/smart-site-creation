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

// Add domain to Vercel project with proper HTTPS configuration
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
  console.log(`🔗 Adding domain ${domain} to Vercel project ${projectName}`);
  
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

    // 2. Force remove domain from ALL other projects
    console.log(`🔍 Checking if domain ${domain} exists on any Vercel project...`);
    
    // First, list ALL projects to find where this domain might be
    try {
      const projectsResponse = await fetch(`https://api.vercel.com/v9/projects?limit=100`, {
        headers: { 'Authorization': `Bearer ${vercelToken}` },
      });
      
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const projects = projectsData.projects || [];
        
        for (const proj of projects) {
          if (proj.id === projectId) continue; // Skip current project
          
          // Check if this project has our domain
          const domainsResponse = await fetch(`https://api.vercel.com/v9/projects/${proj.id}/domains`, {
            headers: { 'Authorization': `Bearer ${vercelToken}` },
          });
          
          if (domainsResponse.ok) {
            const domainsData = await domainsResponse.json();
            const domains = domainsData.domains || [];
            
            for (const d of domains) {
              if (d.name === domain || d.name === `www.${domain}`) {
                console.log(`⚠️ Found ${d.name} on project ${proj.name} (${proj.id}), removing...`);
                const deleteResponse = await fetch(`https://api.vercel.com/v10/projects/${proj.id}/domains/${d.name}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${vercelToken}` },
                });
                if (deleteResponse.ok) {
                  console.log(`✅ Removed ${d.name} from project ${proj.name}`);
                } else {
                  console.log(`⚠️ Could not remove ${d.name}: ${await deleteResponse.text()}`);
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.log(`Domain removal check error: ${e}`);
    }
    
    // Also try direct domain lookup
    try {
      const domainCheckResponse = await fetch(`https://api.vercel.com/v9/domains/${domain}`, {
        headers: { 'Authorization': `Bearer ${vercelToken}` },
      });
      
      if (domainCheckResponse.ok) {
        const domainData = await domainCheckResponse.json();
        if (domainData.projectId && domainData.projectId !== projectId) {
          console.log(`⚠️ Domain registered on project ${domainData.projectId}, forcing removal...`);
          await fetch(`https://api.vercel.com/v10/projects/${domainData.projectId}/domains/${domain}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${vercelToken}` },
          });
          // Also remove www
          await fetch(`https://api.vercel.com/v10/projects/${domainData.projectId}/domains/www.${domain}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${vercelToken}` },
          });
          console.log(`✅ Force removed domain from old project`);
        }
      }
    } catch (e) {
      console.log('Domain lookup skipped');
    }

    // 3. Add main domain to project
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

    // 4. Add www subdomain with redirect to main domain (HTTPS)
    try {
      const wwwResponse = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: `www.${domain}`, 
          redirect: domain,
          redirectStatusCode: 308 // Permanent redirect preserving method
        }),
      });
      
      if (wwwResponse.ok || wwwResponse.status === 409) {
        console.log(`✅ www.${domain} redirect to ${domain} configured`);
      }
    } catch (e) {
      console.log(`www subdomain setup skipped: ${e}`);
    }

    // 5. Get domain config to verify SSL settings
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

    // Log SSL status
    console.log(`🔒 SSL Certificate state: ${configData.sslCert?.state || 'not yet provisioned'}`);

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
    console.log(`=== DOMAIN SETUP: ${domain} ===`);

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

    // Add domain to Vercel with proper HTTPS configuration
    const vercelResult = await addDomainToVercel(domain, vercelProjectName, vercelToken);
    
    if (!vercelResult.success) {
      console.error(`❌ Failed to add domain to Vercel: ${vercelResult.error}`);
      return new Response(
        JSON.stringify({ error: `Configuration Vercel échouée: ${vercelResult.error}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Domain ${domain} added to Vercel`);

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
        'La propagation DNS peut prendre 5-60 minutes',
        'Le certificat HTTPS sera automatiquement provisionné une fois le DNS vérifié par Vercel'
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

    // Save to database - reset SSL status for fresh verification
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
          ssl_provisioned: false, // Reset SSL for fresh check
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
          verification_status: 'pending',
          ssl_provisioned: false
        });
    }

    // Update deployment
    await supabaseAdmin
      .from('deployments')
      .update({ 
        vercel_project_name: vercelProjectName,
        custom_domain: domain,
        ssl_status: 'pending' // Reset SSL status
      })
      .eq('id', deploymentId);

    // Log
    await supabaseAdmin.from('deployment_logs').insert({
      deployment_id: deploymentId,
      level: 'info',
      message: `✅ Domain ${domain} configured on Vercel. Waiting for DNS verification and SSL provisioning.`,
      metadata: { domain, vercelProjectName, projectId: vercelResult.projectId }
    });

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        dnsInstructions,
        message: 'Domaine ajouté à Vercel. Configurez les DNS ci-dessous, puis cliquez Vérifier. Le HTTPS sera actif automatiquement une fois vérifié.'
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