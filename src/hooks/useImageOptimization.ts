import { useState, useEffect, useRef } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
}

/**
 * Hook for intersection observer (lazy loading)
 */
export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '50px',
  root = null
}: UseIntersectionObserverProps = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasIntersected(true);
        }
      },
      { threshold, rootMargin, root }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, root]);

  return { ref, isIntersecting, hasIntersected };
};

/**
 * Hook for lazy loading images
 */
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  useEffect(() => {
    if (!hasIntersected) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setHasError(true);
    };
    img.src = src;
  }, [src, hasIntersected]);

  return {
    ref,
    imageSrc,
    isLoaded,
    hasError,
    shouldLoad: hasIntersected
  };
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Generate responsive image sources
 */
interface ResponsiveImageOptions {
  src: string;
  sizes?: string;
  formats?: string[];
  breakpoints?: number[];
}

export const generateResponsiveImages = ({
  src,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  formats = ['webp', 'jpg'],
  breakpoints = [320, 640, 768, 1024, 1280]
}: ResponsiveImageOptions) => {
  const baseName = src.split('.').slice(0, -1).join('.');
  const extension = src.split('.').pop();

  const generateSrcSet = (format: string) => {
    return breakpoints
      .map(width => `${baseName}-${width}w.${format} ${width}w`)
      .join(', ');
  };

  const sources = formats.map(format => ({
    srcSet: generateSrcSet(format),
    type: `image/${format}`
  }));

  return {
    sources,
    fallback: {
      src,
      srcSet: generateSrcSet(extension || 'jpg'),
      sizes
    }
  };
};

/**
 * Image compression utility (client-side)
 */
export const compressImage = (
  file: File,
  quality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};