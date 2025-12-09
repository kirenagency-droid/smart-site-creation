/**
 * Image utilities for Créali
 * Provides helpers for handling images in AI-generated sites
 */

// Curated Unsplash images by category for AI generation
export const UNSPLASH_IMAGES = {
  // Business & Corporate
  hero: [
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&h=800&fit=crop",
  ],
  business: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
  ],
  team: [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
  ],
  
  // Tech & SaaS
  tech: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop",
  ],
  saas: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop",
  ],
  
  // Finance & Trading
  trading: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=600&fit=crop",
  ],
  finance: [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1565373679580-fc0cb538f49d?w=800&h=600&fit=crop",
  ],
  
  // Coaching & Education
  coaching: [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop",
  ],
  education: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
  ],
  
  // Fitness & Health
  fitness: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop",
  ],
  health: [
    "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
  ],
  
  // Food & Restaurant
  food: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop",
  ],
  restaurant: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop",
  ],
  
  // E-commerce & Products
  ecommerce: [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
  ],
  product: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=600&fit=crop",
  ],
  
  // Creative & Portfolio
  creative: [
    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&h=600&fit=crop",
  ],
  portfolio: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
  ],
  
  // People & Portraits
  portrait: [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  ],
  testimonial: [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  ],
  
  // Abstract & Backgrounds
  abstract: [
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=800&fit=crop",
  ],
  gradient: [
    "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1557682260-96773eb01377?w=1200&h=800&fit=crop",
  ],
};

export type ImageCategory = keyof typeof UNSPLASH_IMAGES;

/**
 * Get a random image URL from a category
 */
export function getRandomImage(category: ImageCategory): string {
  const images = UNSPLASH_IMAGES[category];
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * Get the first image from a category (deterministic)
 */
export function getImage(category: ImageCategory, index = 0): string {
  const images = UNSPLASH_IMAGES[category];
  return images[index % images.length];
}

/**
 * Generate Unsplash URL with custom dimensions
 */
export function getUnsplashImage(
  query: string,
  width = 800,
  height = 600
): string {
  // Use Unsplash source for dynamic images
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`;
}

/**
 * Get appropriate image category based on business type
 */
export function getImageCategoryForBusiness(businessType: string): ImageCategory {
  const businessTypeMap: Record<string, ImageCategory> = {
    trading: "trading",
    finance: "finance",
    crypto: "trading",
    coaching: "coaching",
    coach: "coaching",
    formation: "education",
    education: "education",
    fitness: "fitness",
    gym: "fitness",
    health: "health",
    restaurant: "restaurant",
    food: "food",
    ecommerce: "ecommerce",
    shop: "ecommerce",
    saas: "saas",
    tech: "tech",
    portfolio: "portfolio",
    creative: "creative",
    agency: "business",
    business: "business",
  };

  const normalizedType = businessType.toLowerCase();
  
  for (const [key, category] of Object.entries(businessTypeMap)) {
    if (normalizedType.includes(key)) {
      return category;
    }
  }
  
  return "business";
}

/**
 * Generate a complete set of images for a landing page
 */
export function generateLandingPageImages(businessType: string): {
  hero: string;
  feature1: string;
  feature2: string;
  feature3: string;
  testimonial1: string;
  testimonial2: string;
  testimonial3: string;
  about: string;
} {
  const category = getImageCategoryForBusiness(businessType);
  
  return {
    hero: getImage(category, 0),
    feature1: getImage(category, 1),
    feature2: getImage(category, 2),
    feature3: getImage("business", 0),
    testimonial1: getImage("testimonial", 0),
    testimonial2: getImage("testimonial", 1),
    testimonial3: getImage("testimonial", 2),
    about: getImage("team", 0),
  };
}
