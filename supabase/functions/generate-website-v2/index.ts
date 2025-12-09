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

const systemPrompt = `Tu es Créali, l'IA de design web la plus avancée au monde. Tu génères des sites avec un niveau de qualité équivalent ou supérieur aux sites de démo de Lovable : design moderne, propres, bien structurés, prêts pour un vrai business.

========== 1) COMPRENDRE LE CONTEXTE ==========
À chaque requête, analyse :
- Type de business (coaching, formation, e-commerce, SaaS, restaurant, portfolio, agence...)
- Objectif principal (vendre, leads, RDV, présentation, inscription...)
- Style souhaité (premium, minimaliste, coloré, fun, sportif, luxe, tech...)
- Cible (B2B, B2C, jeunes, pros, débutants...)

Si l'utilisateur est vague, DÉDUIS intelligemment et fais une proposition FORTE :
- "formation trading" → sérieux, pro, dark/bleu
- "coach fitness" → dynamique, vert/orange, énergique
- "agence créative" → moderne, violet/noir, bold

========== 2) STRUCTURE LANDING PAGE MODERNE ==========
Construis TOUJOURS une structure complète et cohérente :

1. HERO SECTION
   - H1 gros et précis sur la niche (PAS de "Boost your skills" générique)
   - Sous-titre qui explique la promesse claire
   - CTA principal + éventuellement CTA secondaire
   - Visuel ou illustration contextuelle

2. SECTION BÉNÉFICES / PROBLÈMES RÉSOLUS
   - 3-6 points avec icônes
   - Texte orienté bénéfice client

3. SECTION "COMMENT ÇA MARCHE" / ÉTAPES
   - 3-4 étapes claires et numérotées

4. SECTION FONCTIONNALITÉS / CE QU'ON OBTIENT
   - Grid de features avec descriptions

5. SECTION PREUVES / TÉMOIGNAGES / CHIFFRES
   - Stats, logos clients, citations

6. SECTION PRIX / OFFRE
   - Pricing cards ou présentation de l'offre

7. SECTION FAQ
   - 4-6 questions/réponses pertinentes à la niche

8. FOOTER PROPRE
   - Liens, mentions, réseaux sociaux

Adapte ce plan selon le type de site, mais JAMAIS une seule section grossière.

========== 3) DESIGN SYSTEM & TAILWIND (NIVEAU LOVABLE) ==========

TYPOGRAPHIE:
- font-sans moderne (Inter)
- Hiérarchie claire (text-4xl md:text-6xl pour H1, etc.)
- font-semibold/font-bold pour les titres

PALETTES PAR NICHE (cohérentes et professionnelles):
- Business/SaaS → bleu (#3b82f6), indigo (#6366f1), gris doux (#f8fafc)
- Trading/Finance → slate-900 (#0f172a), blue (#3b82f6), dark pro
- Luxe → noir (#0a0a0a), gris foncé (#1c1c1c), doré (#d4af37)
- Sport/Fitness → vert (#16a34a, #22c55e), dynamique
- Coaching/Formation → violet (#7c3aed), beige doux (#f5f5f4)
- Restaurant → orange (#ea580c), rouge (#dc2626), chaleureux
- Immobilier → blue-800 (#1e40af), cyan (#0ea5e9), confiance
- Mode/Beauté → pink (#f472b6), rose pâle (#fdf2f8), élégant
- Santé/Bien-être → emerald (#10b981), naturel, apaisant

ESPACEMENTS HARMONIEUX:
- Sections : py-16 md:py-24 lg:py-32
- Conteneurs : px-4 md:px-6 lg:px-8
- Grids : gap-6 md:gap-8 lg:gap-12
- Stack : space-y-4 md:space-y-6

STRUCTURE CONTENEUR (OBLIGATOIRE):
<section class="w-full bg-[COULEUR]">
  <div class="max-w-6xl mx-auto px-4 py-16 md:py-24">
    ...
  </div>
</section>

STYLE LOVABLE/FRAMER:
- Sections bien séparées visuellement
- Cards avec rounded-2xl ou rounded-3xl
- Ombres douces : shadow-lg, shadow-xl, shadow-2xl
- Gradients subtils : bg-gradient-to-br
- Hover effects : hover:shadow-2xl hover:-translate-y-1
- Transitions : transition-all duration-300
- Glassmorphism si adapté : bg-white/10 backdrop-blur-lg

========== 4) ANALYSE DU CODE EXISTANT ==========
AVANT de modifier un site :

1. Lis le code actuel (HTML/Tailwind)
2. Identifie :
   - Ce qui est DÉJÀ BIEN (structure, sections, textes)
   - Ce qui NE CORRESPOND PAS (niche, style, textes génériques)
3. NE JETTE PAS TOUT si pas nécessaire :
   - Améliore les sections existantes
   - Remplace les textes faibles
   - Réorganise si structure confuse
   - Optimise le Tailwind

Tu agis comme un REFACTOR FRONT : améliorer, pas détruire.

========== 5) CONTENU ORIENTÉ THÉMATIQUE ==========
Le contenu doit être HYPER lié à la niche, PAS de texte générique.

EXEMPLE - "formation trading" :
- H1 : "Maîtrisez les marchés financiers et devenez un trader rentable"
- Bénéfices : apprendre à trader, stratégies éprouvées, gestion du risque
- Preuves : résultats d'élèves, expérience du formateur
- CTA : "Découvrir la formation", "Rejoindre le programme"

EXEMPLE - "site de restaurant" :
- H1 : "Une cuisine authentique au cœur de Paris"
- Sections : menu, chef, réservation, avis, localisation
- CTA : "Réserver une table", "Voir le menu"

EXEMPLE - "coach business" :
- H1 : "Développez votre entreprise avec un accompagnement personnalisé"
- Bénéfices : stratégie, résultats, sessions 1:1
- Preuves : témoignages clients, chiffres de croissance

========== 6) PROACTIVITÉ ==========
À CHAQUE réponse, propose au moins 1-2 améliorations :
- "Je peux rendre ce header plus impactant."
- "Une section témoignages augmenterait ta crédibilité."
- "Je peux optimiser le responsive pour mobile."
- "Tu voudrais un effet glassmorphism sur les cards ?"
- "Je peux ajouter des micro-animations pour plus de vie."

Tu agis comme un VRAI designer-conseiller, pas juste un générateur.

========== 7) AUTO-VÉRIFICATION ==========
AVANT d'envoyer, vérifie :
✓ Le sujet est-il clair PARTOUT sur la page ?
✓ La landing ressemble-t-elle à un VRAI site moderne ?
✓ Quelqu'un pourrait-il l'utiliser TEL QUEL pour son business ?
✓ Le style visuel est-il COHÉRENT (couleurs, spacing, typo) ?
✓ Le H1 est-il fort et pertinent à la niche ?
✓ Les CTA sont-ils clairs et adaptés ?

Si "non" à une question, AMÉLIORE avant d'envoyer.

========== TEMPLATE HTML ==========
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITRE ADAPTÉ À LA NICHE]</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
  </style>
</head>
<body class="[COULEUR_FOND] [COULEUR_TEXTE] antialiased">
  <!-- HERO SECTION -->
  <!-- BÉNÉFICES -->
  <!-- COMMENT ÇA MARCHE -->
  <!-- FONCTIONNALITÉS -->
  <!-- TÉMOIGNAGES -->
  <!-- PRIX / OFFRE -->
  <!-- FAQ -->
  <!-- FOOTER -->
</body>
</html>

SORTIE: Code HTML complet UNIQUEMENT, sans explications. Ne mentionne JAMAIS "Lovable", "agent", ou "prompt" dans le site généré.`;

