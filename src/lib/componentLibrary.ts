/**
 * Creali Component Library
 * Modular, reusable website sections with multiple variants
 */

export interface ComponentVariant {
  id: string;
  name: string;
  preview: string; // Thumbnail description
  html: string;
}

export interface ComponentTemplate {
  id: string;
  type: 'navbar' | 'hero' | 'features' | 'testimonials' | 'pricing' | 'faq' | 'cta' | 'footer' | 'stats' | 'team';
  name: string;
  description: string;
  icon: string;
  variants: ComponentVariant[];
}

export const componentLibrary: ComponentTemplate[] = [
  // ============ NAVBAR ============
  {
    id: 'navbar',
    type: 'navbar',
    name: 'Navigation',
    description: 'Barre de navigation sticky',
    icon: 'Menu',
    variants: [
      {
        id: 'navbar-minimal',
        name: 'Minimaliste',
        preview: 'Logo + liens + CTA',
        html: `<nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
        <span class="font-bold text-xl text-gray-900">{{BRAND}}</span>
      </div>
      <div class="hidden md:flex items-center gap-8">
        <a href="#features" class="text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
        <a href="#testimonials" class="text-gray-600 hover:text-gray-900 transition-colors">Témoignages</a>
        <a href="#pricing" class="text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
      </div>
      <a href="#cta" class="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
        Commencer
      </a>
    </div>
  </div>
</nav>`
      },
      {
        id: 'navbar-dark',
        name: 'Dark Mode',
        preview: 'Navigation sombre élégante',
        html: `<nav class="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg"></div>
        <span class="font-bold text-xl text-white">{{BRAND}}</span>
      </div>
      <div class="hidden md:flex items-center gap-8">
        <a href="#features" class="text-slate-400 hover:text-white transition-colors">Fonctionnalités</a>
        <a href="#testimonials" class="text-slate-400 hover:text-white transition-colors">Témoignages</a>
        <a href="#pricing" class="text-slate-400 hover:text-white transition-colors">Tarifs</a>
      </div>
      <a href="#cta" class="bg-white text-slate-900 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-100 transition-colors">
        Commencer
      </a>
    </div>
  </div>
</nav>`
      },
      {
        id: 'navbar-glass',
        name: 'Glassmorphism',
        preview: 'Effet verre moderne',
        html: `<nav class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
  <div class="px-6">
    <div class="flex items-center justify-between h-14">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 bg-gradient-to-br from-violet-500 to-pink-500 rounded-lg"></div>
        <span class="font-bold text-lg text-white">{{BRAND}}</span>
      </div>
      <div class="hidden md:flex items-center gap-6">
        <a href="#features" class="text-white/70 hover:text-white text-sm transition-colors">Fonctionnalités</a>
        <a href="#testimonials" class="text-white/70 hover:text-white text-sm transition-colors">Témoignages</a>
        <a href="#pricing" class="text-white/70 hover:text-white text-sm transition-colors">Tarifs</a>
      </div>
      <a href="#cta" class="bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
        Démarrer
      </a>
    </div>
  </div>
</nav>`
      }
    ]
  },

  // ============ HERO ============
  {
    id: 'hero',
    type: 'hero',
    name: 'Hero Section',
    description: 'Section d\'accueil impactante',
    icon: 'Sparkles',
    variants: [
      {
        id: 'hero-centered',
        name: 'Centré',
        preview: 'Titre + sous-titre + 2 CTA centrés',
        html: `<section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
  </div>
  <div class="relative max-w-4xl mx-auto px-4 text-center">
    <div class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm text-gray-600 mb-8 shadow-sm fade-in">
      <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      {{BADGE}}
    </div>
    <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6 slide-up">
      {{HEADLINE}}
    </h1>
    <p class="text-xl text-gray-600 mb-10 max-w-2xl mx-auto slide-up delay-200">
      {{SUBHEADLINE}}
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center slide-up delay-300">
      <a href="#cta" class="inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
        {{CTA_PRIMARY}}
        <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
      </a>
      <a href="#features" class="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all">
        {{CTA_SECONDARY}}
      </a>
    </div>
  </div>
</section>`
      },
      {
        id: 'hero-dark',
        name: 'Dark Gradient',
        preview: 'Fond sombre avec gradients',
        html: `<section class="relative min-h-screen flex items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden pt-20">
  <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
  <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
    <div class="text-center max-w-4xl mx-auto">
      <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-blue-300 mb-8 fade-in">
        <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        {{BADGE}}
      </div>
      <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 slide-up">
        {{HEADLINE_PART1}}
        <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> {{HEADLINE_HIGHLIGHT}}</span>
      </h1>
      <p class="text-xl text-gray-300 mb-10 max-w-2xl mx-auto slide-up delay-200">
        {{SUBHEADLINE}}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center slide-up delay-300">
        <a href="#cta" class="inline-flex items-center justify-center bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          {{CTA_PRIMARY}}
          <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </a>
        <a href="#features" class="inline-flex items-center justify-center border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all">
          {{CTA_SECONDARY}}
        </a>
      </div>
    </div>
  </div>
</section>`
      },
      {
        id: 'hero-split',
        name: 'Split Image',
        preview: 'Texte à gauche, image à droite',
        html: `<section class="min-h-screen flex items-center bg-white pt-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <div class="fade-in">
        <div class="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm text-blue-600 mb-6">
          <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
          {{BADGE}}
        </div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
          {{HEADLINE}}
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          {{SUBHEADLINE}}
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a href="#cta" class="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            {{CTA_PRIMARY}}
          </a>
          <a href="#features" class="inline-flex items-center justify-center text-gray-600 font-semibold hover:text-gray-900 transition-colors">
            {{CTA_SECONDARY}} →
          </a>
        </div>
      </div>
      <div class="relative slide-up">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl -rotate-3"></div>
        <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop" alt="Hero" class="relative rounded-3xl shadow-2xl rotate-1">
      </div>
    </div>
  </div>
</section>`
      }
    ]
  },

  // ============ FEATURES ============
  {
    id: 'features',
    type: 'features',
    name: 'Fonctionnalités',
    description: 'Grille de fonctionnalités',
    icon: 'Zap',
    variants: [
      {
        id: 'features-grid',
        name: 'Grille 3x2',
        preview: '6 features avec icônes',
        html: `<section id="features" class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{{SECTION_TITLE}}</h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">{{SECTION_SUBTITLE}}</p>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="group p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300">
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{FEATURE_1_TITLE}}</h3>
        <p class="text-gray-600">{{FEATURE_1_DESC}}</p>
      </div>
      <div class="group p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300">
        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{FEATURE_2_TITLE}}</h3>
        <p class="text-gray-600">{{FEATURE_2_DESC}}</p>
      </div>
      <div class="group p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300">
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{FEATURE_3_TITLE}}</h3>
        <p class="text-gray-600">{{FEATURE_3_DESC}}</p>
      </div>
      <div class="group p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300">
        <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{FEATURE_4_TITLE}}</h3>
        <p class="text-gray-600">{{FEATURE_4_DESC}}</p>
      </div>
      <div class="group p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300">
        <div class="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{FEATURE_5_TITLE}}</h3>
        <p class="text-gray-600">{{FEATURE_5_DESC}}</p>
      </div>
      <div class="group p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300">
        <div class="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{FEATURE_6_TITLE}}</h3>
        <p class="text-gray-600">{{FEATURE_6_DESC}}</p>
      </div>
    </div>
  </div>
</section>`
      },
      {
        id: 'features-bento',
        name: 'Bento Grid',
        preview: 'Layout asymétrique moderne',
        html: `<section id="features" class="py-24 bg-slate-950">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{SECTION_TITLE}}</h2>
      <p class="text-xl text-slate-400 max-w-2xl mx-auto">{{SECTION_SUBTITLE}}</p>
    </div>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700">
        <h3 class="text-2xl font-bold text-white mb-4">{{FEATURE_1_TITLE}}</h3>
        <p class="text-blue-100">{{FEATURE_1_DESC}}</p>
      </div>
      <div class="p-8 rounded-3xl bg-slate-900 border border-slate-800">
        <h3 class="text-xl font-bold text-white mb-3">{{FEATURE_2_TITLE}}</h3>
        <p class="text-slate-400">{{FEATURE_2_DESC}}</p>
      </div>
      <div class="p-8 rounded-3xl bg-slate-900 border border-slate-800">
        <h3 class="text-xl font-bold text-white mb-3">{{FEATURE_3_TITLE}}</h3>
        <p class="text-slate-400">{{FEATURE_3_DESC}}</p>
      </div>
      <div class="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600">
        <h3 class="text-2xl font-bold text-white mb-4">{{FEATURE_4_TITLE}}</h3>
        <p class="text-purple-100">{{FEATURE_4_DESC}}</p>
      </div>
    </div>
  </div>
</section>`
      }
    ]
  },

  // ============ TESTIMONIALS ============
  {
    id: 'testimonials',
    type: 'testimonials',
    name: 'Témoignages',
    description: 'Avis clients avec photos',
    icon: 'MessageSquare',
    variants: [
      {
        id: 'testimonials-cards',
        name: 'Cartes',
        preview: '3 témoignages en grille',
        html: `<section id="testimonials" class="py-24 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{{SECTION_TITLE}}</h2>
      <p class="text-xl text-gray-600">{{SECTION_SUBTITLE}}</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <div class="flex items-center gap-1 mb-4">
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
        </div>
        <p class="text-gray-600 mb-6 italic">"{{TESTIMONIAL_1_TEXT}}"</p>
        <div class="flex items-center gap-4">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="{{TESTIMONIAL_1_NAME}}" class="w-12 h-12 rounded-full object-cover">
          <div>
            <p class="font-semibold text-gray-900">{{TESTIMONIAL_1_NAME}}</p>
            <p class="text-sm text-gray-500">{{TESTIMONIAL_1_ROLE}}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <div class="flex items-center gap-1 mb-4">
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
        </div>
        <p class="text-gray-600 mb-6 italic">"{{TESTIMONIAL_2_TEXT}}"</p>
        <div class="flex items-center gap-4">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="{{TESTIMONIAL_2_NAME}}" class="w-12 h-12 rounded-full object-cover">
          <div>
            <p class="font-semibold text-gray-900">{{TESTIMONIAL_2_NAME}}</p>
            <p class="text-sm text-gray-500">{{TESTIMONIAL_2_ROLE}}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <div class="flex items-center gap-1 mb-4">
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
        </div>
        <p class="text-gray-600 mb-6 italic">"{{TESTIMONIAL_3_TEXT}}"</p>
        <div class="flex items-center gap-4">
          <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" alt="{{TESTIMONIAL_3_NAME}}" class="w-12 h-12 rounded-full object-cover">
          <div>
            <p class="font-semibold text-gray-900">{{TESTIMONIAL_3_NAME}}</p>
            <p class="text-sm text-gray-500">{{TESTIMONIAL_3_ROLE}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`
      }
    ]
  },

  // ============ PRICING ============
  {
    id: 'pricing',
    type: 'pricing',
    name: 'Tarifs',
    description: 'Section de pricing',
    icon: 'CreditCard',
    variants: [
      {
        id: 'pricing-three-tiers',
        name: '3 Plans',
        preview: 'Starter, Pro, Enterprise',
        html: `<section id="pricing" class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{{SECTION_TITLE}}</h2>
      <p class="text-xl text-gray-600">{{SECTION_SUBTITLE}}</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      <div class="p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-colors">
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{PLAN_1_NAME}}</h3>
        <div class="mb-6">
          <span class="text-4xl font-bold text-gray-900">{{PLAN_1_PRICE}}</span>
          <span class="text-gray-500">/mois</span>
        </div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center text-gray-600">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{PLAN_1_FEATURE_1}}
          </li>
          <li class="flex items-center text-gray-600">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{PLAN_1_FEATURE_2}}
          </li>
          <li class="flex items-center text-gray-600">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{PLAN_1_FEATURE_3}}
          </li>
        </ul>
        <a href="#" class="block text-center py-3 px-6 rounded-full border-2 border-gray-900 text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-colors">
          Choisir
        </a>
      </div>
      <div class="p-8 rounded-2xl bg-gray-900 text-white relative transform scale-105">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full">
          Populaire
        </div>
        <h3 class="text-xl font-bold mb-2">{{PLAN_2_NAME}}</h3>
        <div class="mb-6">
          <span class="text-4xl font-bold">{{PLAN_2_PRICE}}</span>
          <span class="text-gray-400">/mois</span>
        </div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{PLAN_2_FEATURE_1}}
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{PLAN_2_FEATURE_2}}
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{PLAN_2_FEATURE_3}}
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{PLAN_2_FEATURE_4}}
          </li>
        </ul>
        <a href="#" class="block text-center py-3 px-6 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors">
          Choisir
        </a>
      </div>
      <div class="p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-colors">
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{PLAN_3_NAME}}</h3>
        <div class="mb-6">
          <span class="text-4xl font-bold text-gray-900">{{PLAN_3_PRICE}}</span>
          <span class="text-gray-500">/mois</span>
        </div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center text-gray-600">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{PLAN_3_FEATURE_1}}
          </li>
          <li class="flex items-center text-gray-600">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{PLAN_3_FEATURE_2}}
          </li>
          <li class="flex items-center text-gray-600">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{PLAN_3_FEATURE_3}}
          </li>
          <li class="flex items-center text-gray-600">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{PLAN_3_FEATURE_4}}
          </li>
        </ul>
        <a href="#" class="block text-center py-3 px-6 rounded-full border-2 border-gray-900 text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-colors">
          Choisir
        </a>
      </div>
    </div>
  </div>
</section>`
      }
    ]
  },

  // ============ FAQ ============
  {
    id: 'faq',
    type: 'faq',
    name: 'FAQ',
    description: 'Questions fréquentes',
    icon: 'HelpCircle',
    variants: [
      {
        id: 'faq-simple',
        name: 'Simple',
        preview: 'Questions/réponses en liste',
        html: `<section id="faq" class="py-24 bg-gray-50">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{{SECTION_TITLE}}</h2>
      <p class="text-xl text-gray-600">{{SECTION_SUBTITLE}}</p>
    </div>
    <div class="space-y-4">
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{FAQ_1_QUESTION}}</h3>
        <p class="text-gray-600">{{FAQ_1_ANSWER}}</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{FAQ_2_QUESTION}}</h3>
        <p class="text-gray-600">{{FAQ_2_ANSWER}}</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{FAQ_3_QUESTION}}</h3>
        <p class="text-gray-600">{{FAQ_3_ANSWER}}</p>
      </div>
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{FAQ_4_QUESTION}}</h3>
        <p class="text-gray-600">{{FAQ_4_ANSWER}}</p>
      </div>
    </div>
  </div>
</section>`
      }
    ]
  },

  // ============ CTA ============
  {
    id: 'cta',
    type: 'cta',
    name: 'Call-to-Action',
    description: 'Section CTA finale',
    icon: 'ArrowRight',
    variants: [
      {
        id: 'cta-centered',
        name: 'Centré',
        preview: 'CTA simple et impactant',
        html: `<section id="cta" class="py-24 bg-gray-900">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{{CTA_TITLE}}</h2>
    <p class="text-xl text-gray-300 mb-10">{{CTA_SUBTITLE}}</p>
    <a href="#" class="inline-flex items-center justify-center bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
      {{CTA_BUTTON}}
      <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
    </a>
  </div>
</section>`
      },
      {
        id: 'cta-gradient',
        name: 'Gradient',
        preview: 'Avec gradient coloré',
        html: `<section id="cta" class="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{{CTA_TITLE}}</h2>
    <p class="text-xl text-blue-100 mb-10">{{CTA_SUBTITLE}}</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="#" class="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
        {{CTA_BUTTON_PRIMARY}}
      </a>
      <a href="#" class="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all">
        {{CTA_BUTTON_SECONDARY}}
      </a>
    </div>
  </div>
</section>`
      }
    ]
  },

  // ============ FOOTER ============
  {
    id: 'footer',
    type: 'footer',
    name: 'Pied de page',
    description: 'Footer complet',
    icon: 'LayoutTemplate',
    variants: [
      {
        id: 'footer-simple',
        name: 'Simple',
        preview: 'Logo + liens + réseaux',
        html: `<footer class="bg-gray-900 py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg"></div>
        <span class="font-bold text-xl text-white">{{BRAND}}</span>
      </div>
      <div class="flex items-center gap-6">
        <a href="#" class="text-gray-400 hover:text-white transition-colors">Conditions</a>
        <a href="#" class="text-gray-400 hover:text-white transition-colors">Confidentialité</a>
        <a href="#" class="text-gray-400 hover:text-white transition-colors">Contact</a>
      </div>
      <div class="flex items-center gap-4">
        <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
        </a>
        <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
        </a>
      </div>
    </div>
    <div class="mt-8 pt-8 border-t border-gray-800 text-center">
      <p class="text-gray-400 text-sm">© 2024 {{BRAND}}. Tous droits réservés.</p>
    </div>
  </div>
</footer>`
      }
    ]
  }
];

/**
 * Get component by type
 */
export function getComponentsByType(type: ComponentTemplate['type']): ComponentTemplate | undefined {
  return componentLibrary.find(c => c.type === type);
}

/**
 * Get all component types
 */
export function getComponentTypes(): ComponentTemplate['type'][] {
  return componentLibrary.map(c => c.type);
}

/**
 * Combine multiple component variants into a full page
 */
export function combineComponents(variantIds: string[]): string {
  const sections: string[] = [];
  
  for (const variantId of variantIds) {
    for (const component of componentLibrary) {
      const variant = component.variants.find(v => v.id === variantId);
      if (variant) {
        sections.push(variant.html);
        break;
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Créali</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
    .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
    .slide-up { animation: slideUp 0.8s ease-out forwards; opacity: 0; transform: translateY(30px); }
    @keyframes fadeIn { to { opacity: 1; } }
    @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
  </style>
</head>
<body class="antialiased">
${sections.join('\n')}
</body>
</html>`;
}
