import React, { useRef } from 'react';
import { memo } from 'react';
import { Target, Lightbulb, Heart, Coffee } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { PulseButton } from '../ui/PulseButton';
import { GlassmorphismPhotoCard } from '../ui/GlassmorphismPhotoCard';
import { AnimatedPhilosophyCard } from '../ui/AnimatedPhilosophyCard';
import { FadeInWrapper } from '../ui/FadeInWrapper';
import { Timeline } from '../about/Timeline';
import styles from './AboutSection.module.css';

interface AboutSectionProps {
  onNavigateToSection?: (sectionId: string) => void;
}

const AboutSection = memo(({ onNavigateToSection }: AboutSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useI18n();

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

  const timelineEvents = [
    {
      year: '2019',
      title: 'Début en Design Graphique',
      description: "Formation autodidacte et premiers projets en freelance. Découverte de l'univers du design numérique.",
      type: 'education' as const,
      location: 'Formation en ligne',
    },
    {
      year: '2020',
      title: 'Spécialisation UX/UI',
      description: "Transition vers l'UX/UI design. Formation intensive sur les méthodologies centrées utilisateur.",
      type: 'education' as const,
      location: 'Remote',
    },
    {
      year: '2021',
      title: 'Premier poste UI Designer',
      description: "Intégration dans une startup tech. Conception d'interfaces SaaS et développement de design systems.",
      type: 'work' as const,
      company: 'TechStart Inc.',
      location: 'Paris',
    },
    {
      year: '2022',
      title: 'Lead UX Designer',
      description: "Promotion avec responsabilité d'équipe. Gestion de projets complexes et formation de juniors.",
      type: 'work' as const,
      company: 'Scale-Up Co.',
      location: 'Remote',
    },
    {
      year: '2023',
      title: 'Certifications avancées',
      description: 'Google UX Design Certificate et spécialisation en Research. Expansion vers le Product Design.',
      type: 'certification' as const,
      location: 'En ligne',
    },
    {
      year: '2024',
      title: 'Designer Freelance Senior',
      description: 'Lancement en indépendant. Focus sur les projets à fort impact avec des clients premium.',
      type: 'milestone' as const,
    },
  ];

  return (
    <section ref={sectionRef} id="about" className={styles.aboutSection}>
      {/* Enhanced Animated Background */}
      <AnimatedBackground variant="gradient" />

      <div className={styles.container}>
        {/* Title Section */}
        <FadeInWrapper direction="up" delay={0.2} once className={styles.titleSection}>
          <div className={styles.badge}>
            <div className={styles.badgeIndicator} />
            <span className={styles.badgeText}>{t('about.discover_universe')}</span>
          </div>
          
          {/* Main title - ensure it's visible with proper Safari support */}
          <h1 className={`${styles.mainTitle} relative z-10`}>
            <span className={styles.titleFirstWord}>
              {t('about.about_me').split(' ')[0]}
            </span>
            <br />
            <span className={styles.titleSecondPart}>
              {t('about.about_me').split(' ').slice(1).join(' ')}
            </span>
          </h1>
          
          <p className={styles.subtitle}>
            {t('about.passionate_designer')}
          </p>
        </FadeInWrapper>

        {/* Description Section - AT THE TOP as requested */}
        <FadeInWrapper direction="up" delay={0.4} once className={styles.descriptionSection}>
          <div className={styles.metaBadge}>
            <span>{t('about.age_role')}</span>
          </div>
          
          <div className={styles.descriptionText}>
            <p>{t('about.intro_text')}</p>
            <p>{t('about.process_text')}</p>
          </div>
        </FadeInWrapper>

        {/* 2-Column Grid Layout */}
        <div className={styles.gridLayout}>
          {/* Left Column: Photo + Stats */}
          <FadeInWrapper direction="left" delay={0.6} once className={styles.leftColumn}>
            <GlassmorphismPhotoCard
              imageSrc="/image.png"
              imageAlt="Portrait professionnel de Maxence FOULON, Designer UX/UI freelance spécialisé en interfaces numériques"
              stats={[
                { value: "20+", label: "Projets", position: "top-right" },
                { value: "3+", label: "Années", position: "bottom-left" }
              ]}
            />
          </FadeInWrapper>

          {/* Right Column: Philosophy + Values + CTA */}
          <FadeInWrapper direction="right" delay={0.8} once className={styles.rightColumn}>
            <div className={styles.philosophySection}>
              <h2 className={styles.philosophyTitle}>{t('about.philosophy.title')}</h2>
              
              <div className={styles.valuesGrid}>
                {values.map((value, index) => (
                  <AnimatedPhilosophyCard
                    key={index}
                    icon={value.icon}
                    title={value.title}
                    description={value.description}
                    gradient={value.gradient}
                    delay={1.0 + index * 0.1}
                  />
                ))}
              </div>

              {/* CTA Buttons */}
              <div className={styles.ctaButtons}>
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
              </div>
            </div>
          </FadeInWrapper>
        </div>

        {/* Timeline Section */}
        <FadeInWrapper direction="up" delay={1.0} once>
          <Timeline 
            events={timelineEvents}
            className="mt-20"
          />
        </FadeInWrapper>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;