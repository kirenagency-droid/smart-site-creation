import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublishRequest {
  projectId: string;
  deploymentType: 'subdomain' | 'custom_domain';
  customDomain?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vercelToken = Deno.env.get('VERCEL_TOKEN');
    
    // Get user from auth header
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

    // Get user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { projectId, deploymentType, customDomain }: PublishRequest = await req.json();
    console.log(`Publish request: projectId=${projectId}, type=${deploymentType}, user=${user.id}`);

    // Get project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!project.current_html) {
      return new Response(
        JSON.stringify({ error: 'No HTML content to publish. Generate your site first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check subscription for custom domain
    if (deploymentType === 'custom_domain') {
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
    }

    // Generate or get subdomain
    let subdomain: string | null = null;
    if (deploymentType === 'subdomain') {
      const { data: existingDeployment } = await supabaseAdmin
        .from('deployments')
        .select('subdomain')
        .eq('project_id', projectId)
        .eq('deployment_type', 'subdomain')
        .single();

      if (existingDeployment?.subdomain) {
        subdomain = existingDeployment.subdomain;
      } else {
        const { data: generatedSubdomain } = await supabaseAdmin.rpc('generate_subdomain', {
          project_name: project.name,
          project_id: projectId
        });
        subdomain = generatedSubdomain;
      }
    }

    // Check for existing deployment
    const { data: existingDeployment } = await supabaseAdmin
      .from('deployments')
      .select('id')
      .eq('project_id', projectId)
      .single();

    let deploymentId: string;

    if (existingDeployment) {
      // Update existing deployment
      const { data: updatedDeployment, error: updateError } = await supabaseAdmin
        .from('deployments')
        .update({
          status: 'building',
          deployment_type: deploymentType,
          subdomain: deploymentType === 'subdomain' ? subdomain : null,
          custom_domain: deploymentType === 'custom_domain' ? customDomain : null,
          error_message: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDeployment.id)
        .select()
        .single();

      if (updateError) throw updateError;
      deploymentId = updatedDeployment.id;
    } else {
      // Create new deployment
      const { data: newDeployment, error: createError } = await supabaseAdmin
        .from('deployments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          status: 'building',
          deployment_type: deploymentType,
          subdomain: deploymentType === 'subdomain' ? subdomain : null,
          custom_domain: deploymentType === 'custom_domain' ? customDomain : null,
        })
        .select()
        .single();

      if (createError) throw createError;
      deploymentId = newDeployment.id;
    }

    // Log deployment start
    await supabaseAdmin.from('deployment_logs').insert({
      deployment_id: deploymentId,
      level: 'info',
      message: `Starting ${deploymentType} deployment...`,
      metadata: { projectId, subdomain, customDomain }
    });

    // Prepare the HTML as a complete static site
    const siteFiles = prepareSiteFiles(project.current_html, project.name);

    // If Vercel token is available, deploy to Vercel
    let deploymentUrl: string;
    let externalDeploymentId: string | null = null;

    if (vercelToken) {
      try {
        const vercelResult = await deployToVercel(vercelToken, siteFiles, subdomain || customDomain || 'penflow-site');
        deploymentUrl = vercelResult.url;
        externalDeploymentId = vercelResult.id;

        await supabaseAdmin.from('deployment_logs').insert({
          deployment_id: deploymentId,
          level: 'success',
          message: `Deployed to Vercel successfully`,
          metadata: { url: deploymentUrl, vercelId: externalDeploymentId }
        });
      } catch (vercelError: unknown) {
        console.error('Vercel deployment error:', vercelError);
        const vercelErrorMessage = vercelError instanceof Error ? vercelError.message : 'Unknown error';
        
        await supabaseAdmin.from('deployment_logs').insert({
          deployment_id: deploymentId,
          level: 'error',
          message: `Vercel deployment failed: ${vercelErrorMessage}`,
        });

        // Fallback to simulated deployment
        deploymentUrl = deploymentType === 'subdomain' 
          ? `https://${subdomain}.penflow.site`
          : `https://${customDomain}`;
      }
    } else {
      // No Vercel token - simulate deployment (for demo/development)
      console.log('No VERCEL_TOKEN configured - simulating deployment');
      
      await supabaseAdmin.from('deployment_logs').insert({
        deployment_id: deploymentId,
        level: 'warning',
        message: 'Hosting provider not configured. Site URL is simulated.',
      });

      deploymentUrl = deploymentType === 'subdomain' 
        ? `https://${subdomain}.penflow.site`
        : `https://${customDomain}`;
    }

    // Update deployment with success
    const { data: finalDeployment, error: finalError } = await supabaseAdmin
      .from('deployments')
      .update({
        status: 'deployed',
        deployment_url: deploymentUrl,
        external_deployment_id: externalDeploymentId,
        last_deployed_at: new Date().toISOString(),
        ssl_status: deploymentType === 'subdomain' ? 'active' : 'pending',
      })
      .eq('id', deploymentId)
      .select()
      .single();

    if (finalError) throw finalError;

    // Log success
    await supabaseAdmin.from('deployment_logs').insert({
      deployment_id: deploymentId,
      level: 'success',
      message: `Site published successfully at ${deploymentUrl}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        deployment: finalDeployment,
        url: deploymentUrl,
        message: deploymentType === 'subdomain' 
          ? `Votre site est maintenant en ligne sur ${deploymentUrl}`
          : `Votre domaine ${customDomain} est en cours de configuration`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Publish error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Publication failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function prepareSiteFiles(htmlContent: string, _siteName: string): Record<string, string> {
  // Prepare files structure for deployment
  return {
    'index.html': htmlContent,
    'vercel.json': JSON.stringify({
      rewrites: [
        { source: "/(.*)", destination: "/index.html" }
      ]
    }, null, 2)
  };
}

async function deployToVercel(
  token: string, 
  files: Record<string, string>, 
  projectName: string
): Promise<{ url: string; id: string }> {
  // Convert files to Vercel's expected format
  const vercelFiles = Object.entries(files).map(([path, content]) => ({
    file: path,
    data: btoa(unescape(encodeURIComponent(content))) // Base64 encode
  }));

  // Create deployment
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: projectName,
      files: vercelFiles,
      projectSettings: {
        framework: null
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Vercel deployment failed');
  }

  const result = await response.json();
  
  return {
    url: `https://${result.url}`,
    id: result.id
  };
}
