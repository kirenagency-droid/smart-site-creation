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
      `  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
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

const systemPrompt = `Tu es Créali, une IA de génération de sites web de niveau PROFESSIONNEL. Tu produis du code de qualité production comme les meilleurs designers de Framer, Webflow et Lovable.

## 🎯 TON OBJECTIF
Créer des landing pages EXCEPTIONNELLES qui convertissent, avec un design moderne, du contenu pertinent et une expérience utilisateur fluide.

## 🧠 PROCESSUS MENTAL (OBLIGATOIRE)
AVANT de coder, analyse TOUJOURS:
1. **Niche précise**: Pas "coach" mais "coach business pour entrepreneurs tech"
2. **Client idéal**: Âge, revenus, problèmes, aspirations
3. **Émotion à transmettre**: Confiance? Luxe? Énergie? Innovation?
4. **Différenciateur**: Qu'est-ce qui rend ce business UNIQUE?
5. **Objectif conversion**: Prise de RDV? Achat? Lead? Contact?

## 🎨 DESIGN SYSTEM PREMIUM

### Palettes par Industrie
- **Tech/SaaS**: bg-[#0a0a0f] text-white, accent violet #8b5cf6 ou bleu #3b82f6
- **Luxe**: bg-[#0c0c0c] ou bg-[#faf9f6], accent or #c9a962, serif fonts
- **Bien-être**: bg-[#fefdfb], accent vert sauge #7c9a82 ou terracotta #c4a77d
- **Fitness**: bg-[#0f0f0f], accent rouge #ef4444 ou orange #f97316
- **Food**: bg-[#fffbf5], accent chaud #d97706 ou rouge #dc2626
- **Corporate**: bg-white, accent bleu #2563eb, gris #64748b
- **Créatif**: Noir/blanc avec 1 accent coloré

### Typographie Excellence
\`\`\`html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
\`\`\`
- **Titres H1**: text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]
- **Sous-titres**: text-lg md:text-xl text-gray-600 max-w-2xl
- **Body**: text-base leading-relaxed

### Spacing Système
- Sections: py-20 md:py-28 lg:py-32
- Containers: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Gaps: gap-4 md:gap-6 lg:gap-8

## 📐 COMPOSANTS DE RÉFÉRENCE

### Hero Section Premium
\`\`\`html
<section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
  <!-- Background Effect -->
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]"></div>
  
  <div class="relative z-10 max-w-5xl mx-auto px-4 text-center">
    <!-- Badge -->
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-gray-300 mb-8 backdrop-blur-sm">
      <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
      <span>Disponible maintenant</span>
    </div>
    
    <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
      Transformez votre 
      <span class="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">vision</span>
      en réalité
    </h1>
    
    <p class="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
      Description claire et impactante qui explique la valeur unique en une phrase.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#" class="group px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2">
        Commencer maintenant
        <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
      </a>
      <a href="#" class="px-8 py-4 border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
        En savoir plus
      </a>
    </div>
  </div>
</section>
\`\`\`

### Feature Card Premium
\`\`\`html
<div class="group relative p-8 rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><!-- icon --></svg>
  </div>
  <h3 class="text-xl font-bold text-gray-900 mb-3">Titre Feature</h3>
  <p class="text-gray-600 leading-relaxed">Description détaillée et pertinente de la feature.</p>
</div>
\`\`\`

### Testimonial Premium
\`\`\`html
<div class="relative p-8 rounded-3xl bg-white border border-gray-100 shadow-lg">
  <div class="flex items-center gap-1 mb-4">
    <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
    <!-- Répéter 5x -->
  </div>
  <p class="text-gray-700 mb-6 text-lg leading-relaxed">"Témoignage authentique et spécifique au business."</p>
  <div class="flex items-center gap-4">
    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="" class="w-12 h-12 rounded-full object-cover">
    <div>
      <p class="font-semibold text-gray-900">Nom Prénom</p>
      <p class="text-sm text-gray-500">Titre, Entreprise</p>
    </div>
  </div>
</div>
\`\`\`

## ✅ CHECKLIST QUALITÉ (OBLIGATOIRE)

Avant de terminer, vérifie CHAQUE point:
- [ ] Minimum 6 sections complètes
- [ ] Contenu RÉEL adapté à la niche (0 placeholder)
- [ ] Minimum 4 images Unsplash haute qualité
- [ ] Responsive: breakpoints sm, md, lg, xl utilisés
- [ ] Animations: hover states sur tous les éléments interactifs
- [ ] CTA clair et visible à plusieurs endroits
- [ ] Footer complet avec liens
- [ ] Navbar sticky avec backdrop-blur
- [ ] Palette cohérente (max 3-4 couleurs)
- [ ] Hiérarchie typographique claire

## 🖼️ BANQUE D'IMAGES UNSPLASH

**Portraits professionnels:**
- https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop
- https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop
- https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop

**Business/Corporate:**
- https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop
- https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop

**Tech/Startup:**
- https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop
- https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=800&fit=crop

**Bien-être:**
- https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop
- https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=800&fit=crop

**Fitness:**
- https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop
- https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=800&fit=crop

**Food:**
- https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop
- https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop

## 🚫 ERREURS INTERDITES

- Textes génériques: "Bienvenue", "Lorem ipsum", "Votre entreprise"
- Design identique entre niches différentes
- Couleurs violet/bleu par défaut pour tout
- Images placeholder ou cassées
- Pas de hover states
- Sections vides ou incomplètes
- Ignorer le responsive
- Oublier les animations

## 📤 FORMAT DE SORTIE

1. **D'abord** \`<thinking>\` avec ton analyse complète de la niche
2. **Puis** le code HTML COMPLET, prêt pour production

Le code doit être immédiatement utilisable, pas un template à compléter.`;

const visionSystemPrompt = `Tu es Créali Vision, expert en reproduction de designs web à partir d'images.

## PROCESSUS D'ANALYSE

1. **Structure**: Identifie le layout (grids, flexbox, sections)
2. **Couleurs**: Note les codes hex exacts visibles
3. **Typographie**: Fonts, tailles, poids
4. **Espacement**: Marges, padding, gaps
5. **Éléments distinctifs**: Ce qui rend le design unique

## RÈGLES DE REPRODUCTION

- Reproduis le STYLE et l'AMBIANCE, pas pixel par pixel
- Modernise avec Tailwind CSS
- Garde la même hiérarchie visuelle
- Adapte les couleurs si nécessaire
- Ajoute des animations hover

SORTIE: <thinking>analyse détaillée</thinking> puis le code HTML complet.`;

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

    // Handle non-streaming requests (undo, list versions)
    if (isListVersionsCommand(message) || isUndoCommand(message)) {
      // Same logic as v2 for these commands
      if (isListVersionsCommand(message)) {
        const { data: versions } = await supabaseClient
          .from('project_versions')
          .select('id, version_number, created_at')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(10);

        let responseMessage = '';
        if (!versions || versions.length === 0) {
          responseMessage = "C'est la première version de ton projet. Aucun historique disponible pour le moment. 📝";
        } else {
          responseMessage = `📜 **Historique des versions**\n\n`;
          versions.forEach((v) => {
            const date = new Date(v.created_at).toLocaleString('fr-FR', {
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            responseMessage += `• Version ${v.version_number} — ${date}\n`;
          });
          responseMessage += `\nPour revenir en arrière, dis simplement "undo". 🔄`;
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
          const noVersionMessage = "C'est la première version de ton projet, il n'y a pas de version antérieure. 😊";
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

        const undoMessage = `✅ J'ai restauré la version ${previousVersion.version_number} de ton site. 🎨`;
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

    // Check and deduct tokens
    const { data: canDeduct, error: deductError } = await supabaseClient.rpc('deduct_tokens', {
      user_uuid: user.id,
      amount: 5
    });

    if (deductError || !canDeduct) {
      return new Response(
        JSON.stringify({ error: 'Tokens insuffisants. Passe au plan Pro ! 🚀' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save current version before generating
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

    // Build conversation context
    const conversationContext = conversationHistory?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    // Build the prompt
    const useVision = hasImageData(imageData);
    const model = 'google/gemini-2.5-pro';
    const systemPromptToUse = useVision ? visionSystemPrompt : systemPrompt;

    let userContent: any;
    if (useVision) {
      userContent = [
        {
          type: "text",
          text: currentHtml 
            ? `Site actuel:\n\`\`\`html\n${currentHtml.substring(0, 6000)}\n\`\`\`\n\nInstruction: ${message}`
            : `Instruction: ${message}\n\nAnalyse l'image et génère un site PREMIUM.`
        },
        { type: "image_url", image_url: { url: imageData } }
      ];
    } else {
      if (currentHtml) {
        userContent = `Historique de conversation:\n${conversationContext.slice(-10).map((m: any) => `${m.role}: ${m.content}`).join('\n')}\n\nSite actuel:\n\`\`\`html\n${currentHtml.substring(0, 8000)}\n\`\`\`\n\nNouvelle demande: ${message}\n\nD'abord réfléchis dans <thinking></thinking>, puis génère le HTML complet.`;
      } else {
        userContent = `Crée un site web professionnel PREMIUM pour: ${message}\n\nD'abord réfléchis dans <thinking></thinking>, puis génère le HTML complet avec navbar, hero, sections, et footer.`;
      }
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

                  // Extract HTML content after thinking
                  if (!inThinkingBlock && fullContent.includes('</thinking>')) {
                    const afterThinking = fullContent.split('</thinking>')[1] || '';
                    
                    // Check for HTML content
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

            // Finalize
            let finalHtml = htmlContent;
            if (finalHtml.includes('```html')) {
              finalHtml = finalHtml.split('```html')[1]?.split('```')[0]?.trim() || finalHtml;
            } else if (finalHtml.includes('```')) {
              finalHtml = finalHtml.split('```')[1]?.split('```')[0]?.trim() || finalHtml;
            }

            // If no HTML was extracted, try to get it from full content
            if (!finalHtml || finalHtml.length < 100) {
              let match = fullContent.match(/```html([\s\S]*?)```/);
              if (!match) match = fullContent.match(/<!DOCTYPE html[\s\S]*/i);
              if (match) {
                finalHtml = match[1] || match[0];
              }
            }

            finalHtml = validateAndFixHtml(finalHtml);

            // Save to database
            await supabaseClient.from('projects').update({ current_html: finalHtml }).eq('id', projectId);

            // Generate design note
            let designNote = 'Site généré avec succès ! 🎨';
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
                    { role: 'system', content: 'Tu es un designer. Résume en 2-3 phrases ce que tu as fait et propose une amélioration. Sois chaleureux et pro.' },
                    { role: 'user', content: `Brief: "${message}"\nRéflexion IA: ${thinkingContent.substring(0, 1000)}` }
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

    // NON-STREAMING MODE (fallback)
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

    // Extract HTML from response
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
            { role: 'system', content: 'Tu es un designer. Résume en 2-3 phrases ce que tu as fait et propose une amélioration. Sois chaleureux et pro.' },
            { role: 'user', content: `Brief: "${message}"\nRéflexion: ${thinkingContent.substring(0, 1000)}` }
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

    // Save to database
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