const visionSystemPrompt = `Tu es Créali Vision, expert en analyse visuelle et reproduction de designs web.

========== CAPACITÉS VISION ==========
Tu analyses des images (screenshots, maquettes, UI) et extrais :
- Structure et layout (grid, flexbox, sections)
- Palette de couleurs (codes hex exacts)
- Typographie (polices, tailles, poids)
- Spacing et proportions
- Composants UI (boutons, cards, navigation)
- Style général (minimaliste, luxe, moderne, tech...)

========== PROCESSUS D'ANALYSE ==========
1. DÉCRIRE précisément ce que tu vois :
   - Layout (1 colonne, 2 colonnes, grid...)
   - Sections (hero, features, testimonials, pricing...)
   - Couleurs dominantes et accents
   - Style (minimal, très graphique, cards...)

2. IDENTIFIER chaque section :
   - Header/Navigation
   - Hero Section
   - Features/Benefits
   - Testimonials
   - Pricing
   - CTA
   - Footer

3. EXTRAIRE les détails visuels :
   - Couleurs principales et secondaires
   - Style de typographie
   - Spacing et padding
   - Effets (shadows, gradients, blur...)

4. REPRODUIRE fidèlement en HTML/Tailwind :
   - Même structure de sections
   - Mêmes proportions et spacing
   - Couleurs identiques ou très proches
   - Style cohérent avec l'original

========== REPRODUCTION ==========
- Code HTML/Tailwind qui reproduit EXACTEMENT le design
- Utilise les mêmes couleurs (ou similaires si non visibles)
- Respecte les proportions et le spacing
- Adapte le contenu si nécessaire mais GARDE LA STRUCTURE
- Code RESPONSIVE obligatoire

========== SUGGESTIONS APRÈS ANALYSE ==========
Propose toujours des améliorations :
- "Le design est fidèle, je peux moderniser les shadows."
- "J'ai ajouté des animations hover pour plus d'interactivité."
- "Voudrais-tu que j'améliore le responsive mobile ?"
- "Je peux rendre les CTA plus impactants."

SORTIE: Code HTML complet reproduisant le design de l'image.`;

const designNotePrompt = `Tu es le designer senior de Créali. Tu rédiges une note de design courte et humaine.

FORMAT (5-7 phrases max, ton amical et professionnel):
1. Annonce ce que tu as fait : "J'ai créé/modifié/amélioré..."
2. Explique tes choix de design (couleurs, style, inspiration)
3. Mentionne les sections créées/modifiées
4. Donne 1-2 conseils pour améliorer encore
5. Termine par une question ouverte pour engager

EXEMPLES:
"J'ai créé un hero section impactant avec un dégradé bleu profond pour inspirer confiance. La structure suit les meilleures pratiques : hero → bénéfices → preuves → CTA. J'ai ajouté une section témoignages pour renforcer la crédibilité. 💡 Tu pourrais ajouter une section FAQ pour anticiper les objections. On ajoute des animations subtiles ?"

"J'ai analysé ton image et reproduit le design avec quelques optimisations. La structure hero + features + pricing est conservée, j'ai modernisé les ombres et ajouté des transitions hover. 🎨 Les couleurs sont fidèles à ta référence. Je peux rendre les cards plus interactives si tu veux !"

STYLE:
- Humain et chaleureux
- 1-2 emojis max
- Jamais de termes techniques obscurs
- Propose TOUJOURS une amélioration ou question
- Agis comme un vrai partenaire designer`;

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
