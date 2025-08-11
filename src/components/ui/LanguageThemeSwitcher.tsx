/**
 * Combined Language and Theme Switcher Component
 * Provides elegant toggles for both language (FR/EN) and theme (Light/Dark)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Sun, Moon, ChevronDown } from 'lucide-react';
import { useTheme } from '../../hooks/theme/ThemeProvider';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../lib/utils';

interface LanguageThemeSwitcherProps {
  className?: string;
  showLabels?: boolean;
}

export const LanguageThemeSwitcher: React.FC<LanguageThemeSwitcherProps> = ({
  className = '',
  showLabels = false,
}) => {
  const { theme, toggleTheme, actualTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const isDark = actualTheme === 'dark';

  const handleLanguageChange = (newLang: 'fr' | 'en') => {
    setLanguage(newLang);
    setShowLanguageMenu(false);
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Language Switcher */}
      <div className="relative">
        <button
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
            'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
            'border border-gray-200/60 dark:border-gray-700/60',
            'hover:bg-white/90 dark:hover:bg-gray-800/90',
            'hover:border-gray-300/80 dark:hover:border-gray-600/80',
            'hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-900/20',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
            'language-toggle group'
          )}
          aria-label={t('language.toggle_language')}
          aria-expanded={showLanguageMenu}
          aria-haspopup="true"
        >
          <Globe 
            size={16} 
            className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" 
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">
            {language}
          </span>
          <ChevronDown 
            size={14} 
            className={cn(
              'text-gray-500 dark:text-gray-400 transition-transform duration-200',
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
                'bg-white/95 dark:bg-gray-800/95 backdrop-blur-md',
                'border border-gray-200/60 dark:border-gray-700/60',
                'rounded-lg shadow-xl shadow-gray-200/20 dark:shadow-gray-900/20',
                'ring-1 ring-black/5 dark:ring-white/5'
              )}
            >
              <button
                onClick={() => handleLanguageChange('fr')}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm transition-colors duration-150',
                  'hover:bg-gray-100/80 dark:hover:bg-gray-700/80',
                  language === 'fr' 
                    ? 'text-indigo-600 dark:text-indigo-400 font-medium' 
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                🇫🇷 {t('language.french')}
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm transition-colors duration-150',
                  'hover:bg-gray-100/80 dark:hover:bg-gray-700/80',
                  language === 'en' 
                    ? 'text-indigo-600 dark:text-indigo-400 font-medium' 
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                🇺🇸 {t('language.english')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme Switcher */}
      <button
        onClick={toggleTheme}
        className={cn(
          'relative flex items-center justify-center w-12 h-12 rounded-xl',
          'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
          'border border-gray-200/60 dark:border-gray-700/60',
          'hover:bg-white/90 dark:hover:bg-gray-800/90',
          'hover:border-gray-300/80 dark:hover:border-gray-600/80',
          'hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-gray-900/20',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          'transition-all duration-300 group',
          'overflow-hidden'
        )}
        aria-label={t('theme.toggle_theme')}
        aria-pressed={isDark}
      >
        {/* Theme Icon with Rotation Animation */}
        <div className="relative w-5 h-5">
          <motion.div
            initial={false}
            animate={{ 
              rotate: isDark ? 180 : 0,
              scale: isDark ? 0 : 1 
            }}
            transition={{ 
              duration: 0.3,
              ease: 'easeInOut' 
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun 
              size={20} 
              className="text-amber-500 group-hover:text-amber-600 transition-colors"
            />
          </motion.div>
          
          <motion.div
            initial={false}
            animate={{ 
              rotate: isDark ? 0 : -180,
              scale: isDark ? 1 : 0 
            }}
            transition={{ 
              duration: 0.3,
              ease: 'easeInOut',
              delay: isDark ? 0.1 : 0
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon 
              size={20} 
              className="text-indigo-400 group-hover:text-indigo-300 transition-colors"
            />
          </motion.div>
        </div>

        {/* Ripple Effect */}
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={cn(
            'absolute inset-0 rounded-xl',
            isDark 
              ? 'bg-indigo-400/20' 
              : 'bg-amber-400/20'
          )}
          key={actualTheme} // Re-trigger animation on theme change
        />
      </button>

      {/* Labels (Optional) */}
      {showLabels && (
        <div className="hidden md:flex flex-col text-xs text-gray-600 dark:text-gray-400">
          <span>{t(`theme.${isDark ? 'dark_mode' : 'light_mode'}`)}</span>
          <span>{t(`language.${language === 'fr' ? 'french' : 'english'}`)}</span>
        </div>
      )}
    </div>
  );
};

export default LanguageThemeSwitcher;