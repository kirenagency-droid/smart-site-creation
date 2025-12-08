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

// Undo command patterns
const UNDO_PATTERNS = [
  /reviens?\s*(à|a)?\s*la\s*version\s*pr[eé]c[eé]dente/i,
  /undo/i,
  /annule\s*(la)?\s*derni[eè]re\s*modification/i,
  /r[eé]cup[eè]re\s*(la)?\s*version\s*d'?avant/i,
  /revien[st]?\s*en\s*arri[eè]re/i,
  /ctrl\s*z/i,
  /retour\s*arri[eè]re/i
];

const LIST_VERSIONS_PATTERNS = [
  /montre[sz]?\s*(moi)?\s*(les)?\s*versions?/i,
  /liste[sz]?\s*(les)?\s*versions?/i,
  /historique\s*(des)?\s*versions?/i,
  /voir\s*(les)?\s*versions?/i
];

function isUndoCommand(message: string): boolean {
  return UNDO_PATTERNS.some(pattern => pattern.test(message));
}

function isListVersionsCommand(message: string): boolean {
  return LIST_VERSIONS_PATTERNS.some(pattern => pattern.test(message));
}

// Check if this is an image-based request
function hasImageData(imageData: string | null): boolean {
  return !!imageData && imageData.startsWith('data:image/');
}

const systemPrompt = `Tu es PenFlow Pro, l'IA de design web la plus avancée au monde. Tu combines :
• Designer UI/UX senior (niveau Framer, Lovable, Linear, Stripe, Vercel)
• Développeur expert HTML/Tailwind CSS
• Copywriter spécialisé conversion
• Stratégiste UX/produit

========== TA PERSONNALITÉ ==========
Tu es proactif, créatif et toujours à la recherche de la meilleure solution.
Tu proposes des améliorations spontanément.
Tu expliques tes choix de design de manière concise.
Tu es enthousiaste mais professionnel.

========== PROCESSUS EN 3 ÉTAPES ==========

ÉTAPE 1: ANALYSE APPROFONDIE
- Comprends précisément ce que l'utilisateur veut
- Analyse le code existant (si fourni)
- Identifie les points faibles à améliorer
- Déduis la niche et le style approprié

ÉTAPE 2: MODIFICATION INTELLIGENTE
- NE JAMAIS tout remplacer si pas nécessaire
- Garde les bonnes parties du code existant
- Améliore les sections mal faites
- Optimise le Tailwind CSS
- Ajuste la mise en page et le spacing
- Maintiens la cohérence visuelle

ÉTAPE 3: GÉNÉRATION PREMIUM
Applique ces critères obligatoires :

STRUCTURE OBLIGATOIRE DU SITE:
1. HERO SECTION - Titre puissant + sous-titre bénéfices + CTA principal + visuel
2. SECTION AVANTAGES - 3-6 bullet points avec icons
3. SECTION FONCTIONNALITÉS - Ce qu'on propose/inclut
4. SECTION PREUVES - Témoignages, stats, logos
5. SECTION CIBLE - "À qui ça s'adresse"
6. SECTION FAQ - 4-6 questions/réponses
7. CTA FINAL - Appel à l'action puissant

STYLE VISUEL PREMIUM (inspiré Lovable/Framer/Linear/Stripe):
- Design moderne et minimaliste premium
- Animations douces (opacity, translate, fade)
- Typographies élégantes (Inter)
- Grands espaces (py-24, py-32, gap-12)
- Alignements parfaits
- Gradients subtils
- Glassmorphism si adapté
- Coins très arrondis (rounded-2xl, rounded-3xl)
- Ombres élégantes (shadow-xl, shadow-2xl)

PALETTES PAR NICHE:
- Trading/Finance → #0f172a (slate-900), #3b82f6 (blue), #1e293b
- Luxe → #0a0a0a (noir), #d4af37 (doré), serif premium
- Sport/Fitness → #16a34a (green-600), #22c55e, dynamique
- Coaching/Formation → #7c3aed (violet), #f5f5f4, doux et pro
- SaaS/Tech → #ffffff, #f1f5f9, #6366f1 (indigo)
- Restaurant → #ea580c (orange), #dc2626, chaleureux
- Immobilier → #1e40af (blue-800), #0ea5e9, confiance
- Mode/Beauté → #f472b6 (pink), #fdf2f8, élégant
- Santé/Bien-être → #10b981 (emerald), naturel et apaisant

COPYWRITING CONVERSION:
- H1 = promesse directe liée à la niche
- Sous-titre = bénéfice clair et tangible
- Texte orienté conversion, jamais vague
- CTA adaptés au contexte ("Rejoindre", "Découvrir", "Réserver"...)

IMAGES (commentaires HTML descriptifs):
<!-- Image : [description précise adaptée à la niche] -->
Jamais de visuel hors sujet.

========== PROACTIVITÉ ==========
À chaque réponse, tu DOIS proposer au moins 1 amélioration :
- "Je peux rendre ce header plus impactant si tu veux."
- "Une section témoignages augmenterait ta crédibilité."
- "Je peux optimiser le responsive pour mobile."
- "Tu voudrais un effet glassmorphism sur les cards ?"
- "Je peux ajouter des animations subtiles pour plus de dynamisme."

========== AUTO-VÉRIFICATION ==========
Avant d'envoyer, vérifie :
✓ Design cohérent avec la niche ?
✓ H1 fort et pertinent ?
✓ Sections bien structurées ?
✓ Couleurs harmonieuses ?
✓ Texte vendeur et ciblé ?
✓ Code Tailwind optimisé ?
✓ Responsive ready ?

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

const visionSystemPrompt = `Tu es PenFlow Pro avec Vision, expert en analyse visuelle et reproduction de designs web.

