import type { Language, TranslationDictionary, TranslationLoader } from './types';

/**
 * Translation loaders for lazy loading
 */
export const translationLoaders: Record<Language, TranslationLoader> = {
  fr: () => import('./fr'),
  en: () => import('./en'),
};

/**
 * Get translation value by key path (e.g., 'nav.home')
 */
export function getTranslation(dictionary: TranslationDictionary, key: string): string {
  const keys = key.split('.');
  let current: any = dictionary;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      console.warn(`Translation key "${key}" not found`);
      return key; // Return the key itself as fallback
    }
  }
  
  return typeof current === 'string' ? current : key;
}

/**
 * Detect browser language preference
 */
export function detectBrowserLanguage(): Language {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('fr')) {
      return 'fr';
    }
    if (browserLang.startsWith('en')) {
      return 'en';
    }
  }
  return 'fr'; // Default to French
}

/**
 * Get language from localStorage or browser preference
 */
export function getStoredLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('portfolio-language') as Language;
    if (stored && (stored === 'fr' || stored === 'en')) {
      return stored;
    }
  }
  return detectBrowserLanguage();
}

/**
 * Store language preference
 */
export function storeLanguage(language: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('portfolio-language', language);
  }
}

/**
 * Update document lang attribute for accessibility
 */
export function updateDocumentLanguage(language: Language): void {
  if (typeof window !== 'undefined') {
    document.documentElement.lang = language;
  }
}