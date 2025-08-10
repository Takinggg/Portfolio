import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react';
import { ProblemBlock } from '../../components/case-study/ProblemBlock';
import { ProcessStep } from '../../components/case-study/ProcessStep';
import { KPIStatsRow } from '../../components/case-study/KPIStat';
import { MediaGallery } from '../../components/case-study/MediaGallery';

// This is a template/scaffold for case study pages
// TODO: Replace with actual dynamic data based on slug

interface CaseStudyPageProps {
  slug?: string;
  onBack?: () => void;
}

const CaseStudyPage: React.FC<CaseStudyPageProps> = ({ 
  slug = 'placeholder',
  onBack 
}) => {
  // TODO: Fetch actual case study data based on slug
  const caseStudyData = {
    title: "Projet SaaS Dashboard",
    subtitle: "Augmentation de 40% de l'engagement utilisateur",
    client: "TechStart Inc.",
    duration: "6 semaines",
    role: "UI/UX Designer Lead",
    category: "SaaS Interface",
    heroImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Imhlcm8iIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MzY2ZjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM2I4MmY2IiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjaGVybykiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DQVNFIFNUVURZIEhFUk88L3RleHQ+PC9zdmc+",
    
    problem: {
      title: "Interface complexe réduisant l'adoption",
      description: "Le dashboard existant présentait un taux d'abandon de 65% lors de l'onboarding, créant un frein majeur à la croissance.",
      challenges: [
        "Navigation confuse avec trop de niveaux hiérarchiques",
        "Surcharge cognitive due à l'affichage simultané de trop d'informations",
        "Processus d'onboarding long et non guidé",
        "Absence de personnalisation pour différents types d'utilisateurs"
      ],
      userPain: "Les utilisateurs se sentaient perdus et abandonnaient avant de découvrir la valeur du produit",
      businessGoal: "Réduire le taux d'abandon et augmenter l'activation des utilisateurs",
      timeConstraint: "6 semaines pour livrer une version MVP optimisée"
    },

    process: [
      {
        number: 1,
        title: "Découverte & Recherche",
        description: "Analyse approfondie des données utilisateur et interviews avec les parties prenantes pour comprendre les points de friction.",
        duration: "1 semaine",
        tools: ["Analytics", "Hotjar", "Interviews", "Surveys"],
        deliverables: [
          "Analyse des données d'usage",
          "Personas utilisateur actualisées", 
          "Journey map détaillée",
          "Audit UX complet"
        ],
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2IiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5SRUNIRVJDSEU8L3RleHQ+PC9zdmc+"
      },
      {
        number: 2,
        title: "Idéation & Wireframing",
        description: "Génération de solutions créatives et création de wireframes pour tester les concepts rapidement.",
        duration: "1.5 semaines",
        tools: ["Figma", "Miro", "Crazy 8", "User Testing"],
        deliverables: [
          "20+ concepts d'interface",
          "Wireframes low-fi validés",
          "Architecture de l'information optimisée",
          "Prototype cliquable"
        ],
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVmMmY3IiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM0YjU1NjMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5XSVJFRlJBTUlORzwvdGV4dD48L3N2Zz4="
      },
      {
        number: 3,
        title: "Design & Prototypage",
        description: "Création des maquettes finales avec système de design cohérent et prototypage haute fidélité.",
        duration: "2 semaines", 
        tools: ["Figma", "Design System", "Prototyping", "Animation"],
        deliverables: [
          "Maquettes haute fidélité",
          "Prototype interactif",
          "Design system étendu",
          "Spécifications techniques"
        ],
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGJlYWZlIiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMzNzMwYTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ERVNJR048L3RleHQ+PC9zdmc+"
      },
      {
        number: 4,
        title: "Tests & Validation",
        description: "Tests utilisateur approfondis pour valider les solutions et identifier les derniers ajustements nécessaires.",
        duration: "1 semaine",
        tools: ["UserTesting", "A/B Testing", "Analytics", "Feedback"],
        deliverables: [
          "Rapport de tests utilisateur",
          "Métriques de performance UX",
          "Recommandations d'optimisation",
          "Version finale validée"
        ],
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZGY0IiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwNTk2NjkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5URVNUUzwvdGV4dD48L3N2Zz4="
      },
      {
        number: 5,
        title: "Livraison & Suivi",
        description: "Handoff avec l'équipe développement et mise en place du suivi des métriques d'impact.",
        duration: "0.5 semaine",
        tools: ["Figma Dev Mode", "Zeplin", "Analytics", "Documentation"],
        deliverables: [
          "Handoff développement complet",
          "Documentation technique",
          "Plan de suivi des KPIs",
          "Formation équipe produit"
        ],
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmVmNWU3IiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNkOTc3MDYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MSVZSQUlTT048L3RleHQ+PC9zdmc+"
      }
    ],

    kpis: [
      {
        label: "Réduction du taux d'abandon",
        value: "-40%",
        change: "Amélioration",
        icon: "trending" as const,
        color: "green" as const,
        description: "De 65% à 25% d'abandon lors de l'onboarding"
      },
      {
        label: "Augmentation engagement",
        value: "+65%",
        change: "Croissance",
        icon: "users" as const, 
        color: "blue" as const,
        description: "Sessions quotidiennes moyennes par utilisateur"
      },
      {
        label: "Temps d'activation",
        value: "-50%",
        change: "Optimisation",
        icon: "clock" as const,
        color: "purple" as const,
        description: "Temps moyen pour atteindre la première valeur"
      },
      {
        label: "Score satisfaction",
        value: "8.4/10",
        change: "+2.1 points",
        icon: "award" as const,
        color: "orange" as const,
        description: "Basé sur les retours utilisateur post-redesign"
      }
    ],

    mediaGallery: [
      {
        type: "image" as const,
        src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2IiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BVUFOVCA8L3RleHQ+PC9zdmc+",
        alt: "Interface avant redesign",
        caption: "Interface originale - navigation complexe et surcharge d'informations"
      },
      {
        type: "image" as const,
        src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGJlYWZlIiAvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzNzMwYTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BUFJFUZE8L3RleHQ+PC9zdmc+",
        alt: "Interface après redesign",
        caption: "Nouvelle interface - claire, guidée et centrée utilisateur"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour aux projets</span>
          </button>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>2024</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{caseStudyData.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>{caseStudyData.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-4">
              <Tag className="text-primary-600" size={16} />
              <span className="text-primary-700 font-medium">{caseStudyData.category}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              {caseStudyData.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              {caseStudyData.subtitle}
            </p>
            
            <div className="inline-flex items-center gap-6 text-sm text-gray-500">
              <div>Client: <span className="font-medium text-gray-700">{caseStudyData.client}</span></div>
              <div>Durée: <span className="font-medium text-gray-700">{caseStudyData.duration}</span></div>
              <div>Rôle: <span className="font-medium text-gray-700">{caseStudyData.role}</span></div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img
              src={caseStudyData.heroImage}
              alt={`Projet ${caseStudyData.title}`}
              className="w-full aspect-video object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <ProblemBlock
        title={caseStudyData.problem.title}
        description={caseStudyData.problem.description}
        challenges={caseStudyData.problem.challenges}
        userPain={caseStudyData.problem.userPain}
        businessGoal={caseStudyData.problem.businessGoal}
        timeConstraint={caseStudyData.problem.timeConstraint}
        className="bg-white"
      />

      {/* Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Processus de Design
            </h2>
            <p className="text-xl text-gray-600">
              Une approche méthodique en 5 étapes pour optimiser l'expérience utilisateur
            </p>
          </motion.div>

          <div className="space-y-20">
            {caseStudyData.process.map((step, index) => (
              <ProcessStep
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
                duration={step.duration}
                tools={step.tools}
                deliverables={step.deliverables}
                image={step.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <KPIStatsRow
        title="Impact & Résultats"
        subtitle="Métriques mesurées 3 mois après le lancement de la nouvelle interface"
        stats={caseStudyData.kpis}
        className="bg-white"
      />

      {/* Media Gallery */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <MediaGallery
            items={caseStudyData.mediaGallery}
            title="Avant / Après"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Projet suivant
          </h3>
          <p className="text-gray-600 mb-8">
            Découvrez comment j'ai optimisé l'expérience mobile d'une app e-commerce
          </p>
          <button className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
            Voir le projet suivant
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CaseStudyPage;