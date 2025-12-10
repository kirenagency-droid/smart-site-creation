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

// Command patterns
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

// Mode detection patterns
const REPAIR_PATTERNS = [
  /bug|erreur|problème|probleme|cassé|casse|marche\s*pas|fonctionne\s*pas/i,
  /manque|disparu|invisible|plus\s*là|plus\s*la/i,
  /corrige|répare|repare|fix|debug|résoudre|resoudre/i,
  /ne\s*(s')?affiche\s*pas|n'apparaît\s*pas|n'apparait\s*pas/i,
  /broken|missing|wrong|incorrect/i,
  /pourquoi\s*(ça|ca)\s*(ne)?\s*(marche|fonctionne)\s*pas/i
];

function isUndoCommand(message: string): boolean {
  return UNDO_PATTERNS.some(pattern => pattern.test(message));
}

function isListVersionsCommand(message: string): boolean {
  return LIST_VERSIONS_PATTERNS.some(pattern => pattern.test(message));
}

function detectMode(message: string, hasExistingHtml: boolean): 'repair' | 'creative' {
  // Check for explicit repair indicators
  if (REPAIR_PATTERNS.some(pattern => pattern.test(message))) {
    return 'repair';
  }
  // New site = always creative
  if (!hasExistingHtml) {
    return 'creative';
  }
  // Default to creative for modifications
  return 'creative';
}

function hasImageData(imageData: string | null): boolean {
  return !!imageData && imageData.startsWith('data:image/');
}

// Validate and fix HTML output
function validateAndFixHtml(html: string): string {
  let fixedHtml = html.trim();
  
  if (!fixedHtml.toLowerCase().startsWith('<!doctype html>')) {
    fixedHtml = '<!DOCTYPE html>\n' + fixedHtml;
  }
  
  if (!fixedHtml.includes('viewport')) {
    fixedHtml = fixedHtml.replace(
      '<head>',
      '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    );
  }
  
  if (!fixedHtml.includes('tailwindcss.com') && !fixedHtml.includes('cdn.tailwindcss.com')) {
    fixedHtml = fixedHtml.replace(
      '</head>',
      '  <script src="https://cdn.tailwindcss.com"></script>\n</head>'
    );
  }
  
  if (!fixedHtml.includes('fonts.googleapis.com') || !fixedHtml.includes('Inter')) {
    fixedHtml = fixedHtml.replace(
      '</head>',
      `  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
    .font-serif { font-family: 'Playfair Display', serif; }
  </style>\n</head>`
    );
  }
  
  return fixedHtml;
}

// Helper to send SSE events
function sendSSE(controller: ReadableStreamDefaultController, event: object) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}

// ============================================
// SYSTEM PROMPTS - Lovable Quality Level
// ============================================

const CREALI_PERSONA = `Tu es Creali, un designer/développeur web d'élite passionné et perfectionniste.

## Ta personnalité
- Tu parles naturellement, comme un collègue designer cool et compétent
- Tu es chaleureux, encourageant et tu donnes des conseils proactifs
- Tu poses des questions si le brief est flou plutôt que de deviner
- Tu expliques tes choix de design avec enthousiasme
- Tu utilises des emojis avec parcimonie (2-3 max)`;

const REPAIR_MODE_PROMPT = `${CREALI_PERSONA}

## MODE REPAIR 🔧

Tu es en mode RÉPARATION. L'utilisateur signale un problème.

### RÈGLES STRICTES
1. Identifie précisément le problème signalé dans <thinking>
2. Trouve la cause technique exacte
3. Applique la correction MINIMALE nécessaire
4. NE TOUCHE PAS aux parties qui fonctionnent
5. NE REDESIGNE PAS le site
6. NE PROPOSE PAS de nouvelles fonctionnalités non demandées

### FORMAT
<thinking>
Problème identifié: [description précise]
Cause probable: [cause technique]
Solution: [correction à appliquer]
</thinking>

[Code HTML COMPLET avec UNIQUEMENT les modifications nécessaires pour résoudre le problème]`;

const CREATIVE_MODE_PROMPT = `${CREALI_PERSONA}

## MODE CREATIVE 🎨

Tu crées des landing pages EXCEPTIONNELLES de niveau Framer/Webflow/Lovable.

## 🧠 PROCESSUS MENTAL (Dans <thinking>)
AVANT de coder, analyse TOUJOURS:
1. **Niche précise**: Pas "coach" mais "coach business pour entrepreneurs tech"
2. **Client idéal**: Âge, revenus, problèmes, aspirations
3. **Émotion à transmettre**: Confiance? Luxe? Énergie? Innovation?
4. **Différenciateur**: Qu'est-ce qui rend ce business UNIQUE?
5. **Palette choisie**: Couleurs spécifiques adaptées à la niche
6. **Sections planifiées**: Liste des sections à créer

## 🎨 DESIGN SYSTEM PREMIUM

### Palettes par Industrie (OBLIGATOIRE - NE PAS utiliser les mêmes couleurs pour tout!)
- **Tech/SaaS**: bg-[#0a0a0f] text-white, accent violet #8b5cf6 ou bleu #3b82f6
- **Luxe/Premium**: bg-[#0c0c0c] ou bg-[#faf9f6], accent or #c9a962, typo serif
- **Bien-être/Spa**: bg-[#fefdfb], accent vert sauge #7c9a82 ou terracotta #c4a77d
- **Fitness/Sport**: bg-[#0f0f0f], accent rouge #ef4444 ou orange #f97316, énergie forte
- **Food/Restaurant**: bg-[#fffbf5], accent chaud #d97706 ou rouge #dc2626
- **Corporate/B2B**: bg-white clean, accent bleu #2563eb, pro et sobre
- **Créatif/Agence**: Noir/blanc contrasté avec 1 accent coloré unique
- **E-commerce**: bg-white minimal, accent brand color, focus produit
- **Immobilier**: bg-[#f8f7f4], accent doré #b8860b ou vert #166534, élégance
- **Mode/Beauté**: bg-[#faf8f5], accent rose #ec4899 ou nude #d4a574
- **Coaching/Formation**: bg-gradient sombre, accent énergique, confiance

### Typographie
\`\`\`html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
\`\`\`
- **H1**: text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]
- **H2**: text-3xl md:text-4xl lg:text-5xl font-bold
- **Sous-titres**: text-lg md:text-xl text-gray-400 max-w-2xl
- **Body**: text-base leading-relaxed

### Spacing & Layout
- Sections: py-20 md:py-28 lg:py-32
- Containers: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Gaps: gap-4 md:gap-6 lg:gap-8
- Cards: p-6 md:p-8 rounded-2xl md:rounded-3xl

## 📐 COMPOSANTS PREMIUM (Utilise ces patterns!)

### Hero avec effet glassmorphism et animations
\`\`\`html
<section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]"></div>
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
  </div>
  
  <div class="relative z-10 max-w-5xl mx-auto px-4 text-center">
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-gray-300 mb-8 backdrop-blur-sm">
      <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
      <span>Badge accrocheur contextuel</span>
    </div>
    
    <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
      Titre impactant avec 
      <span class="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">mot clé gradient</span>
    </h1>
    
    <p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
      Sous-titre qui explique la proposition de valeur unique en une phrase claire.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#" class="group px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-white/25">
        CTA Principal
        <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
      </a>
      <a href="#" class="px-8 py-4 border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
        CTA Secondaire
      </a>
    </div>
  </div>
</section>
\`\`\`

### Feature Card avec Glass Effect
\`\`\`html
<div class="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
  <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  <div class="relative z-10">
    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-purple-500/25">
      <!-- Icon SVG -->
    </div>
    <h3 class="text-xl font-bold text-white mb-3">Titre Feature</h3>
    <p class="text-gray-400 leading-relaxed">Description spécifique à la niche.</p>
  </div>
</div>
\`\`\`

### Navbar Sticky avec scroll effect
\`\`\`html
<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" id="navbar">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-20">
      <!-- Logo + Nav Links + CTA -->
    </div>
  </div>
</nav>
<script>
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('bg-gray-900/80', 'backdrop-blur-xl', 'border-b', 'border-white/10');
  } else {
    navbar.classList.remove('bg-gray-900/80', 'backdrop-blur-xl', 'border-b', 'border-white/10');
  }
});
</script>
\`\`\`

## 🖼️ IMAGES UNSPLASH (Utilise ces URLs!)

**Portraits:**
- https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop
- https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop
- https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop
- https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop

**Business:** https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop
**Tech:** https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=800&fit=crop
**Fitness:** https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop
**Food:** https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop
**Bien-être:** https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop
**Immobilier:** https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop

## ✅ CHECKLIST QUALITÉ (OBLIGATOIRE avant de terminer)

- [ ] Minimum 7 sections complètes et pertinentes
- [ ] Contenu RÉEL adapté à la niche (JAMAIS "Lorem ipsum" ou "Votre entreprise")
- [ ] Minimum 4 vraies images Unsplash
- [ ] Responsive complet: sm, md, lg, xl breakpoints
- [ ] Animations: hover states sur TOUS les boutons/cards
- [ ] CTA visible à plusieurs endroits
- [ ] Footer complet avec liens
- [ ] Navbar sticky avec backdrop-blur
- [ ] Palette cohérente et adaptée à la niche
- [ ] Hiérarchie typographique claire

## 🚫 ERREURS INTERDITES

- "Bienvenue sur notre site", "Lorem ipsum", "Votre entreprise ici"
- Mêmes couleurs violet/bleu pour toutes les niches
- Oublier les hover states
- Images cassées ou placeholder
- Sections incomplètes
- Ignorer le responsive

## 📤 FORMAT DE SORTIE

1. <thinking> avec analyse complète de la niche et tes choix
2. Code HTML COMPLET prêt pour production`;

const VISION_PROMPT = `${CREALI_PERSONA}

## MODE VISION 👁️

Tu analyses une image de référence pour reproduire son style en code.

## PROCESSUS D'ANALYSE (Dans <thinking>)

1. **Layout**: Structure de la page, grilles, disposition
2. **Palette**: Couleurs exactes (bg, text, accents)
3. **Typographie**: Styles, tailles, poids
4. **Espacement**: Marges, padding, respiration
5. **Éléments uniques**: Ce qui rend ce design mémorable
6. **Ambiance globale**: Luxe? Tech? Minimaliste?

## RÈGLES

- Reproduis le STYLE et l'AMBIANCE, pas pixel par pixel
- Utilise Tailwind CSS moderne
- Garde la hiérarchie visuelle
- Ajoute des micro-interactions
- Assure le responsive

FORMAT: <thinking>analyse détaillée</thinking> puis code HTML complet.`;

const DESIGN_NOTE_PROMPT = `Tu es Creali. Résume ce que tu viens de créer en 3-4 phrases maximum.

RÈGLES:
- Mentionne le style/ambiance choisi
- Explique UN choix de design clé
- Propose UNE amélioration possible
- Max 2-3 emojis
- Ton chaleureux de designer

EXEMPLE:
"J'ai créé une landing page tech avec un style dark premium ✨ J'ai opté pour des gradients violet/bleu et des effets glassmorphism pour un rendu moderne. La section hero utilise des animations subtiles pour capter l'attention. 💡 Tu pourrais ajouter une section FAQ pour répondre aux objections courantes !"`;

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

    const { projectId, message, currentHtml, siteStructure, imageData, conversationHistory, stream } = await req.json();
    console.log('Request received:', { projectId, message: message?.substring(0, 100), hasImage: !!imageData, stream });

    // Handle version commands
    if (isListVersionsCommand(message) || isUndoCommand(message)) {
      if (isListVersionsCommand(message)) {
        const { data: versions } = await supabaseClient
          .from('project_versions')
          .select('id, version_number, created_at')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(10);

        let responseMessage = '';
        if (!versions || versions.length === 0) {
          responseMessage = "C'est la première version de ton projet ! Aucun historique disponible pour le moment. 📝";
        } else {
          responseMessage = `📜 **Historique des versions**\n\n`;
          versions.forEach((v) => {
            const date = new Date(v.created_at).toLocaleString('fr-FR', {
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            responseMessage += `• Version ${v.version_number} — ${date}\n`;
          });
          responseMessage += `\n💡 Pour revenir en arrière, dis simplement "undo"`;
        }

        await supabaseClient.from('project_messages').insert([
          { project_id: projectId, role: 'user', content: message, tokens_used: 0 },
          { project_id: projectId, role: 'assistant', content: responseMessage }
        ]);

        return new Response(
          JSON.stringify({ html: currentHtml || '', message: responseMessage }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (isUndoCommand(message)) {
        const { data: previousVersion } = await supabaseClient
          .from('project_versions')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!previousVersion) {
          const noVersionMessage = "C'est la première version de ton projet, pas de version antérieure disponible ! 😊";
          await supabaseClient.from('project_messages').insert([
            { project_id: projectId, role: 'user', content: message, tokens_used: 0 },
            { project_id: projectId, role: 'assistant', content: noVersionMessage }
          ]);
          return new Response(
            JSON.stringify({ html: currentHtml || '', message: noVersionMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabaseClient.from('projects').update({ current_html: previousVersion.html_content }).eq('id', projectId);
        await supabaseClient.from('project_versions').delete().eq('id', previousVersion.id);

        const undoMessage = `✅ J'ai restauré la version ${previousVersion.version_number}. Ton site est revenu à son état précédent ! 🎨`;
        await supabaseClient.from('project_messages').insert([
          { project_id: projectId, role: 'user', content: message, tokens_used: 0 },
          { project_id: projectId, role: 'assistant', content: undoMessage }
        ]);

        return new Response(
          JSON.stringify({ html: previousVersion.html_content, message: undoMessage }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check tokens
    const { data: canDeduct, error: deductError } = await supabaseClient.rpc('deduct_tokens', {
      user_uuid: user.id,
      amount: 5
    });

    if (deductError || !canDeduct) {
      return new Response(
        JSON.stringify({ error: 'Crédits insuffisants. Passe au plan Pro pour continuer ! 🚀' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save current version
    if (currentHtml && currentHtml.trim().length > 0) {
      const { count } = await supabaseClient
        .from('project_versions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      await supabaseClient.from('project_versions').insert({
        project_id: projectId,
        html_content: currentHtml,
        version_number: (count || 0) + 1
      });
    }

    // Detect mode and build prompt
    const mode = detectMode(message, !!currentHtml);
    const useVision = hasImageData(imageData);
    const model = 'google/gemini-2.5-pro';
    
    let systemPromptToUse: string;
    if (useVision) {
      systemPromptToUse = VISION_PROMPT;
    } else if (mode === 'repair') {
      systemPromptToUse = REPAIR_MODE_PROMPT;
    } else {
      systemPromptToUse = CREATIVE_MODE_PROMPT;
    }

    console.log('Mode detected:', mode, 'Vision:', useVision);

    // Build conversation context
    const conversationContext = conversationHistory?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    // Build user content
    let userContent: any;
    if (useVision) {
      userContent = [
        {
          type: "text",
          text: currentHtml 
            ? `Site actuel:\n\`\`\`html\n${currentHtml.substring(0, 6000)}\n\`\`\`\n\nInstruction: ${message}\n\nAnalyse l'image et modifie le site selon les instructions.`
            : `Instruction: ${message}\n\nAnalyse cette image et génère un site web PREMIUM qui s'en inspire.`
        },
        { type: "image_url", image_url: { url: imageData } }
      ];
    } else if (currentHtml) {
      const contextStr = conversationContext.slice(-8).map((m: any) => `${m.role}: ${m.content}`).join('\n');
      userContent = `Contexte de conversation:\n${contextStr}\n\nSite actuel:\n\`\`\`html\n${currentHtml.substring(0, 10000)}\n\`\`\`\n\nNouvelle demande: ${message}\n\nD'abord réfléchis dans <thinking></thinking>, puis génère le HTML complet modifié.`;
    } else {
      userContent = `Crée un site web professionnel PREMIUM pour: ${message}\n\nD'abord réfléchis dans <thinking></thinking> en analysant la niche, puis génère le HTML complet avec navbar sticky, hero impactant, minimum 7 sections, et footer complet.`;
    }

    // STREAMING MODE
    if (stream) {
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            sendSSE(controller, { type: 'phase', phase: 'thinking' });

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
                  ...conversationContext.slice(-5),
                  { role: 'user', content: userContent }
                ],
                stream: true,
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('AI Gateway error:', response.status, errorText);
              sendSSE(controller, { type: 'error', message: 'Erreur du service IA' });
              controller.close();
              return;
            }

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullContent = '';
            let inThinkingBlock = false;
            let thinkingContent = '';
            let htmlContent = '';
            let sentDesigning = false;
            let sentGenerating = false;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '[DONE]') continue;

                try {
                  const data = JSON.parse(jsonStr);
                  const delta = data.choices?.[0]?.delta?.content || '';
                  fullContent += delta;

                  // Parse thinking blocks
                  if (fullContent.includes('<thinking>') && !inThinkingBlock) {
                    inThinkingBlock = true;
                    sendSSE(controller, { type: 'phase', phase: 'analyzing' });
                  }

                  if (inThinkingBlock) {
                    const thinkingMatch = fullContent.match(/<thinking>([\s\S]*?)(<\/thinking>|$)/);
                    if (thinkingMatch) {
                      const newThinking = thinkingMatch[1];
                      if (newThinking.length > thinkingContent.length) {
                        const newText = newThinking.slice(thinkingContent.length);
                        thinkingContent = newThinking;
                        sendSSE(controller, { type: 'thinking', content: newText });
                      }
                    }
                  }

                  if (fullContent.includes('</thinking>') && inThinkingBlock) {
                    inThinkingBlock = false;
                    if (!sentDesigning) {
                      sendSSE(controller, { type: 'phase', phase: 'designing' });
                      sentDesigning = true;
                    }
                  }

                  // Extract HTML
                  if (!inThinkingBlock && fullContent.includes('</thinking>')) {
                    const afterThinking = fullContent.split('</thinking>')[1] || '';
                    
                    let htmlMatch = afterThinking.match(/```html([\s\S]*?)```/);
                    if (!htmlMatch) {
                      htmlMatch = afterThinking.match(/<!DOCTYPE html[\s\S]*/i);
                    }

                    if (htmlMatch) {
                      const newHtml = htmlMatch[1] || htmlMatch[0];
                      if (newHtml.length > htmlContent.length) {
                        if (!sentGenerating) {
                          sendSSE(controller, { type: 'phase', phase: 'generating' });
                          sentGenerating = true;
                        }
                        const newChunk = newHtml.slice(htmlContent.length);
                        htmlContent = newHtml;
                        sendSSE(controller, { type: 'html_delta', content: newChunk });
                      }
                    }
                  }
                } catch (e) {
                  // Skip parse errors
                }
              }
            }

            // Finalize HTML
            let finalHtml = htmlContent;
            if (finalHtml.includes('```html')) {
              finalHtml = finalHtml.split('```html')[1]?.split('```')[0]?.trim() || finalHtml;
            } else if (finalHtml.includes('```')) {
              finalHtml = finalHtml.split('```')[1]?.split('```')[0]?.trim() || finalHtml;
            }

            if (!finalHtml || finalHtml.length < 100) {
              let match = fullContent.match(/```html([\s\S]*?)```/);
              if (!match) match = fullContent.match(/<!DOCTYPE html[\s\S]*/i);
              if (match) {
                finalHtml = match[1] || match[0];
              }
            }

            finalHtml = validateAndFixHtml(finalHtml);

            // Save to DB
            await supabaseClient.from('projects').update({ current_html: finalHtml }).eq('id', projectId);

            // Generate design note
            let designNote = 'Site mis à jour avec succès ! 🎨';
            try {
              const noteResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'google/gemini-2.5-flash',
                  messages: [
                    { role: 'system', content: DESIGN_NOTE_PROMPT },
                    { role: 'user', content: `Brief utilisateur: "${message}"\n\nRéflexion du designer:\n${thinkingContent.substring(0, 1500)}\n\nMode: ${mode}` }
                  ],
                }),
              });

              if (noteResponse.ok) {
                const noteData = await noteResponse.json();
                designNote = noteData.choices?.[0]?.message?.content || designNote;
              }
            } catch (e) {
              console.error('Error generating note:', e);
            }

            // Save messages
            await supabaseClient.from('project_messages').insert([
              { project_id: projectId, role: 'user', content: message, tokens_used: 5 },
              { project_id: projectId, role: 'assistant', content: designNote }
            ]);

            sendSSE(controller, { type: 'complete', html: finalHtml, message: designNote });
            controller.close();

          } catch (error) {
            console.error('Streaming error:', error);
            sendSSE(controller, { type: 'error', message: error instanceof Error ? error.message : 'Erreur inconnue' });
            controller.close();
          }
        }
      });

      return new Response(readableStream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // NON-STREAMING MODE
    console.log('Calling AI Gateway (non-streaming)');

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
          ...conversationContext.slice(-5),
          { role: 'user', content: userContent }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Trop de requêtes. Attends quelques secondes. ⏳' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('Erreur du service IA');
    }

    const data = await response.json();
    let generatedContent = data.choices?.[0]?.message?.content || '';

    // Extract HTML
    let generatedHtml = '';
    if (generatedContent.includes('```html')) {
      generatedHtml = generatedContent.split('```html')[1].split('```')[0].trim();
    } else if (generatedContent.includes('```')) {
      generatedHtml = generatedContent.split('```')[1].split('```')[0].trim();
    } else {
      const htmlMatch = generatedContent.match(/<!DOCTYPE html[\s\S]*/i);
      if (htmlMatch) generatedHtml = htmlMatch[0];
    }

    generatedHtml = validateAndFixHtml(generatedHtml);

    // Generate design note
    let designNote = 'Site généré avec succès ! 🎨';
    try {
      const thinkingMatch = generatedContent.match(/<thinking>([\s\S]*?)<\/thinking>/);
      const thinkingContent = thinkingMatch ? thinkingMatch[1] : '';

      const noteResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: DESIGN_NOTE_PROMPT },
            { role: 'user', content: `Brief: "${message}"\nRéflexion: ${thinkingContent.substring(0, 1500)}\nMode: ${mode}` }
          ],
        }),
      });

      if (noteResponse.ok) {
        const noteData = await noteResponse.json();
        designNote = noteData.choices?.[0]?.message?.content || designNote;
      }
    } catch (e) {
      console.error('Error generating note:', e);
    }

    // Save to DB
    await supabaseClient.from('project_messages').insert([
      { project_id: projectId, role: 'user', content: message, tokens_used: 5 },
      { project_id: projectId, role: 'assistant', content: designNote }
    ]);

    await supabaseClient.from('projects').update({ current_html: generatedHtml }).eq('id', projectId);

    return new Response(
      JSON.stringify({ html: generatedHtml, message: designNote, structure: siteStructure }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-website-v3:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
