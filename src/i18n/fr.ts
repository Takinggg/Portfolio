import type { TranslationDictionary } from './types';

/**
 * French translations (Default language)
 */
const fr: TranslationDictionary = {
  nav: {
    home: 'Accueil',
    about: 'À propos',
    projects: 'Projets',
    blog: 'Blog',
    contact: 'Contact',
    back: 'Retour',
  },
  hero: {
    availability: 'FOULON Maxence • Designer UI/UX',
    title: 'Créateur d\'expériences',
    subtitle: 'numériques exceptionnelles',
    description: 'Développeur fullstack passionné, je transforme vos idées en solutions digitales innovantes avec un focus sur l\'expérience utilisateur et la performance.',
    cta_projects: 'Voir mes projets',
    cta_contact: 'Discutons ensemble',
    stats: {
      projects: 'Projets réalisés',
      clients: 'Clients satisfaits',
      experience: 'Années d\'expérience',
    },
  },
  about: {
    title: 'À propos',
    subtitle: 'Passionné par l\'innovation',
    description: 'Je conçois et développe des solutions digitales qui allient esthétique moderne et performance technique.',
  },
  projects: {
    title: 'Projets',
    subtitle: 'Réalisations récentes',
    view_all: 'Voir tous les projets',
    featured: 'À la une',
    case_study: 'Étude de cas',
    demo: 'Démo live',
    source: 'Code source',
  },
  blog: {
    title: 'Articles',
    subtitle: 'Analyses et perspectives',
    insights: 'Analyses',
    featured: 'À la une',
    read_more: 'Lire la suite',
    view_all: 'Voir tous les articles',
    min_read: 'min de lecture',
    back_to_blog: 'Retour aux articles',
  },
  contact: {
    title: 'Contact',
    subtitle: 'Discutons de votre projet',
    form: {
      name: 'Nom complet',
      email: 'Adresse email',
      message: 'Votre message',
      send: 'Envoyer le message',
      sending: 'Envoi en cours...',
    },
  },
  footer: {
    rights: 'Tous droits réservés',
    design_by: 'Conçu et développé avec ❤️',
    social: {
      follow: 'Suivez-moi',
    },
  },
  theme: {
    toggle_theme: 'Basculer le thème',
    light_mode: 'Mode clair',
    dark_mode: 'Mode sombre',
  },
  language: {
    toggle_language: 'Changer de langue',
    french: 'Français',
    english: 'English',
  },
  common: {
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    retry: 'Réessayer',
    close: 'Fermer',
    open: 'Ouvrir',
  },
};

export default fr;