import React from 'react';
import { motion } from 'framer-motion';
import { Code, Smartphone, Palette, Zap, Globe } from 'lucide-react';

interface FilterChip {
  id: string;
  label: string;
  count: number;
  icon?: React.ComponentType<any>;
}

interface ProjectFilterProps {
  categories: FilterChip[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export const ProjectFilter: React.FC<ProjectFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  className = '',
}) => {
  // Map category IDs to icons
  const categoryIcons: Record<string, React.ComponentType<any>> = {
    web: Code,
    mobile: Smartphone,
    branding: Palette,
    blockchain: Zap,
    iot: Globe,
    all: Globe, // Default icon for 'all'
  };

  return (
    <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
      {categories.map((category, index) => {
        const isActive = selectedCategory === category.id;
        const Icon = categoryIcons[category.id] || Globe;

        return (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                : 'bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            data-track="project-filter"
            data-category={category.id}
            aria-label={`Filtrer par ${category.label}`}
            aria-pressed={isActive}
          >
            {/* Background glow for active state */}
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur-lg opacity-30"
                layoutId="filterGlow"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {/* Icon */}
            <Icon 
              size={16} 
              className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-500'}`} 
            />

            {/* Label and count */}
            <span className="relative z-10 text-sm">
              {category.label}
            </span>
            
            {/* Count badge */}
            <span 
              className={`relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors'
              }`}
            >
              {category.count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};