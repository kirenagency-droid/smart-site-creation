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

// Remove domain from old Vercel projects before adding to new one
async function removeDomainFromOldProjects(
  domain: string, 
  targetProjectName: string, 
  vercelToken: string
): Promise<{ removed: boolean; oldProject?: string; error?: string }> {
  console.log(`🔍 Searching for domain ${domain} on existing Vercel projects...`);
  
  try {
    // List all projects
    const projectsResponse = await fetch('https://api.vercel.com/v9/projects?limit=100', {
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
      },
    });
    
    if (!projectsResponse.ok) {
      console.error('Failed to list Vercel projects');
      return { removed: false, error: 'Failed to list projects' };
    }
    
    const projectsData = await projectsResponse.json();
    const projects = projectsData.projects || [];
    
    console.log(`Found ${projects.length} Vercel projects`);
    
    // Filter to creali- projects only
    const crealiProjects = projects.filter((p: { name: string }) => 
      p.name.startsWith('creali-') && p.name !== targetProjectName
    );
    
    console.log(`Checking ${crealiProjects.length} creali- projects (excluding target ${targetProjectName})`);
    
    for (const project of crealiProjects) {
      // Check if domain exists on this project
      const domainsResponse = await fetch(`https://api.vercel.com/v10/projects/${project.id}/domains`, {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
        },
      });
      
      if (!domainsResponse.ok) {
        console.log(`Could not check domains for project ${project.name}`);
        continue;
      }
      
      const domainsData = await domainsResponse.json();
      const domains = domainsData.domains || [];
      
      // Check if our domain is on this project
      const foundDomain = domains.find((d: { name: string }) => 
        d.name === domain || d.name === `www.${domain}`
      );
      
      if (foundDomain) {
        console.log(`⚠️ Found domain ${domain} on old project ${project.name} - removing...`);
        
        // Remove the domain
        const deleteResponse = await fetch(
          `https://api.vercel.com/v9/projects/${project.id}/domains/${domain}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${vercelToken}`,
            },
          }
        );
        
        if (deleteResponse.ok || deleteResponse.status === 404) {
          console.log(`✅ Removed domain ${domain} from project ${project.name}`);
          
          // Also try to remove www subdomain
          try {
            await fetch(
              `https://api.vercel.com/v9/projects/${project.id}/domains/www.${domain}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${vercelToken}`,
                },
              }
            );
            console.log(`✅ Removed www.${domain} from project ${project.name}`);
          } catch (e) {
            // Ignore www removal errors
          }
          
          return { removed: true, oldProject: project.name };
        } else {
          const errorData = await deleteResponse.json();
          console.error(`Failed to remove domain from ${project.name}:`, errorData);
          return { removed: false, error: `Failed to remove from ${project.name}` };
        }
      }
    }
    
    console.log(`✅ Domain ${domain} not found on any other creali- projects`);
    return { removed: false };
    
  } catch (error) {
    console.error('Error searching for domain on old projects:', error);
    return { removed: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Add domain to Vercel project
async function addDomainToVercel(domain: string, projectName: string, vercelToken: string): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log(`🔗 Adding domain ${domain} to Vercel project ${projectName}`);
  
  try {
    // STEP 1: Remove domain from any old projects first
    const removeResult = await removeDomainFromOldProjects(domain, projectName, vercelToken);
    if (removeResult.removed) {
      console.log(`📝 Domain was removed from old project: ${removeResult.oldProject}`);
    }
    
    // STEP 2: Get the target project
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
    
    // STEP 3: Add domain to the project
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
      // Handle 409 conflict - domain already exists somewhere
      if (domainResponse.status === 409) {
        console.log(`Domain ${domain} conflict - checking if it's on the correct project...`);
        
        // Check if domain is already on THIS project
        const checkDomainsResponse = await fetch(`https://api.vercel.com/v10/projects/${project.id}/domains`, {
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
          },
        });
        
        if (checkDomainsResponse.ok) {
          const checkDomainsData = await checkDomainsResponse.json();
          const existingDomain = checkDomainsData.domains?.find((d: { name: string }) => d.name === domain);
          
          if (existingDomain) {
            console.log(`✅ Domain ${domain} is already on the correct project ${projectName}`);
            return { success: true };
          }
        }
        
        // Domain is on another project - try to remove and retry
        console.log(`Domain ${domain} is on a different project - attempting force removal...`);
        
        // Force search and remove from ALL projects (not just creali-)
        const allProjectsResponse = await fetch('https://api.vercel.com/v9/projects?limit=100', {
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
          },
        });
        
        if (allProjectsResponse.ok) {
          const allProjectsData = await allProjectsResponse.json();
          for (const otherProject of allProjectsData.projects || []) {
            if (otherProject.id === project.id) continue;
            
            // Try to remove from this project
            const deleteRes = await fetch(
              `https://api.vercel.com/v9/projects/${otherProject.id}/domains/${domain}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${vercelToken}`,
                },
              }
            );
            
            if (deleteRes.ok) {
              console.log(`✅ Removed domain from project ${otherProject.name}`);
              
              // Retry adding to our project
              const retryResponse = await fetch(`https://api.vercel.com/v10/projects/${project.id}/domains`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${vercelToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: domain }),
              });
              
              if (retryResponse.ok) {
                console.log(`✅ Domain ${domain} successfully added after removal from old project`);
                break;
              }
            }
          }
        }
        
        // Final check if domain is now on correct project
        const finalCheckResponse = await fetch(`https://api.vercel.com/v10/projects/${project.id}/domains`, {
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
          },
        });
        
        if (finalCheckResponse.ok) {
          const finalData = await finalCheckResponse.json();
          if (finalData.domains?.some((d: { name: string }) => d.name === domain)) {
            console.log(`✅ Domain ${domain} confirmed on correct project`);
            return { success: true };
          }
        }
        
        return { success: false, error: 'Domain conflict - could not reassign to correct project' };
      }
      
      console.error('Failed to add domain to Vercel:', domainData);
      return { success: false, error: domainData.error?.message || 'Failed to add domain' };
    }
    
    console.log(`✅ Domain ${domain} successfully added to Vercel project`);
    
    // STEP 4: Also add www subdomain
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
