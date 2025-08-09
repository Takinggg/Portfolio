import React, { useEffect, useState } from 'react';
import { ArrowDown, Palette, Smartphone, Sparkles, Star, Zap } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const floatingElements = [
    { icon: Palette, color: 'from-pink-400 to-rose-600', delay: '0s', position: 'top-20 left-20' },
    { icon: Smartphone, color: 'from-blue-400 to-cyan-600', delay: '0.5s', position: 'top-32 right-32' },
    { icon: Sparkles, color: 'from-purple-400 to-indigo-600', delay: '1s', position: 'bottom-40 left-40' },
    { icon: Star, color: 'from-yellow-400 to-orange-600', delay: '1.5s', position: 'bottom-32 right-20' },
    { icon: Zap, color: 'from-green-400 to-emerald-600', delay: '2s', position: 'top-1/2 left-10' },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
      </div>

      {/* Floating Elements */}
      {floatingElements.map((element, index) => {
        const Icon = element.icon;
        return (
          <div
            key={index}
            className={`absolute ${element.position} animate-bounce hidden lg:block`}
            style={{ 
              animationDelay: element.delay,
              animationDuration: '3s'
            }}
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${element.color} rounded-2xl flex items-center justify-center shadow-2xl rotate-12 hover:rotate-0 transition-transform duration-500`}>
              <Icon className="text-white" size={24} />
            </div>
          </div>
        );
      })}

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/20 rounded-full text-sm font-medium mb-8 shadow-2xl mt-8">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Disponible pour nouveaux projets
            </span>
            <Sparkles size={16} className="text-blue-500" />
          </div>

          {/* Main Title */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none">
              <span className="block bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                FOULON
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                Maxence
              </span>
            </h1>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1 max-w-20" />
              <span className="text-xl text-gray-600 font-light">22 ans</span>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1 max-w-20" />
            </div>

            <p className="text-2xl md:text-3xl font-light text-gray-700 max-w-4xl mx-auto leading-relaxed mb-4">
              Designer UI/UX passionné par la création d'expériences
            </p>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              digitales exceptionnelles et l'innovation dans le design
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button 
              onClick={scrollToProjects}
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg overflow-hidden shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Découvrir mes créations
                <ArrowDown size={20} className="group-hover:translate-y-1 transition-transform duration-300" />
              </span>
            </button>
            
            <button className="group px-10 py-5 bg-white/80 backdrop-blur-xl border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold text-lg hover:border-gray-300 hover:bg-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
              <span className="flex items-center gap-2">
                Télécharger CV
                <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:animate-ping" />
              </span>
            </button>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Palette,
                title: "UI Design",
                description: "Interfaces visuelles modernes et esthétiques",
                gradient: "from-pink-500 to-rose-600",
                bgGradient: "from-pink-50 to-rose-50"
              },
              {
                icon: Smartphone,
                title: "UX Design", 
                description: "Expériences utilisateur optimisées",
                gradient: "from-blue-500 to-cyan-600",
                bgGradient: "from-blue-50 to-cyan-50"
              },
              {
                icon: Sparkles,
                title: "Prototypage",
                description: "Prototypes interactifs et tests utilisateur",
                gradient: "from-purple-500 to-indigo-600",
                bgGradient: "from-purple-50 to-indigo-50"
              }
            ].map((skill, index) => {
              const Icon = skill.icon;
              return (
                <div 
                  key={index}
                  className={`group relative bg-gradient-to-br ${skill.bgGradient} p-8 rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 backdrop-blur-xl`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${skill.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-blue-600 transition-all duration-300">
                    {skill.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {skill.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;