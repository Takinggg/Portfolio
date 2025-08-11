import React, { useRef } from 'react';
import { memo } from 'react';
import { Target, Lightbulb, Heart, Coffee, Search, Brain, Palette, Code } from 'lucide-react';
import { CompetencyMatrix } from './about/CompetencyMatrix';
import { Timeline } from './about/Timeline';
import { ProcessStrip } from './about/ProcessStrip';
import { useI18n } from '../hooks/useI18n';
import { AnimatedBackground } from './ui/AnimatedBackground';
import { ShimmerText } from './ui/ShimmerText';
import { PulseButton } from './ui/PulseButton';
import { GlassmorphismPhotoCard } from './ui/GlassmorphismPhotoCard';
import { AnimatedPhilosophyCard } from './ui/AnimatedPhilosophyCard';
import { FadeInWrapper } from './ui/FadeInWrapper';

interface AboutProps {
  onNavigateToSection?: (sectionId: string) => void;
}

const About = memo(({ onNavigateToSection }: AboutProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useI18n();

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
      title: t('about.values.precision.title'),
      description: t('about.values.precision.description'),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Lightbulb,
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.description'),
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Heart,
      title: t('about.values.passion.title'),
      description: t('about.values.passion.description'),
      gradient: "from-pink-500 to-red-500"
    },
    {
      icon: Coffee,
      title: t('about.values.perseverance.title'),
      description: t('about.values.perseverance.description'),
      gradient: "from-amber-600 to-yellow-600"
    }
  ];

  return (
    <section ref={sectionRef} id="about" className="py-32 bg-white dark:bg-gray-950 relative overflow-hidden transition-colors">
      {/* Enhanced Animated Background */}
      <AnimatedBackground variant="gradient" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <FadeInWrapper direction="up" delay={0.2} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-base rounded-full text-sm font-medium mb-6 border-iridescent glass-reflection">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
            <span className="text-text-strong">{t('about.discover_universe')}</span>
          </div>
          
          {/* Enhanced title with shimmer effect */}
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <ShimmerText className="bg-gradient-to-r from-text-strong via-liquid-blue to-liquid-purple bg-clip-text text-transparent">
              {t('about.about_me').split(' ')[0]}
            </ShimmerText>
            <br />
            <ShimmerText delay={0.5} className="bg-gradient-to-r from-liquid-blue to-liquid-purple bg-clip-text text-transparent">
              {t('about.about_me').split(' ').slice(1).join(' ')}
            </ShimmerText>
          </h2>
          
          <p className="text-xl text-text-soft max-w-4xl mx-auto leading-relaxed">
            {t('about.passionate_designer')}
          </p>
        </FadeInWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Enhanced Image Section with 3D Glassmorphism Card */}
          <FadeInWrapper direction="left" delay={0.3}>
            <GlassmorphismPhotoCard
              imageSrc="/image.png"
              imageAlt="Portrait de Maxence FOULON"
              stats={[
                { value: "20+", label: "Projets", position: "top-right" },
                { value: "3+", label: "Années", position: "bottom-left" }
              ]}
            />
          </FadeInWrapper>

          {/* Content Section */}
          <FadeInWrapper direction="right" delay={0.5} className="space-y-8">
            <div className="prose prose-lg text-text-soft space-y-6">
              {/* Age moved from Hero */}
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200/50 dark:border-gray-600/50 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-300">
                  {t('about.age_role')}
                </span>
              </div>
              
              <p className="text-lg leading-relaxed text-text-strong">
                {t('about.intro_text')}
              </p>
              
              <p className="text-lg leading-relaxed text-text-strong">
                {t('about.process_text')}
              </p>
            </div>

            {/* Enhanced Philosophy Section with animated cards */}
            <FadeInWrapper direction="up" delay={0.7} className="mb-8">
              <h3 className="text-xl font-bold text-text-strong mb-4">{t('about.philosophy.title')}</h3>
              <div className="grid grid-cols-2 gap-4">
                {values.map((value, index) => (
                  <AnimatedPhilosophyCard
                    key={index}
                    icon={value.icon}
                    title={value.title}
                    description={value.description}
                    gradient={value.gradient}
                    delay={1.1 + index * 0.1}
                  />
                ))}
              </div>
            </FadeInWrapper>

            {/* Enhanced CTA Buttons */}
            <FadeInWrapper direction="up" delay={0.9} className="flex flex-col sm:flex-row gap-4">
              <PulseButton 
                variant="primary"
                onClick={() => onNavigateToSection?.('projects')}
              >
                {t('about.cta.projects')}
              </PulseButton>
              <PulseButton 
                variant="secondary"
                onClick={() => onNavigateToSection?.('contact')}
              >
                {t('about.cta.contact')}
              </PulseButton>
            </FadeInWrapper>
          </FadeInWrapper>
        </div>

        {/* Competency Matrix - Replaces Skills Section */}
        <FadeInWrapper direction="up" delay={0.7} className="mb-20">
          <CompetencyMatrix 
            categories={competencyCategories}
            className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-8 transition-colors"
          />
        </FadeInWrapper>

        {/* Process Strip */}
        <FadeInWrapper direction="up" delay={0.9} className="mb-20">
          <ProcessStrip />
        </FadeInWrapper>

        {/* Timeline */}
        <FadeInWrapper direction="up" delay={1.0}>
          <Timeline 
            events={timelineEvents}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors"
          />
        </FadeInWrapper>
      </div>
    </section>
  );
});

About.displayName = 'About';

export default About;