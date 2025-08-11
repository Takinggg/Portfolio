import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface Skill {
  name: string;
  rating: number; // 1-5 numeric rating
  evidence: string[];
}

interface SkillCategory {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  skills: Skill[];
}

interface CompetencyMatrixProps {
  categories: SkillCategory[];
  className?: string;
}

const getRatingLevel = (rating: number, t: (key: string) => string) => {
  if (rating >= 4) return { label: t('about.competency_matrix.expertise_levels.expert'), color: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-700' };
  if (rating >= 3) return { label: t('about.competency_matrix.expertise_levels.advanced'), color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-700' };
  return { label: t('about.competency_matrix.expertise_levels.operational'), color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-700' };
};

export const CompetencyMatrix: React.FC<CompetencyMatrixProps> = ({
  categories,
  className = '',
}) => {
  const { t } = useI18n();
  
  return (
    <div className={`${className}`}>
      <div className="text-center mb-12">
        <div className="inline-block px-6 py-3 mb-4 bg-white/80 dark:bg-gray-800/70 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-full transition-colors">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors">
            {t('about.competency_matrix.title')}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 transition-colors">
          {t('about.competency_matrix.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categories.map((category, categoryIndex) => {
          const Icon = category.icon;
          
          return (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    {category.title}
                  </h4>
                </div>

                {/* Skills List */}
                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => {
                    const levelInfo = getRatingLevel(skill.rating, t);
                    
                    return (
                      <motion.div
                        key={skillIndex}
                        className="space-y-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (skillIndex * 0.05) }}
                        viewport={{ once: true }}
                      >
                        {/* Skill Name and Rating */}
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors">
                            {skill.name}
                          </span>
                          <div className="flex items-center gap-2">
                            {/* Numeric Rating Bars */}
                            <div className="flex gap-1" role="img" aria-label={`${skill.name}: ${skill.rating} sur 5`}>
                              {Array.from({ length: 5 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-3 rounded-full ${
                                    i < skill.rating 
                                      ? 'bg-gradient-to-r from-violet-500 to-indigo-500' 
                                      : 'bg-gray-200 dark:bg-gray-700'
                                  } transition-colors`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">
                              {skill.rating}/5
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${levelInfo.bg} ${levelInfo.color}`}>
                              {levelInfo.label}
                            </span>
                          </div>
                        </div>

                        {/* Evidence */}
                        <div className="pl-4 space-y-1">
                          {skill.evidence.map((evidence, evidenceIndex) => (
                            <div
                              key={evidenceIndex}
                              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors"
                            >
                              <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                              <span>{evidence}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Enhanced Legend */}
      <div className="mt-8 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm transition-colors">
        <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">{t('about.competency_matrix.expertise_levels.title')}</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < 5 ? 'bg-gradient-to-r from-violet-500 to-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              ))}
            </div>
            <div>
              <div className="font-medium text-green-700 dark:text-green-300 transition-colors">{t('about.competency_matrix.expertise_levels.expert')}</div>
              <div className="text-gray-600 dark:text-gray-400 transition-colors">{t('about.competency_matrix.expertise_levels.expert_desc')}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < 3 ? 'bg-gradient-to-r from-violet-500 to-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              ))}
            </div>
            <div>
              <div className="font-medium text-blue-700 dark:text-blue-300 transition-colors">{t('about.competency_matrix.expertise_levels.advanced')}</div>
              <div className="text-gray-600 dark:text-gray-400 transition-colors">{t('about.competency_matrix.expertise_levels.advanced_desc')}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < 2 ? 'bg-gradient-to-r from-violet-500 to-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              ))}
            </div>
            <div>
              <div className="font-medium text-orange-700 dark:text-orange-300 transition-colors">{t('about.competency_matrix.expertise_levels.operational')}</div>
              <div className="text-gray-600 dark:text-gray-400 transition-colors">{t('about.competency_matrix.expertise_levels.operational_desc')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};