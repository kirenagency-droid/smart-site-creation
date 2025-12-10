/**
 * HTML Section Parser & Modifier
 * Allows surgical modifications of specific sections without regenerating everything
 */

export interface HtmlSection {
  id: string;
  type: 'navbar' | 'hero' | 'benefits' | 'features' | 'testimonials' | 'pricing' | 'faq' | 'footer' | 'other';
  name: string;
  startIndex: number;
  endIndex: number;
  content: string;
}

const SECTION_PATTERNS: { type: HtmlSection['type']; patterns: RegExp[] }[] = [
  { 
    type: 'navbar', 
    patterns: [
      /<nav[^>]*>/i,
      /<header[^>]*class="[^"]*sticky[^"]*"[^>]*>/i,
      /<header[^>]*class="[^"]*fixed[^"]*"[^>]*>/i,
    ]
  },
  { 
    type: 'hero', 
    patterns: [
      /<section[^>]*class="[^"]*hero[^"]*"[^>]*>/i,
      /<section[^>]*id="hero[^"]*"[^>]*>/i,
      /<section[^>]*class="[^"]*min-h-screen[^"]*"[^>]*>/i,
    ]
  },
  { 
    type: 'benefits', 
    patterns: [
      /<section[^>]*class="[^"]*benefits?[^"]*"[^>]*>/i,
      /<section[^>]*id="benefits?[^"]*"[^>]*>/i,
      /<section[^>]*class="[^"]*avantages?[^"]*"[^>]*>/i,
    ]
  },
  { 
    type: 'features', 
    patterns: [
      /<section[^>]*class="[^"]*features?[^"]*"[^>]*>/i,
      /<section[^>]*id="features?[^"]*"[^>]*>/i,
      /<section[^>]*class="[^"]*fonctionnalit[^"]*"[^>]*>/i,
    ]
  },
  { 
    type: 'testimonials', 
    patterns: [
      /<section[^>]*class="[^"]*testimonials?[^"]*"[^>]*>/i,
      /<section[^>]*id="testimonials?[^"]*"[^>]*>/i,
      /<section[^>]*class="[^"]*t[ée]moignages?[^"]*"[^>]*>/i,
    ]
  },
  { 
    type: 'pricing', 
    patterns: [
      /<section[^>]*class="[^"]*pricing[^"]*"[^>]*>/i,
      /<section[^>]*id="pricing[^"]*"[^>]*>/i,
      /<section[^>]*class="[^"]*tarifs?[^"]*"[^>]*>/i,
    ]
  },
  { 
    type: 'faq', 
    patterns: [
      /<section[^>]*class="[^"]*faq[^"]*"[^>]*>/i,
      /<section[^>]*id="faq[^"]*"[^>]*>/i,
    ]
  },
  { 
    type: 'footer', 
    patterns: [
      /<footer[^>]*>/i,
    ]
  },
];

/**
 * Parse HTML and extract sections
 */
export function parseHtmlSections(html: string): HtmlSection[] {
  const sections: HtmlSection[] = [];
  
  // Find all sections in order
  let searchIndex = 0;
  let sectionId = 0;

  // Find body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  const bodyStartOffset = bodyMatch ? (html.indexOf(bodyMatch[0]) + bodyMatch[0].indexOf(bodyMatch[1])) : 0;

  // Simple section detection based on common patterns
  const sectionMatches: { index: number; type: HtmlSection['type']; match: string }[] = [];

  for (const { type, patterns } of SECTION_PATTERNS) {
    for (const pattern of patterns) {
      const globalPattern = new RegExp(pattern.source, 'gi');
      let match;
      while ((match = globalPattern.exec(bodyContent)) !== null) {
        sectionMatches.push({
          index: match.index,
          type,
          match: match[0],
        });
      }
    }
  }

  // Sort by index and remove duplicates
  sectionMatches.sort((a, b) => a.index - b.index);

  // Find section ends and create section objects
  for (let i = 0; i < sectionMatches.length; i++) {
    const match = sectionMatches[i];
    const nextMatch = sectionMatches[i + 1];
    
    // Find the closing tag
    const tagName = match.match.match(/<(\w+)/)?.[1] || 'section';
    const closingTag = `</${tagName}>`;
    
    let depth = 1;
    let endIndex = match.index + match.match.length;
    const openTagPattern = new RegExp(`<${tagName}[^>]*>`, 'gi');
    const closeTagPattern = new RegExp(`</${tagName}>`, 'gi');
    
    // Find balanced closing tag
    while (depth > 0 && endIndex < bodyContent.length) {
      const remaining = bodyContent.slice(endIndex);
      const nextOpen = remaining.search(openTagPattern);
      const nextClose = remaining.search(closeTagPattern);
      
      if (nextClose === -1) break;
      
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        endIndex += nextOpen + 1;
      } else {
        depth--;
        endIndex += nextClose + closingTag.length;
      }
    }

    const content = bodyContent.slice(match.index, endIndex);
    
    sections.push({
      id: `section-${sectionId++}`,
      type: match.type,
      name: getSectionName(match.type),
      startIndex: bodyStartOffset + match.index,
      endIndex: bodyStartOffset + endIndex,
      content,
    });
  }

  return sections;
}

