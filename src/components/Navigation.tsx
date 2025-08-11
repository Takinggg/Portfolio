import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, Home, User, Briefcase, Mail, ArrowRight, BookOpen, ArrowLeft } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

interface NavigationProps {
  onNavigateToSection: (sectionId: string) => void;
  onNavigateToBlog: () => void;
  onNavigateToProjects: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backLabel?: string;
  currentPage?: 'home' | 'blog' | 'post' | 'projects';
  isAuthenticated?: boolean; // Add authentication state
}

const Navigation: React.FC<NavigationProps> = ({ 
  onNavigateToSection, 
  onNavigateToBlog,
  onNavigateToProjects,
  showBackButton = false,
  onBack,
  backLabel = "Retour",
  currentPage = 'home',
  isAuthenticated = false
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      
      // Only update active section based on scroll position if we're on home page
      if (currentPage === 'home') {
        const sections = ['hero', 'about', 'contact'];
        const scrollPosition = window.scrollY + 200;
        
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
    { id: 'hero', label: 'Accueil', icon: Home, type: 'anchor' },
    { id: 'about', label: 'À propos', icon: User, type: 'anchor' },
    { id: 'projects', label: 'Projets', icon: Briefcase, type: 'section' },
    { id: 'blog', label: 'Blog', icon: BookOpen, type: 'section' },
    { id: 'contact', label: 'Contact', icon: Mail, type: 'anchor' }
  ];

  return (
    <>
      {/* Floating Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-700 w-auto max-w-4xl`}
      >
        <GlassCard className={`px-6 py-3 ${isScrolled ? 'shadow-lg' : 'shadow-card'}`} premium reflection iridescent>
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Left Section - Back Button or Logo */}
            <div className="flex items-center">
              {/* Back Button */}
              {showBackButton && onBack && (
                <motion.button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-text-soft hover:text-primary-500 transition-all duration-300 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline">{backLabel}</span>
                </motion.button>
              )}

              {/* Logo - Only show on home page */}
              {currentPage === 'home' && !showBackButton && (
                <motion.div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => handleNavigation('hero')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <motion.div 
                      className="w-10 h-10 bg-gradient-to-br from-liquid-blue to-liquid-purple rounded-xl flex items-center justify-center shadow-liquid"
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Sparkles className="text-white" size={16} />
                    </motion.div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-lg font-bold text-liquid-blue">
                      FOULON
                    </div>
                    <div className="text-xs text-text-muted font-medium -mt-1">
                      UI/UX Designer
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-liquid-blue focus-visible:ring-offset-2 ${
                        isActive
                          ? 'text-white'
                          : 'text-text-soft hover:text-text-strong'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-liquid-blue to-liquid-purple rounded-xl shadow-liquid"
                          layoutId="activeTab"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <Icon 
                        size={16} 
                        className={`relative z-10 ${isActive ? 'text-white' : ''}`} 
                      />
                      <span className="relative z-10 hidden xl:inline">{item.label}</span>
                      {isActive && (
                        <motion.div
                          className="w-1 h-1 bg-white rounded-full ml-1 relative z-10"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Admin Button - Discrete but visible when authenticated */}
              {isAuthenticated && (
                <motion.a
                  href="/admin"
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-text-soft hover:text-text-strong hover:bg-surface-alt transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-liquid-blue focus-visible:ring-offset-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Administration"
                  aria-label="Accéder à l'administration"
                >
                  <span className="text-lg">⚙️</span>
                </motion.a>
              )}

              {/* Admin Login Button - Visible when not authenticated */}
              {!isAuthenticated && (
                <motion.a
                  href="/admin"
                  className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl text-text-soft hover:text-text-strong hover:bg-surface-alt transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-liquid-blue focus-visible:ring-offset-2 opacity-50 hover:opacity-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Administration"
                  aria-label="Connexion administrateur"
                >
                  <span className="text-sm">🔧</span>
                </motion.a>
              )}

              {/* CTA Button */}
              <motion.button
                onClick={() => handleNavigation('contact')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-liquid-blue to-liquid-purple text-white rounded-xl font-medium text-sm shadow-liquid hover:shadow-magnetic transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-liquid-purple liquid-spread glass-reflection"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                data-track="nav-cta-collaborate"
              >
                <span>Collaborer</span>
                <ArrowRight size={14} />
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-text-soft hover:text-text-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-liquid-blue focus-visible:ring-offset-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
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
          </div>
        </GlassCard>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Content */}
            <motion.div
              className="fixed top-20 left-4 right-4 z-50 lg:hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3 }}
            >
              <GlassCard className="p-6" premium reflection particles>
                <div className="space-y-3">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 ${
                          isActive
                            ? 'bg-primary-600 text-white shadow-card'
                            : 'text-text-DEFAULT hover:bg-surface-alt'
                        }`}
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium shadow-card mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Collaborer</span>
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;