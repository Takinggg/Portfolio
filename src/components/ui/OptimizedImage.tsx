import React, { useState } from 'react';
import { useLazyImage, generateResponsiveImages } from '../hooks/useImageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  lazy?: boolean;
  responsive?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  width?: number;
  height?: number;
}

/**
 * Optimized Image component with lazy loading, responsive images, and performance optimizations
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  lazy = true,
  responsive = true,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError,
  priority = false,
  width,
  height
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Use lazy loading hook if lazy is enabled
  const {
    ref: lazyRef,
    imageSrc,
    isLoaded,
    hasError
  } = useLazyImage(
    src,
    placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZhZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+'
  );

  const handleImageLoad = () => {
    onLoad?.();
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  // Generate responsive image sources if responsive is enabled
  const responsiveImages = responsive ? generateResponsiveImages({
    src,
    sizes
  }) : null;

  // For non-lazy images or priority images
  if (!lazy || priority) {
    if (responsive && responsiveImages) {
      return (
        <picture className={`block ${className}`}>
          {responsiveImages.sources.map((source, index) => (
            <source
              key={index}
              srcSet={source.srcSet}
              type={source.type}
            />
          ))}
          <img
            src={responsiveImages.fallback.src}
            srcSet={responsiveImages.fallback.srcSet}
            sizes={responsiveImages.fallback.sizes}
            alt={alt}
            width={width}
            height={height}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        </picture>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  // Lazy loading with intersection observer
  return (
    <div
      ref={lazyRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {(hasError || imageError) ? (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Failed to load image
          </span>
        </div>
      ) : (
        <>
          {/* Loading skeleton */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse">
              <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
            </div>
          )}
          
          {/* Actual image */}
          {responsive && responsiveImages ? (
            <picture className="block">
              {responsiveImages.sources.map((source, index) => (
                <source
                  key={index}
                  srcSet={source.srcSet}
                  type={source.type}
                />
              ))}
              <img
                src={imageSrc}
                alt={alt}
                width={width}
                height={height}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
                decoding="async"
              />
            </picture>
          ) : (
            <img
              src={imageSrc}
              alt={alt}
              width={width}
              height={height}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              decoding="async"
            />
          )}
        </>
      )}
    </div>
  );
};

/**
 * Avatar component with optimized loading
 */
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className = ''
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!src) {
    return (
      <div
        className={`${sizes[size]} ${className} bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium`}
      >
        {fallback || getInitials(alt)}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`${sizes[size]} ${className} rounded-full`}
      lazy={false} // Avatars are usually above the fold
      responsive={false}
      priority={size === 'xl'} // Large avatars might be important
    />
  );
};