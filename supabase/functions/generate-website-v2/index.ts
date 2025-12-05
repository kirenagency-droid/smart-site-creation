import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const systemPrompt = `Tu es un expert en création de sites web modernes et professionnels pour des landing pages de vente. Tu génères du code HTML/CSS complet, moderne et responsive.

ANALYSE DU BRIEF:
1. Identifie le type de business (trading, coaching, e-commerce, restaurant...)
2. Identifie l'objectif (vendre, collecter des leads, prendre RDV...)
3. Identifie le style souhaité (premium, sportif, sérieux, fun...)

STRUCTURE OBLIGATOIRE POUR LANDING PAGES DE VENTE:
1. Hero section - titre fort avec la niche, sous-titre promesse, CTA principal
2. Section "Ce que tu vas apprendre / obtenir" - contenu de l'offre
3. Section bénéfices / résultats concrets
4. Section preuves / crédibilité (témoignages, résultats, expérience)
5. Section "À qui ça s'adresse" - cible idéale
6. FAQ - questions fréquentes
7. CTA final - bouton d'action clair

RÈGLES IMPORTANTES:
1. Génère TOUJOURS un site complet avec toutes les sections
2. Utilise Tailwind CSS via CDN
3. Le site DOIT être responsive (mobile-first)
4. Couleurs cohérentes avec la thématique:
   - Trading: bleu foncé, graphiques, sérieux
   - Sport: vert, dynamique, énergique
   - Luxe: noir, doré, minimal
   - Tech: violet, bleu, moderne
5. Animations subtiles (hover, transitions)
6. NE JAMAIS utiliser lorem ipsum - contenu réel en français
7. CTA adaptés au business ("Rejoindre la formation", "Réserver", etc.)
8. Le H1 doit CLAIREMENT mentionner le sujet/niche

STYLE MODERNE:
- Coins arrondis (rounded-2xl, rounded-3xl)
- Ombres douces (shadow-lg, shadow-xl)
- Espacement généreux (py-20, px-8)
- Gradients subtils
- Emojis pour les icônes
- Typographie claire (Inter)

TEMPLATE HTML:
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITRE]</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900">
  [CONTENU]
</body>
</html>

COPYWRITING:
- Texte concret orienté conversion
- Parle de ce que la personne OBTIENT
- Parle de ce qu'elle pourra ACCOMPLIR
- Évite les phrases floues génériques

Réponds UNIQUEMENT avec le code HTML complet, sans explications.`;

const designNotePrompt = `Tu es un assistant design qui explique brièvement les choix créatifs faits sur un site web.

Génère une courte note de design en français (3-5 phrases max) qui explique:
- L'inspiration/ambiance choisie
- La palette de couleurs utilisée
- Les sections principales créées ou modifiées
- Le style général (moderne, premium, dynamique...)

Format: texte court, style conversationnel, comme si tu expliquais à un client.
Ne mentionne JAMAIS "agent", "IA", "Lovable" ou termes techniques.
Commence directement par l'explication, pas de "Voici..." ou "J'ai...".`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token
    const supabaseClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await createClient(
      SUPABASE_URL!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    ).auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { projectId, message, currentHtml, siteStructure } = await req.json();

    console.log('Request received:', { projectId, message: message?.substring(0, 100) });

    // Check and deduct tokens
    const { data: canDeduct, error: deductError } = await supabaseClient.rpc('deduct_tokens', {
      user_uuid: user.id,
      amount: 5
    });

    if (deductError || !canDeduct) {
      console.log('Token deduction failed:', deductError);
      return new Response(
        JSON.stringify({ error: 'Tokens insuffisants. Passez au plan Pro pour continuer.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt
    let userPrompt = message;
    if (currentHtml) {
      userPrompt = `Site actuel:\n\`\`\`html\n${currentHtml}\n\`\`\`\n\nModification demandée: ${message}\n\nGénère le HTML complet mis à jour.`;
    } else {
      userPrompt = `Crée un site web professionnel pour: ${message}\n\nGénère le HTML complet.`;
    }

    // Call Lovable AI Gateway
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Trop de requêtes. Réessayez dans quelques secondes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Erreur du service IA');
    }

    const data = await response.json();
    let generatedHtml = data.choices?.[0]?.message?.content || '';

    // Clean up the response - extract HTML if wrapped in code blocks
    if (generatedHtml.includes('```html')) {
      generatedHtml = generatedHtml.split('```html')[1].split('```')[0].trim();
    } else if (generatedHtml.includes('```')) {
      generatedHtml = generatedHtml.split('```')[1].split('```')[0].trim();
    }

    // Generate design note explanation
    let designNote = 'Site généré avec succès.';
    try {
      const designNoteResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: designNotePrompt },
            { role: 'user', content: `Brief utilisateur: "${message}"\n\nRésumé du site généré (extrait du HTML):\n${generatedHtml.substring(0, 2000)}` }
          ],
        }),
      });

      if (designNoteResponse.ok) {
        const noteData = await designNoteResponse.json();
        designNote = noteData.choices?.[0]?.message?.content || designNote;
      }
    } catch (noteError) {
      console.error('Error generating design note:', noteError);
    }

    // Save message to history
    await supabaseClient
      .from('project_messages')
      .insert([
        { project_id: projectId, role: 'user', content: message, tokens_used: 5 },
        { project_id: projectId, role: 'assistant', content: designNote }
      ]);

    // Update project
    await supabaseClient
      .from('projects')
      .update({ current_html: generatedHtml })
      .eq('id', projectId);

    console.log('Generation successful, HTML length:', generatedHtml.length);

    return new Response(
      JSON.stringify({
        html: generatedHtml,
        message: designNote,
        structure: siteStructure
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-website-v2:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
