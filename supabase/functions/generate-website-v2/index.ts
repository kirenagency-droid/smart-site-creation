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

// Validate and fix HTML output
function validateAndFixHtml(html: string): string {
  let fixedHtml = html.trim();
  
  // Ensure DOCTYPE exists
  if (!fixedHtml.toLowerCase().startsWith('<!doctype html>')) {
    fixedHtml = '<!DOCTYPE html>\n' + fixedHtml;
  }
  
  // Ensure viewport meta exists
  if (!fixedHtml.includes('viewport')) {
    fixedHtml = fixedHtml.replace(
      '<head>',
      '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    );
  }
  
  // Ensure Tailwind CDN is included
  if (!fixedHtml.includes('tailwindcss.com') && !fixedHtml.includes('cdn.tailwindcss.com')) {
    fixedHtml = fixedHtml.replace(
      '</head>',
      '  <script src="https://cdn.tailwindcss.com"></script>\n</head>'
    );
  }
  
  // Ensure Inter font is included
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

const systemPrompt = `Tu es Créali, l'IA de design web la plus avancée au monde. Tu génères des sites de qualité PROFESSIONNELLE équivalente à Lovable, Framer, Linear, Stripe.

========== 🎯 MISSION ==========
Créer des landing pages PREMIUM prêtes à être utilisées par de vrais business. Chaque site doit être si bien fait qu'il pourrait être montré en portfolio.

========== 1) ANALYSE DU CONTEXTE ==========
À chaque requête, identifie :
- Type de business (coaching, formation, e-commerce, SaaS, restaurant, portfolio, agence...)
- Objectif (vendre, leads, RDV, inscription, présentation...)
- Style souhaité (premium, minimaliste, coloré, fun, luxe, tech...)
- Cible (B2B, B2C, jeunes, pros...)

Si l'utilisateur est vague, DÉDUIS intelligemment :
- "formation trading" → dark, sérieux, bleu/indigo
- "coach fitness" → dynamique, vert/orange, énergique
- "agence créative" → moderne, violet/noir, bold

========== 2) STRUCTURE OBLIGATOIRE (7+ SECTIONS) ==========

1. NAVBAR STICKY
   - Logo à gauche, navigation au centre, CTA à droite
   - backdrop-blur-md bg-white/80 ou bg-slate-900/80
   - shadow-sm au scroll

2. HERO SECTION (IMPACTANTE)
   - H1 GROS et précis sur la niche (text-5xl md:text-6xl lg:text-7xl)
   - Sous-titre qui explique la promesse (text-xl text-muted)
   - 2 CTA (principal + secondaire)
   - Image/illustration ou gradient animé
   - Animation d'entrée (fade-in, slide-up)

3. SECTION BÉNÉFICES / LOGOS / STATS
   - 3-6 points avec icônes SVG
   - Ou barre de logos clients
   - Ou stats impressionnantes

4. SECTION "COMMENT ÇA MARCHE"
   - 3-4 étapes numérotées avec icons
   - Layout horizontal sur desktop, vertical sur mobile

5. SECTION FONCTIONNALITÉS / FEATURES
   - Grid 2x2 ou 3x2 avec cards
   - Chaque feature avec icône + titre + description

6. SECTION PREUVES / TÉMOIGNAGES
   - 3 témoignages avec photos, noms, rôles
   - Design cards avec quotes

7. SECTION PRICING (si applicable)
   - 2-3 plans avec features listées
   - Plan recommandé mis en avant

8. SECTION FAQ
   - 4-6 questions/réponses pertinentes
   - Accordion ou liste simple

9. FOOTER COMPLET
   - Logo, liens, réseaux sociaux
   - Copyright et mentions

========== 3) ANIMATIONS MODERNES (OBLIGATOIRE) ==========

ANIMATIONS D'ENTRÉE (à inclure dans <style>):
<style>
  .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
  .slide-up { animation: slideUp 0.8s ease-out forwards; opacity: 0; transform: translateY(30px); }
  .scale-in { animation: scaleIn 0.6s ease-out forwards; opacity: 0; transform: scale(0.95); }
  
  @keyframes fadeIn { to { opacity: 1; } }
  @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { to { opacity: 1; transform: scale(1); } }
  
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-400 { animation-delay: 0.4s; }
  
  .hover-lift { transition: all 0.3s ease; }
  .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
</style>

HOVER STATES (obligatoires sur les éléments interactifs):
- Boutons: hover:scale-105 hover:shadow-xl transition-all duration-300
- Cards: hover:-translate-y-2 hover:shadow-2xl transition-all duration-300
- Links: hover:text-primary transition-colors

SCROLL ANIMATIONS (utiliser IntersectionObserver):
<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
</script>

========== 4) DESIGN SYSTEM PREMIUM ==========

TYPOGRAPHIE:
- H1: text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight
- H2: text-3xl md:text-4xl lg:text-5xl font-bold
- H3: text-xl md:text-2xl font-semibold
- Body: text-base md:text-lg text-gray-600 (light) ou text-gray-300 (dark)

PALETTES PAR NICHE:
- Business/SaaS → bg-white text-slate-900, accent blue-600 (#2563eb)
- Trading/Finance → bg-slate-950 text-white, accent blue-500 (#3b82f6)
- Luxe → bg-black text-white, accent amber-500 (#f59e0b)
- Sport/Fitness → bg-white text-slate-900, accent emerald-500 (#10b981)
- Coaching → bg-slate-50 text-slate-900, accent violet-600 (#7c3aed)
- Restaurant → bg-stone-50 text-stone-900, accent orange-500 (#f97316)
- Mode/Beauté → bg-pink-50 text-slate-900, accent pink-500 (#ec4899)

ESPACEMENTS:
- Sections: py-20 md:py-28 lg:py-32
- Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Grids: gap-6 md:gap-8 lg:gap-12
- Stacks: space-y-4 md:space-y-6

COMPOSANTS PREMIUM:
- Cards: bg-white rounded-2xl shadow-lg p-6 md:p-8
- Buttons primaire: bg-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all
- Buttons secondaire: bg-transparent border-2 border-primary text-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all
- Glassmorphism: bg-white/10 backdrop-blur-xl border border-white/20

========== 5) EXEMPLES DE CODE PREMIUM (FEW-SHOT) ==========

EXEMPLE HERO SECTION PREMIUM:
<section class="relative min-h-screen flex items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden">
  <!-- Gradient orbs -->
  <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
  <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
  
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
    <div class="text-center max-w-4xl mx-auto">
      <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-blue-300 mb-8 fade-in">
        <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        Disponible maintenant
      </div>
      
      <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 slide-up">
        Transformez votre business avec
        <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> l'IA</span>
      </h1>
      
      <p class="text-xl text-gray-300 mb-10 max-w-2xl mx-auto slide-up delay-200">
        La plateforme tout-en-un qui automatise votre croissance et multiplie vos résultats par 10.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center slide-up delay-300">
        <a href="#" class="inline-flex items-center justify-center bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          Commencer gratuitement
          <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </a>
        <a href="#" class="inline-flex items-center justify-center border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all">
          Voir la démo
        </a>
      </div>
    </div>
  </div>
</section>

EXEMPLE FEATURE CARD GLASSMORPHISM:
<div class="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2">
  <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
  </div>
  <h3 class="text-xl font-bold text-white mb-3">Performance ultra-rapide</h3>
  <p class="text-gray-400">Chargement en moins de 100ms pour une expérience utilisateur optimale.</p>
</div>

EXEMPLE TESTIMONIAL CARD:
<div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
  <div class="flex items-center gap-1 mb-4">
    <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
    <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
    <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
    <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
    <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
  </div>
  <p class="text-gray-600 mb-6 text-lg italic">"Résultats incroyables en seulement 2 semaines. Mon chiffre d'affaires a doublé !"</p>
  <div class="flex items-center gap-4">
    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="Photo client" class="w-12 h-12 rounded-full object-cover">
    <div>
      <p class="font-semibold text-gray-900">Marie Dupont</p>
      <p class="text-sm text-gray-500">CEO, StartupXYZ</p>
    </div>
  </div>
</div>

========== 6) IMAGES UNSPLASH (CRITIQUE) ==========

RÈGLES OBLIGATOIRES:
- TOUJOURS utiliser des URLs Unsplash complètes
- Chaque image DOIT avoir un alt descriptif
- Utiliser des images PERTINENTES à la niche

BANQUE D'IMAGES PAR CATÉGORIE:

BUSINESS/CORPORATE:
- Hero: https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop
- Team: https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop
- Office: https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop
- Meeting: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop

TRADING/FINANCE:
- Hero: https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=800&fit=crop
- Charts: https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop
- Finance: https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop

COACHING/FORMATION:
- Hero: https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop
- Session: https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop
- Education: https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop

FITNESS/SPORT:
- Hero: https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop
- Gym: https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop
- Workout: https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop

FOOD/RESTAURANT:
- Hero: https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop
- Restaurant: https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop
- Chef: https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop

TECH/SAAS:
- Hero: https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop
- Dashboard: https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop
- Code: https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop

E-COMMERCE:
- Hero: https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop
- Products: https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop
- Shopping: https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop

IMMOBILIER:
- Hero: https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop
- House: https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop
- Interior: https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop

MODE/BEAUTÉ:
- Hero: https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=800&fit=crop
- Fashion: https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop
- Beauty: https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop

SANTÉ/BIEN-ÊTRE:
- Hero: https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop
- Wellness: https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop
- Spa: https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop

PORTRAITS/TESTIMONIALS:
- Portrait 1: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop
- Portrait 2: https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop
- Portrait 3: https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop
- Portrait 4: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop
- Portrait 5: https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop
- Portrait 6: https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop

========== 7) CONTENU THÉMATIQUE ==========
Le contenu doit être HYPER lié à la niche, JAMAIS générique.

EXEMPLE - "formation trading":
- H1: "Maîtrisez les marchés financiers et devenez un trader rentable"
- Bénéfices: stratégies éprouvées, gestion du risque, résultats réels
- CTA: "Rejoindre le programme", "Découvrir la formation"

EXEMPLE - "coach fitness":
- H1: "Transformez votre corps en 12 semaines"
- Bénéfices: programmes personnalisés, suivi quotidien, résultats garantis
- CTA: "Commencer ma transformation", "Prendre RDV"

========== 8) AUTO-VÉRIFICATION ==========
AVANT d'envoyer, vérifie :
✓ Au moins 7 sections distinctes ?
✓ Navbar sticky avec logo et CTA ?
✓ Hero avec H1 impactant et 2 CTA ?
✓ Au moins 3 images Unsplash ?
✓ Au moins 2 types d'animations ?
✓ Témoignages avec photos ?
✓ Footer complet ?
✓ Mobile responsive (grid responsive, text responsive) ?
✓ Couleurs cohérentes avec la niche ?

========== TEMPLATE HTML ==========
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITRE ADAPTÉ]</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
    
    .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
    .slide-up { animation: slideUp 0.8s ease-out forwards; opacity: 0; transform: translateY(30px); }
    .scale-in { animation: scaleIn 0.6s ease-out forwards; opacity: 0; transform: scale(0.95); }
    
    @keyframes fadeIn { to { opacity: 1; } }
    @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { to { opacity: 1; transform: scale(1); } }
    
    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-500 { animation-delay: 0.5s; }
  </style>
</head>
<body class="[BG] [TEXT] antialiased">
  <!-- NAVBAR STICKY -->
  <!-- HERO SECTION avec animations -->
  <!-- BÉNÉFICES / STATS -->
  <!-- COMMENT ÇA MARCHE -->
  <!-- FONCTIONNALITÉS -->
  <!-- TÉMOIGNAGES avec photos -->
  <!-- PRICING (si applicable) -->
  <!-- FAQ -->
  <!-- FOOTER -->
</body>
</html>

SORTIE: Code HTML complet UNIQUEMENT, sans explications. Ne mentionne JAMAIS "Lovable", "Créali", "agent", ou "IA" dans le site généré.`;

const visionSystemPrompt = `Tu es Créali Vision, expert en analyse visuelle et reproduction de designs web PREMIUM.

========== CAPACITÉS VISION ==========
Tu analyses des images (screenshots, maquettes, UI) et extrais :
- Structure et layout (grid, flexbox, sections)
- Palette de couleurs (codes hex exacts)
- Typographie (polices, tailles, poids)
- Spacing et proportions
- Composants UI (boutons, cards, navigation)
- Style général (minimaliste, luxe, moderne, tech...)

========== PROCESSUS D'ANALYSE ==========
1. DÉCRIRE précisément ce que tu vois
2. IDENTIFIER chaque section
3. EXTRAIRE les détails visuels (couleurs, typo, spacing)
4. REPRODUIRE fidèlement en HTML/Tailwind PREMIUM

========== QUALITÉ REPRODUCTION ==========
- Code HTML/Tailwind qui reproduit EXACTEMENT le design
- Même structure de sections
- Mêmes proportions et spacing
- Couleurs identiques ou très proches
- Style cohérent avec l'original
- Responsive obligatoire
- Animations ajoutées si pertinentes

========== ANIMATIONS À AJOUTER ==========
<style>
  .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
  .slide-up { animation: slideUp 0.8s ease-out forwards; opacity: 0; transform: translateY(30px); }
  @keyframes fadeIn { to { opacity: 1; } }
  @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
</style>

SORTIE: Code HTML complet reproduisant le design de l'image avec qualité PREMIUM.`;

const designNotePrompt = `Tu es le designer senior de Créali. Tu rédiges une note de design courte et humaine.

FORMAT (5-7 phrases max, ton amical et professionnel):
1. Annonce ce que tu as fait : "J'ai créé/modifié/amélioré..."
2. Explique tes choix de design (couleurs, style, inspiration)
3. Mentionne les sections créées/modifiées
4. Donne 1-2 conseils pour améliorer encore
5. Termine par une question ouverte pour engager

EXEMPLES:
"J'ai créé un hero section impactant avec un dégradé bleu profond pour inspirer confiance. La structure suit les meilleures pratiques : hero → bénéfices → preuves → CTA. J'ai ajouté une section témoignages pour renforcer la crédibilité. 💡 Tu pourrais ajouter une section FAQ pour anticiper les objections. On ajoute des micro-animations ?"

"J'ai reproduit le design de ta référence avec quelques améliorations modernes. Les ombres sont plus douces, j'ai ajouté des animations d'entrée et optimisé le responsive. 🎨 Les couleurs sont fidèles à l'original. Je peux rendre les cards plus interactives si tu veux !"

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
            ? `Site actuel:\n\`\`\`html\n${currentHtml.substring(0, 8000)}\n\`\`\`\n\nInstruction: ${message}\n\nAnalyse l'image fournie et génère le HTML complet PREMIUM avec animations, responsive, et qualité Lovable.`
            : `Instruction: ${message}\n\nAnalyse l'image fournie et génère le HTML complet PREMIUM inspiré de ce design avec animations, responsive, et qualité Lovable.`
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
        userContent = `Site actuel:\n\`\`\`html\n${currentHtml.substring(0, 10000)}\n\`\`\`\n\nModification demandée: ${message}\n\nGénère le HTML complet mis à jour. Garde les bonnes parties, améliore ce qui doit l'être, assure-toi d'avoir au moins 7 sections, des animations, et un design PREMIUM.`;
      } else {
        userContent = `Crée un site web professionnel PREMIUM pour: ${message}\n\nGénère le HTML complet avec:\n- Navbar sticky\n- Hero section impactante avec animations\n- Au moins 7 sections distinctes\n- Témoignages avec photos\n- FAQ\n- Footer complet\n- Responsive mobile-first\n- Animations d'entrée (fade-in, slide-up)\n- Design niveau Lovable/Framer`;
      }
    }

    // Use PRO model for main generation (better quality)
    const model = useVision ? 'google/gemini-2.5-pro' : 'google/gemini-2.5-pro';
    const systemPromptToUse = useVision ? visionSystemPrompt : systemPrompt;

    console.log('Calling AI Gateway with model:', model);

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

    // Validate and fix HTML
    generatedHtml = validateAndFixHtml(generatedHtml);

    console.log('Generated HTML length:', generatedHtml.length);

    // Generate design note (use faster model)
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
            { role: 'user', content: `${noteContext}\n\nRésumé du site généré (extrait):\n${generatedHtml.substring(0, 3000)}` }
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
