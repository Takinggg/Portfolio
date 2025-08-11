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
            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 border ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                : 'bg-gray-100/60 dark:bg-gray-800/60 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200/80 dark:hover:bg-gray-800/80 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-100'
            } focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900`}
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
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-lg opacity-30"
                layoutId="filterGlow"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {/* Icon */}
            <Icon 
              size={16} 
              className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} 
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
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
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