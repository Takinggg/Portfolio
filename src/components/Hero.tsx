import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Calendar, CheckCircle, Users, TrendingUp, Award, Target } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const Hero = () => {
  const { t } = useI18n();
  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-black transition-colors">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-100/30 dark:bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-100/30 dark:bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Identity Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200/50 dark:border-gray-600/50 rounded-full shadow-sm transition-all duration-300">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('hero.availability')}
            </span>
            <CheckCircle className="ml-2 text-green-500" size={16} />
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight transition-colors">
            <span className="block mb-2">
              {t('hero.title')}
            </span>
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              {t('hero.subtitle')}
            </span>
          </h1>
        </motion.div>

        {/* Supporting Paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-8 max-w-3xl mx-auto"
        >
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8 transition-colors">
            {t('hero.description')}
          </p>
          
          {/* Value Props */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200/50 dark:border-gray-600/50 rounded-full transition-all duration-300">
              <Target className="text-violet-600" size={18} />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{t('hero.value_props.user_centered')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200/50 dark:border-gray-600/50 rounded-full transition-all duration-300">
              <Award className="text-indigo-600" size={18} />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{t('hero.value_props.experience')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200/50 dark:border-gray-600/50 rounded-full transition-all duration-300">
              <TrendingUp className="text-violet-600" size={18} />
              <span className="text-gray-700 dark:text-gray-200 font-medium">{t('hero.value_props.roi')}</span>
            </div>
          </div>
        </motion.div>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <button
            onClick={scrollToProjects}
            className="flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2"
          >
            <span>{t('hero.cta_projects')}</span>
            <ArrowDown size={20} />
          </button>

          <button
            onClick={scrollToContact}
            className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white rounded-full font-semibold transition-all duration-300 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2"
          >
            <Calendar size={20} />
            <span>{t('hero.cta_contact')}</span>
          </button>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: "5+", label: t('hero.metrics.experience_years'), icon: Users },
            { value: "50+", label: t('hero.metrics.projects_delivered'), icon: CheckCircle },
            { value: "95%", label: t('hero.metrics.success_rate'), icon: TrendingUp },
            { value: "4.9/5", label: t('hero.metrics.client_satisfaction'), icon: Award }
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200/50 dark:border-gray-600/50 rounded-2xl p-6 text-center hover:shadow-lg dark:hover:shadow-xl transition-all duration-300"
              >
                <Icon className="w-8 h-8 text-violet-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors">
                  {metric.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;