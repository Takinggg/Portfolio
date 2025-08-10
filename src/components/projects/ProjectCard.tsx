import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Eye, Heart, ArrowRight } from 'lucide-react';
import { TiltCard } from '../ui/TiltCard';

interface ProjectCardProps {
  id: string;
  title: string;
  subtitle?: string; // New field for impact/brief description
  category: string;
  type: string;
  description: string;
  image: string;
  tags: string[];
  gradient: string;
  likes: number;
  views: string;
  featured: boolean;
  onClick?: (id: string) => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  subtitle,
  category,
  type,
  description,
  image,
  tags,
  gradient,
  likes,
  views,
  featured,
  onClick,
  className = '',
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <motion.article
      className={`group cursor-pointer ${className}`}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleClick}
      data-track="project-card-click"
      data-project-id={id}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Voir le projet ${title}`}
    >
      <TiltCard className="relative h-full overflow-hidden bg-surface-DEFAULT border border-surface-border rounded-2xl shadow-card hover:shadow-lg transition-all duration-300">
        {/* Featured ribbon */}
        {featured && (
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-accent-orange text-white text-xs font-semibold px-3 py-1 rounded-full shadow-card">
              Mis en avant
            </div>
          </div>
        )}

        {/* Image container */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={image}
            alt={`Aperçu du projet ${title}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Hover overlay with action button */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-surface-DEFAULT/90 rounded-lg text-text-DEFAULT font-medium"
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <span>Étude de cas</span>
              <ArrowRight size={16} />
            </motion.div>
          </div>

          {/* Category badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-600 border border-primary-100">
              {type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and subtitle */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-text-DEFAULT mb-1 group-hover:text-primary-600 transition-colors">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-primary-600 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-text-soft text-sm leading-relaxed mb-4 line-clamp-3">
            {description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-surface-subtle text-text-soft border border-surface-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={14} />
                <span>{likes}</span>
              </div>
            </div>
            
            {/* CTA indicator */}
            <div className="flex items-center gap-1 text-primary-600 group-hover:text-primary-700 transition-colors">
              <span className="text-sm font-medium">Voir le projet</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.article>
  );
};