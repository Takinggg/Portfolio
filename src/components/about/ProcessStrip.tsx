import React from 'react';
import { motion } from 'framer-motion';
import { Search, Lightbulb, Palette, TestTube, Rocket } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface ProcessStepData {
  number: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
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
  },
  {
    number: 2,
    title: 'Define',
    description: 'Définition du problème et des objectifs',
    icon: Lightbulb,
  },
  {
    number: 3,
    title: 'Design',
    description: 'Conception et prototypage des solutions',
    icon: Palette,
  },
  {
    number: 4,
    title: 'Validate',
    description: 'Tests utilisateur et itérations',
    icon: TestTube,
  },
  {
    number: 5,
    title: 'Ship',
    description: 'Livraison et suivi des performances',
    icon: Rocket,
  }
];

// Gradient backgrounds for each step
const stepGradients = [
  'from-violet-500 to-fuchsia-500',
  'from-fuchsia-500 to-rose-500', 
  'from-indigo-500 to-sky-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500'
];

export const ProcessStrip: React.FC<ProcessStripProps> = ({
  title,
  subtitle,
  className = '',
}) => {
  const { t } = useI18n();

  const processStepsData: ProcessStepData[] = [
    {
      number: 1,
      title: t('about.process.steps.discover.title'),
      description: t('about.process.steps.discover.description'),
      icon: Search,
    },
    {
      number: 2,
      title: t('about.process.steps.define.title'),
      description: t('about.process.steps.define.description'),
      icon: Lightbulb,
    },
    {
      number: 3,
      title: t('about.process.steps.design.title'),
      description: t('about.process.steps.design.description'),
      icon: Palette,
    },
    {
      number: 4,
      title: t('about.process.steps.validate.title'),
      description: t('about.process.steps.validate.description'),
      icon: TestTube,
    },
    {
      number: 5,
      title: t('about.process.steps.ship.title'),
      description: t('about.process.steps.ship.description'),
      icon: Rocket,
    }
  ];

  return (
    <div className={`${className}`}>
      <div className="text-center mb-12">
        <div className="inline-block px-6 py-3 mb-4 bg-white/80 dark:bg-gray-800/70 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-full transition-colors">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
            {title || t('about.process.title')}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors">
          {subtitle || t('about.process.subtitle')}
        </p>
      </div>

      <div className="relative">
        {/* Connection Lines */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 transform -translate-y-1/2 transition-colors" />

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {processStepsData.map((step, index) => {
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
                {/* Step Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gradient-to-br hover:from-violet-50 hover:to-fuchsia-50 dark:hover:from-gray-800 dark:hover:to-gray-800 relative z-10 overflow-hidden">
                  {/* Subtle gradient accent at bottom */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stepGradients[index]} opacity-60`} />
                  
                  {/* Step Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${stepGradients[index]} rounded-2xl flex items-center justify-center shadow-sm relative`}>
                    <Icon size={24} className="text-white" />
                    
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-sm shadow-sm transition-colors">
                      {step.number}
                    </div>
                  </div>

                  {/* Step Content */}
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (for desktop) */}
                {index < processSteps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-1/2 -right-4 z-20 transform -translate-y-1/2"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center shadow-sm transition-colors">
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

      {/* Enhanced Process Benefits */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm transition-colors">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
              {t('about.process.why_title')}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm transition-colors">
                <Search size={20} className="text-blue-600" />
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 transition-colors">{t('about.process.benefits.user_centered.title')}</div>
              <div className="text-gray-600 dark:text-gray-400 transition-colors">{t('about.process.benefits.user_centered.description')}</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm transition-colors">
                <TestTube size={20} className="text-purple-600" />
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 transition-colors">{t('about.process.benefits.iterative.title')}</div>
              <div className="text-gray-600 dark:text-gray-400 transition-colors">{t('about.process.benefits.iterative.description')}</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm transition-colors">
                <Rocket size={20} className="text-green-600" />
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 transition-colors">{t('about.process.benefits.results_oriented.title')}</div>
              <div className="text-gray-600 dark:text-gray-400 transition-colors">{t('about.process.benefits.results_oriented.description')}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};