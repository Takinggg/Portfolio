import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  Briefcase, 
  BookOpen, 
  Mail,
  ChevronUp,
  ArrowUp
} from 'lucide-react';
import { theme } from '../../theme/tokens';

interface MobileFabMenuProps {
  onNavigateToSection: (sectionId: string) => void;
  onNavigateToBlog: () => void;
  onNavigateToProjects: () => void;
  activeSection?: string;
  className?: string;
}

export const MobileFabMenu: React.FC<MobileFabMenuProps> = ({
  onNavigateToSection,
  onNavigateToBlog,
  onNavigateToProjects,
  activeSection = 'hero',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (id: string) => {
    if (id === 'blog') {
      onNavigateToBlog();
    } else if (id === 'projects') {
      onNavigateToProjects();
    } else {
      onNavigateToSection(id);
    }
    setIsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const navItems = [
    { id: 'hero', label: 'Accueil', icon: Home, action: () => handleNavigation('hero') },
    { id: 'about', label: 'À propos', icon: User, action: () => handleNavigation('about') },
    { id: 'projects', label: 'Projets', icon: Briefcase, action: () => handleNavigation('projects') },
    { id: 'blog', label: 'Blog', icon: BookOpen, action: () => handleNavigation('blog') },
    { id: 'contact', label: 'Contact', icon: Mail, action: () => handleNavigation('contact') },
    { id: 'scroll-top', label: 'Haut de page', icon: ArrowUp, action: scrollToTop },
  ];

  return (
    <div className={`fixed bottom-6 right-6 z-50 lg:hidden ${className}`}>
      {/* Background overlay when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ zIndex: 40 }}
          />
        )}
      </AnimatePresence>

      {/* Menu items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 space-y-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={item.action}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 min-w-[140px] ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                      : 'bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white'
                  }`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-track={`fab-menu-${item.id}`}
                  aria-label={item.label}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ 
          boxShadow: '0 0 0 1px rgb(99 102 241 / 0.1), 0 8px 32px rgb(99 102 241 / 0.16)',
          zIndex: 50
        }}
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu de navigation'}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'menu'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Scroll indicator dot */}
      {!isOpen && window.scrollY > 100 && (
        <motion.div
          className="absolute -top-2 -right-2 w-3 h-3 bg-accent-green rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};