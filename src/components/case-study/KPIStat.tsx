import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, Award } from 'lucide-react';

interface KPIStatProps {
  label: string;
  value: string;
  change?: string;
  icon?: 'trending' | 'users' | 'clock' | 'award';
  color?: 'green' | 'blue' | 'purple' | 'orange';
  description?: string;
}

const iconMap = {
  trending: TrendingUp,
  users: Users,
  clock: Clock,
  award: Award,
};

const colorMap = {
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    icon: 'text-green-500',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600', 
    border: 'border-blue-200',
    icon: 'text-blue-500',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    icon: 'text-purple-500',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    icon: 'text-orange-500',
  },
};

export const KPIStat: React.FC<KPIStatProps> = ({
  label,
  value,
  change,
  icon = 'trending',
  color = 'green',
  description,
}) => {
  const IconComponent = iconMap[icon];
  const colors = colorMap[color];

  return (
    <motion.div
      className={`p-6 rounded-xl border-2 ${colors.bg} ${colors.border} hover:shadow-lg transition-all duration-300`}
      whileHover={{ scale: 1.02, y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <IconComponent className={colors.icon} size={24} />
        </div>
        {change && (
          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
            {change}
          </span>
        )}
      </div>

      <div className="mb-2">
        <div className={`text-3xl font-bold ${colors.text} mb-1`}>
          {value}
        </div>
        <div className="text-gray-600 font-medium">
          {label}
        </div>
      </div>

      {description && (
        <p className="text-sm text-gray-500 leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
};

interface KPIStatsRowProps {
  title?: string;
  subtitle?: string;
  stats: Array<Omit<KPIStatProps, 'key'>>;
  className?: string;
}

export const KPIStatsRow: React.FC<KPIStatsRowProps> = ({
  title = "Impact & Résultats",
  subtitle,
  stats,
  className = '',
}) => {
  return (
    <motion.section
      className={`py-16 ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              className="text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <KPIStat {...stat} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};