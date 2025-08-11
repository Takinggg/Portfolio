import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, User, Briefcase, BookOpen, Mail, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useI18n } from '../hooks/useI18n';
import { LanguageSwitcher } from './ui/LanguageSwitcher';

interface NewNavbarProps {
  onNavigateToSection: (sectionId: string) => void;
  onNavigateToBlog: () => void;
  onNavigateToProjects: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backLabel?: string;
  currentPage?: 'home' | 'blog' | 'post' | 'projects';
  isAuthenticated?: boolean;
}

const NewNavbar: React.FC<NewNavbarProps> = ({ 
  onNavigateToSection, 
  onNavigateToBlog,
  onNavigateToProjects,
  currentPage = 'home',
  // TODO: Implement these features in future iterations
  showBackButton = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  onBack, // eslint-disable-line @typescript-eslint/no-unused-vars
  backLabel, // eslint-disable-line @typescript-eslint/no-unused-vars
  isAuthenticated = false // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useI18n();
  
  // TODO: Use the translation for backLabel when back button is implemented
  // const finalBackLabel = backLabel || t('nav.back');

  // Scroll detection for enhanced glass effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 32);
      
      // Only update active section based on scroll position if we're on home page
      if (currentPage === 'home') {
        const sections = ['hero', 'about', 'projects', 'blog', 'contact'];
        const scrollPosition = scrollY + 200;
        
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPage]);

  // Set active section based on current page
  useEffect(() => {
    if (currentPage === 'blog' || currentPage === 'post') {
      setActiveSection('blog');
    } else if (currentPage === 'projects') {
      setActiveSection('projects');
    } else if (currentPage === 'home') {
      setActiveSection('hero');
    }
  }, [currentPage]);

  const handleNavigation = (id: string) => {
    if (id === 'blog') {
      onNavigateToBlog();
    } else if (id === 'projects') {
      onNavigateToProjects();
    } else {
      // For home page sections (hero, about, contact)
      onNavigateToSection(id);
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'hero', label: t('nav.home'), icon: Home },
    { id: 'about', label: t('nav.about'), icon: User },
    { id: 'projects', label: t('nav.projects'), icon: Briefcase },
    { id: 'blog', label: t('nav.blog'), icon: BookOpen },
    { id: 'contact', label: t('nav.contact'), icon: Mail }
  ];

  // Glass effect styling classes - removed dark mode support
  const glassNavClass = cn(
    // Base glass styling
    "bg-white/75 backdrop-blur-xl backdrop-saturate-150",
    // Border and ring for depth
    "border border-gray-200/50",
    "ring-1 ring-white/20",
    // Enhanced styles when scrolled
    isScrolled && "bg-white/90 shadow-2xl",
    // Transition for smooth effect
    "transition-all duration-300 ease-out"
  );

  const glassMobileMenuClass = cn(
    // Base glass styling for mobile menu
    "bg-white/80 backdrop-blur-xl backdrop-saturate-150",
    // Border and ring for depth
    "border border-gray-200/50",
    "ring-1 ring-white/20"
  );

  return (
    <>
      {/* Sticky Header Container */}
      <header className="fixed top-4 left-0 right-0 z-40 flex justify-center px-4">
        <nav className={cn(
          "flex items-center gap-8 w-full max-w-6xl rounded-full h-14 px-6",
          glassNavClass
        )}
             style={{
               boxShadow: isScrolled 
                 ? '0 12px 40px -10px rgba(0,0,0,0.25), 0 8px 20px -6px rgba(0,0,0,0.15)'
                 : '0 8px 28px -10px rgba(0,0,0,0.15), 0 4px 12px -6px rgba(0,0,0,0.1)'
             }}>
          
          {/* Left: Logo Button */}
          <motion.button
            onClick={() => handleNavigation('hero')}
            className="flex-shrink-0 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={t('nav.home')}
          >
            <Home size={18} />
          </motion.button>

          {/* Middle: Navigation Links (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    "focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2",
                    isActive
                      ? "text-gray-900 bg-white/30"
                      : "text-gray-700 hover:text-gray-900 hover:bg-white/20"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-white/40 rounded-full ring-1 ring-violet-400/50"
                      layoutId="activeNavItem"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30,
                        duration: 0.3 
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher className="hidden sm:flex" />
            
            {/* Admin Link */}
            <motion.a
              href="/admin"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 rounded"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              admin
            </motion.a>

            {/* Collaborer CTA */}
            <motion.button
              onClick={() => handleNavigation('contact')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full font-medium text-sm hover:shadow-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{t('nav.collaborate')}</span>
              <ArrowRight size={14} />
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 rounded"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Content */}
            <motion.div
              id="mobile-menu"
              className="fixed top-20 left-4 right-4 z-40 md:hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3 }}
            >
              <div className={cn(glassMobileMenuClass, "rounded-2xl p-6 shadow-xl")}>
                {/* Mobile Language Switcher */}
                <div className="mb-4 flex justify-center">
                  <LanguageSwitcher />
                </div>
                
                <div className="space-y-3">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-300",
                          "focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2",
                          isActive
                            ? "bg-white/40 text-gray-900 ring-1 ring-violet-400/50"
                            : "text-gray-700 hover:bg-white/30"
                        )}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                        {isActive && <ArrowRight size={16} className="ml-auto" />}
                      </motion.button>
                    );
                  })}
                  
                  {/* Mobile CTA */}
                  <motion.button
                    onClick={() => {
                      handleNavigation('contact');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium mt-4 hover:shadow-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{t('nav.collaborate')}</span>
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NewNavbar;