========== CAPACITÉS VISION ==========
Tu peux analyser des images de sites web, interfaces, maquettes, et en extraire :
- La structure et le layout (grid, flexbox, sections)
- La palette de couleurs (codes hex exacts)
- La typographie (polices, tailles, poids)
- Le spacing et les proportions
- Les composants UI (boutons, cards, navigation)
- Le style général (minimaliste, luxe, moderne, etc.)

========== PROCESSUS D'ANALYSE ==========
1. Décris précisément ce que tu vois dans l'image
2. Identifie chaque section (header, hero, features, footer, etc.)
3. Extrait les couleurs principales et secondaires
4. Note le style de typographie et d'espacement
5. Reproduis fidèlement le design en HTML/Tailwind

========== REPRODUCTION ==========
- Génère du code HTML/Tailwind qui reproduit exactement le design
- Utilise les mêmes couleurs (ou similaires si non visibles)
- Respecte les proportions et le spacing
- Adapte le contenu si nécessaire mais garde la structure
- Assure-toi que le code est responsive

========== SUGGESTIONS APRÈS ANALYSE ==========
Propose toujours des améliorations :
- "Le design est bon, mais je peux moderniser les shadows."
- "Je peux ajouter des animations hover pour plus d'interactivité."
- "Voudrais-tu que j'améliore le responsive mobile ?"

SORTIE: Code HTML complet reproduisant le design de l'image.`;

