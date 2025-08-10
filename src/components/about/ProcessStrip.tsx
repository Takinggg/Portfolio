import React from 'react';
import { motion } from 'framer-motion';
import { Search, Lightbulb, Palette, TestTube, Rocket } from 'lucide-react';

interface ProcessStepData {
  number: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ProcessStripProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const processSteps: ProcessStepData[] = [
  {
    number: 1,
    title: 'Discover',
    description: 'Recherche utilisateur et analyse des besoins',
    icon: Search,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    number: 2,
    title: 'Define',
    description: 'Définition du problème et des objectifs',
    icon: Lightbulb,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    number: 3,
    title: 'Design',
    description: 'Conception et prototypage des solutions',
    icon: Palette,
    color: 'from-purple-500 to-pink-500'
  },
  {
    number: 4,
    title: 'Validate',
    description: 'Tests utilisateur et itérations',
    icon: TestTube,
    color: 'from-green-500 to-emerald-500'
  },
  {
    number: 5,
    title: 'Ship',
    description: 'Livraison et suivi des performances',
    icon: Rocket,
    color: 'from-red-500 to-rose-500'
  }
];

export const ProcessStrip: React.FC<ProcessStripProps> = ({
  title = 'Processus en 5 étapes',
  subtitle = 'Ma méthodologie éprouvée pour créer des expériences utilisateur exceptionnelles',
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      <div className="text-center mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="relative">
        {/* Connection Lines */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-red-200 transform -translate-y-1/2" />

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <motion.div
                key={index}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Step Icon */}
                <motion.div
                  className={`relative mx-auto w-20 h-20 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center shadow-lg mb-4 z-10`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon size={28} className="text-white" />
                  
                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 font-bold text-sm shadow-md">
                    {step.number}
                  </div>
                </motion.div>

                {/* Step Content */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Arrow (for desktop) */}
                {index < processSteps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-10 -right-4 z-20"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-gray-400"
                      >
                        <path
                          d="M6 12l4-4-4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Process Benefits */}
      <motion.div
        className="mt-12 bg-gray-50 rounded-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Pourquoi cette approche ?
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-blue-600" />
            </div>
            <div className="font-medium text-gray-900 mb-1">Centré utilisateur</div>
            <div className="text-gray-600">Décisions basées sur des données réelles et des insights utilisateurs</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TestTube size={20} className="text-purple-600" />
            </div>
            <div className="font-medium text-gray-900 mb-1">Itératif</div>
            <div className="text-gray-600">Tests continus et améliorations basées sur les retours</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Rocket size={20} className="text-green-600" />
            </div>
            <div className="font-medium text-gray-900 mb-1">Orienté résultats</div>
            <div className="text-gray-600">Focus sur l'impact business et la satisfaction utilisateur</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};