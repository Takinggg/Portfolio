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
    collaborate: 'Collaborer',
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
    metrics: {
      experience_years: 'Années d\'expérience',
      projects_delivered: 'Projets livrés',
      success_rate: 'Taux de réussite',
      client_satisfaction: 'Satisfaction client',
    },
    value_props: {
      user_centered: 'Design centré utilisateur',
      experience: '5+ années d\'expérience',
      roi: 'ROI mesurable',
    },
  },
  about: {
    title: 'À propos',
    subtitle: 'Passionné par l\'innovation',
    description: 'Je conçois et développe des solutions digitales qui allient esthétique moderne et performance technique.',
    discover_universe: 'Découvrez mon univers',
    about_me: 'Mon Parcours',
    passionate_designer: 'Développeur passionné par la création d\'expériences numériques innovantes',
    age_role: '22 ans • Développeur Full-Stack',
    intro_text: 'Bonjour ! Je suis Maxence FOULON, développeur full-stack passionné par l\'innovation technologique et la création d\'applications web modernes.',
    process_text: 'Avec une solide expérience en développement frontend et backend, je me spécialise dans la création de solutions numériques performantes et user-friendly.',
    skills: {
      title: 'Mes domaines d\'expertise',
      react: 'React / Next.js',
      design: 'UI/UX Design', 
      node: 'Node.js / Express',
      database: 'Bases de données'
    },
    philosophy: {
      title: 'Ma philosophie',
      innovation: '💡 Innovation et créativité dans chaque projet',
      user_focus: '🎯 Focus sur l\'expérience utilisateur',
      performance: '⚡ Performance et qualité du code',
      collaboration: '🤝 Collaboration et communication'
    },
    cta: {
      projects: 'Voir mes projets',
      contact: 'Me contacter'
    },
    values: {
      precision: {
        title: 'Précision',
        description: 'Attention méticuleuse aux détails et à la cohérence visuelle'
      },
      innovation: {
        title: 'Innovation', 
        description: 'Recherche constante de solutions créatives et originales'
      },
      passion: {
        title: 'Passion',
        description: 'Amour profond pour le design et l\'expérience utilisateur'
      },
      perseverance: {
        title: 'Persévérance',
        description: 'Engagement total dans chaque projet jusqu\'à la perfection'
      }
    },
    competency_matrix: {
      title: 'Matrice de Compétences',
      subtitle: 'Expertise validée par des certifications et projets livrés',
      categories: {
        product_research: 'Produit / Recherche',
        ui_design: 'UI / Design',
        ux_methods: 'UX / Méthodes',
        frontend_tech: 'Frontend / Tech'
      },
      expertise_levels: {
        title: 'Niveaux d\'expertise',
        expert: 'Expert (4-5/5)',
        expert_desc: 'Maîtrise complète + formation d\'équipes',
        advanced: 'Avancé (3/5)',
        advanced_desc: 'Autonomie sur projets complexes',
        operational: 'Opérationnel (1-2/5)',
        operational_desc: 'Capable d\'exécuter avec supervision'
      }
    },
    process: {
      title: 'Processus en 5 étapes',
      subtitle: 'Ma méthodologie éprouvée pour créer des expériences utilisateur exceptionnelles',
      steps: {
        discover: {
          title: 'Discover',
          description: 'Recherche utilisateur et analyse des besoins'
        },
        define: {
          title: 'Define',
          description: 'Définition du problème et des objectifs'
        },
        design: {
          title: 'Design',
          description: 'Conception et prototypage des solutions'
        },
        validate: {
          title: 'Validate',
          description: 'Tests utilisateur et itérations'
        },
        ship: {
          title: 'Ship',
          description: 'Livraison et suivi des performances'
        }
      },
      why_title: 'Pourquoi cette approche ?',
      benefits: {
        user_centered: {
          title: 'Centré utilisateur',
          description: 'Décisions basées sur des données réelles et des insights utilisateurs'
        },
        iterative: {
          title: 'Itératif',
          description: 'Tests continus et améliorations basées sur les retours'
        },
        results_oriented: {
          title: 'Orienté résultats',
          description: 'Focus sur l\'impact business et la satisfaction utilisateur'
        }
      }
    },
    timeline: {
      title: 'Parcours Professionnel',
      subtitle: 'Mon évolution de 2019 à aujourd\'hui'
    }
  },
  projects: {
    title: 'Projets',
    subtitle: 'Réalisations récentes',
    view_all: 'Voir tous les projets',
    featured: 'À la une',
    case_study: 'Étude de cas',
    demo: 'Démo live',
    source: 'Code source',
    all_projects: 'Tous les projets',
    filter_by: 'Filtrer par',
    see_project: 'Voir le projet',
    ready_to_create: 'Prêt à créer quelque chose d\'extraordinaire ?',
    collaborate_vision: 'Collaborons pour donner vie à votre vision',
    start_project: 'Démarrer un projet',
    categories: {
      all: 'Tous les projets',
      web: 'Web',
      mobile: 'Mobile',
      branding: 'Branding',
      blockchain: 'Blockchain',
      iot: 'IoT'
    },
    section: {
      creative_portfolio: 'Portfolio créatif',
      my_title: 'Mes',
      my_subtitle: 'Créations',
      description: 'Découvrez une sélection de mes projets les plus innovants, alliant créativité, technologie et impact utilisateur',
      loading: 'Chargement des projets...',
      error: 'Erreur lors du chargement des projets',
      retry: 'Réessayer',
    },
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
    section: {
      latest: 'Derniers articles',
      blog_and: 'Blog &',
      description: 'Découvrez mes réflexions sur le design, les tendances UX/UI et les meilleures pratiques du design digital',
      cta_title: 'Envie de lire plus d\'articles ?',
      cta_description: 'Découvrez tous mes articles sur le design, l\'UX et les tendances digitales',
    },
  },
  contact: {
    title: 'Contact',
    subtitle: 'Discutons de votre projet',
    discuss_project: 'Parlons de votre projet',
    ambitious_project: 'Vous avez un projet ambitieux ? Discutons ensemble de la façon dont nous pouvons créer quelque chose d\'extraordinaire',
    stay_connected: 'Restons connectés',
    choose_communication: 'Choisissez le moyen de communication qui vous convient le mieux. Je suis toujours ravi d\'échanger sur de nouveaux défis créatifs.',
    start_project: 'Démarrons votre projet',
    form_description: 'Remplissez ce formulaire et je vous recontacte dans les plus brefs délais',
    form: {
      name: 'Nom complet',
      email: 'Adresse email',
      message: 'Votre message',
      send: 'Envoyer le message',
      sending: 'Envoi en cours...',
      subject: 'Sujet du projet',
      describe_project: 'Décrivez votre projet',
      budget: 'Budget estimé',
      timeline: 'Timeline souhaitée',
      brief_title: 'Brief du projet (optionnel)',
      brief_link: 'Lien vers votre brief (Notion, Google Doc, etc.)',
      file_upload: 'Télécharger un fichier',
      choose_file: 'Choisir un fichier (PDF, DOC, TXT - max 10MB)',
      schedule_call: 'Préférez-vous un appel ?',
      schedule_description: 'Planifiez un créneau qui vous convient',
      schedule: 'Planifier',
      want_appointment: 'Je souhaite prendre un rendez-vous',
      appointment_option: 'Option rendez-vous',
      with_appointment: 'Avec rendez-vous',
      without_appointment: 'Message simple',
      book_meeting: 'Réserver un créneau',
      privacy_consent: 'J\'accepte que mes données personnelles soient utilisées pour me recontacter concernant ma demande.',
      privacy_link: 'En savoir plus sur la protection des données',
      response_time: 'Réponse sous 24h',
      working_hours: 'Lun-Ven 9h-18h',
      location: 'France',
      remote_missions: 'Missions à distance',
      statistics: 'Statistiques',
      satisfaction: 'Satisfaction client',
      response_time_stat: 'Temps de réponse',
      // Contact method titles
      email_title: 'Email',
      phone_title: 'Téléphone',
      location_title: 'Localisation',
      // Form placeholders and labels
      name_placeholder: 'Votre nom',
      project_placeholder: 'Parlez-moi de votre vision, vos objectifs, votre audience cible...',
      select_budget: 'Sélectionnez un budget',
      select_timeline: 'Sélectionnez une timeline',
      // Success/Error messages
      success_message: 'Message envoyé avec succès !',
      success_detail: 'Je vous répondrai dans les plus brefs délais.',
      error_title: 'Erreur lors de l\'envoi',
      scheduling_message: 'Votre message sera envoyé puis le widget de planification s\'ouvrira automatiquement pour choisir votre créneau.',
      // Validation messages
      validation_error: 'Veuillez corriger les erreurs dans le formulaire',
      validation_data_error: 'Erreur de validation des données',
      general_error: 'Une erreur est survenue',
      // File upload
      file_size_error: 'Le fichier ne doit pas dépasser 10MB',
      file_type_error: 'Format de fichier non supporté. Utilisez PDF, DOC, DOCX ou TXT',
      file_remove: 'Supprimer le fichier',
      // Contact method actions
      contact_by: 'Contacter par',
      or: 'ou',
      // Budget ranges
      budget_5k: '< 5k €',
      budget_5_15k: '5k - 15k €',
      budget_15_30k: '15k - 30k €',
      budget_30_50k: '30k - 50k €',
      budget_50k_plus: '50k+ €',
      // Timeline options
      timeline_urgent: 'Urgent (< 1 mois)',
      timeline_short: 'Court terme (1-3 mois)',
      timeline_medium: 'Moyen terme (3-6 mois)',
      timeline_long: 'Long terme (6+ mois)'
    }
  },
  footer: {
    rights: 'Tous droits réservés',
    design_by: 'Conçu et développé avec ❤️',
    social: {
      follow: 'Suivez-moi',
    },
    description: 'Designer passionné par la création d\'expériences digitales exceptionnelles. Je transforme vos idées en interfaces modernes et intuitives qui marquent les esprits.',
    navigation: 'Navigation',
    services: 'Services',
    legal: 'Mentions légales',
    privacy: 'Confidentialité',
    created_with: 'Créé avec',
    and_coffee: 'et beaucoup de café',
    back_to_top: 'Retour en haut',
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
    featured: 'À la une',
    read_more: 'Lire la suite',
  },
  switches: {
    theme_light: 'Mode clair',
    theme_dark: 'Mode sombre',
    language_to_en: 'Switch to English',
    language_to_fr: 'Passer en français',
    toggle_language: 'Changer de langue',
    toggle_theme: 'Basculer le thème',
  },
  scheduling: {
    form: {
      title: 'Saisissez vos informations',
      name: 'Nom complet',
      email: 'Adresse email',
      notes_optional: 'Notes supplémentaires (facultatif)',
      consent_label: 'J\'accepte de recevoir les confirmations de réservation et les mises à jour par email. Vous pouvez vous désabonner à tout moment.',
      submit: 'Planifier la réunion',
      booking: 'Réservation...',
      clear_prefilled: 'Effacer',
    },
    common: {
      back: 'Retour',
      continue: 'Continuer',
      close: 'Fermer',
    },
    validation: {
      name_required: 'Le nom est requis',
      email_required: 'L\'email est requis',
      email_invalid: 'Veuillez saisir une adresse email valide',
      consent_required: 'Veuillez accepter les conditions pour continuer',
    },
    steps: {
      event_type: 'Sélectionner le type de réunion',
      slots: 'Choisir l\'heure',
      form: 'Vos informations',
      confirmation: 'Confirmé !',
    },
    messages: {
      booking_created: 'Votre réservation a été créée avec succès',
      no_event_types: 'Aucun type de réunion disponible pour le moment.',
      no_slots_available: 'Aucun créneau disponible pour cette date.',
      select_time: 'Sélectionnez une heure',
      times_shown_in: 'Heures affichées en',
    },
    errors: {
      network: 'Erreur de connexion au service de planification. Vérifiez votre connexion internet.',
      not_found: 'Service de planification non trouvé. Contactez le support technique.',
      server_error: 'Erreur serveur du service de planification. Réessayez plus tard.',
      invalid_json: 'Le service de planification est indisponible (réponse non-JSON) — vérifiez la configuration.',
      generic: 'Le service de planification est temporairement indisponible',
      invalid_request: 'Données de réservation invalides. Veuillez vérifier les informations saisies.',
      invalid_event_type: 'Type d\'événement invalide. Veuillez sélectionner un type d\'événement valide.',
      invalid_email: 'Adresse email invalide. Veuillez saisir une adresse email valide.',
      invalid_time: 'Créneau horaire invalide. Veuillez sélectionner un nouveau créneau.',
      invalid_start_time: 'Heure de début invalide. Veuillez sélectionner une heure de début valide.',
      invalid_end_time: 'Heure de fin invalide. Veuillez sélectionner une heure de fin valide.',
      end_before_start: 'L\'heure de fin doit être après l\'heure de début. Veuillez vérifier votre sélection.',
    },
    time: {
      minutes: 'minutes',
      duration_minutes: 'minutes',
    },
    calendar: {
      previous_week: 'Semaine précédente',
      next_week: 'Semaine suivante',
      today: 'Aujourd\'hui',
      slots_available: 'créneaux disponibles',
      slot_available: 'créneau disponible',
    },
    trigger: {
      schedule_meeting: 'Planifier une réunion',
    },
    confirmation: {
      title: 'Tout est prêt !',
      subtitle: 'Votre réunion a été programmée avec succès. Vous recevrez un email de confirmation sous peu.',
      add_to_calendar: 'Ajouter à votre calendrier :',
      google_calendar: 'Google Calendar',
      download_ics: 'Télécharger .ics',
      whats_next: 'Et maintenant ?',
      next_steps: [
        'Vous recevrez un email de confirmation avec tous les détails',
        'Les informations de réunion et d\'accès seront fournies',
        'Vous pouvez reprogrammer ou annuler via les liens dans votre email'
      ],
      booking_reference: 'Référence de réservation',
      notes_label: 'Notes :',
    },
  },
};

export default fr;