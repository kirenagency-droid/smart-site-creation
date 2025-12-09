import * as React from "react";
import { cn } from "@/lib/utils";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  aspectRatio?: "square" | "video" | "wide" | "portrait" | "auto";
}

const FALLBACK_IMAGES = {
  hero: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop",
  business: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
  team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
  product: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
  tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
  coaching: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
  trading: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop",
  fitness: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
  placeholder: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop",
};

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[21/9]",
  portrait: "aspect-[3/4]",
  auto: "",
};

/**
 * Resolves image source to a valid URL
 * - External URLs (http/https) are used as-is
 * - Local paths starting with / are served from public folder
 * - Fallback keywords (hero, business, etc.) resolve to Unsplash images
 */
export function resolveImageSrc(src: string, fallbackType?: keyof typeof FALLBACK_IMAGES): string {
  if (!src) {
    return FALLBACK_IMAGES[fallbackType || "placeholder"];
  }

  // External URL - use as-is
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Data URL - use as-is
  if (src.startsWith("data:")) {
    return src;
  }

  // Local path from public folder - Vite serves /public at root
  if (src.startsWith("/public/")) {
    return src.replace("/public/", "/");
  }

  // Already a root path (served from public)
  if (src.startsWith("/")) {
    return src;
  }

  // Check if it's a fallback keyword
  if (src in FALLBACK_IMAGES) {
    return FALLBACK_IMAGES[src as keyof typeof FALLBACK_IMAGES];
  }

  // Default: treat as relative path from public
  return `/${src}`;
}

/**
 * Get a themed placeholder image from Unsplash
 */
export function getPlaceholderImage(
  type: keyof typeof FALLBACK_IMAGES = "placeholder",
  width = 800,
  height = 600
): string {
  const baseUrl = FALLBACK_IMAGES[type] || FALLBACK_IMAGES.placeholder;
  // Update dimensions in URL
  return baseUrl.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`);
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallback, aspectRatio = "auto", onError, ...props }, ref) => {
    const [imgSrc, setImgSrc] = React.useState(() => resolveImageSrc(src, fallback as keyof typeof FALLBACK_IMAGES));
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      setImgSrc(resolveImageSrc(src, fallback as keyof typeof FALLBACK_IMAGES));
      setHasError(false);
    }, [src, fallback]);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (!hasError) {
        setHasError(true);
        const fallbackSrc = FALLBACK_IMAGES[fallback as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.placeholder;
        setImgSrc(fallbackSrc);
      }
      onError?.(e);
    };

    return (
      <img
        ref={ref}
        src={imgSrc}
        alt={alt}
        onError={handleError}
        className={cn(
          "object-cover",
          aspectRatioClasses[aspectRatio],
          className
        )}
        loading="lazy"
        {...props}
      />
    );
  }
);

Image.displayName = "Image";

export { Image, FALLBACK_IMAGES };
