import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Palette, Smartphone, Sparkles, Star, Zap, Users, Calendar, CheckCircle } from 'lucide-react';
import { GlassCard, LiquidButton, TypingText, LiquidBackground } from './ui/liquid-glass';

const Hero = () => {
  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // UI/UX Engineer roles for typing animation
  const roles = [
    "UI/UX Engineer",
    "Experience Designer", 
    "Design Systems Architect",
    "Product Designer",
    "Interaction Designer"
  ];

  // Floating design tool icons - Reduced for performance
  const floatingElements = [
    { icon: Palette, color: 'from-pink-400 to-rose-600', delay: '0s', position: 'top-20 left-20' },
    { icon: Sparkles, color: 'from-purple-400 to-indigo-600', delay: '1s', position: 'bottom-40 left-40' },
    { icon: Star, color: 'from-yellow-400 to-orange-600', delay: '1.5s', position: 'bottom-32 right-20' },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Liquid Glass Background */}
      <LiquidBackground variant="vibrant" />

      {/* Floating Design Elements - Optimized */}
      {floatingElements.map((element, index) => {
        const Icon = element.icon;
        return (
          <motion.div
            key={index}
            className={`absolute ${element.position} hidden lg:block`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
            }}
            transition={{
              duration: 1.5,
              delay: index * 0.5,
            }}
            style={{
              animation: 'float 6s ease-in-out infinite',
              animationDelay: `${index * 0.5}s`
            }}
          >
            <GlassCard className="w-16 h-16 flex items-center justify-center hover:scale-110 transition-transform duration-300" magnetic premium>
              <Icon className="text-liquid-purple" size={24} />
            </GlassCard>
          </motion.div>
        );
      })}

      {/* Main Content Container */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Availability Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <GlassCard 
            className="inline-flex items-center px-6 py-3 mb-6" 
            magnetic 
            premium
            reflection
            iridescent
            particles
            particleVariant="medium"
          >
            <motion.div
              className="w-3 h-3 bg-accent-green rounded-full mr-3"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-text-strong">
              Available for new projects
            </span>
            <CheckCircle className="ml-2 text-accent-green" size={16} />
          </GlassCard>
        </motion.div>

        {/* Floating Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-8"
        >
          <GlassCard 
            className="w-32 h-32 mx-auto rounded-full p-1 magnetic" 
            magnetic 
            premium
            reflection
            distortion
            fragments
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-liquid-blue to-liquid-purple flex items-center justify-center overflow-hidden">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/30">
                <Users className="text-white" size={32} />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Hero Title with Typing Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-text-strong tracking-tight">
            <motion.span
              className="block mb-2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <span className="bg-gradient-to-r from-liquid-blue to-liquid-purple bg-clip-text text-transparent">
                FOULON Maxence
              </span>
            </motion.span>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-3xl md:text-4xl font-semibold text-liquid-purple"
            >
              <TypingText 
                texts={roles}
                speed={80}
                deleteSpeed={50}
                delayBetweenTexts={2000}
                className="min-h-[1.2em]"
              />
            </motion.div>
          </h1>
        </motion.div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mb-8 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-text-strong mb-6 leading-tight">
            I craft exceptional digital experiences that drive user engagement and business growth
          </h2>
          
          {/* Value Props with Enhanced Glass Effects */}
          <div className="flex flex-wrap justify-center gap-4 text-lg leading-relaxed">
            <GlassCard className="flex items-center gap-2 px-4 py-2" magnetic premium particles>
              <Sparkles className="text-liquid-cyan" size={20} />
              <span className="text-text-strong font-medium">User-Centered Design</span>
            </GlassCard>
            <GlassCard className="flex items-center gap-2 px-4 py-2" magnetic premium reflection>
              <Star className="text-liquid-pink" size={20} />
              <span className="text-text-strong font-medium">5+ Years Experience</span>
            </GlassCard>
            <GlassCard className="flex items-center gap-2 px-4 py-2" magnetic premium iridescent>
              <Palette className="text-liquid-purple" size={20} />
              <span className="text-text-strong font-medium">Design Systems Expert</span>
            </GlassCard>
          </div>
        </motion.div>

        {/* CTA Buttons with Proper Alignment */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-16"
        >
          <LiquidButton
            variant="primary"
            size="lg"
            onClick={scrollToProjects}
            magnetic
            premium
            multiRipple
            liquidSpread
            glassReflection
            className="shadow-lg w-full sm:w-auto"
          >
            <span>View Case Studies</span>
            <ArrowDown size={20} className="ml-2" />
          </LiquidButton>

          <LiquidButton
            variant="outline"
            size="lg"
            magnetic
            premium
            multiRipple
            liquidSpread
            className="shadow-lg w-full sm:w-auto"
          >
            <Calendar size={20} className="mr-2" />
            <span>Schedule a Call</span>
          </LiquidButton>

          {/* Discover My Work - Integrated as third CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="w-full sm:w-auto"
          >
            <LiquidButton
              variant="ghost"
              size="lg"
              onClick={scrollToProjects}
              className="w-full sm:w-auto text-text-soft hover:text-liquid-purple transition-colors"
            >
              <span className="text-sm font-medium">Discover My Work</span>
              <ArrowDown size={16} className="ml-2" />
            </LiquidButton>
          </motion.div>
        </motion.div>

        {/* Skills Preview with Optimized Effects */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            { 
              icon: Palette, 
              title: "UI Design", 
              desc: "Creating visually stunning and intuitive interfaces that users love",
              gradient: "from-liquid-pink to-liquid-purple"
            },
            { 
              icon: Smartphone, 
              title: "UX Research", 
              desc: "Data-driven insights to optimize user journeys and experiences",
              gradient: "from-liquid-blue to-liquid-cyan"
            },
            { 
              icon: Sparkles, 
              title: "Prototyping", 
              desc: "Interactive prototypes that bring ideas to life and validate concepts",
              gradient: "from-liquid-purple to-liquid-blue"
            }
          ].map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 + index * 0.2 }}
              className="group hover:-translate-y-2 transition-transform duration-300"
            >
              <GlassCard className="p-6 text-center" magnetic premium reflection>
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${skill.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <skill.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-text-strong">
                  {skill.title}
                </h3>
                <p className="text-text-soft text-sm leading-relaxed">
                  {skill.desc}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;