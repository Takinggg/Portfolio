import React, { useEffect, useRef, useState } from 'react';
import { memo } from 'react';
import { Target, Lightbulb, Heart, Coffee, Search, Brain, Palette, Code } from 'lucide-react';
import { CompetencyMatrix } from './about/CompetencyMatrix';
import { Timeline } from './about/Timeline';
import { ProcessStrip } from './about/ProcessStrip';

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

  // Competency Matrix Data
  const competencyCategories = [
    {
      title: 'Produit / Recherche',
      icon: Search,
      color: 'bg-blue-500',
      skills: [
        {
          name: 'Recherche utilisateur',
          rating: 4,
          evidence: ['15+ études utilisateur menées', 'Certification Google UX', 'Formation d\'équipes']
        },
        {
          name: 'Analytics & Data',
          rating: 3,
          evidence: ['Google Analytics certified', 'A/B tests sur 8 projets', 'Dashboard de KPIs']
        },
        {
          name: 'Product Strategy',
          rating: 3,
          evidence: ['3 roadmaps produit', 'OKRs définition', 'Go-to-market strategy']
        }
      ]
    },
    {
      title: 'UI / Design',
      icon: Palette,
      color: 'bg-purple-500',
      skills: [
        {
          name: 'Interface Design',
          rating: 4,
          evidence: ['50+ interfaces livrées', 'Design Systems créés', 'Atomic Design maîtrise']
        },
        {
          name: 'Design Systems',
          rating: 4,
          evidence: ['3 Design Systems de A à Z', 'Tokens & Components', 'Documentation complète']
        },
        {
          name: 'Visual Design',
          rating: 3,
          evidence: ['Brand identity projets', 'Illustrations custom', 'Motion design']
        }
      ]
    },
    {
      title: 'UX / Méthodes',
      icon: Brain,
      color: 'bg-green-500',
      skills: [
        {
          name: 'Prototypage',
          rating: 4,
          evidence: ['Figma/Framer expert', '20+ prototypes validés', 'Micro-interactions']
        },
        {
          name: 'Tests utilisateur',
          rating: 3,
          evidence: ['Tests modérés/non-modérés', 'UserTesting platform', 'A/B testing']
        },
        {
          name: 'Information Architecture',
          rating: 3,
          evidence: ['Card sorting études', 'Tree testing', 'Sitemaps optimisés']
        }
      ]
    },
    {
      title: 'Frontend / Tech',
      icon: Code,
      color: 'bg-orange-500',
      skills: [
        {
          name: 'React / TypeScript',
          rating: 2,
          evidence: ['4 apps React livrées', 'TypeScript sur projets', 'Hooks & Context']
        },
        {
          name: 'CSS / Animations',
          rating: 2,
          evidence: ['CSS avancé', 'Framer Motion', 'Animations performantes']
        },
        {
          name: 'Design to Code',
          rating: 2,
          evidence: ['Handoff optimisé', 'Design tokens', 'Collaboration dev']
        }
      ]
    }
  ];

  // Timeline Data
  const timelineEvents = [
    {
      year: '2019',
      title: 'Début en Design Graphique',
      description: 'Formation autodidacte et premiers projets en freelance. Découverte de l\'univers du design numérique.',
      type: 'education' as const,
      location: 'Formation en ligne'
    },
    {
      year: '2020',
      title: 'Spécialisation UX/UI',
      description: 'Transition vers l\'UX/UI design. Formation intensive sur les méthodologies centrées utilisateur.',
      type: 'education' as const,
      location: 'Remote'
    },
    {
      year: '2021',
      title: 'Premier poste UI Designer',
      description: 'Intégration dans une startup tech. Conception d\'interfaces SaaS et développement de design systems.',
      type: 'work' as const,
      company: 'TechStart Inc.',
      location: 'Paris'
    },
    {
      year: '2022',
      title: 'Lead UX Designer',
      description: 'Promotion avec responsabilité d\'équipe. Gestion de projets complexes et formation de juniors.',
      type: 'work' as const,
      company: 'Scale-Up Co.',
      location: 'Remote'
    },
    {
      year: '2023',
      title: 'Certifications avancées',
      description: 'Google UX Design Certificate et spécialisation en Research. Expansion vers le Product Design.',
      type: 'certification' as const,
      location: 'En ligne'
    },
    {
      year: '2024',
      title: 'Designer Freelance Senior',
      description: 'Lancement en indépendant. Focus sur les projets à fort impact avec des clients premium.',
      type: 'milestone' as const,
      location: 'France / Remote'
    }
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
    <section ref={sectionRef} id="about" className="py-32 bg-white relative overflow-hidden">
      {/* WHITE Liquid Glass Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 liquid-shape opacity-5 blur-3xl" 
             style={{background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.15), rgba(118, 75, 162, 0.15))'}} />
        <div className="absolute bottom-20 right-10 w-96 h-96 liquid-shape-alt opacity-5 blur-3xl" 
             style={{background: 'linear-gradient(45deg, rgba(240, 147, 251, 0.12), rgba(79, 172, 254, 0.12))'}} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-base rounded-full text-sm font-medium mb-6 border-iridescent glass-reflection">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
            <span className="text-text-strong">Découvrez mon univers</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-text-strong via-liquid-blue to-liquid-purple bg-clip-text text-transparent">
              À propos
            </span>
            <br />
            <span className="bg-gradient-to-r from-liquid-blue to-liquid-purple bg-clip-text text-transparent">
              de moi
            </span>
          </h2>
          
          <p className="text-xl text-text-soft max-w-4xl mx-auto leading-relaxed">
            Designer passionné avec une vision moderne du design digital, 
            je transforme les idées complexes en expériences utilisateur exceptionnelles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image Section */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative group">
              <div className="absolute inset-0 liquid-shape opacity-10 blur-xl group-hover:blur-2xl transition-all duration-500"
                   style={{background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.2), rgba(118, 75, 162, 0.2))'}} />
              <div className="relative glass-heavy rounded-3xl p-8 shadow-glass glass-reflection glass-distortion">
                <img 
                  src="https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg" 
                  alt="Portrait de Maxence FOULON"
                  className="w-full h-96 object-cover rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Enhanced Glass Floating Stats */}
                <div className="absolute -top-4 -right-4 glass-ultra rounded-2xl p-4 shadow-glass border-iridescent glass-fragments">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-liquid-blue">50+</div>
                    <div className="text-xs text-text-muted">Projets</div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 glass-ultra rounded-2xl p-4 shadow-glass border-iridescent glass-fragments">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-liquid-purple">3+</div>
                    <div className="text-xs text-text-muted">Années</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className={`space-y-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="prose prose-lg text-text-soft space-y-6">
              {/* Age moved from Hero */}
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur border border-gray-200 rounded-full text-sm font-medium text-gray-700">
                  22 ans • Designer UI/UX
                </span>
              </div>
              
              <p className="text-lg leading-relaxed text-text-strong">
                Diplômé en design graphique et spécialisé en UX/UI design, 
                je combine créativité artistique et approche scientifique pour 
                créer des interfaces qui séduisent et convertissent.
              </p>
              
              <p className="text-lg leading-relaxed text-text-strong">
                Mon processus de design s'appuie sur la recherche utilisateur, 
                le prototypage itératif et les tests d'usabilité pour garantir 
                des expériences optimales sur tous les supports.
              </p>
            </div>

            {/* Enhanced Glass Values Grid */}
            <div className="grid grid-cols-2 gap-4">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div 
                    key={index}
                    className="group glass-heavy p-6 rounded-2xl shadow-glass hover:shadow-glass-lg transition-all duration-500 hover:-translate-y-2 magnetic glass-reflection liquid-spread glass-fragments"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${value.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-liquid border border-white/20`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <h4 className="font-bold text-text-strong mb-2">{value.title}</h4>
                    <p className="text-sm text-text-soft leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Competency Matrix - Replaces Skills Section */}
        <div className={`mb-20 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <CompetencyMatrix 
            categories={competencyCategories}
            className="bg-gray-50 rounded-2xl p-8"
          />
        </div>

        {/* Process Strip */}
        <div className={`mb-20 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <ProcessStrip />
        </div>

        {/* Timeline */}
        <div className={`transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Timeline 
            events={timelineEvents}
            className="bg-white rounded-2xl p-8 shadow-lg"
          />
        </div>
      </div>
    </section>
  );
});

About.displayName = 'About';

export default About;