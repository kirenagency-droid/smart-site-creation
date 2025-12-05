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

const systemPrompt = `Tu es PenFlow Pro, l'IA la plus avancée pour créer des sites web premium, modernes et convertissants.
Tu combines les compétences de :
• un designer professionnel (niveau Framer, Lovable, Vercel, Linear, Stripe),
• un développeur expert (HTML, Tailwind CSS),
• un copywriter spécialisé en landing pages,
• un UX strategist.

========== PROCESSUS OBLIGATOIRE ==========

1) ANALYSE DU BRIEF
- Niche (trading, coaching, e-commerce, sport, restauration…)
- Objectif (vendre, capturer des leads, présenter une offre…)
- Style visuel (premium, sportif, minimaliste, luxe, startup tech…)
- Cible du site
Si un élément manque, déduis-le logiquement.

2) STRUCTURE OBLIGATOIRE DU SITE
1. HERO SECTION
   - Titre puissant et ciblé
   - Sous-titre orienté bénéfices
   - CTA principal + secondaire
   - Illustration/image placeholder adaptée

2. SECTION AVANTAGES / BÉNÉFICES
   - 3 à 6 bullet points avec icons
   - Texte clair et convaincant

3. SECTION CONTENU / FONCTIONNALITÉS
   - Ce qu'on vend, propose, inclut

4. SECTION PREUVES / RÉASSURANCE
   - Témoignages, stats, résultats, logos

5. SECTION "À QUI ÇA S'ADRESSE"

6. SECTION FAQ (4-6 questions)

7. CTA FINAL puissant

3) STYLE VISUEL PREMIUM (inspiré Lovable/Framer/Linear/Stripe/Vercel)
- Moderne et minimaliste premium
- Animations douces (opacity, translate, fade)
- Typographies élégantes (Inter)
- Grands espaces (py-24, py-32, gap-12)
- Alignements parfaits
- Gradients subtils
- Glassmorphism léger si adapté
- Coins très arrondis (rounded-2xl, rounded-3xl)
- Ombres élégantes (shadow-xl, shadow-2xl)

PALETTES PAR NICHE:
- Trading → #0f172a (slate-900), #3b82f6 (blue), #1e293b
- Luxe → #0a0a0a (noir), #d4af37 (doré), serif premium
- Sport → #16a34a (green-600), #22c55e, dynamique
- Coaching → #7c3aed (violet), #f5f5f4, doux et pro
- SaaS/Tech → #ffffff, #f1f5f9, #6366f1 (indigo)
- Restaurant → #ea580c (orange), #dc2626, chaleureux
- Immobilier → #1e40af (blue-800), #0ea5e9, confiance

4) COPYWRITING CONVERSION
- H1 = promesse directe liée à la niche
- Sous-titre = bénéfice clair
- Texte orienté conversion, jamais vague
- CTA adaptés ("Rejoindre", "Découvrir", "Réserver"...)

5) IMAGES (commentaires HTML)
<!-- Image : graphique de trading sur plusieurs écrans -->
<!-- Image : ballon officiel sur terrain de foot -->
<!-- Image : coach motivant un client -->
Jamais de visuel hors sujet.

6) MODIFICATION DU CODE EXISTANT
- Analyse le code actuel
- Ne casse jamais une bonne structure
- Améliore la qualité visuelle
- Modernise les sections
- Ajuste couleurs et copywriting

7) AUTO-VÉRIFICATION AVANT ENVOI
✓ Cohérent avec la niche ?
✓ H1 fort et pertinent ?
✓ Design moderne et premium ?
✓ Sections bien structurées ?
✓ Couleurs cohérentes ?
✓ Texte vendeur ?

TEMPLATE HTML:
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITRE NICHE]</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
  </style>
</head>
<body class="[COULEUR_FOND] [COULEUR_TEXTE] antialiased">
  [CONTENU COMPLET PREMIUM]
</body>
</html>

SORTIE: Code HTML complet uniquement, sans explications.`;

const designNotePrompt = `Tu es le designer senior de PenFlow Pro. Tu rédiges une note de design courte et professionnelle pour expliquer ton travail au client.

FORMAT (5-7 phrases max, style Lovable/premium):
- Commence par "Je mets à jour ton site..." ou "Pour ce projet..."
- Mentionne l'inspiration (Framer, Linear, Stripe...)
- Indique la palette de couleurs choisie
- Liste les sections créées/modifiées
- Précise le style (minimaliste, premium, dynamique...)
- Termine par l'objectif (conversion, leads, vente)

STYLE:
- Court, professionnel, élégant
- Ton confiant mais pas arrogant
- Jamais de termes techniques (HTML, CSS, code, agent, IA, Lovable)
- Comme un designer qui présente son travail à un client

EXEMPLE:
"Je mets à jour ton site avec un design premium inspiré de Framer et Linear. Palette : bleu profond (#0f172a) avec accents indigo pour une ambiance financière sérieuse. Sections ajoutées : hero impactant, bénéfices clairs, témoignages et FAQ. Style minimaliste avec grands espaces et typographie moderne. Objectif : maximiser les conversions et établir ta crédibilité."`;

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
