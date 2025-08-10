import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2 } from 'lucide-react';

interface MediaItem {
  type: 'image' | 'video' | 'gif';
  src: string;
  alt?: string;
  caption?: string;
  poster?: string; // For videos
}

interface MediaGalleryProps {
  items: MediaItem[];
  title?: string;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  title,
  className = '',
  autoPlay = false,
  showControls = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentItem = items[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-advance for GIFs and videos
  React.useEffect(() => {
    if (isPlaying && items.length > 1) {
      const interval = setInterval(goToNext, 5000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, items.length]);

  const renderMedia = (item: MediaItem, isMain: boolean = false) => {
    const mediaClasses = `w-full h-full object-cover transition-all duration-300 ${
      isMain ? 'cursor-pointer' : ''
    }`;

    if (item.type === 'video') {
      return (
        <video
          className={mediaClasses}
          poster={item.poster}
          controls={isMain && showControls}
          autoPlay={isMain && autoPlay}
          muted
          loop
          onClick={() => isMain && setIsFullscreen(true)}
        >
          <source src={item.src} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      );
    }

    return (
      <img
        src={item.src}
        alt={item.alt || `Media ${currentIndex + 1}`}
        className={mediaClasses}
        loading={isMain ? 'eager' : 'lazy'}
        onClick={() => isMain && setIsFullscreen(true)}
      />
    );
  };

  return (
    <div className={`${className}`}>
      {title && (
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {title}
        </h3>
      )}

      <div className="relative">
        {/* Main Media Display */}
        <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              {renderMedia(currentItem, true)}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {items.length > 1 && showControls && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
                aria-label="Image précédente"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
                aria-label="Image suivante"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Play/Pause for Auto-advance */}
          {items.length > 1 && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
              aria-label={isPlaying ? 'Pause automatique' : 'Lecture automatique'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200"
            aria-label="Plein écran"
          >
            <Maximize2 size={16} />
          </button>

          {/* Current Item Caption */}
          {currentItem.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <p className="text-white text-sm">{currentItem.caption}</p>
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {items.length > 1 && (
          <div className="flex gap-2 mt-4 justify-center overflow-x-auto pb-2">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex
                    ? 'border-primary-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {renderMedia(item)}
              </button>
            ))}
          </div>
        )}

        {/* Dots Indicator */}
        {items.length > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex ? 'bg-primary-500' : 'bg-gray-300'
                }`}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              className="max-w-4xl max-h-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {renderMedia(currentItem)}
            </motion.div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              aria-label="Fermer le plein écran"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};