const designNotePrompt = `Tu es le designer senior de PenFlow Pro. Tu rédiges une note de design courte et humaine.

FORMAT (5-7 phrases max, ton amical et professionnel):
- Commence par ce que tu as fait : "J'ai créé/modifié/amélioré..."
- Explique tes choix de design (couleurs, style, inspiration)
- Mentionne les sections créées/modifiées
- Donne 1-2 conseils pour améliorer encore
- Termine par une question ouverte pour engager

EXEMPLES:
"J'ai créé un hero section impactant avec un dégradé bleu profond inspiré de Linear. La palette est pensée pour inspirer confiance (bleu) et action (orange accent). J'ai ajouté une section bénéfices avec des icônes modernes et une FAQ complète. 💡 Tu pourrais ajouter une section témoignages pour renforcer la crédibilité. Tu veux que j'ajoute des animations subtiles ?"

"J'ai analysé ton image et reproduit le design avec quelques améliorations. La structure hero + features + pricing est conservée, j'ai modernisé les shadows et ajouté des transitions hover. Les couleurs sont fidèles à ta référence. 🎨 Je peux rendre les cards plus interactives si tu veux !"

STYLE:
- Humain et chaleureux
- Utilise des emojis avec parcimonie (1-2 max)
- Jamais de termes techniques obscurs
- Propose toujours une amélioration ou question`;

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

    const supabaseClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
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

    const { projectId, message, currentHtml, siteStructure, imageData } = await req.json();
    console.log('Request received:', { projectId, message: message?.substring(0, 100), hasImage: !!imageData });

    // ========== HANDLE LIST VERSIONS COMMAND ==========
    if (isListVersionsCommand(message)) {
      const { data: versions, error: versionsError } = await supabaseClient
        .from('project_versions')
        .select('id, version_number, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (versionsError) {
        console.error('Error fetching versions:', versionsError);
      }

      let responseMessage = '';
      if (!versions || versions.length === 0) {
        responseMessage = "C'est la première version de ton projet. Aucun historique disponible pour le moment. 📝";
      } else {
        responseMessage = `📜 **Historique des versions**\n\n`;
        versions.forEach((v, i) => {
          const date = new Date(v.created_at).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          responseMessage += `• Version ${v.version_number} — ${date}\n`;
        });
        responseMessage += `\nPour revenir en arrière, dis simplement "undo" ou "reviens à la version précédente". 🔄`;
      }

      await supabaseClient
        .from('project_messages')
        .insert([
          { project_id: projectId, role: 'user', content: message, tokens_used: 0 },
          { project_id: projectId, role: 'assistant', content: responseMessage }
        ]);

      return new Response(
        JSON.stringify({ html: currentHtml || '', message: responseMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========== HANDLE UNDO COMMAND ==========
    if (isUndoCommand(message)) {
      const { data: previousVersion, error: versionError } = await supabaseClient
        .from('project_versions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (versionError) {
        console.error('Error fetching previous version:', versionError);
      }

      if (!previousVersion) {
        const noVersionMessage = "C'est la première version de ton projet, il n'y a pas de version antérieure. Mais ne t'inquiète pas, on peut toujours améliorer ce qu'on a ! 😊";
        
        await supabaseClient
          .from('project_messages')
          .insert([
            { project_id: projectId, role: 'user', content: message, tokens_used: 0 },
            { project_id: projectId, role: 'assistant', content: noVersionMessage }
          ]);

        return new Response(
          JSON.stringify({ html: currentHtml || '', message: noVersionMessage }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Restore previous version
      await supabaseClient
        .from('projects')
        .update({ current_html: previousVersion.html_content })
        .eq('id', projectId);

      // Delete the restored version from history
      await supabaseClient
        .from('project_versions')
        .delete()
        .eq('id', previousVersion.id);

      const undoMessage = `✅ C'est fait ! J'ai restauré la version ${previousVersion.version_number} de ton site.\n\nTu peux continuer à éditer ou me demander d'autres modifications. Je suis là pour t'aider ! 🎨`;

      await supabaseClient
        .from('project_messages')
        .insert([
          { project_id: projectId, role: 'user', content: message, tokens_used: 0 },
          { project_id: projectId, role: 'assistant', content: undoMessage }
        ]);

      return new Response(
        JSON.stringify({ html: previousVersion.html_content, message: undoMessage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========== NORMAL GENERATION FLOW ==========
    
    // Check and deduct tokens
    const { data: canDeduct, error: deductError } = await supabaseClient.rpc('deduct_tokens', {
      user_uuid: user.id,
      amount: 5
    });

    if (deductError || !canDeduct) {
      console.log('Token deduction failed:', deductError);
      return new Response(
        JSON.stringify({ error: 'Tokens insuffisants. Passe au plan Pro pour continuer à créer des sites incroyables ! 🚀' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save current version BEFORE generating new one
    if (currentHtml && currentHtml.trim().length > 0) {
      const { count } = await supabaseClient
        .from('project_versions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      const newVersionNumber = (count || 0) + 1;

      await supabaseClient
        .from('project_versions')
        .insert({
          project_id: projectId,
          html_content: currentHtml,
          version_number: newVersionNumber
        });

      console.log(`Saved version ${newVersionNumber} for project ${projectId}`);
    }

    // Determine if we're using vision mode
    const useVision = hasImageData(imageData);
    console.log('Using vision mode:', useVision);

    // Build the messages for AI
    let userContent: any;
    
    if (useVision) {
      // Vision mode with image
      userContent = [
        {
          type: "text",
          text: currentHtml 
            ? `Site actuel:\n\`\`\`html\n${currentHtml.substring(0, 5000)}\n\`\`\`\n\nInstruction: ${message}\n\nAnalyse l'image fournie et génère le HTML complet.`
            : `Instruction: ${message}\n\nAnalyse l'image fournie et génère le HTML complet inspiré de ce design.`
        },
        {
          type: "image_url",
          image_url: {
            url: imageData
          }
        }
      ];
    } else {
      // Text-only mode
      if (currentHtml) {
        userContent = `Site actuel:\n\`\`\`html\n${currentHtml}\n\`\`\`\n\nModification demandée: ${message}\n\nGénère le HTML complet mis à jour en gardant les bonnes parties et en améliorant ce qui doit l'être.`;
      } else {
        userContent = `Crée un site web professionnel premium pour: ${message}\n\nGénère le HTML complet avec toutes les sections obligatoires.`;
      }
    }

    // Choose the right model based on whether we have an image
    const model = useVision ? 'google/gemini-2.5-flash' : 'google/gemini-2.5-flash';
    const systemPromptToUse = useVision ? visionSystemPrompt : systemPrompt;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPromptToUse },
          { role: 'user', content: userContent }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Trop de requêtes en même temps. Attends quelques secondes et réessaye ! ⏳' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Erreur du service IA');
    }

    const data = await response.json();
    let generatedHtml = data.choices?.[0]?.message?.content || '';

    // Clean up the response
    if (generatedHtml.includes('```html')) {
      generatedHtml = generatedHtml.split('```html')[1].split('```')[0].trim();
    } else if (generatedHtml.includes('```')) {
      generatedHtml = generatedHtml.split('```')[1].split('```')[0].trim();
    }

    // Generate design note
    let designNote = 'Site généré avec succès ! 🎨';
    try {
      const noteContext = useVision 
        ? `L'utilisateur a envoyé une image de référence avec l'instruction: "${message}"`
        : `Brief utilisateur: "${message}"`;
      
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
            { role: 'user', content: `${noteContext}\n\nRésumé du site généré (extrait):\n${generatedHtml.substring(0, 2000)}` }
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
      JSON.stringify({ error: error instanceof Error ? error.message : 'Une erreur est survenue. Réessaye dans quelques instants ! 🔄' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
