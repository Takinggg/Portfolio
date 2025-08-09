import React, { useEffect, useRef, useState } from 'react';
import { memo } from 'react';
import { Code, Users, Zap, Award, Target, Lightbulb, Heart, Coffee } from 'lucide-react';

const About = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const skills = [
    { name: 'Figma', level: 95, color: 'from-purple-500 to-pink-500' },
    { name: 'Adobe XD', level: 90, color: 'from-blue-500 to-cyan-500' },
  ];

  const values = [
    {
      icon: Target,
      title: "Précision",
      description: "Attention méticuleuse aux détails et à la cohérence visuelle",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Recherche constante de solutions créatives et originales",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Amour profond pour le design et l'expérience utilisateur",
      gradient: "from-pink-500 to-red-500"
    },
    {
      icon: Coffee,
      title: "Persévérance",
      description: "Engagement total dans chaque projet jusqu'à la perfection",
      gradient: "from-amber-600 to-yellow-600"
    }
  ];

  return (
    <section ref={sectionRef} id="about" className="py-32 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-gray-700">Découvrez mon univers</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              À propos
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              de moi
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Designer passionné avec une vision moderne du design digital, 
            je transforme les idées complexes en expériences utilisateur exceptionnelles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image Section */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-white/50 shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg" 
                  alt="Portrait de Maxence FOULON"
                  className="w-full h-96 object-cover rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Floating Stats */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">50+</div>
                    <div className="text-xs text-gray-600">Projets</div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">3+</div>
                    <div className="text-xs text-gray-600">Années</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className={`space-y-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="prose prose-lg text-gray-700 space-y-6">
              <p className="text-lg leading-relaxed">
                Diplômé en design graphique et spécialisé en UX/UI design, 
                je combine créativité artistique et approche scientifique pour 
                créer des interfaces qui séduisent et convertissent.
              </p>
              
              <p className="text-lg leading-relaxed">
                Mon processus de design s'appuie sur la recherche utilisateur, 
                le prototypage itératif et les tests d'usabilité pour garantir 
                des expériences optimales sur tous les supports.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-2 gap-4">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div 
                    key={index}
                    className="group bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${value.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Expertise Technique</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Maîtrise des outils de design les plus avancés et des technologies web modernes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <div 
                key={index}
                className="group bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">{skill.name}</span>
                  <span className="text-sm text-gray-600">{skill.level}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                    style={{ 
                      width: isVisible ? `${skill.level}%` : '0%',
                      transitionDelay: `${index * 100}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

About.displayName = 'About';

export default About;