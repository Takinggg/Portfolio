/**
 * I18n Provider - Handles internationalization with lazy loading
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language, TranslationDictionary, I18nContextType } from '../i18n/types';
import { 
  translationLoaders, 
  getTranslation, 
  getStoredLanguage, 
  storeLanguage, 
  updateDocumentLanguage 
} from '../i18n';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => getStoredLanguage());
  const [dictionary, setDictionary] = useState<TranslationDictionary | null>(null);
  const [loading, setLoading] = useState(true);

  // Load translation dictionary
  const loadDictionary = async (lang: Language) => {
    try {
      setLoading(true);
      const module = await translationLoaders[lang]();
      setDictionary(module.default);
    } catch (error) {
      console.error(`Failed to load translations for language: ${lang}`, error);
      // Fallback to French if English fails to load
      if (lang === 'en') {
        try {
          const frModule = await translationLoaders.fr();
          setDictionary(frModule.default);
          setLanguageState('fr');
        } catch (frError) {
          console.error('Failed to load fallback French translations', frError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Change language
  const setLanguage = (newLanguage: Language) => {
    if (newLanguage !== language) {
      setLanguageState(newLanguage);
      storeLanguage(newLanguage);
      updateDocumentLanguage(newLanguage);
      loadDictionary(newLanguage);
    }
  };

  // Translation function
  const t = (key: string): any => {
    if (!dictionary) {
      return key; // Return key as fallback while loading
    }
    return getTranslation(dictionary, key);
  };

  // Load initial dictionary
  useEffect(() => {
    updateDocumentLanguage(language);
    loadDictionary(language);
  }, []);

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    loading,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
}