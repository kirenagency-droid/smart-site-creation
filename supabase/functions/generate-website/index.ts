import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessDescription, businessType, siteName } = await req.json();
    
    console.log('Generating website for:', { businessDescription, businessType, siteName });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Tu es un expert en création de sites web HTML/CSS modernes et professionnels. 
Tu génères du code HTML complet avec CSS intégré pour créer des landing pages magnifiques.

RÈGLES STRICTES:
1. Génère UNIQUEMENT du code HTML valide avec CSS intégré dans une balise <style>
2. Le design doit être moderne, professionnel, responsive
3. Utilise des gradients, des ombres douces, des coins arrondis
4. Inclus des sections: hero, fonctionnalités, à propos, contact, footer
5. Utilise des emojis pertinents comme icônes
6. Les couleurs doivent être harmonieuses et professionnelles
7. N'inclus PAS de JavaScript, uniquement HTML et CSS
8. Le site doit être complet et prêt à être affiché
9. Réponds UNIQUEMENT avec le code HTML, sans explication`;

    const userPrompt = `Crée un site web complet pour:
- Nom du site: ${siteName || 'Mon Site'}
- Type d'activité: ${businessType || 'Business'}
- Description: ${businessDescription}

Génère un site HTML/CSS moderne et professionnel avec toutes les sections nécessaires.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Crédits insuffisants. Veuillez ajouter des crédits.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let generatedHtml = data.choices?.[0]?.message?.content || '';
    
    console.log('Generated HTML length:', generatedHtml.length);

    // Clean up the response - remove markdown code blocks if present
    generatedHtml = generatedHtml
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim();

    // Ensure it starts with proper HTML
    if (!generatedHtml.toLowerCase().startsWith('<!doctype') && !generatedHtml.toLowerCase().startsWith('<html')) {
      generatedHtml = `<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${siteName || 'Mon Site'}</title>\n</head>\n<body>\n${generatedHtml}\n</body>\n</html>`;
    }

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: insertedSite, error: insertError } = await supabase
      .from('generated_sites')
      .insert({
        business_description: businessDescription,
        business_type: businessType,
        site_name: siteName,
        generated_html: generatedHtml,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Continue anyway, just return the HTML
    }

    console.log('Site generated and saved:', insertedSite?.id);

    return new Response(JSON.stringify({ 
      success: true,
      html: generatedHtml,
      siteId: insertedSite?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-website function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Une erreur est survenue' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
