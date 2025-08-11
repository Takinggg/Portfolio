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
  };
  about: {
    title: string;
    subtitle: string;
    description: string;
  };
  projects: {
    title: string;
    subtitle: string;
    view_all: string;
    featured: string;
    case_study: string;
    demo: string;
    source: string;
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
  };
  contact: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      email: string;
      message: string;
      send: string;
      sending: string;
    };
  };
  footer: {
    rights: string;
    design_by: string;
    social: {
      follow: string;
    };
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