import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  description?: string;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  change,
  description,
  loading = false,
  onClick,
  className = '',
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      accent: 'bg-blue-500',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      accent: 'bg-green-500',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      accent: 'bg-purple-500',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      accent: 'bg-orange-500',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      accent: 'bg-red-500',
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-700/20',
      icon: 'text-gray-600 dark:text-gray-400',
      accent: 'bg-gray-500',
    },
  };

  const colors = colorClasses[color];

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'down':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'neutral':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/20';
    }
  };

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}k`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, scale: 1.02 }}
      className={`relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-xl' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colors.accent}`} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center transition-colors duration-300`}>
              <Icon className={`${colors.icon} transition-colors duration-300`} size={24} />
            </div>
            {change && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(change.trend)}`}>
                {change.value}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
              {loading ? '...' : formatValue(value)}
            </p>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hover effect decoration */}
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-gray-100/50 to-transparent dark:from-gray-700/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
};

export default StatsCard;

// Predefined stat card configurations
export const statCardConfigs = {
  posts: {
    title: 'Articles publiés',
    icon: 'FileText' as const,
    color: 'blue' as const,
  },
  projects: {
    title: 'Projets',
    icon: 'Briefcase' as const,
    color: 'purple' as const,
  },
  views: {
    title: 'Vues totales',
    icon: 'Eye' as const,
    color: 'green' as const,
  },
  visitors: {
    title: 'Visiteurs uniques',
    icon: 'Users' as const,
    color: 'orange' as const,
  },
  messages: {
    title: 'Messages',
    icon: 'MessageCircle' as const,
    color: 'blue' as const,
  },
  performance: {
    title: 'Performance',
    icon: 'TrendingUp' as const,
    color: 'green' as const,
  },
};