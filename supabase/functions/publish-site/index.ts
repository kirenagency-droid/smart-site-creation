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
          hosting_provider: 'supabase',
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
          hosting_provider: 'supabase',
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
      message: `Starting ${deploymentType} deployment to Supabase Storage...`,
      metadata: { projectId, subdomain, customDomain }
    });

    // Upload HTML to Supabase Storage
    const sitePath = `${subdomain || customDomain}/index.html`;
    const htmlContent = project.current_html;
    
    // Encode HTML content as UTF-8 bytes
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(htmlContent);

    console.log(`Uploading site to storage: sites/${sitePath}`);

    // First, try to delete existing file to ensure clean upload
    await supabaseAdmin.storage.from('sites').remove([sitePath]);

    // Upload the file with proper content type
    const { error: uploadError } = await supabaseAdmin.storage
      .from('sites')
      .upload(sitePath, htmlBytes, {
        contentType: 'text/html',
        upsert: true,
        cacheControl: 'no-cache'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      
      await supabaseAdmin.from('deployment_logs').insert({
        deployment_id: deploymentId,
        level: 'error',
        message: `Storage upload failed: ${uploadError.message}`,
      });

      // Update deployment with error
      await supabaseAdmin
        .from('deployments')
        .update({
          status: 'failed',
          error_message: uploadError.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', deploymentId);

      return new Response(
        JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate the public URL via storage
    const deploymentUrl = `${supabaseUrl}/storage/v1/object/public/sites/${sitePath}`;

    await supabaseAdmin.from('deployment_logs').insert({
      deployment_id: deploymentId,
      level: 'success',
      message: `Uploaded to Supabase Storage successfully`,
      metadata: { url: deploymentUrl }
    });

    // Update deployment with success
    const { data: finalDeployment, error: finalError } = await supabaseAdmin
      .from('deployments')
      .update({
        status: 'deployed',
        deployment_url: deploymentUrl,
        external_deployment_id: null,
        last_deployed_at: new Date().toISOString(),
        ssl_status: 'active',
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
        message: `Votre site est maintenant en ligne !`
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