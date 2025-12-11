/**
 * Niche-specific prompts and configurations for Creali AI
 * Each niche has specialized design guidelines, color palettes, and content structure
 */

export interface NicheConfig {
  id: string;
  name: string;
  keywords: string[];
  palette: {
    background: string;
    text: string;
    accent: string;
    secondary: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  tone: string;
  sections: string[];
  vocabulary: string[];
  unsplashKeywords: string[];
  designGuidelines: string;
}

export const NICHE_CONFIGS: NicheConfig[] = [
  {
    id: 'tech-saas',
    name: 'Tech / SaaS',
    keywords: ['saas', 'tech', 'startup', 'application', 'logiciel', 'software', 'app', 'plateforme', 'api', 'cloud'],
    palette: {
      background: 'bg-[#0a0a0f]',
      text: 'text-white',
      accent: '#8b5cf6', // violet
      secondary: '#3b82f6' // blue
    },
    typography: {
      heading: 'font-bold tracking-tight',
      body: 'font-medium'
    },
    tone: 'innovant, moderne, technique mais accessible',
    sections: ['Hero avec démo/produit', 'Features avec icônes', 'How it works', 'Integrations', 'Pricing', 'Testimonials entreprises', 'FAQ technique', 'CTA final'],
    vocabulary: ['automatiser', 'scaler', 'intégrer', 'dashboards', 'analytics', 'workflow', 'productivité', 'ROI'],
    unsplashKeywords: ['technology', 'dashboard', 'laptop', 'startup office'],
    designGuidelines: `
Design dark et sophistiqué avec:
- Effets glassmorphism et gradients violets/bleus
- Animations de code/terminal subtiles
- Dashboard mockups et UI screenshots
- Badges "Nouveau", "Beta", status dots verts
- Compteurs de stats animés
- Grilles de features avec hover effects
- Comparaison de plans claire`
  },
  {
    id: 'coaching',
    name: 'Coaching / Formation',
    keywords: ['coach', 'coaching', 'formation', 'mentor', 'accompagnement', 'développement personnel', 'consultant', 'formateur'],
    palette: {
      background: 'bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900',
      text: 'text-white',
      accent: '#f59e0b', // amber
      secondary: '#10b981' // emerald
    },
    typography: {
      heading: 'font-bold',
      body: 'font-normal'
    },
    tone: 'inspirant, confiant, motivant, professionnel',
    sections: ['Hero avec photo coach', 'Problèmes clients', 'Solution/Méthode', 'Parcours/Programmes', 'Résultats clients (témoignages)', 'À propos du coach', 'Booking/Contact', 'FAQ'],
    vocabulary: ['transformer', 'débloquer', 'atteindre vos objectifs', 'potentiel', 'accompagnement personnalisé', 'résultats concrets', 'méthode éprouvée'],
    unsplashKeywords: ['coaching session', 'success', 'business meeting', 'mentor'],
    designGuidelines: `
Design inspirant et personnel avec:
- Photo professionnelle du coach en hero
- Témoignages avec vrais résultats chiffrés
- Timeline ou processus en étapes
- Section "À propos" authentique
- Badges de certifications/presse
- Calendly ou bouton de réservation proéminent
- Couleurs chaudes qui inspirent confiance`
  },
  {
    id: 'wellness-spa',
    name: 'Bien-être / Spa',
    keywords: ['spa', 'bien-être', 'wellness', 'massage', 'relaxation', 'yoga', 'méditation', 'beauté', 'soin'],
    palette: {
      background: 'bg-[#fefdfb]',
      text: 'text-gray-800',
      accent: '#7c9a82', // sage green
      secondary: '#c4a77d' // terracotta
    },
    typography: {
      heading: 'font-serif',
      body: 'font-sans'
    },
    tone: 'apaisant, luxueux, naturel, serein',
    sections: ['Hero avec ambiance zen', 'Services/Soins', 'Expérience', 'Équipe/Praticiens', 'Galerie', 'Tarifs', 'Réservation', 'Contact/Localisation'],
    vocabulary: ['sérénité', 'bien-être', 'détente', 'harmonie', 'ressourcement', 'évasion', 'équilibre', 'naturel'],
    unsplashKeywords: ['spa', 'wellness', 'massage', 'zen', 'candles', 'nature'],
    designGuidelines: `
Design épuré et zen avec:
- Beaucoup d'espace blanc (respiration)
- Photos atmosphériques avec éclairage doux
- Typographie serif élégante pour les titres
- Couleurs naturelles (vert sauge, beige, terracotta)
- Animations très douces et lentes
- Section galerie avec lightbox
- Bouton de réservation toujours visible`
  },
  {
    id: 'fitness',
    name: 'Fitness / Sport',
    keywords: ['fitness', 'sport', 'gym', 'musculation', 'entraînement', 'coach sportif', 'personal trainer', 'crossfit'],
    palette: {
      background: 'bg-[#0f0f0f]',
      text: 'text-white',
      accent: '#ef4444', // red
      secondary: '#f97316' // orange
    },
    typography: {
      heading: 'font-black uppercase tracking-wide',
      body: 'font-medium'
    },
    tone: 'énergique, motivant, puissant, direct',
    sections: ['Hero impactant avec action', 'Programmes/Services', 'Résultats avant/après', 'Équipements/Salle', 'Tarifs/Abonnements', 'Témoignages transformations', 'Coach/Équipe', 'Contact'],
    vocabulary: ['transformer', 'dépasser ses limites', 'résultats', 'intensité', 'performance', 'objectifs', 'motivation', 'discipline'],
    unsplashKeywords: ['fitness', 'gym', 'workout', 'training', 'athlete'],
    designGuidelines: `
Design bold et énergique avec:
- Contraste fort (noir/couleur vive)
- Photos d'action dynamiques
- Typographie uppercase et grasse
- Effets de glow sur les CTAs
- Compteurs de stats (membres, séances, etc.)
- Avant/après avec sliders
- Bouton d'essai gratuit proéminent`
  },
  {
    id: 'restaurant',
    name: 'Restaurant / Food',
    keywords: ['restaurant', 'food', 'cuisine', 'gastronomie', 'chef', 'bistrot', 'café', 'brasserie', 'traiteur'],
    palette: {
      background: 'bg-[#fffbf5]',
      text: 'text-gray-900',
      accent: '#d97706', // amber
      secondary: '#dc2626' // red
    },
    typography: {
      heading: 'font-serif',
      body: 'font-sans'
    },
    tone: 'chaleureux, gourmand, convivial, authentique',
    sections: ['Hero avec plat signature', 'Notre cuisine', 'Menu/Carte', 'Galerie de plats', 'Notre histoire', 'Le chef', 'Réservation', 'Contact/Horaires'],
    vocabulary: ['saveurs', 'fraîcheur', 'passion', 'terroir', 'fait maison', 'convivialité', 'générosité', 'authenticité'],
    unsplashKeywords: ['food', 'restaurant', 'chef', 'cuisine', 'dish', 'dining'],
    designGuidelines: `
Design chaleureux et appétissant avec:
- Photos de plats en pleine page (food photography)
- Typographie serif élégante
- Couleurs chaudes (beige, orange, touches de rouge)
- Menu stylisé avec catégories
- Section réservation avec widget ou formulaire
- Horaires et localisation clairs
- Badges TripAdvisor/Yelp si applicable`
  },
  {
    id: 'luxury',
    name: 'Luxe / Premium',
    keywords: ['luxe', 'premium', 'prestige', 'haut de gamme', 'exclusif', 'bijoux', 'immobilier luxe', 'yacht', 'joaillerie'],
    palette: {
      background: 'bg-[#0c0c0c]',
      text: 'text-white',
      accent: '#c9a962', // gold
      secondary: '#a78bfa' // soft purple
    },
    typography: {
      heading: 'font-serif tracking-wide',
      body: 'font-light tracking-wide'
    },
    tone: 'élégant, sophistiqué, exclusif, raffiné',
    sections: ['Hero cinématique', 'Collections/Produits', 'Savoir-faire', 'Héritage/Histoire', 'Galerie immersive', 'Services privés', 'Contact privilégié'],
    vocabulary: ['excellence', 'exclusivité', 'raffinement', 'prestige', 'sur-mesure', 'artisanat', 'héritage', 'distinction'],
    unsplashKeywords: ['luxury', 'elegant', 'gold', 'premium', 'jewelry', 'fashion'],
    designGuidelines: `
Design ultra-sophistiqué avec:
- Minimalisme extrême, beaucoup d'espace
- Accents dorés subtils
- Animations au scroll très fluides
- Typographie serif fine et espacée
- Photos en pleine page avec parallax
- Hover effects subtils et élégants
- Pas de prix affichés (sur demande)`
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    keywords: ['boutique', 'shop', 'e-commerce', 'vente', 'produits', 'magasin', 'store', 'achat'],
    palette: {
      background: 'bg-white',
      text: 'text-gray-900',
      accent: '#3b82f6', // blue
      secondary: '#10b981' // green
    },
    typography: {
      heading: 'font-bold',
      body: 'font-normal'
    },
    tone: 'professionnel, clair, rassurant, engageant',
    sections: ['Hero produit phare', 'Catégories', 'Produits vedettes', 'Avantages (livraison, retours)', 'Avis clients', 'Newsletter', 'FAQ', 'Footer complet'],
    vocabulary: ['livraison rapide', 'satisfait ou remboursé', 'paiement sécurisé', 'meilleur prix', 'qualité premium', 'nouveautés'],
    unsplashKeywords: ['product', 'shopping', 'package', 'ecommerce'],
    designGuidelines: `
Design clean et conversion-focused avec:
- Hero avec produit phare et offre
- Grille de produits avec hover quick view
- Badges promos et réductions visibles
- Trust badges (paiement, livraison, etc.)
- Reviews avec étoiles
- Cart/panier accessible
- Newsletter popup subtile`
  },
  {
    id: 'real-estate',
    name: 'Immobilier',
    keywords: ['immobilier', 'real estate', 'agent', 'maison', 'appartement', 'propriété', 'achat', 'location', 'investissement'],
    palette: {
      background: 'bg-[#f8f7f4]',
      text: 'text-gray-900',
      accent: '#166534', // green
      secondary: '#b8860b' // gold
    },
    typography: {
      heading: 'font-semibold',
      body: 'font-normal'
    },
    tone: 'professionnel, rassurant, expert, local',
    sections: ['Hero avec propriété premium', 'Services', 'Biens à la vente/location', 'Estimation gratuite', 'Témoignages', 'Équipe', 'Quartiers/Zones', 'Contact'],
    vocabulary: ['votre projet', 'accompagnement', 'expertise locale', 'estimation gratuite', 'mandat exclusif', 'bien d\'exception', 'investissement'],
    unsplashKeywords: ['real estate', 'house', 'apartment', 'interior', 'architecture'],
    designGuidelines: `
Design élégant et professionnel avec:
- Photos immobilières grand format
- Carousel de biens avec filtres
- Formulaire d'estimation bien visible
- Carte interactive des zones
- Photos de l'équipe professionnelles
- Témoignages avec photos clients
- CTA "Estimation gratuite" omniprésent`
  },
  {
    id: 'agency',
    name: 'Agence / Creative',
    keywords: ['agence', 'agency', 'creative', 'design', 'branding', 'marketing', 'digital', 'studio'],
    palette: {
      background: 'bg-[#0a0a0a]',
      text: 'text-white',
      accent: '#ec4899', // pink
      secondary: '#06b6d4' // cyan
    },
    typography: {
      heading: 'font-black',
      body: 'font-medium'
    },
    tone: 'créatif, audacieux, expert, moderne',
    sections: ['Hero statement fort', 'Services', 'Portfolio/Réalisations', 'Process de travail', 'Clients/Logos', 'Équipe', 'Contact créatif'],
    vocabulary: ['impact', 'créativité', 'stratégie', 'résultats', 'sur-mesure', 'innovation', 'performance'],
    unsplashKeywords: ['creative', 'design', 'agency', 'team', 'office'],
    designGuidelines: `
Design bold et créatif avec:
- Effets de parallax et animations avancées
- Portfolio avec cases studies interactives
- Typographie expressive et grande
- Un accent coloré unique et mémorable
- Curseur personnalisé
- Transitions de page fluides
- Section clients avec logos animés`
  },
  {
    id: 'medical',
    name: 'Médical / Santé',
    keywords: ['médecin', 'clinique', 'santé', 'medical', 'docteur', 'cabinet', 'soins', 'santé'],
    palette: {
      background: 'bg-white',
      text: 'text-gray-800',
      accent: '#0891b2', // cyan
      secondary: '#059669' // emerald
    },
    typography: {
      heading: 'font-semibold',
      body: 'font-normal'
    },
    tone: 'professionnel, rassurant, expert, humain',
    sections: ['Hero avec praticien', 'Spécialités/Services', 'Équipe médicale', 'Prendre RDV', 'Parcours patient', 'FAQ santé', 'Contact/Accès'],
    vocabulary: ['expertise', 'accompagnement', 'soins personnalisés', 'équipe qualifiée', 'votre santé', 'prendre soin'],
    unsplashKeywords: ['doctor', 'medical', 'healthcare', 'clinic'],
    designGuidelines: `
Design professionnel et rassurant avec:
- Couleurs apaisantes (bleu, vert, blanc)
- Photos de l'équipe souriante
- Bouton RDV très visible
- Informations pratiques claires
- Section FAQ santé
- Certifications et diplômes
- Plan d'accès et parking`
  }
];

/**
 * Detect the most relevant niche from user message
 */
export function detectNiche(message: string): NicheConfig | null {
  const lowercaseMessage = message.toLowerCase();
  
  let bestMatch: NicheConfig | null = null;
  let highestScore = 0;
  
  for (const niche of NICHE_CONFIGS) {
    let score = 0;
    for (const keyword of niche.keywords) {
      if (lowercaseMessage.includes(keyword.toLowerCase())) {
        score += 1;
        // Exact match bonus
        if (new RegExp(`\\b${keyword}\\b`, 'i').test(message)) {
          score += 0.5;
        }
      }
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = niche;
    }
  }
  
  return highestScore >= 1 ? bestMatch : null;
}

/**
 * Generate niche-specific system prompt enhancement
 */
export function getNichePromptEnhancement(niche: NicheConfig): string {
  return `
## 🎯 NICHE DÉTECTÉE: ${niche.name.toUpperCase()}

### Palette de couleurs OBLIGATOIRE
- Background: ${niche.palette.background}
- Texte: ${niche.palette.text}
- Accent principal: ${niche.palette.accent}
- Accent secondaire: ${niche.palette.secondary}

### Typographie
- Titres: ${niche.typography.heading}
- Body: ${niche.typography.body}

### Ton de communication
${niche.tone}

### Structure de sections recommandée
${niche.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### Vocabulaire à utiliser
${niche.vocabulary.map(v => `• ${v}`).join('\n')}

### Guidelines design spécifiques
${niche.designGuidelines}

### Images Unsplash à chercher
Keywords: ${niche.unsplashKeywords.join(', ')}
`;
}

/**
 * Get clarifying questions for vague briefs
 */
export function getClarifyingQuestions(message: string, hasExistingHtml: boolean): string[] | null {
  const wordCount = message.split(/\s+/).length;
  
  // If message is very short and no existing site, ask questions
  if (wordCount < 8 && !hasExistingHtml) {
    const niche = detectNiche(message);
    
    if (!niche) {
      return [
        "C'est pour quel type d'activité ? (coaching, restaurant, e-commerce, agence...)",
        "Quelle ambiance tu veux ? (moderne/tech, luxueux, énergique, zen...)",
        "Tu as une couleur ou style en tête ?"
      ];
    }
    
    // Niche detected but brief is still vague
    return [
      `Pour ton ${niche.name.toLowerCase()}, c'est pour qui exactement ? (quel client type)`,
      "Qu'est-ce qui te différencie de la concurrence ?",
      "Plutôt dark/sombre ou light/clair comme ambiance ?"
    ];
  }
  
  return null; // No questions needed
}
