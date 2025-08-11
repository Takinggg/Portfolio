/**
 * Language Switcher Component
 * Provides elegant toggle for language selection (FR/EN) only
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  showLabels?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  showLabels = false,
}) => {
  const { language, setLanguage, t } = useI18n();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const handleLanguageChange = (newLang: 'fr' | 'en') => {
    setLanguage(newLang);
    setShowLanguageMenu(false);
  };

  return (
    <div className={cn('flex items-center', className)}>
      {/* Language Switcher */}
      <div className="relative">
        <button
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
            'bg-white/80 backdrop-blur-sm',
            'border border-gray-200/60',
            'hover:bg-white/90',
            'hover:border-gray-300/80',
            'hover:shadow-lg hover:shadow-gray-200/20',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
            'language-toggle group'
          )}
          aria-label={t('language.toggle_language')}
          aria-expanded={showLanguageMenu}
          aria-haspopup="true"
        >
          <Globe 
            size={16} 
            className="text-gray-600 group-hover:text-indigo-600 transition-colors" 
          />
          <span className="text-sm font-medium text-gray-700 uppercase">
            {language}
          </span>
          <ChevronDown 
            size={14} 
            className={cn(
              'text-gray-500 transition-transform duration-200',
              showLanguageMenu && 'rotate-180'
            )}
          />
        </button>

        {/* Language Dropdown */}
        <AnimatePresence>
          {showLanguageMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute top-full left-0 mt-2 w-32 py-1 z-50',
                'bg-white/95 backdrop-blur-md',
                'border border-gray-200/60',
                'rounded-lg shadow-xl shadow-gray-200/20',
                'ring-1 ring-black/5'
              )}
            >
              <button
                onClick={() => handleLanguageChange('fr')}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm transition-colors duration-150',
                  'hover:bg-gray-100/80',
                  language === 'fr' 
                    ? 'text-indigo-600 font-medium' 
                    : 'text-gray-700'
                )}
              >
                🇫🇷 {t('language.french')}
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm transition-colors duration-150',
                  'hover:bg-gray-100/80',
                  language === 'en' 
                    ? 'text-indigo-600 font-medium' 
                    : 'text-gray-700'
                )}
              >
                🇺🇸 {t('language.english')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Labels (Optional) */}
      {showLabels && (
        <div className="hidden md:flex flex-col text-xs text-gray-600 ml-3">
          <span>{t(`language.${language === 'fr' ? 'french' : 'english'}`)}</span>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;