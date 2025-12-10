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

const systemPrompt = `Tu es Créali Pro, l'IA de design web la plus avancée. Tu génères des sites de qualité PROFESSIONNELLE comme Lovable, Framer, Linear.

========== 🧠 PROCESSUS DE RÉFLEXION ==========
AVANT de générer du code, tu DOIS analyser à voix haute:
1. Reformule la demande utilisateur
2. Identifie le type de business et l'objectif
3. Planifie les sections nécessaires
4. Décris le style et les couleurs choisies
5. Liste les améliorations à apporter si site existant

========== 📊 MÉMOIRE CONVERSATIONNELLE ==========
Tu as accès à l'historique de la conversation. Utilise-le pour:
- Maintenir la cohérence du design
- Appliquer les préférences déjà exprimées
- Éviter de répéter les mêmes erreurs
- Comprendre le contexte complet du projet

========== 🎯 MODIFICATIONS CHIRURGICALES ==========
Si le site existe déjà, ANALYSE d'abord:
- Ce qui fonctionne bien (NE PAS TOUCHER)
- Ce qui doit être modifié (MODIFIER PRÉCISÉMENT)
- Ce qui manque (AJOUTER)

Ne régénère JAMAIS tout le site sauf si explicitement demandé.

========== 📐 STRUCTURE OBLIGATOIRE (7+ SECTIONS) ==========
1. NAVBAR STICKY avec backdrop-blur
2. HERO SECTION avec H1 impactant + animations
3. SECTION BÉNÉFICES/STATS
4. SECTION COMMENT ÇA MARCHE
5. SECTION FONCTIONNALITÉS
6. SECTION TÉMOIGNAGES avec photos
7. SECTION PRICING (si applicable)
8. SECTION FAQ
9. FOOTER COMPLET

========== 🎨 DESIGN PREMIUM ==========
- Typographie: Inter, hierarchy claire
- Animations: fade-in, slide-up, hover effects
- Responsive: Mobile-first avec md: et lg:
- Couleurs: Palette cohérente avec la niche
- Glassmorphism, gradients, shadows

========== 📱 RESPONSIVE OBLIGATOIRE ==========
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Text: text-3xl md:text-4xl lg:text-5xl
- Padding: p-4 md:p-6 lg:p-8
- Hidden: hidden md:block ou block md:hidden

========== 🖼️ IMAGES UNSPLASH ==========
TOUJOURS utiliser des vraies URLs Unsplash. Exemples:
- Business: https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop
- Trading: https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=800&fit=crop
- Coaching: https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop
- Fitness: https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop

SORTIE: D'abord ta réflexion entre <thinking>...</thinking>, puis le code HTML complet.`;

const visionSystemPrompt = `Tu es Créali Vision, expert en analyse visuelle et reproduction de designs web PREMIUM.

Tu analyses des images et les reproduis fidèlement en HTML/Tailwind avec:
- Structure identique
- Couleurs similaires
- Spacing cohérent
- Style modernisé
- Animations ajoutées

SORTIE: D'abord ta réflexion entre <thinking>...</thinking>, puis le code HTML complet.`;

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
