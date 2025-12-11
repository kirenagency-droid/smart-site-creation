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

interface VercelFile {
  file: string;
  data: string;
  encoding?: string;
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
    
    if (!vercelToken) {
      return new Response(
        JSON.stringify({ error: 'Vercel token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      .select('id, external_deployment_id')
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
          hosting_provider: 'vercel',
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
          hosting_provider: 'vercel',
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
      message: `Starting Vercel deployment...`,
      metadata: { projectId, subdomain, customDomain }
    });

    // Prepare files for Vercel deployment
    let htmlContent = project.current_html;
    
    // Inject HTTPS redirect script at the beginning of <head> to force secure connection
    const httpsRedirectScript = `<script>if(location.protocol!=='https:'&&location.hostname!=='localhost'){location.replace('https://'+location.host+location.pathname+location.search)}</script>`;
    
    // Insert the script right after <head> tag
    if (htmlContent.includes('<head>')) {
      htmlContent = htmlContent.replace('<head>', `<head>\n${httpsRedirectScript}`);
    } else if (htmlContent.includes('<HEAD>')) {
      htmlContent = htmlContent.replace('<HEAD>', `<HEAD>\n${httpsRedirectScript}`);
    } else {
      // If no head tag, prepend the script
      htmlContent = httpsRedirectScript + htmlContent;
    }
    
    // Generate unique Vercel project name based on projectId (first 8 chars)
    const vercelProjectName = `creali-${projectId.substring(0, 8)}`;
    
    // For Vercel v13 API, we need to use the file upload approach
    // Convert HTML to Uint8Array for proper encoding
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(htmlContent);
    
    // Convert to base64 properly
    const base64Html = btoa(String.fromCharCode(...htmlBytes));
    
    const files: VercelFile[] = [
      {
        file: "index.html",
        data: base64Html,
        encoding: "base64"
      }
    ];

    console.log(`Deploying to Vercel: ${vercelProjectName}`);

    // Create Vercel deployment
    const vercelResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: vercelProjectName,
        files: files,
        projectSettings: {
          framework: null,
        },
        target: 'production',
      }),
    });

    const vercelData = await vercelResponse.json();
    console.log('Vercel response:', JSON.stringify(vercelData));

    if (!vercelResponse.ok) {
      const errorMsg = vercelData.error?.message || 'Vercel deployment failed';
      console.error('Vercel error:', errorMsg);
      
      await supabaseAdmin.from('deployment_logs').insert({
        deployment_id: deploymentId,
        level: 'error',
        message: `Vercel deployment failed: ${errorMsg}`,
        metadata: vercelData
      });

      // Update deployment with error
      await supabaseAdmin
        .from('deployments')
        .update({
          status: 'failed',
          error_message: errorMsg,
          updated_at: new Date().toISOString()
        })
        .eq('id', deploymentId);

      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get deployment URL from Vercel response
    const deploymentUrl = `https://${vercelData.url}`;
    const vercelDeploymentId = vercelData.id;

    await supabaseAdmin.from('deployment_logs').insert({
      deployment_id: deploymentId,
      level: 'success',
      message: `Vercel deployment created successfully`,
      metadata: { vercelId: vercelDeploymentId, url: deploymentUrl }
    });

    // Update deployment with success (including vercel_project_name for domain config)
    const { data: finalDeployment, error: finalError } = await supabaseAdmin
      .from('deployments')
      .update({
        status: 'deployed',
        deployment_url: deploymentUrl,
        external_deployment_id: vercelDeploymentId,
        last_deployed_at: new Date().toISOString(),
        ssl_status: 'active',
        vercel_project_name: vercelProjectName,
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

    console.log(`Site published successfully: ${deploymentUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        deployment: finalDeployment,
        url: deploymentUrl,
        message: `Votre site est maintenant en ligne sur Vercel !`
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
