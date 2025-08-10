import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Palette, Smartphone, Sparkles, Star, Zap, Download } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { PrimaryCTA } from './ui/buttons/PrimaryCTA';
import { useProjects } from '../hooks/useSQLite';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { projects } = useProjects(); // Get projects to count them

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Count projects dynamically
  const projectCount = projects.length;

  const floatingElements = [
    { icon: Palette, color: 'from-pink-400 to-rose-600', delay: '0s', position: 'top-20 left-20' },
    { icon: Smartphone, color: 'from-blue-400 to-cyan-600', delay: '0.5s', position: 'top-32 right-32' },
    { icon: Sparkles, color: 'from-purple-400 to-indigo-600', delay: '1s', position: 'bottom-40 left-40' },
    { icon: Star, color: 'from-yellow-400 to-orange-600', delay: '1.5s', position: 'bottom-32 right-20' },
    { icon: Zap, color: 'from-green-400 to-emerald-600', delay: '2s', position: 'top-1/2 left-10' },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Background with Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30 dark:opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-secondary-50/50 to-purple-50/30 dark:from-dark-900/90 dark:via-dark-800/80 dark:to-dark-700/70" />
      
      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary-500/30 to-secondary-500/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-accent-green/30 to-accent-orange/30 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Enhanced Floating Elements */}
      {floatingElements.map((element, index) => {
        const Icon = element.icon;
        return (
          <motion.div
            key={index}
            className={`absolute ${element.position} hidden lg:block`}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 360,
              y: [0, -20, 0],
            }}
            transition={{
              duration: 2,
              delay: index * 0.3,
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            whileHover={{ scale: 1.2, rotate: 0 }}
          >
            <GlassCard className="w-16 h-16 flex items-center justify-center shadow-neon">
              <Icon className="text-primary-500 dark:text-primary-400" size={24} />
            </GlassCard>
          </motion.div>
        );
      })}

      {/* Main Content Container */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <GlassCard className="inline-flex items-center px-6 py-3 mb-6">
            <motion.div
              className="w-3 h-3 bg-accent-green rounded-full mr-3"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Disponible pour nouveaux projets
            </span>
            <Sparkles className="ml-2 text-accent-green" size={16} />
          </GlassCard>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-green bg-clip-text text-transparent bg-size-200 animate-gradient-shift">
            <motion.span
              className="block"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              FOULON
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Maxence
            </motion.span>
          </h1>
        </motion.div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mb-8 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-6 leading-tight">
            Je conçois des interfaces SaaS qui augmentent l'engagement & les conversions
          </h2>
          
          {/* Value Props bullets */}
          <div className="flex flex-wrap justify-center gap-6 text-lg text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Sparkles className="text-accent-green" size={20} />
              <span>SaaS • e-commerce • dashboards</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-accent-orange" size={20} />
              <span>délais 2–6 sem</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="text-primary-500" size={20} />
              <span>remote FR/EN</span>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
        >
          {/* Primary CTA with dynamic project count */}
          <PrimaryCTA
            onClick={scrollToProjects}
            size="lg"
            icon="arrow-down"
            data-track="hero-cta-projects"
          >
            Voir les projets ({projectCount})
          </PrimaryCTA>

          {/* Secondary CTA */}
          <motion.button
            className="flex items-center gap-2 px-6 py-3 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-track="hero-cta-cv"
          >
            <Download size={20} />
            Télécharger le CV
          </motion.button>
        </motion.div>

        {/* Skills Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            { icon: Palette, title: "UI Design", desc: "Interfaces visuelles modernes et esthétiques" },
            { icon: Smartphone, title: "UX Design", desc: "Expériences utilisateur optimisées" },
            { icon: Sparkles, title: "Prototypage", desc: "Prototypes interactifs et tests utilisateur" }
          ].map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 + index * 0.2 }}
              whileHover={{ y: -10 }}
            >
              <GlassCard className="p-6 text-center group hover:shadow-glass-lg transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <skill.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                  {skill.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {skill.desc}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.5 }}
      >
        <motion.button
          onClick={scrollToProjects}
          className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors group"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm mb-2 group-hover:text-primary-500 transition-colors">
            Scroll pour découvrir
          </span>
          <ArrowDown size={24} className="group-hover:text-primary-500 transition-colors" />
        </motion.button>
      </motion.div>
    </section>
  );
};

export default Hero;