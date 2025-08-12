/**
 * Translation System Types
 */

export type Language = 'fr' | 'en';

export interface TranslationDictionary {
  nav: {
    home: string;
    about: string;
    projects: string;
    blog: string;
    contact: string;
    back: string;
    collaborate: string;
  };
  hero: {
    availability: string;
    title: string;
    subtitle: string;
    description: string;
    cta_projects: string;
    cta_contact: string;
    stats: {
      projects: string;
      clients: string;
      experience: string;
    };
    metrics: {
      experience_years: string;
      projects_delivered: string;
      success_rate: string;
      client_satisfaction: string;
    };
    value_props: {
      user_centered: string;
      experience: string;
      roi: string;
    };
  };
  about: {
    title: string;
    subtitle: string;
    description: string;
    discover_universe: string;
    about_me: string;
    passionate_designer: string;
    age_role: string;
    intro_text: string;
    process_text: string;
    values: {
      precision: {
        title: string;
        description: string;
      };
      innovation: {
        title: string;
        description: string;
      };
      passion: {
        title: string;
        description: string;
      };
      perseverance: {
        title: string;
        description: string;
      };
    };
    competency_matrix: {
      title: string;
      subtitle: string;
      categories: {
        product_research: string;
        ui_design: string;
        ux_methods: string;
        frontend_tech: string;
      };
      expertise_levels: {
        title: string;
        expert: string;
        expert_desc: string;
        advanced: string;
        advanced_desc: string;
        operational: string;
        operational_desc: string;
      };
    };
    process: {
      title: string;
      subtitle: string;
      steps: {
        discover: {
          title: string;
          description: string;
        };
        define: {
          title: string;
          description: string;
        };
        design: {
          title: string;
          description: string;
        };
        validate: {
          title: string;
          description: string;
        };
        ship: {
          title: string;
          description: string;
        };
      };
      why_title: string;
      benefits: {
        user_centered: {
          title: string;
          description: string;
        };
        iterative: {
          title: string;
          description: string;
        };
        results_oriented: {
          title: string;
          description: string;
        };
      };
    };
    timeline: {
      title: string;
      subtitle: string;
    };
  };
  projects: {
    title: string;
    subtitle: string;
    view_all: string;
    featured: string;
    case_study: string;
    demo: string;
    source: string;
    all_projects: string;
    filter_by: string;
    see_project: string;
    ready_to_create: string;
    collaborate_vision: string;
    start_project: string;
    categories: {
      all: string;
      web: string;
      mobile: string;
      branding: string;
      blockchain: string;
      iot: string;
    };
    section: {
      creative_portfolio: string;
      my_title: string;
      my_subtitle: string;
      description: string;
      loading: string;
      error: string;
      retry: string;
    };
  };
  blog: {
    title: string;
    subtitle: string;
    insights: string;
    featured: string;
    read_more: string;
    view_all: string;
    min_read: string;
    back_to_blog: string;
    section: {
      latest: string;
      blog_and: string;
      description: string;
      cta_title: string;
      cta_description: string;
    };
  };
  contact: {
    title: string;
    subtitle: string;
    discuss_project: string;
    ambitious_project: string;
    stay_connected: string;
    choose_communication: string;
    start_project: string;
    form_description: string;
    form: {
      name: string;
      email: string;
      message: string;
      send: string;
      sending: string;
      subject: string;
      describe_project: string;
      budget: string;
      timeline: string;
      brief_title: string;
      brief_link: string;
      file_upload: string;
      choose_file: string;
      schedule_call: string;
      schedule_description: string;
      schedule: string;
      privacy_consent: string;
      privacy_link: string;
      response_time: string;
      working_hours: string;
      location: string;
      remote_missions: string;
      statistics: string;
      satisfaction: string;
      response_time_stat: string;
    };
  };
  footer: {
    rights: string;
    design_by: string;
    social: {
      follow: string;
    };
    description: string;
    navigation: string;
    services: string;
    legal: string;
    privacy: string;
    created_with: string;
    and_coffee: string;
    back_to_top: string;
  };
  theme: {
    toggle_theme: string;
    light_mode: string;
    dark_mode: string;
  };
  language: {
    toggle_language: string;
    french: string;
    english: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    close: string;
    open: string;
    featured: string;
    read_more: string;
  };
  switches: {
    theme_light: string;
    theme_dark: string;
    language_to_en: string;
    language_to_fr: string;
    toggle_language: string;
    toggle_theme: string;
  };
  scheduling: {
    form: {
      title: string;
      name: string;
      email: string;
      notes_optional: string;
      consent_label: string;
      submit: string;
      booking: string;
    };
    common: {
      back: string;
      continue: string;
      close: string;
    };
    validation: {
      name_required: string;
      email_required: string;
      email_invalid: string;
      consent_required: string;
    };
    steps: {
      event_type: string;
      slots: string;
      form: string;
      confirmation: string;
    };
    messages: {
      booking_created: string;
      no_event_types: string;
      no_slots_available: string;
      select_time: string;
      times_shown_in: string;
    };
    time: {
      minutes: string;
      duration_minutes: string;
    };
    calendar: {
      previous_week: string;
      next_week: string;
      today: string;
      slots_available: string;
      slot_available: string;
    };
    trigger: {
      schedule_meeting: string;
    };
    confirmation: {
      title: string;
      subtitle: string;
      add_to_calendar: string;
      google_calendar: string;
      download_ics: string;
      whats_next: string;
      next_steps: string[];
      booking_reference: string;
      notes_label: string;
    };
  };
}

/**
 * Lazy loading type for translation dictionaries
 */
export type TranslationLoader = () => Promise<{ default: TranslationDictionary }>;

/**
 * I18n Context Type
 */
export interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  loading: boolean;
}