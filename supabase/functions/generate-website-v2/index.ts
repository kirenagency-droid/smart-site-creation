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

const systemPrompt = `Tu es un designer et copywriter expert en pages de vente modernes (landing pages) construites avec Tailwind CSS.

=== PROCÉDURE À CHAQUE REQUÊTE ===

1) ANALYSE DU BRIEF
Identifie clairement :
- Type de business (trading, coaching, e-commerce, restaurant, fitness, immobilier...)
- Objectif de la page (vendre une formation, collecter des leads, prendre RDV...)
- Ambiance/style (sérieux, premium, sportif, fun, luxe, minimaliste...)

2) STRUCTURE OBLIGATOIRE POUR LANDING PAGES
1. Hero section - titre fort avec la niche, sous-titre promesse claire, CTA principal
2. Section "Ce que tu vas apprendre / obtenir" - contenu détaillé de l'offre
3. Section bénéfices / résultats concrets (liberté financière, transformation, gains...)
4. Section preuves / crédibilité (témoignages, résultats clients, expérience)
5. Section "À qui ça s'adresse" - profil cible idéal
6. FAQ - questions fréquentes
7. CTA final - bouton d'action puissant

3) RÈGLES DE MODIFICATION
- Ne régénère pas tout : modifie ce qui est nécessaire pour aligner avec le brief
- Priorités :
  - H1 doit refléter EXACTEMENT la niche et l'offre
  - Sous-titre explique clairement la promesse
  - Sections parlent de la bonne thématique
  - CTA adaptés ("Rejoindre la formation", "Réserver maintenant", etc.)

4) PALETTES DE COULEURS PAR THÉMATIQUE
- Trading/Finance : bleu foncé (#1e3a5f), graphiques, sérieux, pro
- Sport/Fitness : vert (#22c55e), dynamique, énergique
- Luxe/Premium : noir (#0a0a0a), doré (#d4af37), minimal
- Tech/SaaS : violet (#7c3aed), bleu (#3b82f6), moderne
- Bien-être/Coaching : turquoise (#14b8a6), apaisant, chaleureux
- Immobilier : bleu marine (#1e40af), confiance, élégant
- Food/Restaurant : orange (#f97316), rouge (#ef4444), appétissant

5) CONTENU ORIENTÉ THÉMATIQUE
Le H1, sous-titres, bénéfices, exemples et sections doivent TOUS mentionner la thématique.
Exemples pour "formations de trading" :
- H1 : "Maîtrise les Marchés Financiers et Génère des Revenus en Trading"
- Sections : modules de formation, types de trading (scalping, swing, crypto, forex)
- CTA : "Découvrir la Formation", "Commencer à Trader"

6) COPYWRITING ORIENTÉ CONVERSION
- Texte concret, pas générique
- Parle de ce que la personne OBTIENT (modules, contenu, support)
- Parle de ce qu'elle pourra ACCOMPLIR
- Pour qui c'est fait
- Pourquoi maintenant
- JAMAIS de lorem ipsum

7) STYLE MODERNE OBLIGATOIRE
- Tailwind CSS via CDN
- Responsive mobile-first
- Coins arrondis (rounded-2xl, rounded-3xl)
- Ombres douces (shadow-lg, shadow-xl)
- Espacement généreux (py-20, px-8, gap-8)
- Gradients subtils
- Emojis comme icônes (📈 💰 🎯 ⚡ 🚀)
- Typographie Inter
- Transitions hover élégantes

8) TEMPLATE HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITRE AVEC NICHE]</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-[COULEUR_FOND] text-[COULEUR_TEXTE]">
  [CONTENU COMPLET]
</body>
</html>

9) AUTO-VÉRIFICATION
Avant de renvoyer le code, vérifie :
- Le sujet demandé est clair partout sur la page ?
- Un visiteur comprend en 3 secondes ce qui est vendu ?
- Les sections sont logiques pour ce type d'offre ?
- L'ambiance et les couleurs collent à la thématique ?

SORTIE: Réponds UNIQUEMENT avec le code HTML complet, sans explications.`;

const designNotePrompt = `Tu es un assistant design qui explique brièvement les choix créatifs faits sur un site web.

Génère une note de design en français (4-6 phrases) qui explique de manière naturelle et conversationnelle :
- L'inspiration et l'ambiance choisies pour ce type de business
- La palette de couleurs utilisée et pourquoi
- Les sections principales créées ou modifiées
- Le style général et l'impact visuel recherché
- Les éléments de conversion intégrés (CTA, témoignages, etc.)

Format: style conversationnel comme un designer qui présente son travail à un client.
Ne mentionne JAMAIS "agent", "IA", "Lovable", "HTML", "CSS", "code" ou termes techniques.
Commence directement par l'explication créative, pas de "Voici..." ou "J'ai créé...".
Utilise des formulations comme "Pour cette landing page...", "L'ambiance...", "Les couleurs...", etc.`;

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
