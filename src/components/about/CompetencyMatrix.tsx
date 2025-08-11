import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Star } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface Skill {
  name: string;
  rating: number; // 1-5 numeric rating
  evidence: string[];
}

interface SkillCategory {
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  skills: Skill[];
}

interface CompetencyMatrixProps {
  categories: SkillCategory[];
  className?: string;
}

const getRatingLevel = (rating: number, t: (key: string) => string) => {
  if (rating >= 4) return { label: t('about.competency_matrix.expertise_levels.expert'), color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
  if (rating >= 3) return { label: t('about.competency_matrix.expertise_levels.advanced'), color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
  return { label: t('about.competency_matrix.expertise_levels.operational'), color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
};

export const CompetencyMatrix: React.FC<CompetencyMatrixProps> = ({
  categories,
  className = '',
}) => {
  const { t } = useI18n();
  
  return (
    <div className={`${className}`}>
      <div className="text-center mb-12">
        <div className="inline-block px-6 py-3 mb-4 bg-white/80 backdrop-blur border border-gray-200 rounded-full">
          <h3 className="text-2xl font-bold text-gray-900">
            {t('about.competency_matrix.title')}
          </h3>
        </div>
        <p className="text-gray-600">
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
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">
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
                          <span className="font-medium text-gray-900">
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
                                      : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              {skill.rating}/5
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${levelInfo.bg} ${levelInfo.color}`}>
                              {levelInfo.label}
                            </span>
                          </div>
                        </div>

                        {/* Evidence */}
                        <div className="pl-4 space-y-1">
                          {skill.evidence.map((evidence, evidenceIndex) => (
                            <div
                              key={evidenceIndex}
                              className="flex items-center gap-2 text-sm text-gray-600"
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
      <div className="mt-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <h5 className="font-semibold text-gray-900 mb-4">{t('about.competency_matrix.expertise_levels.title')}</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < 5 ? 'bg-gradient-to-r from-violet-500 to-indigo-500' : 'bg-gray-200'}`} />
              ))}
            </div>
            <div>
              <div className="font-medium text-green-700">{t('about.competency_matrix.expertise_levels.expert')}</div>
              <div className="text-gray-600">{t('about.competency_matrix.expertise_levels.expert_desc')}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < 3 ? 'bg-gradient-to-r from-violet-500 to-indigo-500' : 'bg-gray-200'}`} />
              ))}
            </div>
            <div>
              <div className="font-medium text-blue-700">{t('about.competency_matrix.expertise_levels.advanced')}</div>
              <div className="text-gray-600">{t('about.competency_matrix.expertise_levels.advanced_desc')}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < 2 ? 'bg-gradient-to-r from-violet-500 to-indigo-500' : 'bg-gray-200'}`} />
              ))}
            </div>
            <div>
              <div className="font-medium text-orange-700">{t('about.competency_matrix.expertise_levels.operational')}</div>
              <div className="text-gray-600">{t('about.competency_matrix.expertise_levels.operational_desc')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};