function getSectionName(type: HtmlSection['type']): string {
  const names: Record<HtmlSection['type'], string> = {
    navbar: 'Navigation',
    hero: 'Hero Section',
    benefits: 'Bénéfices',
    features: 'Fonctionnalités',
    testimonials: 'Témoignages',
    pricing: 'Tarifs',
    faq: 'FAQ',
    footer: 'Pied de page',
    other: 'Section',
  };
  return names[type];
}

/**
 * Replace a specific section in HTML
 */
export function replaceSectionInHtml(
  html: string, 
  sectionId: string, 
  sections: HtmlSection[], 
  newContent: string
): string {
  const section = sections.find(s => s.id === sectionId);
  if (!section) return html;

  return (
    html.slice(0, section.startIndex) +
    newContent +
    html.slice(section.endIndex)
  );
}

/**
 * Detect which section a user wants to modify based on their message
 */
export function detectTargetSection(message: string): HtmlSection['type'] | null {
  const keywords: Record<HtmlSection['type'], string[]> = {
    navbar: ['navbar', 'nav', 'navigation', 'menu', 'header'],
    hero: ['hero', 'accueil', 'home', 'landing', 'première section', 'entête'],
    benefits: ['bénéfices', 'avantages', 'benefits', 'pourquoi'],
    features: ['features', 'fonctionnalités', 'caractéristiques', 'options'],
    testimonials: ['témoignages', 'testimonials', 'avis', 'reviews', 'clients'],
    pricing: ['pricing', 'tarifs', 'prix', 'plans', 'abonnements'],
    faq: ['faq', 'questions', 'foire aux questions'],
    footer: ['footer', 'pied de page', 'bas de page'],
    other: [],
  };

  const lowerMessage = message.toLowerCase();

  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => lowerMessage.includes(word))) {
      return type as HtmlSection['type'];
    }
  }

  return null;
}

/**
 * Validate generated HTML has all required sections
 */
export function validateHtmlCompleteness(html: string): {
  isValid: boolean;
  missingSections: string[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const missingSections: string[] = [];

  // Check for required elements
  if (!html.includes('<nav') && !html.includes('<header')) {
    missingSections.push('Navigation');
  }

  if (!/<section[^>]*class="[^"]*min-h-/i.test(html) && !/<section[^>]*id="hero/i.test(html)) {
    missingSections.push('Hero Section');
  }

  if (!html.includes('<footer')) {
    missingSections.push('Footer');
  }

  // Check for responsive classes
  if (!html.includes('md:') && !html.includes('lg:')) {
    warnings.push('Le site pourrait ne pas être responsive');
  }

  // Check for animations
  if (!html.includes('animation') && !html.includes('transition')) {
    warnings.push('Aucune animation détectée');
  }

  // Check for images
  if (!html.includes('<img')) {
    warnings.push('Aucune image trouvée');
  }

  return {
    isValid: missingSections.length === 0,
    missingSections,
    warnings,
  };
}

/**
 * Extract color palette from HTML
 */
export function extractColorPalette(html: string): string[] {
  const colors: Set<string> = new Set();
  
  // Match Tailwind color classes
  const tailwindColorPattern = /(?:bg|text|border|from|to)-([a-z]+)-(\d{2,3})/g;
  let match;
  while ((match = tailwindColorPattern.exec(html)) !== null) {
    colors.add(`${match[1]}-${match[2]}`);
  }

  // Match hex colors
  const hexPattern = /#([0-9a-fA-F]{3,6})\b/g;
  while ((match = hexPattern.exec(html)) !== null) {
    colors.add(match[0]);
  }

  return Array.from(colors);
}
