import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Star } from 'lucide-react';

interface Skill {
  name: string;
  level: 'Expert' | 'Avancé' | 'Opérationnel';
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

const levelConfig = {
  'Expert': {
    color: 'bg-green-500',
    text: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dots: 5
  },
  'Avancé': {
    color: 'bg-blue-500', 
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dots: 4
  },
  'Opérationnel': {
    color: 'bg-orange-500',
    text: 'text-orange-700', 
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dots: 3
  }
};

export const CompetencyMatrix: React.FC<CompetencyMatrixProps> = ({
  categories,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      <div className="text-center mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Matrice de Compétences
        </h3>
        <p className="text-gray-600">
          Expertise validée par des certifications et projets livrés
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categories.map((category, categoryIndex) => {
          const Icon = category.icon;
          
          return (
            <motion.div
              key={categoryIndex}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
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
                  const levelStyle = levelConfig[skill.level];
                  
                  return (
                    <motion.div
                      key={skillIndex}
                      className="space-y-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (skillIndex * 0.05) }}
                      viewport={{ once: true }}
                    >
                      {/* Skill Name and Level */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {skill.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Level Indicator Dots */}
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < levelStyle.dots ? levelStyle.color : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${levelStyle.bg} ${levelStyle.text}`}>
                            {skill.level}
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
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h5 className="font-semibold text-gray-900 mb-4">Niveaux d'expertise</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < 5 ? 'bg-green-500' : 'bg-gray-200'}`} />
              ))}
            </div>
            <div>
              <div className="font-medium text-green-700">Expert</div>
              <div className="text-gray-600">Maîtrise complète + formation d'équipes</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < 4 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              ))}
            </div>
            <div>
              <div className="font-medium text-blue-700">Avancé</div>
              <div className="text-gray-600">Autonomie sur projets complexes</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-orange-500' : 'bg-gray-200'}`} />
              ))}
            </div>
            <div>
              <div className="font-medium text-orange-700">Opérationnel</div>
              <div className="text-gray-600">Capable d'exécuter avec supervision</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};